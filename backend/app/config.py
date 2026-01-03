"""Configuration for FixMate backend."""
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

# For MVP, we just log notifications instead of sending them
NOTIFICATIONS_ENABLED = False
