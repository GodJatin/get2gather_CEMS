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
DATABASE_URL = "postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:6543/postgres?sslmode=require"

print(f"--- DB CONFIG ---")
print(f"Original URL: {DATABASE_URL}")

# CRITICAL FIX: FORCE IPv4
# Vercel resolves Supabase to IPv6, which fails with "Cannot assign requested address".
# We must manually resolve to IPv4 to force the connection to work.
try:
    import dns.resolver
    from urllib.parse import urlparse, urlunparse

    parsed = urlparse(DATABASE_URL)
    hostname = parsed.hostname
    
    if hostname:
        print(f"Resolving {hostname} to IPv4...")
        resolver = dns.resolver.Resolver()
        # Use Google DNS to ensure we get a result
        resolver.nameservers = ['8.8.8.8', '8.8.4.4'] 
        answer = resolver.resolve(hostname, 'A')
        ipv4_address = answer[0].to_text()
        print(f"Resolved to IPv4: {ipv4_address}")
        
        # Replace hostname with IP in the URL
        new_netloc = parsed.netloc.replace(hostname, ipv4_address)
        parsed = parsed._replace(netloc=new_netloc)
        DATABASE_URL = urlunparse(parsed)
        print(f"Modified URL (IPv4): {DATABASE_URL.split('@')[-1]}") # Masked

except Exception as e:
    print(f"WARNING: DNS Resolution failed ({e}). Falling back to system DNS.")

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
