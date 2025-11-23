import asyncio
from database import SessionLocal
from models import User, Organizer, OrganizerInvite
from sqlalchemy import select

async def cleanup_user():
    async with SessionLocal() as session:
        # Find user
        result = await session.execute(select(User).where(User.email == "organizer@test.com"))
        user = result.scalar_one_or_none()
        
        if user:
            # Delete organizer profile if exists
            result = await session.execute(select(Organizer).where(Organizer.user_id == user.id))
            organizer = result.scalar_one_or_none()
            if organizer:
                await session.delete(organizer)
            
            # Delete user
            await session.delete(user)
            print("User deleted")
        
        # Reset invite
        result = await session.execute(select(OrganizerInvite).where(OrganizerInvite.email == "organizer@test.com"))
        invite = result.scalar_one_or_none()
        if invite:
            invite.is_used = False
            print("Invite reset")
            
        await session.commit()

if __name__ == "__main__":
    asyncio.run(cleanup_user())
