import asyncio
from database import SessionLocal
from models import RegistrationAttempt
from sqlalchemy import select

async def check_attempt():
    async with SessionLocal() as session:
        result = await session.execute(select(RegistrationAttempt).where(RegistrationAttempt.email == "organizer@test.com"))
        attempt = result.scalar_one_or_none()
        
        if attempt:
            print(f"Attempt found: verified={attempt.is_verified}, otp={attempt.otp}")
        else:
            print("Attempt not found")

if __name__ == "__main__":
    asyncio.run(check_attempt())
