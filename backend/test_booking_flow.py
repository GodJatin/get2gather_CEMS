"""
Test script to verify QR code booking flow
"""
import requests

BASE_URL = "http://localhost:8000"

# Student credentials
EMAIL = "test@paruluniversity.ac.in"
PASSWORD = "password123"

def test_booking_flow():
    print("🔍 Testing QR Code Booking Flow\n")
    
    # 1. Login as student
    print("1. Logging in...")
    login_data = {
        "username": EMAIL,
        "password": PASSWORD
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(response.json())
        return
    
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Logged in successfully")
    
    # 2. Get available events
    print("\n2. Fetching events...")
    events_response = requests.get(f"{BASE_URL}/events/", headers=headers)
    events = events_response.json()
    
    if not events:
        print("❌ No events available")
        return
    
    print(f"✅ Found {len(events)} events")
    for i, event in enumerate(events[:3], 1):
        print(f"   {i}. {event['title']} - {event['date']} at {event['time']}")
    
    # 3. Try to book first event
    first_event = events[0]
    print(f"\n3. Attempting to book '{first_event['title']}'...")
    
    booking_data = {"event_id": first_event['id']}
    booking_response = requests.post(f"{BASE_URL}/bookings/", json=booking_data, headers=headers)
    
    if booking_response.status_code == 200:
        booking = booking_response.json()
        print(f"✅ Booking successful!")
        print(f"   Booking ID: {booking['id']}")
        print(f"   QR Code: {booking.get('qr_code', 'NOT GENERATED')[:50]}...")
        
        # 4. Check if email would be sent
        if booking.get('qr_code'):
            print(f"\n4. QR Code generated successfully")
            print(f"   📧 Ticket email should be sent to: {EMAIL}")
        else:
            print(f"\n❌ QR Code was not generated")
    elif booking_response.status_code == 400:
        error = booking_response.json()
        if "already booked" in error.get("detail", "").lower():
            print(f"ℹ️  Already booked this event")
            
            # Get existing bookings
            print(f"\n4. Fetching your bookings...")
            bookings_response = requests.get(f"{BASE_URL}/bookings/my", headers=headers)
            bookings = bookings_response.json()
            
            for booking in bookings:
                if booking['event_id'] == first_event['id']:
                    print(f"✅ Found existing booking:")
                    print(f"   Event: {booking.get('event_title')}")
                    print(f"   Status: {booking.get('status')}")
                    print(f"   Attended: {booking.get('attended', 'N/A')}")
        else:
            print(f"❌ Booking failed: {error.get('detail')}")
    else:
        print(f"❌ Booking failed: {booking_response.status_code}")
        print(booking_response.json())
    
    # 5. Check points
    print(f"\n5. Checking current points...")
    me_response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    user_data = me_response.json()
    
    print(f"✅ Points Status:")
    print(f"   Available: {user_data.get('available_points', 0)} pts")
    print(f"   Total Earned: {user_data.get('total_points', 0)} pts")
    
    # 6. Check history
    print(f"\n6. Checking transaction history...")
    history_response = requests.get(f"{BASE_URL}/student/history", headers=headers)
    history = history_response.json()
    
    print(f"✅ Found {len(history)} transactions:")
    for h in history[:5]:
        status_icon = "✅" if h.get('status') == 'attended' else "❌" if h.get('status') == 'no-show' else "ℹ️"
        print(f"   {status_icon} {h['action']} ({h['points']:+d} pts)")

if __name__ == "__main__":
    test_booking_flow()
