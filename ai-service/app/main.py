
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import pdf_routes, chat_routes
from app.config.settings import APP_NAME, ALLOWED_ORIGINS, GEMINI_API_KEY

app = FastAPI(title=APP_NAME)

# CORS: only the frontend URLs from ALLOWED_ORIGINS can call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(pdf_routes.router)
app.include_router(chat_routes.router)


@app.get("/")
def root():
    return {
        "message": "SmartLurn AI Service is running"
    }


# Used by Render to check the service is up
@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_key_set": bool(GEMINI_API_KEY),
    }
