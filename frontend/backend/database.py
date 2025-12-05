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
# CRITICAL FIX: FORCE IPv4 via 'hostaddr' (Preserves SNI)
# 1. Hostname: 'db.vqfnndepdzdewugdcwjg.supabase.co' (Needed for SNI/SSL Verification)
# 2. HostAddr: '52.77.146.31' (Singapore IPv4) - Bypasses Vercel's broken DNS/IPv6.
# 3. User: 'postgres.vqfnndepdzdewugdcwjg' (Explicit Project ID for Supavisor routing).

HARDCODED_IPV4 = "52.77.146.31"
DATABASE_URL = f"postgresql://postgres.vqfnndepdzdewugdcwjg:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:6543/postgres?sslmode=require&hostaddr={HARDCODED_IPV4}"

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
