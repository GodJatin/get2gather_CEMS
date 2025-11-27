import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Add path
sys.path.append(os.getcwd())

from database import Base
from models import User, UserRole, Organizer, Event
from routers.security_utils import get_password_hash

def setup_organizer():
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///C:/Users/HP/.gemini/test_sync_final.db").replace("sqlite+aiosqlite", "sqlite")
    engine = create_engine(DATABASE_URL, echo=True)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Organizer User
        email = "organizer@paruluniversity.ac.in"
        password = "OrgPassword123"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating organizer: {email}")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                role=UserRole.ORGANIZER,
                is_active=True,
                organization_name="PU Events Committee",
                contact="9876543210"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            organizer = Organizer(
                user_id=user.id,
                organization_name="PU Events Committee",
                contact="9876543210"
            )
            db.add(organizer)
            db.commit()
            db.refresh(organizer)
        else:
            print(f"Organizer found: {email}")
            organizer = db.query(Organizer).filter(Organizer.user_id == user.id).first()

        # 2. Create Events
        events_data = [
            {
                "title": "Tech Talk 2024",
                "description": "A deep dive into AI and Future Tech.",
                "category": "Technology",
                "capacity": 100,
                "seats_available": 100,
                "date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
                "time": "10:00 AM",
                "venue": "Auditorium A",
                "status": "Upcoming"
            },
            {
                "title": "Cultural Fest Night",
                "description": "Music, Dance, and Fun!",
                "category": "Cultural",
                "capacity": 500,
                "seats_available": 500,
                "date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
                "time": "06:00 PM",
                "venue": "Main Ground",
                "status": "Upcoming"
            },
            {
                "title": "Coding Hackathon",
                "description": "24-hour coding challenge.",
                "category": "Competition",
                "capacity": 50,
                "seats_available": 50,
                "date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "time": "09:00 AM",
                "venue": "Lab 101",
                "status": "Upcoming"
            }
        ]

        for event_data in events_data:
            exists = db.query(Event).filter(Event.title == event_data["title"]).first()
            if not exists:
                print(f"Creating event: {event_data['title']}")
                event = Event(
                    organizer_id=organizer.id,
                    **event_data
                )
                db.add(event)
            else:
                print(f"Event exists: {event_data['title']}")
        
        db.commit()
        print("Organizer and events setup complete.")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    setup_organizer()
