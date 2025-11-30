import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add path
sys.path.append(os.getcwd())

from database import SessionLocal
from models import User, UserRole

def verify_admin():
    db = SessionLocal()
    try:
        email = "admin@get2gather.com"
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print(f"✅ Admin Found: {user.email}")
            print(f"Role: {user.role}")
            print(f"Is Active: {user.is_active}")
            print(f"Password Hash: {user.hashed_password[:10]}...")
        else:
            print("❌ Admin user NOT found!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_admin()
