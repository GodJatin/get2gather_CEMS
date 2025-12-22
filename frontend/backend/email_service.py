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

def generate_ics_string(summary, start_dt, end_dt, location, description):
    """
    Generate ICS file content as a string.
    Dates should be datetime objects.
    """
    from datetime import datetime, timedelta
    
    def format_dt(dt):
        return dt.strftime("%Y%m%dT%H%M%S")

    # If simple string dates were passed, try to parse (simple adapter)
    # But ideal is datetime objects. Let's assume the caller handles parsing or we improve this.
    # For now, simplistic implementation assuming datetime objects or string parsing inside caller.
    
    # Create simple VCALENDAR
    ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Get2Gather//Event Booking//EN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        f"UID:event-{start_dt.strftime('%Y%m%d%H%M')}-{random.randint(1000,9999)}@get2gather.com",
        f"DTSTAMP:{format_dt(datetime.utcnow())}Z",
        f"DTSTART:{format_dt(start_dt)}",
        f"DTEND:{format_dt(end_dt)}",
        f"SUMMARY:{summary}",
        f"DESCRIPTION:{description}",
        f"LOCATION:{location}",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
    ]
    return "\r\n".join(ics)

BASE_URL = "https://get2gather-cems.vercel.app"

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
                    <p><a href="https://get2gather-cems.vercel.app/student/events" class="footer-link">Browse Events</a></p>
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

def send_email(to_email: str, subject: str, html_content: str, attachments: list = None) -> bool:
    try:
        print(f"DEBUG: Configuration - Server: {SMTP_SERVER}:{SMTP_PORT}, Email: {SENDER_EMAIL[:3]}***")
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(html_content, 'html'))

        if attachments:
            # Normalize to list if single dict passed (backward compat)
            if isinstance(attachments, dict):
                attachments = [attachments]
                
            for att in attachments:
                data = att.get('data')
                name = att.get('name')
                # Default to image if no mime specified (legacy behavior)
                mime_type = att.get('mime_type', 'image/png')
                cid = att.get('cid') # Content-ID for inline images
                
                if mime_type.startswith('image/'):
                    img = MIMEImage(data)
                    if cid:
                        img.add_header('Content-ID', f'<{cid}>')
                    img.add_header('Content-Disposition', 'inline', filename=name)
                    msg.attach(img)
                elif mime_type == 'text/calendar':
                    # ICS File
                    from email.mime.base import MIMEBase
                    from email import encoders
                    part = MIMEBase('text', 'calendar', method='REQUEST', name=name)
                    part.set_payload(data)
                    # encoders.encode_base64(part) # text/calendar doesn't strictly need base64 if ascii, but safer
                    # Actually standard MIMEText might be easier for calendar? 
                    # Let's use MIMEBase for correct headers
                    part.add_header('Content-Disposition', f'attachment; filename="{name}"')
                    msg.attach(part)

        # SMTP Connection
        print("DEBUG: Connecting to SMTP server...")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            print("DEBUG: Login attempt...")
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            print("DEBUG: Login successful. Sending message...")
            server.send_message(msg)
            print("DEBUG: Message sent.")
        
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

def send_ticket_email(to_email: str, user_name: str, event_title: str, ticket_id: str, qr_bytes: bytes, event_id: int = 0, ics_data: str = None):
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
    
    event_link = f"{BASE_URL}/events/{event_id}" if event_id else f"{BASE_URL}/student/events"
    event_link = f"{BASE_URL}/events/{event_id}" if event_id else f"{BASE_URL}/student/events"
    content = get_email_template("Booking Confirmed!", body, "View Event Details", event_link)
    
    attachments = []
    # QR Code
    attachments.append({"data": qr_bytes, "name": "ticket_qr.png", "mime_type": "image/png", "cid": "qr_code"})
    
    # ICS File
    if ics_data:
        attachments.append({"data": ics_data, "name": "event.ics", "mime_type": "text/calendar"})
        
    return send_email(to_email, subject, content, attachments)

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
    
    # QR Attachment
    attachments = [{"data": qr_bytes, "name": "volunteer_qr.png", "mime_type": "image/png", "cid": "qr_code"}]
    
    return send_email(to_email, subject, content, attachments)

def send_event_update_email(to_email: str, user_name: str, event_title: str, update_message: str, event_id: int = 0):
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
    
    event_link = f"{BASE_URL}/events/{event_id}" if event_id else f"{BASE_URL}/student/events"
    content = get_email_template("Event Update", body, "View Event", event_link)
    return send_email(to_email, subject, content)

# --- Backward Compatibility Adapters (for Routers) ---

def send_booking_ticket(email, student_name, event_title, event_date, event_time, event_venue, qr_image, qr_data, ticket_type="attendee", event_id=0):
    """
    Adapter for booking/volunteer routers.
    qr_image: BytesIO object, bytes, or Base64 string
    """
    try:
        from datetime import datetime, timedelta
        
        # Parse Dates for ICS - Try common formats
        dt_start = datetime.now() + timedelta(days=1) # Default fallback
        duration = timedelta(hours=2)
        
        try:
            # Combine Date and Time
            dt_str = f"{event_date} {event_time}"
            # Formats to try: YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM AM/PM
            for fmt in ["%Y-%m-%d %H:%M", "%Y-%m-%d %I:%M %p", "%d-%m-%Y %H:%M", "%d-%m-%Y %I:%M %p"]:
                try:
                    dt_start = datetime.strptime(dt_str, fmt)
                    break
                except ValueError:
                    continue
        except Exception as e:
            print(f"ICS Date Parsing failed: {e}")
            
        dt_end = dt_start + duration
        
        # Generate ICS
        ics_content = generate_ics_string(
            summary=event_title,
            start_dt=dt_start,
            end_dt=dt_end,
            location=event_venue,
            description=f"Ticket ID: {qr_data}\nPresented by Get2Gather"
        )
    except Exception as e:
        print(f"ICS Generation failed, skipping: {e}")
        ics_content = None

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
        # Volunteer also gets only QR usually, but could get ICS? user asked "booking", so focus on booking.
        # But harmless to pass ics to volunteer if we wanted, but ticket_email handles it. 
        # Volunteer confirmation signature doesn't accept ICS yet.
        return send_volunteer_confirmation_email(email, student_name, event_title, role_name, qr_bytes, ticket_id)
    else:
        return send_ticket_email(email, student_name, event_title, ticket_id, qr_bytes, event_id, ics_data=ics_content)

def send_attendance_confirmation(email, name, event_title, event_date, venue, points, type="attendee", event_id=0):
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
    
    content = get_email_template("Attendance Recorded", body, "Check Leaderboard", f"{BASE_URL}/student/leaderboard")
    content = get_email_template("Attendance Recorded", body, "Check Leaderboard", f"{BASE_URL}/student/leaderboard")
    return send_email(email, subject, content)

def send_feedback_request_email(email, name, event_title, event_id):
    subject = f"Feedback: {event_title}"
    
    body = f"""
    <p>Hi {name},</p>
    <p>We hope you enjoyed <strong>{event_title}</strong>!</p>
    
    <div class="card">
        <p style="text-align: center; color: #4b5563; margin: 0;">How was your experience?</p>
    </div>
    
    <p style="text-align: center;">Your feedback helps us improve future events. Please take a moment to rate us.</p>
    """
    
    feedback_link = f"{BASE_URL}/events/{event_id}" # Ideally /feedback, but consistent with request
    content = get_email_template("Rate Your Experience", body, "Give Feedback", feedback_link)
    return send_email(email, subject, content)

def send_event_update_notification(email, name, event_title, changes: list, event_id=0):
    # Format changes list into HTML
    changes_html = "<ul style='padding-left: 20px; margin: 0;'>" + "".join([f"<li style='margin-bottom:5px;'>{c}</li>" for c in changes]) + "</ul>"
    return send_event_update_email(email, name, event_title, changes_html, event_id)

def send_booking_cancellation_email(email, name, event_title):
    subject = f"Booking Cancelled: {event_title}"
    
    body = f"""
    <p>Hi {name},</p>
    <p>Your booking for <strong>{event_title}</strong> has been cancelled as requested.</p>
    
    <div class="highlight-box" style="background-color: #fef2f2; border-left-color: #ef4444;">
        <div class="instruction-title" style="color: #b91c1c;">🚫 Cancellation Confirmed</div>
        <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
            Your ticket is no longer valid. If this was a mistake, please re-book if seats are available.
        </p>
    </div>
    """
    
    content = get_email_template("Booking Cancelled", body)
    return send_email(email, subject, content)

def send_waitlist_promotion_email(email, student_name, event_title, event_date, event_time, event_venue, qr_image, qr_data, event_id=0):
    """
    Sends a ticket to a user who was promoted from the waitlist.
    Reuse logic similar to booking ticket but custom message.
    """
    subject = f"You're In! Ticket for {event_title}"
    
    # Generate ICS (Reuse logic if possible, or duplicate for simplicity since it's short)
    try:
        from datetime import datetime, timedelta
        dt_start = datetime.now() + timedelta(days=1)
        duration = timedelta(hours=2)
        try:
            dt_str = f"{event_date} {event_time}"
            for fmt in ["%Y-%m-%d %H:%M", "%Y-%m-%d %I:%M %p", "%d-%m-%Y %H:%M", "%d-%m-%Y %I:%M %p"]:
                try:
                    dt_start = datetime.strptime(dt_str, fmt)
                    break
                except ValueError: continue
        except: pass
        dt_end = dt_start + duration
        
        ics_content = generate_ics_string(
            summary=event_title,
            start_dt=dt_start,
            end_dt=dt_end,
            location=event_venue,
            description=f"Ticket ID: {qr_data}\nPromoted from Waitlist"
        )
    except:
        ics_content = None

    # Processing QR
    try:
        if hasattr(qr_image, 'getvalue'): qr_bytes = qr_image.getvalue()
        elif isinstance(qr_image, str) and "base64," in qr_image: qr_bytes = base64.b64decode(qr_image.split("base64,")[1])
        elif isinstance(qr_image, str): qr_bytes = base64.b64decode(qr_image)
        else: qr_bytes = qr_image
    except: return False, "QR Error"

    instructions = """
    <div class="highlight-box" style="border-left-color: #059669; background-color: #ecfdf5;">
        <div class="instruction-title" style="color: #047857;">🎉 Good News!</div>
        <p style="margin: 0; color: #064e3b; font-size: 14px; margin-bottom: 10px;">
            A spot opened up and you've been <strong>automatically promoted</strong> from the waitlist!
        </p>
        <ul class="instruction-list">
            <li>Your spot is now reserved.</li>
            <li>Scan the QR code below at the entrance.</li>
        </ul>
    </div>
    """

    body = f"""
    <p>Hi {student_name},</p>
    <p>Great news! We have confirmed your spot for <strong>{event_title}</strong>.</p>
    
    <div class="card">
        <div class="card-label">Event</div>
        <div class="card-value">{event_title}</div>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        <div class="card-label">Ticket ID</div>
        <div class="card-value">{qr_data}</div>
    </div>
    
    {instructions}
    
    <div class="qr-section">
        <p style="margin-bottom: 10px; font-weight: 600; color: #4b5563;">Your Entry Pass</p>
        <img src="cid:qr_code" alt="QR Code" class="qr-code">
    </div>
    """
    
    event_link = f"{BASE_URL}/events/{event_id}"
    content = get_email_template("You're In!", body, "View Event Details", event_link)
    
    attachments = []
    attachments.append({"data": qr_bytes, "name": "ticket_qr.png", "mime_type": "image/png", "cid": "qr_code"})
    if ics_content:
        attachments.append({"data": ics_content, "name": "event.ics", "mime_type": "text/calendar"})
        
    return send_email(email, subject, content, attachments)
