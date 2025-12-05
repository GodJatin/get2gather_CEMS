import psycopg2
import os

# Connection String targeting the POOLER (Port 6543)
# We verified 5432 works and has data. We need to check if 6543 sees that data.
DB_URL = "postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:6543/postgres"

print(f"Connecting to POOLER: {DB_URL}")

try:
    conn = psycopg2.connect(DB_URL)
    print("✅ Connection Successful to Port 6543!")
    
    cur = conn.cursor()
    
    # Check Admin
    print("Checking Admin via Pooler...")
    cur.execute("SELECT email, role FROM users WHERE email='admin@get2gather.com'")
    user = cur.fetchone()
    if user:
        print(f"✅ Found Admin via Pooler: {user}")
    else:
        print("❌ Admin NOT found via Pooler (Sync Issue?)")
    
    conn.close()

except Exception as e:
    print(f"❌ Connection Failed to Pooler: {e}")
