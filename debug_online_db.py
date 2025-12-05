import psycopg2
import os

# Connection String from .env
DB_URL = "postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:5432/postgres"

print(f"Connecting to: {DB_URL}")

try:
    conn = psycopg2.connect(DB_URL)
    print("✅ Connection Successful!")
    
    cur = conn.cursor()
    
    # Check Admin
    print("Checking Admin...")
    cur.execute("SELECT email, role FROM users WHERE email='admin@get2gather.com'")
    user = cur.fetchone()
    if user:
        print(f"✅ Found Admin: {user}")
    else:
        print("❌ Admin NOT found. Attempting insert...")
        # NOTE: This is a raw insert, password hash might not match backend's algo if we don't use passlib
        # But we just want to see if we can write.
    
    conn.close()

except Exception as e:
    print(f"❌ Connection Failed: {e}")
