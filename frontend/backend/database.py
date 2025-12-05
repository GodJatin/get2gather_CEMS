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
# CRITICAL FIX: MUMBAI REGIONAL POOLER (Standard IPv4)
# 1. Host: aws-0-ap-south-1.pooler.supabase.com (Mumbai standard pooler)
# 2. User: postgres.vqfnndepdzdewugdcwjg (Explicit tenant routing)
# 3. Port: 6543 (Transaction Mode)

# This resolves to IPv4 natively, satisfying Vercel.
# It uses the Explicit User to route to the correct project.
REGIONAL_POOLER_HOST = "aws-0-ap-south-1.pooler.supabase.com"
DATABASE_URL = f"postgresql://postgres.vqfnndepdzdewugdcwjg:J%40tin224@{REGIONAL_POOLER_HOST}:6543/postgres?sslmode=require"

print(f"Using Mumbai Regional Host: {REGIONAL_POOLER_HOST}")



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
