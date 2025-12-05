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
# CRITICAL FIX: FORCE IPv4 via HARDCODED IP
# The hostname 'db.vqfnndepdzdewugdcwjg.supabase.co' resolves ONLY to IPv6 (AAAA record).
# Vercel serverless functions fail on IPv6 ("Cannot assign requested address").
# We found the IPv4 address of the underlying Supavisor Pooler (ap-southeast-1): 52.77.146.31
# We use this IP directly to guarantee an IPv4 connection.

HARDCODED_IPV4 = "52.77.146.31"
# Explicitly use 'postgres.PROJECT_ID' as username so Supavisor knows the tenant
# even when connecting via raw IP.
DATABASE_URL = f"postgresql://postgres.vqfnndepdzdewugdcwjg:J%40tin224@{HARDCODED_IPV4}:6543/postgres?sslmode=require"

print(f"--- DB CONFIG ---")
print(f"Using Hardcoded IPv4: {HARDCODED_IPV4} (Bypassing IPv6 DNS)")



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
