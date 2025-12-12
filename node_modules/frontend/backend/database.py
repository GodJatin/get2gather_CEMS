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
# CRITICAL FIX: CORRECT REGIONAL POOLER (CLUSTER 1)
# User Dashboard confirms the project is on 'aws-1-ap-southeast-1', NOT 'aws-0'.
# 'aws-0' returned "Tenant Not Found" because the tenant is on Cluster 1.
# This hostname resolves to IPv4 and works on Vercel.

REGIONAL_POOLER_HOST = "aws-1-ap-southeast-1.pooler.supabase.com"
PROJECT_ID = "vqfnndepdzdewugdcwjg"

# Exact URL from Dashboard:
# postgresql://postgres.PROJECT:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
DATABASE_URL = f"postgresql://postgres.{PROJECT_ID}:J%40tin224@{REGIONAL_POOLER_HOST}:6543/postgres?sslmode=require"

print(f"Using Regional Pooler (Cluster 1): {REGIONAL_POOLER_HOST}")



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
