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
# CRITICAL FIX: MUMBAI POOLER IPv4 + SNI
# The project is likely in Mumbai (ap-south-1) based on user location.
# Previous attempts with Singapore IP failed ("Tenant not found").
# We use the Mumbai IPv4 (3.108.251.216) but send the Project Hostname in SNI.

MUMBAI_IPV4 = "3.108.251.216"
# Host: db.vqfnnd... (SNI)
# HostAddr: 3.108... (Physical Connection)
# User: postgres (Standard, SNI routes the tenant)
DATABASE_URL = f"postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:6543/postgres?sslmode=require&hostaddr={MUMBAI_IPV4}"

print(f"Using Mumbai Pooler IP: {MUMBAI_IPV4} (with SNI)")



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
