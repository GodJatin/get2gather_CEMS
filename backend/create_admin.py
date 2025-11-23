import asyncio
from sqlalchemy.future import select
from database import SessionLocal
from models import User, UserRole
from routers.security_utils import get_password_hash

async def create_admin():
    async with SessionLocal() as db:
        # Check if admin exists
        result = await db.execute(select(User).where(User.email == "admin@get2gather.com"))
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print("Admin user already exists.")
            return

        # Create Admin
        print("Creating admin user...")
        hashed_pw = get_password_hash("admin123")
        new_admin = User(
            email="admin@get2gather.com",
            hashed_password=hashed_pw,
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(new_admin)
        await db.commit()
        print("✅ Admin user created successfully!")
        print("Email: admin@get2gather.com")
        print("Password: admin123")

if __name__ == "__main__":
    asyncio.run(create_admin())
