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
    
    # DETECT REGION via TimeZone and IP
    cur.execute("SELECT current_setting('TIMEZONE'), inet_server_addr(), version();")
    tz, ip, ver = cur.fetchone()
    print(f"🌍 DB TimeZone: {tz}")
    print(f"💻 DB Server IP: {ip}")
    print(f"📜 Version: {ver}")
    
    conn.close()

except Exception as e:
    print(f"❌ Connection Failed to Pooler: {e}")
