import asyncio
from database import SessionLocal
from models import User, Organizer, UserRole
from routers.security_utils import get_password_hash
from sqlalchemy.future import select

async def create_test_organizer():
    async with SessionLocal() as db:
        email = "organizer@test.com"
        password = "password123"
        
        # Check if user exists
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"User {email} already exists.")
        else:
            print(f"Creating user {email}...")
            hashed_pw = get_password_hash(password)
            user = User(email=email, hashed_password=hashed_pw, role=UserRole.ORGANIZER)
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"User created with ID: {user.id}")

        # Check if organizer profile exists
        result = await db.execute(select(Organizer).where(Organizer.user_id == user.id))
        organizer = result.scalar_one_or_none()
        
        if organizer:
            print("Organizer profile already exists.")
        else:
            print("Creating organizer profile...")
            organizer = Organizer(
                user_id=user.id,
                organization_name="Test Organization",
                contact="1234567890"
            )
            db.add(organizer)
            await db.commit()
            print("Organizer profile created.")

if __name__ == "__main__":
    asyncio.run(create_test_organizer())
