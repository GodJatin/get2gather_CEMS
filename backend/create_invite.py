import asyncio
from database import SessionLocal
from models import OrganizerInvite

async def create_invite():
    async with SessionLocal() as session:
        invite = OrganizerInvite(
            email="organizer@test.com",
            invite_code="ADMIN123",
            is_used=False
        )
        session.add(invite)
        await session.commit()
        print("Invite created successfully")

if __name__ == "__main__":
    asyncio.run(create_invite())
