
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import pdf_routes, chat_routes
from app.config.settings import APP_NAME

app = FastAPI(title=APP_NAME)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
