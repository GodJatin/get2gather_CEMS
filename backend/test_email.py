import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv(override=True)

from email_service import send_otp_email

key = os.getenv('RESEND_API_KEY')
print(f"API Key present: {bool(key)}")
if key:
    print(f"Key starts with: {key[:5]}...{key[-4:]}")


# Try sending to a likely test email or just a placeholder to see the error
# If the user is the owner, maybe they used their own email.
# I'll try a generic one, knowing it will likely fail if in test mode, but I want to see the ERROR message.
test_email = "224jatin2006@gmail.com" 
print(f"Attempting to send email to {test_email}...")

success = send_otp_email(test_email, "123456")

if success:
    print("Email sent successfully!")
else:
    print("Email sending failed.")
