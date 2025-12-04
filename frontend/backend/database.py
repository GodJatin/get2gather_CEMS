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

# FORCE IPv4: Explicitly resolve hostname to IPv4
# This bypasses psycopg2's internal DNS resolution which might prefer IPv6
import socket
from urllib.parse import urlparse, urlunparse

try:
    if "supabase.co" in DATABASE_URL and "@" in DATABASE_URL:
        parsed = urlparse(DATABASE_URL)
        hostname = parsed.hostname
        if hostname:
            # Resolve to IPv4 address
            ipv4_address = socket.gethostbyname(hostname)
            print(f"Resolved {hostname} to {ipv4_address}")
            
            # Reconstruct URL with IP address
            # We need to keep the port if it exists
            netloc = parsed.netloc.replace(hostname, ipv4_address)
            
            # Update the URL
            parsed = parsed._replace(netloc=netloc)
            DATABASE_URL = urlunparse(parsed)
            print(f"Updated DATABASE_URL to use IPv4 IP")
except Exception as e:
    print(f"Failed to resolve IPv4: {e}")

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
