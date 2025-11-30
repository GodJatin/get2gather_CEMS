import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def verify_smtp():
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    print(f"Checking SMTP Configuration:")
    print(f"Email: {smtp_email}")
    print(f"Password: {'*' * len(smtp_password) if smtp_password else 'Not Set'}")

    if not smtp_email or not smtp_password:
        print("❌ SMTP credentials missing in .env")
        return

    try:
        print("Connecting to smtp.gmail.com:587...")
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.set_debuglevel(1)  # Enable debug output
        server.starttls()
        print("Logging in...")
        server.login(smtp_email, smtp_password)
        print("✅ Login successful!")

        # Send test email
        receiver_email = "2305103140014@paruluniversity.ac.in"
        msg = MIMEMultipart()
        msg['From'] = f"Get2Gather Test <{smtp_email}>"
        msg['To'] = receiver_email
        msg['Subject'] = "Get2Gather SMTP Test"
        msg.attach(MIMEText("This is a test email from the Get2Gather backend verification script.", 'plain'))

        print(f"Sending test email to {receiver_email}...")
        server.send_message(msg)
        print("✅ Test email sent successfully!")
        
        server.quit()

    except Exception as e:
        print(f"❌ SMTP Verification Failed: {e}")

if __name__ == "__main__":
    verify_smtp()
