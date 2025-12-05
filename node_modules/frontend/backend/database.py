from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Use sqlite directly
# Use sqlite directly
# FORCE IPv4: Explicitly resolve hostname to IPv4 using Google DNS
# This bypasses system DNS entirely to avoid IPv6 issues on Vercel
import dns.resolver
from urllib.parse import urlparse, urlunparse

# Debug globals
resolution_log = []
resolution_status = "NOT_ATTEMPTED"
final_db_url_masked = "NOT_SET"

try:
    if "supabase.co" in DATABASE_URL and "@" in DATABASE_URL:
        parsed = urlparse(DATABASE_URL)
        hostname = parsed.hostname
        if hostname:
            resolution_log.append(f"Attempting to resolve {hostname} via Google DNS...")
            try:
                resolver = dns.resolver.Resolver()
                resolver.nameservers = ['8.8.8.8', '8.8.4.4']
                answer = resolver.resolve(hostname, 'A')
                ipv4_address = answer[0].to_text()
                resolution_log.append(f"Resolved to {ipv4_address}")
                
                # Reconstruct URL with IP address
                netloc = parsed.netloc.replace(hostname, ipv4_address)
                parsed = parsed._replace(netloc=netloc)
                DATABASE_URL = urlunparse(parsed)
                resolution_log.append("Updated DATABASE_URL to use IPv4 IP")
                resolution_status = "SUCCESS"
            except Exception as e:
                resolution_log.append(f"Resolution failed: {str(e)}")
                resolution_status = "FAILED"
    else:
        resolution_log.append("Skipping resolution: Not a Supabase URL or no credentials")
        resolution_status = "SKIPPED"

    # Store masked URL for debug
    if DATABASE_URL:
        final_db_url_masked = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "NO_CREDENTIALS"

except Exception as e:
    print(f"DNS resolution failed: {e}")
    resolution_log.append(f"Global exception: {str(e)}")
    resolution_status = "CRASHED"
    print("WARNING: Using original DATABASE_URL which may cause IPv6 errors.")

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
