import asyncio
from database import get_db
from models import Event
from sqlalchemy.future import select

async def verify_event():
    async for db in get_db():
        result = await db.execute(select(Event).where(Event.title == "Tech Talk 2024"))
        event = result.scalar_one_or_none()
        if event:
            print(f"Event found: {event.title} (ID: {event.id})")
        else:
            print("Event NOT found.")

if __name__ == "__main__":
    asyncio.run(verify_event())
