import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from models import User, UserRole

DATABASE_URL = "sqlite+aiosqlite:///./test.db"

async def get_demo_student():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        result = await db.execute(select(User).where(User.role == UserRole.ORGANIZER).limit(1))
        user = result.scalar_one_or_none()
        if user:
            print(f"Email: {user.email}")
            print(f"Password: password123") # Known from seed.py
        else:
            print("No organizer found.")

if __name__ == "__main__":
    asyncio.run(get_demo_student())
