import psycopg2
import sys

PROJECT_ID = "vqfnndepdzdewugdcwjg"
PASSWORD = "J@tin224"
USER = f"postgres.{PROJECT_ID}"
DB_NAME = "postgres"

REGIONS = [
    # ASIA
    "aws-0-ap-south-1.pooler.supabase.com",      # Mumbai
    "aws-0-ap-southeast-1.pooler.supabase.com",  # Singapore
    "aws-0-ap-northeast-1.pooler.supabase.com",  # Tokyo
    "aws-0-ap-northeast-2.pooler.supabase.com",  # Seoul
    "aws-0-ap-southeast-2.pooler.supabase.com",  # Sydney
    
    # US
    "aws-0-us-east-1.pooler.supabase.com",       # N. Virginia
    "aws-0-us-west-1.pooler.supabase.com",       # N. California
    "aws-0-us-west-2.pooler.supabase.com",       # Oregon
    
    # EU
    "aws-0-eu-central-1.pooler.supabase.com",    # Frankfurt
    "aws-0-eu-west-1.pooler.supabase.com",       # Ireland
    "aws-0-eu-west-2.pooler.supabase.com",       # London
    "aws-0-eu-west-3.pooler.supabase.com",       # Paris
    
    # OTHERS
    "aws-0-sa-east-1.pooler.supabase.com",       # Sao Paulo
    "aws-0-ca-central-1.pooler.supabase.com",    # Canada
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
