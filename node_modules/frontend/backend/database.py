from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# CRITICAL: Vercel must use Port 6543 (Pooler) to avoid IPv6 errors.
# We verified 6543 connects and data is seeded.
SUPABASE_URL = "postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:6543/postgres"

# Force usage of KNOWN GOOD URL.
# This bypasses Vercel's potentially incompatible env var (Port 5432)
DATABASE_URL = SUPABASE_URL 

print(f"--- DB CONFIG ---")
print(f"Loading .env from: {os.path.join(os.path.dirname(__file__), '.env')}")
print(f"Resolved DATABASE_URL: {DATABASE_URL}")
print(f"-----------------")

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
