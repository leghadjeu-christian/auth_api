use sqlx::PgPool;
use std::sync::Arc;

use axum::{
    routing::{get, post},
    Router,
};
use tower_http::cors::CorsLayer;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

pub mod middleware;
pub mod models;
pub mod routes;
pub mod utils;

use crate::{
    middleware::auth::auth_middleware,
    routes::{auth, protected},
    utils::load_env,
};

#[derive(Debug, Clone)]
pub struct AppState {
    pub config: Arc<utils::Config>,
    pub db: PgPool,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    #[derive(OpenApi)]
    #[openapi(
        info(title = "Auth API", description = "A simple auth API"),
        paths(auth::login, auth::register, protected::admin_route),
        components(schemas(
            models::User,
            models::LoginRequest,
            models::RegisterRequest,
            models::LoginResponse
        ))
    )]
    struct ApiDoc;

    let db = PgPool::connect(&std::env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
        .await
        .unwrap();

    let state = AppState {
        config: Arc::new(load_env()),
        db,
    };

    let app = Router::new()
        .route("/admin", get(protected::admin_route))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth_middleware,
        ))
        .route("/register", post(auth::register))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .route("/login", post(auth::login))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
