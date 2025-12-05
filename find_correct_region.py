import psycopg2
import sys

PROJECT_ID = "vqfnndepdzdewugdcwjg"
PASSWORD = "J@tin224"
USER = f"postgres.{PROJECT_ID}"
DB_NAME = "postgres"

REGIONS = [
    # Common AWS Regions
    "aws-0-ap-south-1.pooler.supabase.com",
    "aws-0-ap-southeast-1.pooler.supabase.com",
    "aws-0-us-east-1.pooler.supabase.com",
    "aws-0-eu-central-1.pooler.supabase.com",
    "aws-0-us-west-1.pooler.supabase.com",
    
    # Common GCP Regions
    "gcp-0-us-central1.pooler.supabase.com",
    "gcp-0-asia-southeast1.pooler.supabase.com", # Singapore GCP!
    "gcp-0-europe-west1.pooler.supabase.com",
    "gcp-0-europe-west2.pooler.supabase.com",
    "gcp-0-asia-east1.pooler.supabase.com",      # Taiwan
    
    # Azure (Fly)
    "fly-0-iad.pooler.supabase.com",             # Fly.io pg
]

print(f"🔎 Hunting for project '{PROJECT_ID}' across {len(REGIONS)} regions...")
print(f"User: {USER}")

for host in REGIONS:
    print(f"\nTrying {host} ...", end=" ")
    try:
        conn = psycopg2.connect(
            host=host,
            user=USER,
            password=PASSWORD,
            dbname=DB_NAME,
            port=6543,
            sslmode="require",
            connect_timeout=3
        )
        print("✅ SUCCESS! CONNECTED!")
        print(f"🎯 CORRECT HOST: {host}")
        conn.close()
        break
    except psycopg2.OperationalError as e:
        err = str(e)
        if "Tenant or user not found" in err:
            print("❌ Tenant Not Found (Wrong Region)")
        elif "password authentication failed" in err:
            print("🔑 FOUND REGION! (Password might be wrong, or user format, but tenant exists)")
            print(f"🎯 CORRECT HOST: {host}")
            break
        elif "timeout" in err:
             print("⏳ Timeout")
        else:
            print(f"⚠️ Error: {err.strip()}")
    except Exception as e:
        print(f"⚠️ Unexpected: {e}")
