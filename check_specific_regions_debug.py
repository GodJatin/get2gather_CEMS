import psycopg2

PROJECT = "vqfnndepdzdewugdcwjg"
PASS = "J@tin224"
USER = f"postgres.{PROJECT}"

CANDIDATES = [
    ("Mumbai (AWS)", "aws-0-ap-south-1.pooler.supabase.com"),
    ("Hyderabad (AWS)", "aws-0-ap-south-2.pooler.supabase.com"), # NEW CANDIDATE
    ("Singapore (AWS)", "aws-0-ap-southeast-1.pooler.supabase.com"),
    ("Singapore (GCP)", "gcp-0-asia-southeast1.pooler.supabase.com"),
    ("Tokyo (AWS)", "aws-0-ap-northeast-1.pooler.supabase.com"),
    ("Frankfurt (AWS)", "aws-0-eu-central-1.pooler.supabase.com"),
    ("US East (AWS)", "aws-0-us-east-1.pooler.supabase.com"),
]

print(f"🕵️ Debugging Project: {PROJECT}")
print(f"👤 User: {USER}")

for name, host in CANDIDATES:
    print(f"\n--- Checking {name} ---")
    print(f"Host: {host}")
    try:
        conn = psycopg2.connect(
            host=host,
            database="postgres",
            user=USER,
            password=PASS,
            port=6543,
            sslmode="require",
            connect_timeout=5
        )
        print("✅ SUCCESS!!! FOUND IT!")
        conn.close()
        break
    except Exception as e:
        msg = str(e).strip()
        if "Tenant or user not found" in msg:
            print("❌ Tenant Not Found (Wrong Region)")
        elif "password authentication failed" in msg:
            print("🔑 FOUND REGION! (Password incorrect, but Tenant Exists)")
        elif "could not translate host name" in msg:
             print("⚠️ Hostname Invalid (Region might not exist)")
        elif "timeout" in msg:
             print("⏳ Timeout")
        else:
            print(f"⚠️ Error: {msg}")
