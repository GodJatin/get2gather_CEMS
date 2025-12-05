from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import urllib.parse

# Construct the URL correctly
# Original: postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:5432/postgres
# We need to ensure special chars in password are handled, though %40 is already encoded '@'
db_url = "postgresql://postgres:J%40tin224@db.vqfnndepdzdewugdcwjg.supabase.co:5432/postgres"

print(f"Connecting to: {db_url.split('@')[-1]}")

try:
    engine = create_engine(db_url)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("✅ Connection Successful!")
        
        # Check for User table
        try:
            result = connection.execute(text("SELECT email, role FROM users WHERE email='admin@get2gather.com'"))
            admin = result.fetchone()
            if admin:
                print(f"✅ Admin found: {admin}")
            else:
                print("❌ Admin NOT found")
        except Exception as e:
             print(f"❌ Could not query users table (might not exist): {e}")

        # Check for Invite
        try:
            result = connection.execute(text("SELECT email, invite_code FROM organizer_invites WHERE invite_code='ABCD1234'"))
            invite = result.fetchone()
            if invite:
                 print(f"✅ Invite found: {invite}")
            else:
                 print(f"❌ Invite NOT found")
        except Exception as e:
             print(f"❌ Could not query invites table: {e}")

except Exception as e:
    print(f"❌ Connection Failed: {e}")
