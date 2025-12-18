import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import secrets
from datetime import datetime
import base64

def generate_otp() -> str:
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def get_base_template(content: str) -> str:
    """Returns the standardized HTML wrapper with the Get2Gather design."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; padding: 0; color: #1a1a1a; }}
            .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, #111827 0%, #000000 100%); padding: 40px 30px; text-align: center; color: white; }}
            .logo {{ font-size: 28px; font-weight: 800; letter-spacing: -0.5px; background: linear-gradient(to right, #c084fc, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }}
            .content {{ padding: 40px 30px; line-height: 1.6; }}
            .footer {{ background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb; }}
            .button {{ display: inline-block; background: #000000; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }}
            .badge {{ background: #fff3cd; color: #856404; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; }}
            .otp-box {{ background: #f3f4f6; letter-spacing: 8px; font-size: 32px; font-family: monospace; font-weight: 700; text-align: center; padding: 24px; border-radius: 12px; margin: 24px 0; color: #1f2937; border: 1px solid #e5e7eb; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Get2Gather</div>
            </div>
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>&copy; 2025 Get2Gather. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_email(to_email: str, subject: str, html_content: str, image_attachment: dict = None) -> bool:
    """Helper to send emails via SMTP."""
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured. Mock sent to {to_email}: {subject}")
        return True

    try:
        msg = MIMEMultipart('related')
        msg['From'] = f"Get2Gather <{smtp_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach HTML
        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)
        msg_alternative.attach(MIMEText(html_content, 'html'))
        
        if image_attachment:
             # image_attachment = {'data': base64_str, 'cid': 'unique_id', 'filename': 'name.png'}
            if image_attachment['data'].startswith('data:image'):
                 _, encoded = image_attachment['data'].split(",", 1)
                 data = base64.b64decode(encoded)
                 from email.mime.image import MIMEImage
                 image = MIMEImage(data)
                 image.add_header('Content-ID', f"<{image_attachment['cid']}>")
                 image.add_header('Content-Disposition', 'inline', filename=image_attachment['filename'])
                 msg.attach(image)

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

def send_otp_email(email: str, otp: str, user_type: str = "user") -> bool:
    content = f"""
        <h2 style="margin-top: 0; color: #111827;">Verify Your Email</h2>
        <p>Hello!</p>
        <p>Use the verification code below to complete your {user_type} registration:</p>
        <div class="otp-box">{otp}</div>
        <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
    """
    return send_email(email, "🔑 Verify your email - Get2Gather", get_base_template(content)), "Email sent"

def send_booking_ticket(email: str, student_name: str, event_title: str, event_date: str, event_time: str, event_venue: str, qr_image: str, qr_data: str = None, ticket_type: str = "attendee") -> bool:
    color = "#8b5cf6" if ticket_type == "attendee" else "#ec4899"
    type_label = "Event Ticket" if ticket_type == "attendee" else "Volunteer Pass"
    
    content = f"""
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="background: {color}; color: white; display: inline-block; padding: 6px 16px; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase;">
                {type_label}
            </div>
            <h2 style="margin: 15px 0 5px 0; font-size: 24px;">{event_title}</h2>
            <p style="color: #6b7280; margin: 0;">Confirmed for {student_name}</p>
        </div>

        <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <div style="margin-bottom: 12px;"><strong>📅 Date:</strong> {event_date}</div>
            <div style="margin-bottom: 12px;"><strong>🕐 Time:</strong> {event_time}</div>
            <div><strong>📍 Venue:</strong> {event_venue}</div>
        </div>

        <div style="text-align: center;">
            <p style="font-weight: 600; margin-bottom: 15px;">Scan at entrance:</p>
            <img src="cid:qrcode_image" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px; background: white;" />
            {f'<div style="margin-top: 15px; font-family: monospace; background: #eef2ff; color: #4338ca; padding: 10px; border-radius: 8px; display: inline-block;">{qr_data}</div>' if qr_data else ''}
        </div>
    """
    
    img_data = {'data': qr_image, 'cid': 'qrcode_image', 'filename': 'ticket_qr.png'}
    return send_email(email, f"🎟️ Your Ticket: {event_title}", get_base_template(content), img_data)

def send_attendance_confirmation(email: str, student_name: str, event_title: str, event_date: str, event_venue: str, points_earned: int, attendance_type: str = "attendee") -> bool:
    content = f"""
        <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h2 style="margin: 0; color: #059669;">Attendance Verified!</h2>
            <p style="color: #6b7280; font-size: 16px;">You successfully checked in.</p>
        </div>

        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #047857; font-weight: bold;">Points Earned</div>
            <div style="font-size: 42px; font-weight: 800; color: #065f46; margin: 5px 0;">+{points_earned}</div>
        </div>

        <div style="margin-top: 30px;">
            <h3 style="font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Event Details</h3>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Event:</strong> {event_title}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Venue:</strong> {event_venue}</p>
            <p style="margin: 8px 0; font-size: 14px;"><strong>Date:</strong> {event_date}</p>
        </div>
    """
    return send_email(email, f"✅ Attendance: {event_title}", get_base_template(content))

def send_event_update_notification(email: str, student_name: str, event_title: str, changes: list) -> bool:
    changes_html = "".join([f"<li style='margin-bottom: 8px;'>{change}</li>" for change in changes])
    
    content = f"""
        <h2 style="color: #b45309; margin-top: 0;">📢 Event Update</h2>
        <p>Hello {student_name},</p>
        <p>The event <strong>{event_title}</strong> has been updated.</p>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #92400e;">What changed:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #b45309;">
                {changes_html}
            </ul>
        </div>
        
        <a href="https://get2gather-cems.vercel.app/events" class="button">View Event Details</a>
    """
    return send_email(email, f"📢 Update: {event_title}", get_base_template(content))
