import requests
import json
from datetime import datetime, timedelta
import sqlite3

BASE_URL = "http://localhost:8000"
DB_PATH = "C:/Users/HP/.gemini/test_sync_final.db"

# Credentials
ORG_EMAIL = "organizer@paruluniversity.ac.in"
ORG_PASSWORD = "OrgPassword123"
STUDENT_EMAIL = "test@paruluniversity.ac.in"
STUDENT_PASSWORD = "password123"

def get_token(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

def setup_preview():
    print("🛠️ Setting up Preview Data...")
    
    # 1. Login
    org_token = get_token(ORG_EMAIL, ORG_PASSWORD)
    student_token = get_token(STUDENT_EMAIL, STUDENT_PASSWORD)
    
    if not org_token or not student_token:
        print("❌ Login failed")
        return

    org_headers = {"Authorization": f"Bearer {org_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # 2. Create Event (Initially Future)
    print("2. Creating 'Past Workshop'...")
    now = datetime.now()
    # Create it for TOMORROW first so we can book it easily
    event_date = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    event_time = "10:00"
    
    dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    event_payload = {
        "title": f"Past Workshop Preview",
        "category": "Workshop",
        "capacity": 50,
        "description": "This event should appear as Completed.",
        "date": event_date,
        "time": event_time,
        "venue": "Auditorium",
        "department": "CSE",
        "open_for": "Everyone",
        "images": json.dumps([dummy_image]),
        "image_url": dummy_image,
        "seats_available": 50,
        "organizer_id": 1,
        "status": "Upcoming"
    }
    
    response = requests.post(f"{BASE_URL}/events/", json=event_payload, headers=org_headers)
    if response.status_code != 200:
        print(f"❌ Event creation failed: {response.text}")
        return
    event_id = response.json()['id']
    print(f"✅ Event created: ID {event_id}")
    
    # 3. Book Event
    print("3. Booking Event...")
    booking_response = requests.post(f"{BASE_URL}/bookings/", json={"event_id": event_id}, headers=student_headers)
    if booking_response.status_code == 200:
        print(f"✅ Booking successful")
    elif "already booked" in booking_response.text:
        print("ℹ️ Already booked")
    else:
        print(f"❌ Booking failed: {booking_response.text}")
        return

    # 4. Time Travel (Update DB to make event past)
    print("4. Time Traveling (Updating DB to yesterday)...")
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        yesterday = (now - timedelta(days=1)).strftime("%Y-%m-%d")
        cursor.execute("UPDATE events SET date = ? WHERE id = ?", (yesterday, event_id))
        conn.commit()
        conn.close()
        print(f"✅ Event {event_id} moved to {yesterday}")
    except Exception as e:
        print(f"❌ DB Update failed: {e}")

if __name__ == "__main__":
    setup_preview()
