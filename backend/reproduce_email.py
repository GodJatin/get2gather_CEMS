import os
from dotenv import load_dotenv
import sys

# Add current directory to path so we can import email_service
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load .env
load_dotenv()

from email_service import send_otp_email

api_key = os.getenv("RESEND_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key prefix: {api_key[:5]}...")

print("Attempting to send email...")
# Use 'delivered@resend.dev' which is Resend's test address.
success = send_otp_email("delivered@resend.dev", "123456", "student")

if success:
    print("Email sent successfully!")
else:
    print("Failed to send email.")
