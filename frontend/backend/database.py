from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from dotenv import load_dotenv

load_dotenv()

# Use sqlite directly
# Use sqlite directly
# Default to a temporary file in /tmp for Vercel if no env var is set
# This ensures it doesn't crash, but data won't persist on Vercel without a real DB
default_db = "sqlite:////tmp/temp.db" if os.path.exists("/tmp") else "sqlite:///./test.db"
DATABASE_URL = os.getenv("DATABASE_URL", default_db)

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")
    connect_args = {"check_same_thread": False}
else:
    # Handle postgres:// to postgresql:// replacement for SQLAlchemy
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)
except Exception as e:
    print(f"Failed to create engine with URL {DATABASE_URL}: {e}")
    # Fallback to in-memory for safety if everything fails
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

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
