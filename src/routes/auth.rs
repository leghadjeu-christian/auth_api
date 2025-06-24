use axum::extract::State;
use axum::{http::StatusCode, response::IntoResponse, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde_json::json;
use sqlx::query_as;
use utoipa::OpenApi;    

use crate::middleware::auth::Claims;
use crate::models::{LoginRequest, LoginResponse, RegisterRequest, User};
use crate::AppState;

use crate::models::user::Role;
use std::str::FromStr;

#[derive(OpenApi)]
#[openapi(
    paths(login, register),
    components(schemas(LoginRequest, LoginResponse, RegisterRequest, User))
)]
pub struct AuthApi;

#[utoipa::path(
    post,
    path = "/login",
    request_body = LoginRequest,
    responses(
        (status = 200, description = "Login successful", body = LoginResponse),
        (status = 401, description = "Invalid credentials")
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    let user = query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await
        .unwrap();

        if let Some(user) = user {
            if verify(&payload.password, &user.password).unwrap_or(false) {
                let role = Role::from_str(&user.role).unwrap(); // Convert String to Role
                let claims = Claims {
                    sub: user.email.clone(),
                    role, // Now a Role, not a String
                    exp: (chrono::Utc::now() + chrono::Duration::minutes(10)).timestamp() as usize,
                };
            let config = state.config.clone();
            let token = encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret(config.jwt_secret.as_ref()),
            )
            .unwrap();
            return (StatusCode::OK, Json(LoginResponse { token })).into_response();
        }
    }
    (
        StatusCode::UNAUTHORIZED,
        Json(json!({"error": "Invalid credentials"})),
    )
        .into_response()
}

#[utoipa::path(
    post,
    path = "/register",
    request_body = RegisterRequest,
    responses(
        (status = 201, description = "Registration successful"),
        (status = 400, description = "Bad request")
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> impl IntoResponse {
    if payload.password.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Password cannot be empty"})),
        )
            .into_response();
    }

    // Check if user already exists
    let existing: Option<(i32,)> = sqlx::query_as("SELECT id FROM users WHERE email = $1")
        .bind(&payload.email)
        .fetch_optional(&state.db)
        .await
        .unwrap();

    if existing.is_some() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Email already exists"})),
        )
            .into_response();
    }

    let hashed_password = hash(&payload.password, DEFAULT_COST).unwrap();

    // Insert new user
    sqlx::query("INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)")
        .bind(&payload.email)
        .bind(&hashed_password)
        .bind(&payload.first_name)
        .bind(&payload.last_name)
        .bind("User")
        .execute(&state.db)
        .await
        .unwrap();

    (
        StatusCode::CREATED,
        Json(json!({"message": "User Registered Successfully"})),
    )
        .into_response()
}
