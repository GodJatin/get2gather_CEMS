from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# ---------------------------------------------------------
# UNIFIED DATABASE CONFIGURATION (Supabase Only)
# ---------------------------------------------------------
# We use Port 6543 (Transaction Pooler) because:
# 1. It works on Vercel (avoids IPv6 "Cannot assign requested address" errors).
# 2. It works Locally (standard IPv4).
# 3. It creates a SINGLE Source of Truth for data.
# ---------------------------------------------------------
# ---------------------------------------------------------
# UNIFIED DATABASE CONFIGURATION (Supabase Only)
# ---------------------------------------------------------
# REVERTING TO ORIGINAL CONFIGURATION (As requested)
# Host: db.vqfnndepdzdewugdcwjg.supabase.co
# User: postgres
# Port: 6543

DATABASE_URL = "postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:6543/postgres?sslmode=require"

try:
    import socket
    from urllib.parse import urlparse
    hostname = urlparse(DATABASE_URL).hostname
    print(f"Resolving {hostname}...")
    ip_info = socket.getaddrinfo(hostname, 6543)
    print(f"DEBUG: Resolved IPs: {[x[4][0] for x in ip_info]}")
except Exception as e:
    print(f"DEBUG: Resolution Failed: {e}")

print(f"Using Original Config: {DATABASE_URL.split('@')[-1]}")



print(f"Using UNIFIED Database: Supabase (Pooler Mode)")
print(f"-----------------")

# SQLAlchemy Engine
try:
    engine = create_engine(DATABASE_URL, echo=True, pool_pre_ping=True)
except Exception as e:
    print(f"CRITICAL: Failed to connect to Supabase: {e}")
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
