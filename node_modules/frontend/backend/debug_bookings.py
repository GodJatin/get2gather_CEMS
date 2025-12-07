from database import SessionLocal
from models import Booking, Event
from datetime import datetime

db = SessionLocal()
bookings = db.query(Booking).all()
print(f"Total bookings: {len(bookings)}")
for b in bookings:
    print(f"Booking: ID={b.id}, Event={b.event.title}, User={b.student.name}, Status={b.status}, Date={b.booking_date}")

events = db.query(Event).all()
print(f"Total events: {len(events)}")
for e in events:
    print(f"Event: {e.title}, Date={e.date}, Time={e.time}, Status={e.status}")
