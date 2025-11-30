import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

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

def test_full_scan_flow():
    print("🔍 Testing Full Scan Flow (Create -> Book -> Scan)\n")
    
    # 1. Login as Organizer
    print("1. Logging in as Organizer...")
    org_token = get_token(ORG_EMAIL, ORG_PASSWORD)
    if not org_token:
        print("❌ Organizer login failed")
        return
    org_headers = {"Authorization": f"Bearer {org_token}"}
    
    # 2. Create Event starting in 30 mins
    print("2. Creating event starting in 30 mins...")
    now = datetime.now()
    event_date = now.strftime("%Y-%m-%d")
    event_time = (now + timedelta(minutes=30)).strftime("%H:%M")
    
    dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    event_payload = {
        "title": f"Scan Test Event {now.strftime('%H%M%S')}",
        "category": "Technical",
        "capacity": 10,
        "description": "Event for testing scanning",
        "date": event_date,
        "time": event_time,
        "venue": "Test Lab",
        "department": "CSE",
        "open_for": "Everyone",
        "images": json.dumps([dummy_image]),
        "image_url": dummy_image,
        "seats_available": 10,
        "organizer_id": 1, # Dummy
        "status": "Upcoming"
    }
    
    response = requests.post(f"{BASE_URL}/events/", json=event_payload, headers=org_headers)
    if response.status_code != 200:
        print(f"❌ Event creation failed: {response.text}")
        return
    
    event = response.json()
    event_id = event['id']
    print(f"✅ Event created: {event['title']} (ID: {event_id})")
    
    # 3. Login as Student
    print("\n3. Logging in as Student...")
    student_token = get_token(STUDENT_EMAIL, STUDENT_PASSWORD)
    if not student_token:
        print("❌ Student login failed")
        return
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # 4. Book Event
    print("4. Booking event...")
    booking_response = requests.post(f"{BASE_URL}/bookings/", json={"event_id": event_id}, headers=student_headers)
    if booking_response.status_code != 200:
        print(f"❌ Booking failed: {booking_response.text}")
        return
    
    booking = booking_response.json()
    qr_code = booking.get('qr_code')
    print(f"✅ Booking successful. QR Code: {qr_code}")
    
    if not qr_code:
        print("❌ No QR code generated")
        return
        
    # 5. Scan QR Code (as Organizer)
    print("\n5. Scanning QR Code...")
    scan_payload = {"qr_data": qr_code}
    scan_response = requests.post(f"{BASE_URL}/scan/checkin", json=scan_payload, headers=org_headers)
    
    if scan_response.status_code == 200:
        result = scan_response.json()
        print("✅ Scan Successful!")
        print(f"   Message: {result['message']}")
        print(f"   Student: {result['student_name']}")
        print(f"   Points: {result['points_earned']}")
    else:
        print(f"❌ Scan failed: {scan_response.status_code}")
        print(scan_response.text)

if __name__ == "__main__":
    test_full_scan_flow()
