import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add path
sys.path.append(os.getcwd())

from database import Base, engine
from models import User, Student, UserRole
from routers.security_utils import get_password_hash

def create_test_user():
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Check if user exists
        email = "test@paruluniversity.ac.in"
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            print("User already exists.")
            return

        # Create User
        print(f"Creating user {email}...")
        hashed_pw = get_password_hash("password123")
        user = User(
            email=email,
            hashed_password=hashed_pw,
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create Student Profile
        print("Creating student profile...")
        student = Student(
            user_id=user.id,
            name="Test Student",
            contact="9876543210",
            department="CSE",
            enrollment_number="200303124999",
            spent_points=0
        )
        db.add(student)
        db.commit()
        print("Test user created successfully.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
