import asyncio
import sys
from database import SessionLocal
from models import OrganizerInvite

async def add_invite(email: str, invite_code: str):
    """
    Add a new organizer invite to the database.
    Usage: python add_organizer_invite.py <email> <invite_code>
    """
    if len(invite_code) != 8:
        print(f"❌ Error: Invite code must be exactly 8 characters long. Got: {len(invite_code)}")
        return
    
    async with SessionLocal() as session:
        # Check if invite already exists
        from sqlalchemy import select
        result = await session.execute(
            select(OrganizerInvite).where(OrganizerInvite.email == email)
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print(f"⚠️  Invite for {email} already exists with code: {existing.invite_code}")
            print(f"   Is used: {existing.is_used}")
            
            # Update the invite code and reset is_used
            existing.invite_code = invite_code
            existing.is_used = False
            await session.commit()
            print(f"✅ Updated invite code for {email} to: {invite_code}")
        else:
            invite = OrganizerInvite(
                email=email,
                invite_code=invite_code,
                is_used=False
            )
            session.add(invite)
            await session.commit()
            print(f"✅ Created new invite for {email} with code: {invite_code}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python add_organizer_invite.py <email> <invite_code>")
        print("Example: python add_organizer_invite.py user@example.com ADMIN123")
        sys.exit(1)
    
    email = sys.argv[1]
    invite_code = sys.argv[2]
    
    asyncio.run(add_invite(email, invite_code))
