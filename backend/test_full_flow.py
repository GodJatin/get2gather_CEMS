import requests

BASE_URL = "http://127.0.0.1:8000"

def login(email, password):
    response = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    print(f"Login failed for {email}: {response.text}")
    return None

def test_flow():
    # 1. Login as Organizer
    print("Logging in as Organizer...")
    org_token = login("organizer@test.com", "password123")
    if not org_token: return
    org_headers = {"Authorization": f"Bearer {org_token}"}

    # 2. Create Event with 1 seat
    print("\nCreating Event...")
    event_data = {
        "title": "Test Event 1",
        "description": "Testing bookings",
        "category": "Tech",
        "capacity": 1,
        "date": "2023-12-25",
        "time": "10:00",
        "venue": "Hall A",
        "is_paid": False,
        "price": 0
    }
    res = requests.post(f"{BASE_URL}/events/", json=event_data, headers=org_headers)
    if res.status_code != 200:
        print(f"Create event failed: {res.text}")
        return
    event_id = res.json()["id"]
    print(f"Event created with ID: {event_id}")

    # 3. Login as Student
    print("\nLogging in as Student...")
    student_token = login("test@example.com", "password") # Assuming this user exists
    if not student_token: return
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 4. Book Event
    print("\nBooking Event...")
    res = requests.post(f"{BASE_URL}/bookings/", json={"event_id": event_id}, headers=student_headers)
    if res.status_code == 200:
        print("Booking successful")
    else:
        print(f"Booking failed: {res.text}")

    # 5. Check Seats
    print("\nChecking Seats...")
    res = requests.get(f"{BASE_URL}/events/{event_id}", headers=student_headers)
    seats = res.json()["seats_available"]
    print(f"Seats available: {seats}")

    # 6. Try to Book Again (Should fail)
    print("\nBooking Again (Should fail)...")
    res = requests.post(f"{BASE_URL}/bookings/", json={"event_id": event_id}, headers=student_headers)
    print(f"Status: {res.status_code}, Response: {res.text}")

    # 7. Join Waitlist (Should fail if seats > 0, but here seats are 0 so should succeed)
    print("\nJoining Waitlist...")
    res = requests.post(f"{BASE_URL}/events/{event_id}/waitlist", headers=student_headers)
    print(f"Status: {res.status_code}, Response: {res.text}")

    # 8. Try to Update Event (Organizer) - Should Succeed now
    print("\nUpdating Event (Organizer)...")
    update_data = {
        "title": "Updated Title",
        "description": "Updated Description",
        "category": "Tech",
        "capacity": 1,
        "date": "2023-12-25",
        "time": "10:00",
        "venue": "Hall A",
        "is_paid": False,
        "price": 0
    }
    res = requests.put(f"{BASE_URL}/events/{event_id}", json=update_data, headers=org_headers)
    if res.status_code == 200:
        print("Update successful")
        print(res.json())
    else:
        print(f"Update failed: {res.status_code} {res.text}")

if __name__ == "__main__":
    test_flow()
