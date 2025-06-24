use axum::{
    extract::{Extension, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde_json::json;
use std::sync::Arc;
use utoipa::OpenApi;
use crate::models::user::Role;
use crate::models::User;
use crate::AppState;
use sqlx::query_as;

#[derive(OpenApi)]
#[openapi(
    paths(admin_route),
    components(schemas(User))
)]
pub struct ProtectedApi;

#[utoipa::path(
    get,
    path = "/admin",
    responses(
        (status = 200, description = "Admin access granted", body = User),
        (status = 403, description = "Forbidden")
    ),
    security(("api_key" = []))
)]
pub async fn admin_route(Extension(user): Extension<Arc<User>>) -> impl IntoResponse {
    if user.role == Role::Admin.to_string() {
        (StatusCode::OK, Json(user)).into_response()
    } else {
        (
            StatusCode::FORBIDDEN,
            Json(json!({"error": "Admin access required"})),
        ).into_response()
    }
}

#[utoipa::path(
    get,
    path = "/user",
    responses(
        (status = 200, description = "User access granted", body = User),
        (status = 403, description = "Forbidden")
    ),
    security(("api_key" = []))
)]
pub async fn user_route(Extension(user): Extension<Arc<User>>) -> impl IntoResponse {
    if user.role == "User" {
        (StatusCode::OK, Json(user)).into_response()
    } else {
        (
            StatusCode::FORBIDDEN,
            Json(json!({"error": "User access required"})),
        ).into_response()
    }
}

#[utoipa::path(
    get,
    path = "/profile",
    responses(
        (status = 200, description = "Profile info", body = User),
        (status = 401, description = "Unauthorized")
    ),
    security(("api_key" = []))
)]
pub async fn profile_route(
    Extension(user): Extension<Arc<User>>,
    State(state): State<AppState>,
) -> impl IntoResponse {
    // Query the database for the full user info using the email from the JWT
    let db_user = query_as::<_, User>("SELECT * FROM users WHERE email = $1")
        .bind(&user.email)
        .fetch_optional(&state.db)
        .await;

    match db_user {
        Ok(Some(full_user)) => (StatusCode::OK, Json(full_user)).into_response(),
        _ => (
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "User not found"})),
        )
            .into_response(),
    }
}