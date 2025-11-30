import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add path
sys.path.append(os.getcwd())

from database import SessionLocal
from models import User, UserRole
from routers.security_utils import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        email = "admin@get2gather.com"
        existing_admin = db.query(User).filter(User.email == email).first()

        if existing_admin:
            print("Admin user already exists.")
            return

        # Create Admin
        print("Creating admin user...")
        hashed_pw = get_password_hash("admin123")
        new_admin = User(
            email=email,
            hashed_password=hashed_pw,
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(new_admin)
        db.commit()
        print("✅ Admin user created successfully!")
        print(f"Email: {email}")
        print("Password: admin123")
    
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
