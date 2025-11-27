import requests

BASE_URL = "http://localhost:8000"

# Login
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    data={
        "username": "2305103140014@paruluniversity.ac.in",
        "password": "J@tin224"
    }
)

token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Get latest event
events = requests.get(f"{BASE_URL}/events/").json()
event = events[-1]

print(f"Event: {event['title']} (ID: {event['id']})")

# Create booking
booking_response = requests.post(
    f"{BASE_URL}/bookings/",
    headers=headers,
    json={"event_id": event['id']}
)

if booking_response.status_code == 200:
    booking = booking_response.json()
    print(f"Booking ID: {booking['id']}")
    print(f"QR Code: {booking.get('qr_code', 'NOT FOUND')}")
    print(f"\n==========================================")
    print("COPY THIS QR CODE:")
    print("==========================================")
    print(booking.get('qr_code', 'ERROR - NO QR CODE'))
    print("==========================================")
else:
    print(f"Error: {booking_response.status_code}")
    print(booking_response.text)
