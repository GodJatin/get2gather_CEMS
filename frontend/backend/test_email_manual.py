
from email_service import send_ticket_email, send_volunteer_confirmation_email, send_attendance_confirmation
import io
import qrcode

# Test Configuration
TEST_EMAIL = "2305103140014@paruluniversity.ac.in"

def create_dummy_qr():
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data("TEST_DATA_12345")
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def run_tests():
    print("--- Starting Email Tests ---")
    qr_bytes = create_dummy_qr()

    # 1. Booking Ticket
    print(f"1. Sending Booking Ticket to {TEST_EMAIL}...")
    success, msg = send_ticket_email(
        TEST_EMAIL, 
        "Jatin Shah", 
        "Hackathon 2025", 
        "TICKET-789", 
        qr_bytes
    )
    print(f"Result: {success} - {msg}")

    # 2. Volunteer Confirmation
    print(f"2. Sending Volunteer Confirmation to {TEST_EMAIL}...")
    success, msg = send_volunteer_confirmation_email(
        TEST_EMAIL,
        "Jatin Shah",
        "Tech Summit",
        "Event Coordinator",
        qr_bytes
    )
    print(f"Result: {success} - {msg}")

    # 3. Attendance Confirmation
    print(f"3. Sending Attendance Confirmation to {TEST_EMAIL}...")
    success, msg = send_attendance_confirmation(
        TEST_EMAIL,
        "Jatin Shah",
        "Workshop: AI & ML",
        "2025-12-21",
        "Auditorium 1",
        150
    )
    print(f"Result: {success} - {msg}")

if __name__ == "__main__":
    run_tests()
