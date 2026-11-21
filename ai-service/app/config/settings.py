
import os
from dotenv import load_dotenv

load_dotenv()


def _split(value: str):
    """'a, b,c/' -> ['a', 'b', 'c'] (trailing slashes removed)."""
    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Main model, then backups tried in order if it is retired, overloaded or rate limited.
# When Google releases new models, change these in .env / Render; no code change needed.
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODELS = _split(
    os.getenv("GEMINI_FALLBACK_MODELS", "gemini-2.5-flash-lite")
)

# Frontend URLs allowed to call this service, comma-separated
# e.g. ALLOWED_ORIGINS=http://localhost:5173,https://smartlurn.vercel.app
ALLOWED_ORIGINS = _split(os.getenv("ALLOWED_ORIGINS", "http://localhost:5173"))

DATABASE_URL = os.getenv("DATABASE_URL")

APP_NAME = "SmartLurn AI Service"
