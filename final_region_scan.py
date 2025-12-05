import psycopg2
import sys

PROJECT = "vqfnndepdzdewugdcwjg"
PASS = "J@tin224"

# Full List of likely regions
REGIONS = [
    "aws-0-ap-south-1.pooler.supabase.com",      # Mumbai
    "aws-0-ap-southeast-1.pooler.supabase.com",  # Singapore
    "aws-0-ap-northeast-1.pooler.supabase.com",  # Tokyo
    "aws-0-ap-northeast-2.pooler.supabase.com",  # Seoul
    "aws-0-ap-southeast-2.pooler.supabase.com",  # Sydney
    "aws-0-us-east-1.pooler.supabase.com",       # N. Virginia
    "aws-0-us-west-1.pooler.supabase.com",       # N. California
    "aws-0-us-west-2.pooler.supabase.com",       # Oregon
    "aws-0-eu-central-1.pooler.supabase.com",    # Frankfurt
    "aws-0-eu-west-1.pooler.supabase.com",       # Ireland
    "aws-0-eu-west-2.pooler.supabase.com",       # London
    "aws-0-eu-west-3.pooler.supabase.com",       # Paris
    "aws-0-sa-east-1.pooler.supabase.com",       # Sao Paulo
    "aws-0-ca-central-1.pooler.supabase.com",    # Canada
    "gcp-0-asia-southeast1.pooler.supabase.com", # GCP Singapore
    "gcp-0-us-central1.pooler.supabase.com",     # GCP US
]

print(f"🔎 Scanning regions for project '{PROJECT}'...")

for host in REGIONS:
    # Try different user/option combos
    combos = [
        (f"postgres.{PROJECT}", None, "Standard"),
        ("postgres", f"-c project={PROJECT}", "Options"),
    ]
    
    for user, options, label in combos:
        try:
            print(f"Checking {host} ({label})...", end=" ")
            conn = psycopg2.connect(
                host=host,
                database="postgres",
                user=user,
                password=PASS,
                port=6543,
                sslmode="require",
                connect_timeout=3,
                options=options
            )
            print("✅ SUCCESS!")
            print(f"🎉 FOUND REGION: {host}")
            print(f"🎉 CONFIG: User={user}, Options={options}")
            conn.close()
            sys.exit(0)
        except Exception as e:
            msg = str(e).strip()
            if "Tenant or user not found" in msg:
                print("❌ Tenant Not Found")
            elif "password" in msg:
                print("🔑 AUTH ERROR (Tenant Exists!)")
                print(f"🎉 FOUND REGION: {host} (Bad Pass?)")
                sys.exit(0)
            else:
                pass # print(f"⚠️ {msg}")
    print("") # Newline
