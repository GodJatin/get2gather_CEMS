import os
from dotenv import load_dotenv
import sys

# Add current directory to path so we can import email_service
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load .env
load_dotenv()

from email_service import send_otp_email

smtp_email = os.getenv("SMTP_EMAIL")
print(f"SMTP Email found: {smtp_email}")

print("Attempting to send email...")
# Send to the same email as sender for testing
success = send_otp_email(smtp_email, "123456", "student")

if success:
    print("Email sent successfully!")
else:
    print("Failed to send email.")
