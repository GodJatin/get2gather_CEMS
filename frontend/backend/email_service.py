import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import random
import string
from io import BytesIO
import base64
from dotenv import load_dotenv

# Load .env from the same directory as this file
current_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(current_dir, ".env"))

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("SMTP_EMAIL") or os.getenv("MAIL_USERNAME") or "get2gather.team@gmail.com"
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD") or os.getenv("MAIL_PASSWORD") or ""

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

def get_base_css():
    return """
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        
        body {
            font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f3f4f6;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #d946ef 100%);
            padding: 40px 0;
            text-align: center;
        }
        .logo-text {
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 1px;
            margin: 0;
            text-transform: uppercase;
        }
        .content {
            padding: 40px;
            color: #374151;
        }
        .welcome-text {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
            text-align: center;
        }
        .body-text {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 25px;
            text-align: center;
        }
        .card {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        .card-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .card-value {
            font-size: 20px;
            color: #111827;
            font-weight: 700;
        }
        .highlight-box {
            background-color: #fdf2f8;
            border-left: 4px solid #db2777;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
            text-align: left;
        }
        .instruction-title {
            color: #be185d;
            font-weight: 700;
            margin-bottom: 10px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .instruction-list {
            margin: 0;
            padding-left: 20px;
        }
        .instruction-list li {
            margin-bottom: 8px;
            font-size: 14px;
            color: #4b5563;
        }
        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #ffffff;
            border: 2px dashed #e5e7eb;
            border-radius: 16px;
        }
        .qr-code {
            width: 200px;
            height: 200px;
            margin-bottom: 10px;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #d946ef 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            font-weight: 600;
            margin-top: 20px;
            box-shadow: 0 4px 15px rgba(168, 85, 247, 0.4);
            transition: transform 0.2s;
        }
        .footer {
            background-color: #1f2937;
            padding: 30px;
            text-align: center;
        }
        .footer-text {
            color: #9ca3af;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .footer-link {
            color: #d946ef;
            text-decoration: none;
            font-weight: 500;
        }
        
        /* Mobile Optimization */
        @media only screen and (max-width: 600px) {
            .container {
                border-radius: 0;
                width: 100% !important;
            }
            .content {
                padding: 20px;
            }
            .header {
                padding: 30px 0;
            }
            .logo-text {
                font-size: 24px;
            }
        }
    </style>
    """

def get_email_template(title, body_content, cta_text=None, cta_link=None):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        {get_base_css()}
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">Get2Gather</h1>
                </div>
                <div class="content">
                    <h2 class="welcome-text">{title}</h2>
                    <div class="body-text">
                        {body_content}
                    </div>
                    {f'<div style="text-align: center;"><a href="{cta_link}" class="btn">{cta_text}</a></div>' if cta_text and cta_link else ''}
                </div>
                <div class="footer">
                    <p class="footer-text">Start exploring more events on our platform!</p>
                    <p><a href="https://your-domain.com/events" class="footer-link">Browse Events</a></p>
                    <p class="footer-text" style="font-size: 12px; margin-top: 20px; opacity: 0.6;">
                        &copy; 2025 Get2Gather. All rights reserved.<br>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def send_email(to_email: str, subject: str, html_content: str, image_attachment: dict = None) -> bool:
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        if image_attachment:
            # image_attachment expected: {"data": bytes, "name": str}
            img = MIMEImage(image_attachment['data'])
            img.add_header('Content-ID', '<qr_code>')
            img.add_header('Content-Disposition', 'inline', filename=image_attachment['name'])
            msg.attach(img)

        # SMTP Connection
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        return True, "Email sent successfully"
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False, str(e)

def send_otp_email(to_email: str, otp: str, user_type: str = "student"):
    subject = f"Your Get2Gather Verification Code"
    
    body = f"""
    <p>Welcome to Get2Gather! Use the verification code below to complete your {user_type} registration.</p>
    <div class="card">
        <div class="card-label">Verification Code</div>
        <div class="card-value" style="letter-spacing: 5px; color: #7c3aed;">{otp}</div>
    </div>
    <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    """
    
    content = get_email_template("Verify Your Email", body)
    return send_email(to_email, subject, content)

def send_ticket_email(to_email: str, user_name: str, event_title: str, ticket_id: str, qr_bytes: bytes):
    subject = f"Ticket: {event_title}"
    
    # Instructions Section
    instructions = """
    <div class="highlight-box">
        <div class="instruction-title">⚠️ Important Instructions</div>
        <ul class="instruction-list">
            <li>Arrive at the venue at least 15 minutes before start time.</li>
            <li><strong>Scan the QR code below</strong> at the entrance to mark your attendance.</li>
            <li>If scanning fails, show the Ticket ID to the organizer.</li>
            <li>Points will be credited <strong>ONLY</strong> after successful scanning.</li>
            <li>Keep this email accessible on your phone (screenshot recommended).</li>
        </ul>
    </div>
    """

    body = f"""
    <p>Hi {user_name},</p>
    <p>Your booking for <strong>{event_title}</strong> is confirmed! We can't wait to see you there.</p>
    
    <div class="card">
        <div class="card-label">Event</div>
        <div class="card-value">{event_title}</div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <div class="card-label">Ticket ID</div>
        <div class="card-value">{ticket_id}</div>
    </div>

    {instructions}

    <div class="qr-section">
        <p style="margin-bottom: 10px; font-weight: 600; color: #4b5563;">Your Entry Pass</p>
        <img src="cid:qr_code" alt="QR Code" class="qr-code">
    </div>
    """
    
    content = get_email_template("Booking Confirmed!", body, "View Event Details", f"https://get2gather.vercel.app/events")
    return send_email(to_email, subject, content, {"data": qr_bytes, "name": "ticket_qr.png"})

def send_volunteer_confirmation_email(to_email: str, user_name: str, event_title: str, role: str, qr_bytes: bytes, ticket_id: str = "N/A"):
    subject = f"Volunteer Confirmation: {event_title}"
    
    instructions = """
    <div class="highlight-box" style="border-left-color: #8b5cf6; background-color: #f5f3ff;">
        <div class="instruction-title" style="color: #6d28d9;">📋 Volunteer Instructions</div>
        <ul class="instruction-list">
            <li>Please report to the organizer 30 minutes prior to the event.</li>
            <li><strong>Scan this QR code</strong> to mark your Check-In and Check-Out.</li>
            <li>Coordinate with the team for your assigned duties.</li>
            <li>Volunteer points are awarded after completion of duties.</li>
            <li>Wear comfortable clothing and bring your ID.</li>
        </ul>
    </div>
    """

    body = f"""
    <p>Awesome, {user_name}!</p>
    <p>You have been selected as a <strong>{role}</strong> for {event_title}. Your contribution makes a huge difference!</p>
    
    <div class="card">
        <div class="card-label">Role</div>
        <div class="card-value">{role}</div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <div class="card-label">Event</div>
        <div class="card-value">{event_title}</div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <div class="card-label">Volunteer ID</div>
        <div class="card-value" style="font-size: 16px;">{ticket_id}</div>
    </div>
    
    {instructions}
    
    <div class="qr-section">
        <p style="margin-bottom: 10px; font-weight: 600; color: #4b5563;">Your Volunteer Badge</p>
        <img src="cid:qr_code" alt="QR Code" class="qr-code">
    </div>
    """
    
    content = get_email_template("Volunteer Confirmed", body)
    return send_email(to_email, subject, content, {"data": qr_bytes, "name": "volunteer_qr.png"})

def send_event_update_email(to_email: str, user_name: str, event_title: str, update_message: str):
    subject = f"Update: {event_title}"
    
    body = f"""
    <p>Hello {user_name},</p>
    <p>There is an important update regarding <strong>{event_title}</strong>.</p>
    
    <div class="highlight-box" style="border-left-color: #f59e0b; background-color: #fffbeb;">
        <div class="instruction-title" style="color: #b45309;">📢 Announcement</div>
        <p style="margin: 0; color: #92400e; font-size: 16px;">{update_message}</p>
    </div>
    
    <p>Please check the event page for more details.</p>
    """
    
    content = get_email_template("Event Update", body, "View Event", "https://get2gather.vercel.app/events")
    return send_email(to_email, subject, content)

# --- Backward Compatibility Adapters (for Routers) ---

def send_booking_ticket(email, student_name, event_title, event_date, event_time, event_venue, qr_image, qr_data, ticket_type="attendee"):
    """
    Adapter for booking/volunteer routers.
    qr_image: BytesIO object or bytes
    """
    """
    Adapter for booking/volunteer routers.
    qr_image: BytesIO object, bytes, or Base64 string
    """
    try:
        if hasattr(qr_image, 'getvalue'):
            qr_bytes = qr_image.getvalue()
        elif isinstance(qr_image, str):
            # Handle Base64 string (e.g., from qr_utils.py)
            if "base64," in qr_image:
                qr_base64 = qr_image.split("base64,")[1]
            else:
                qr_base64 = qr_image
            qr_bytes = base64.b64decode(qr_base64)
        else:
            qr_bytes = qr_image
    except Exception as e:
        print(f"Error processing QR image: {e}")
        return False, "QR Processing Error"
        
    # Format ticket ID - Use full QR data for manual entry support
    ticket_id = qr_data
    
    if ticket_type == "volunteer":
        role_name = "Volunteer" # Or infer from data
        return send_volunteer_confirmation_email(email, student_name, event_title, role_name, qr_bytes, ticket_id)
    else:
        return send_ticket_email(email, student_name, event_title, ticket_id, qr_bytes)

def send_attendance_confirmation(email, name, event_title, event_date, venue, points, type="attendee"):
    subject = f"Attendance Confirmed: {event_title}"
    
    body = f"""
    <p>Hi {name},</p>
    <p>Your attendance for <strong>{event_title}</strong> has been successfully recorded.</p>
    
    <div class="card">
        <div class="card-label">Points Earned</div>
        <div class="card-value" style="color: #059669;">+{points} GP</div>
    </div>
    
    <div class="highlight-box" style="background-color: #ecfdf5; border-left-color: #059669;">
        <div class="instruction-title" style="color: #047857;">🎉 Success!</div>
        <p style="margin: 0; color: #064e3b; font-size: 14px;">
            Your points have been credited to your profile. Keep attending events to climb the leaderboard!
        </p>
    </div>
    """
    
    content = get_email_template("Attendance Recorded", body, "Check Leaderboard", "https://get2gather.vercel.app/leaderboard")
    return send_email(email, subject, content)

def send_event_update_notification(email, name, event_title, changes: list):
    # Format changes list into HTML
    changes_html = "<ul style='padding-left: 20px; margin: 0;'>" + "".join([f"<li style='margin-bottom:5px;'>{c}</li>" for c in changes]) + "</ul>"
    return send_event_update_email(email, name, event_title, changes_html)
