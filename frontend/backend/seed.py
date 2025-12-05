import asyncio
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import Base, User, Student, Organizer, Event, Booking, UserRole, FeedPost, user_follows, OrganizerInvite
import bcrypt
from datetime import datetime, timedelta

from database import DATABASE_URL as SYNC_DATABASE_URL

# Convert sync URL to async URL for asyncpg
if SYNC_DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
elif SYNC_DATABASE_URL.startswith("sqlite"):
    DATABASE_URL = "sqlite+aiosqlite:///./test.db"
else:
    DATABASE_URL = SYNC_DATABASE_URL

print(f"Seeding database: {DATABASE_URL.split('@')[-1]}") # Log masked URL

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("Seeding data...")

        # 1. Create Organizers
        org_users = []
        departments = ["PICA", "PIET", "PIP", "PIMR", "PARUL"]
        
        for dept in departments:
            user = User(
                email=f"{dept.lower()}@paruluniversity.ac.in",
                hashed_password=get_password_hash("password123"),
                role=UserRole.ORGANIZER,
                organization_name=f"{dept} Events Committee",
                contact="9876543210"
            )
            db.add(user)
            await db.flush()
            
            organizer = Organizer(
                user_id=user.id,
                organization_name=f"{dept} Events Committee",
                contact="9876543210"
            )
            db.add(organizer)
            await db.flush()
            org_users.append(organizer)
        
        # 2. Create Events (Past, Upcoming, Trending)
        events = []
        categories = ["Technical", "Cultural", "Sports", "Workshop", "Seminar"]
        
        for i in range(20):
            org = random.choice(org_users)
            is_past = i < 5
            date = (datetime.now() + timedelta(days=random.randint(-10, 30))).strftime("%Y-%m-%d")
            
            event = Event(
                organizer_id=org.id,
                title=f"{random.choice(['Annual', 'Mega', 'Inter-College', 'State Level'])} {random.choice(categories)} {random.choice(['Fest', 'Meet', 'Hackathon', 'Gala'])} {i+1}",
                description="Join us for an amazing experience with industry experts and fun activities.",
                category=random.choice(categories),
                capacity=random.randint(50, 500),
                seats_available=random.randint(0, 50), # Low seats for trending
                date=date,
                time="10:00 AM",
                venue=f"{org.organization_name.split()[0]} Auditorium",
                department=org.organization_name.split()[0],
                open_for="Everyone",
                status="Completed" if is_past else "Upcoming",
                hashtags=f"#{random.choice(categories)}, #Fun, #2025",
                is_paid=random.choice([True, False]),
                price=random.randint(100, 500) if random.choice([True, False]) else 0,
                image_url=f"https://placehold.co/600x400?text=Event+{i+1}",
                images=f'["https://placehold.co/600x400?text=Event+{i+1}", "https://placehold.co/600x400?text=Details+1", "https://placehold.co/600x400?text=Details+2"]'
            )
            db.add(event)
            events.append(event)
        
        await db.flush()

        # 3. Create Students
        students = []
        for i in range(20):
            dept = random.choice(departments)
            user = User(
                email=f"200303124{i:03d}@paruluniversity.ac.in",
                hashed_password=get_password_hash("password123"),
                role=UserRole.STUDENT
            )
            db.add(user)
            await db.flush()
            
            student = Student(
                user_id=user.id,
                name=f"Student {i+1}",
                department=dept,
                enrollment_number=f"200303124{i:03d}",
                title=random.choice(["Tech Wizard", "Rising Star", "Event Enthusiast", None]),
                badges=[{"name": "Bronze", "icon": "🥉"}] if i % 3 == 0 else []
            )
            db.add(student)
            students.append(student)

        await db.flush()

        # 4. Create Bookings (To populate leaderboard)
        for student in students:
            # Randomly book 1-10 events
            num_bookings = random.randint(1, 10)
            booked_events = random.sample(events, num_bookings)
            
            for event in booked_events:
                booking = Booking(
                    event_id=event.id,
                    student_id=student.id,
                    booking_date=datetime.now().isoformat(),
                    status="Confirmed"
                )
                db.add(booking)
                
                # Decrease seats
                if event.seats_available > 0:
                    event.seats_available -= 1

        # 5. Social Data (Follows & Posts)
        # Random follows
        for student in students:
            target = random.choice(students)
            if target.id != student.id:
                stmt = user_follows.insert().values(follower_id=student.user_id, followed_id=target.user_id)
                await db.execute(stmt)

        # Random Posts
        for i in range(10):
            student = random.choice(students)
            post = FeedPost(
                user_id=student.user_id,
                content=f"Just registered for an amazing event! Can't wait! 🚀 #{random.choice(categories)}",
                created_at=datetime.now().isoformat(),
                feeling="excited"
            )
            db.add(post)

        await db.commit()
        print("Seeding complete!")

        # 6. Create Specific Organizer Invite
        invite = OrganizerInvite(
            email="224jatin2006@gmail.com",
            invite_code="ABCD1234",
            is_used=False
        )
        # Check if exists
        from sqlalchemy import select
        result = await db.execute(select(OrganizerInvite).where(OrganizerInvite.email == "224jatin2006@gmail.com"))
        existing_invite = result.scalar_one_or_none()
        if not existing_invite:
            db.add(invite)
            print("Added invite code for 224jatin2006@gmail.com")
        
        # 7. Create Admin User
        result = await db.execute(select(User).where(User.email == "admin@get2gather.com"))
        existing_admin = result.scalar_one_or_none()
        if not existing_admin:
            admin_user = User(
                email="admin@get2gather.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin_user)
            print("Added Admin User: admin@get2gather.com / admin123")

        await db.commit()

if __name__ == "__main__":
    asyncio.run(init_db())
    asyncio.run(seed_data())
