import asyncio
from database import engine, Base, get_db
from models import User, Student, UserRole, Event, Organizer
from routers.security_utils import get_password_hash
from sqlalchemy.future import select
from datetime import datetime, timedelta

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async for db in get_db():
        # 1. Create Student User
        result = await db.execute(select(User).where(User.email == "test@paruluniversity.ac.in"))
        user = result.scalar_one_or_none()
        
        if not user:
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
            print("Student created.")
        else:
            print("Student already exists.")

        # 2. Create Organizer User
        result = await db.execute(select(User).where(User.email == "organizer@paruluniversity.ac.in"))
        org_user = result.scalar_one_or_none()
        
        if not org_user:
            hashed_pw = get_password_hash("password123")
            org_user = User(
                email="organizer@paruluniversity.ac.in",
                hashed_password=hashed_pw,
                role=UserRole.ORGANIZER,
                is_active=True
            )
            db.add(org_user)
            await db.commit()
            await db.refresh(org_user)

            organizer = Organizer(
                user_id=org_user.id,
                organization_name="Tech Club",
                contact="1234567890"
            )
            db.add(organizer)
            await db.commit()
            await db.refresh(organizer)
            print("Organizer created.")
        else:
            # Fetch existing organizer profile
            result = await db.execute(select(Organizer).where(Organizer.user_id == org_user.id))
            organizer = result.scalar_one_or_none()

        # 3. Create Event
        # Check if event exists
        result = await db.execute(select(Event).where(Event.title == "Tech Talk 2024"))
        event = result.scalar_one_or_none()
        
        if not event and organizer:
            tomorrow = datetime.now() + timedelta(days=1)
            event = Event(
                organizer_id=organizer.id,
                title="Tech Talk 2024",
                description="An amazing tech talk about AI.",
                category="Technology",
                capacity=100,
                seats_available=100,
                date=tomorrow.strftime("%Y-%m-%d"),
                time="10:00 AM",
                venue="Auditorium",
                status="Upcoming",
                image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"
            )
            db.add(event)
            await db.commit()
            print("Event created.")
        else:
            print("Event already exists.")

if __name__ == "__main__":
    asyncio.run(seed_data())
