import asyncio
import sys
import os
from sqlalchemy.future import select

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from database import get_db, SessionLocal
from models import User
from routers.security_utils import verify_password, get_password_hash

async def check_user():
    email = "test@example.com"
    password = "password"

    print(f"Checking user: {email}")

    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            print(f"User found: {user.email}")
        else:
            print("User not found. Creating user...")
            hashed_pw = get_password_hash(password)
            # Assuming 'student' role for test user, need to import UserRole if strict
            from models import UserRole
            new_user = User(email=email, hashed_password=hashed_pw, role=UserRole.STUDENT)
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            
            from models import Student
            new_student = Student(
                user_id=new_user.id,
                name="Test Student",
                contact="1234567890",
                department="CSE",
                enrollment_number="1234567890123"
            )
            db.add(new_student)
            await db.commit()
            print(f"User created with password: {password}")

if __name__ == "__main__":
    asyncio.run(check_user())
