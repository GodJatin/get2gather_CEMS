from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ---------------------------------------------------------
# DATABASE CONFIGURATION
# ---------------------------------------------------------
# Use Environment Variable for Security
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("WARNING: DATABASE_URL not found in environment variables. Using SQLite fallback for LOCAL ONLY.")
    DATABASE_URL = "sqlite:///./test.db"
else:
    print("Using configured DATABASE_URL")

print(f"Database Configured: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'SQLite/Local'}")

# SQLAlchemy Engine
try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # Postgres/Supabase
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
except Exception as e:
    print(f"CRITICAL: Failed to connect to Database: {e}")
    raise e

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
