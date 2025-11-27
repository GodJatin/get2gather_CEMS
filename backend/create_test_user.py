import asyncio
from database import engine, Base, get_db
from models import User, Student, UserRole
from routers.security_utils import get_password_hash
from sqlalchemy.future import select

async def create_test_user():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async for db in get_db():
        # Check if user exists
        result = await db.execute(select(User).where(User.email == "test@paruluniversity.ac.in"))
        if result.scalar_one_or_none():
            print("User already exists.")
            return

        # Create User
        hashed_pw = get_password_hash("password123")
        user = User(
            email="test@paruluniversity.ac.in",
            hashed_password=hashed_pw,
            role=UserRole.STUDENT,
            is_active=True
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Create Student Profile
        student = Student(
            user_id=user.id,
            name="Test Student",
            contact="9876543210",
            department="CSE",
            enrollment_number="200303124999",
            spent_points=0
        )
        db.add(student)
        await db.commit()
        print("Test user created successfully.")
        return

if __name__ == "__main__":
    asyncio.run(create_test_user())
