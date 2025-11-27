from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from dotenv import load_dotenv

load_dotenv()

# Use sqlite directly
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///C:/Users/HP/.gemini/test_sync_final.db").replace("sqlite+aiosqlite", "sqlite")

engine = create_engine(DATABASE_URL, echo=True, connect_args={"check_same_thread": False})

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
