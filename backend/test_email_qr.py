import sys
import os
import base64
from io import BytesIO
import qrcode

# Add path to import backend modules
sys.path.append(os.getcwd())

from email_service import send_booking_ticket

def test_email_qr():
    print("Testing Email QR Code Visibility...")
    
    # Generate a dummy QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data("test:booking:123")
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()
    qr_image_data = f"data:image/png;base64,{img_base64}"
    
    # Send email
    # You should check your inbox after running this
    recipient = "organizer@paruluniversity.ac.in" # Or user's email if known, using a default for now
    print(f"Sending test email to {recipient}...")
    
    success = send_booking_ticket(
        email=recipient,
        student_name="Test Student",
        event_title="QR Verification Event",
        event_date="2024-12-25",
        event_time="10:00 AM",
        event_venue="Test Lab",
        qr_image=qr_image_data,
        ticket_type="attendee"
    )
    
    if success:
        print("✅ Email sent successfully.")
        print("👉 Please check the inbox for 'organizer@paruluniversity.ac.in' (or configure SMTP to send to your real email).")
        print("   Verify if the QR code image is visible or broken.")
    else:
        print("❌ Failed to send email.")

if __name__ == "__main__":
    test_email_qr()
