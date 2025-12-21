import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import secrets
from datetime import datetime
import base64

def generate_otp() -> str:
    """Generate a secure 6-digit OTP"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def get_base_template(content: str) -> str:
    """Returns the standardized, responsive HTML wrapper."""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Get2Gather Notification</title>
        <style>
            /* Reset and Base Styles */
            body {{
                margin: 0;
                padding: 0;
                background-color: #f3f4f6;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #1f2937;
                line-height: 1.6;
            }}
            table {{
                border-spacing: 0;
                width: 100%;
            }}
            td {{
                padding: 0;
            }}
            img {{
                border: 0;
            }}
            
            /* Wrapper */
            .wrapper {{
                width: 100%;
                table-layout: fixed;
                background-color: #f3f4f6;
                padding-bottom: 40px;
            }}
            
            /* Main Container */
            .main {{
                background-color: #ffffff;
                margin: 0 auto;
                width: 100%;
                max-width: 600px;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }}

            /* Header */
            .header {{
                background: linear-gradient(135deg, #111827 0%, #000000 100%);
                padding: 40px 0;
                text-align: center;
            }}
            .header-text {{
                color: transparent;
                background: linear-gradient(to right, #c084fc, #db2777);
                -webkit-background-clip: text;
                background-clip: text;
                font-size: 32px;
                font-weight: 800;
                letter-spacing: -0.025em;
                margin: 0;
            }}

            /* Content */
            .content-cell {{
                padding: 40px 32px;
            }}

            /* Footer */
            .footer {{
                background-color: #f9fafb;
                padding: 32px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }}
            .footer-text {{
                color: #6b7280;
                font-size: 14px;
                margin: 0;
            }}
            
            /* Utility Classes for content injection */
            .button {{
                display: inline-block;
                background-color: #000000;
                color: #ffffff;
                padding: 14px 28px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 24px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }}
            .otp-box {{
                background-color: #f3f4f6;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                font-family: 'Courier New', monospace;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 0.25em;
                color: #111827;
                text-align: center;
                padding: 24px;
                margin: 32px 0;
            }}
            
            /* Ticket specific styles */
            .ticket-card {{
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 32px;
            }}
            .info-row {{
                margin-bottom: 12px;
                font-size: 16px;
            }}
            .label {{
                font-weight: 600;
                color: #4b5563;
                margin-right: 8px;
            }}
            
            .instruction-box {{
                background-color: #fffbeb;
                border: 1px solid #fcd34d;
                border-radius: 12px;
                padding: 24px;
                margin-top: 32px;
            }}
            .instruction-title {{
                color: #92400e;
                font-weight: 700;
                font-size: 18px;
                margin-top: 0;
                margin-bottom: 12px;
            }}
            .instruction-list {{
                margin: 0;
                padding-left: 20px;
                color: #b45309;
            }}
            .instruction-list li {{
                margin-bottom: 8px;
            }}

            /* Responsive overrides */
            @media only screen and (max-width: 600px) {{
                .main {{
                    width: 100% !important;
                    border-radius: 0 !important;
                }}
                .content-cell {{
                    padding: 32px 20px !important;
                }}
            }}
        </style>
    </head>
    <body>
        <center class="wrapper">
            <table class="main">
                <tr>
                    <td class="header">
                        <h1 class="header-text">Get2Gather</h1>
                    </td>
                </tr>
                <tr>
                    <td class="content-cell">
                        {content}
                    </td>
                </tr>
                <tr>
                    <td class="footer">
                        <p class="footer-text">&copy; 2025 Get2Gather. All rights reserved.</p>
                        <p class="footer-text" style="font-size: 12px; margin-top: 8px;">Automated notification system.</p>
                    </td>
                </tr>
            </table>
        </center>
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
        
        # Attach HTML content
        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)
        msg_alternative.attach(MIMEText(html_content, 'html'))
        
        # Handle Image Attachment (e.g. QR Code)
        if image_attachment:
             # Expected dict: {'data': base64_str, 'cid': 'unique_id', 'filename': 'name.png'}
            if image_attachment['data'].startswith('data:image'):
                 try:
                     _, encoded = image_attachment['data'].split(",", 1)
                     data = base64.b64decode(encoded)
                     image = MIMEImage(data)
                     image.add_header('Content-ID', f"<{image_attachment['cid']}>")
                     image.add_header('Content-Disposition', 'inline', filename=image_attachment['filename'])
                     msg.attach(image)
                 except Exception as img_err:
                     print(f"⚠️ Failed to attach image: {img_err}")

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
        <h2 style="margin-top: 0; color: #111827; font-size: 24px; text-align: center;">Verify Your Email</h2>
        <p style="text-align: center; color: #4b5563; font-size: 16px;">
            Hello! Use the code below to complete your {user_type} registration.
        </p>
        
        <div class="otp-box">{otp}</div>
        
        <p style="text-align: center; color: #6b7280; font-size: 14px;">
            ⏰ This code expires in 10 minutes.<br>
            If you didn't request this code, please ignore this email.
        </p>
    """
    return send_otp_email_helper(email, content) if 'send_otp_email_helper' in globals() else send_email(email, "🔑 Verify your email - Get2Gather", get_base_template(content))

def send_booking_ticket(email: str, student_name: str, event_title: str, event_date: str, event_time: str, event_venue: str, qr_image: str, qr_data: str = None, ticket_type: str = "attendee") -> bool:
    is_attendee = (ticket_type == "attendee")
    badge_color = "#8b5cf6" if is_attendee else "#ec4899"
    badge_text = "Event Ticket" if is_attendee else "Volunteer Pass"
    
    content = f"""
        <div style="text-align: center;">
            <span style="background-color: {badge_color}; color: white; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">
                {badge_text}
            </span>
            <h2 style="margin: 20px 0 8px 0; font-size: 28px; line-height: 1.2;">{event_title}</h2>
            <p style="color: #6b7280; font-size: 16px; margin: 0 0 32px 0;">Confirmed for <strong>{student_name}</strong></p>
        </div>

        <div class="ticket-card">
            <div class="info-row">
                <span class="label">📅 Date:</span> {event_date}
            </div>
            <div class="info-row">
                <span class="label">🕐 Time:</span> {event_time}
            </div>
            <div class="info-row">
                <div class="label" style="display:inline;">📍 Venue:</div> {event_venue}
            </div>
        </div>

        <div style="text-align: center;">
            <p style="font-weight: 600; margin-bottom: 16px; color: #111827;">Scan at entrance:</p>
            <img src="cid:qrcode_image" alt="QR Code" style="width: 200px; height: 200px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; background: white;" />
            
            {f'<div style="margin-top: 16px; font-family: monospace; background: #eef2ff; color: #4338ca; padding: 12px; border-radius: 8px; font-weight: 600; display: inline-block;">{qr_data}</div>' if qr_data else ''}
        </div>

        <div class="instruction-box">
            <h3 class="instruction-title">⚠️ Important Instructions</h3>
            <ul class="instruction-list">
                <li><strong>Arrive at the venue on time</strong> to ensure smooth entry.</li>
                <li><strong>Scan this QR code at the entrance</strong> to mark your attendance.</li>
                <li>If scanning fails, provide the manual code above to the organizer.</li>
                <li>Points will be credited <strong>ONLY after scanning</strong>.</li>
                <li>Keep this email accessible on your phone (brightness up! 🔆).</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 32px;">
            <p style="color: #6b7280; font-style: italic;">We can't wait to see you there! 🎉</p>
        </div>
    """
    
    img_data = {'data': qr_image, 'cid': 'qrcode_image', 'filename': 'ticket_qr.png'}
    return send_email(email, f"🎟️ Your Ticket: {event_title}", get_base_template(content), img_data)

def send_attendance_confirmation(email: str, student_name: str, event_title: str, event_date: str, event_venue: str, points_earned: int, attendance_type: str = "attendee") -> bool:
    content = f"""
        <div style="text-align: center;">
            <div style="font-size: 56px; margin-bottom: 16px;">✅</div>
            <h2 style="margin: 0; color: #059669; font-size: 28px;">Attendance Verified!</h2>
            <p style="color: #6b7280; font-size: 16px; margin-top: 8px;">Thanks for showing up, {student_name}!</p>
        </div>

        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #34d399; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #047857; font-weight: 800;">Points Earned</div>
            <div style="font-size: 48px; font-weight: 800; color: #065f46; margin: 8px 0; line-height: 1;">+{points_earned}</div>
            <div style="color: #059669; font-size: 14px; font-weight: 600;">Awesome job! 🌟</div>
        </div>

        <div class="ticket-card" style="text-align:center;">
            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #111827;">Event Recap</h3>
            <p style="margin: 4px 0; color: #4b5563;"><strong>{event_title}</strong></p>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">{event_date} @ {event_venue}</p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #e5e7eb;">
            <h3 style="margin: 0 0 16px 0; font-size: 20px;">Ready for more?</h3>
            <p style="color: #6b7280; margin-bottom: 24px;">Check out other upcoming events and keep that streak going!</p>
            <a href="https://get2gather-cems.vercel.app/student/dashboard" class="button">Browse Events</a>
        </div>
    """
    return send_email(email, f"✅ Attendance: {event_title}", get_base_template(content))

def send_event_update_notification(email: str, student_name: str, event_title: str, changes: list) -> bool:
    changes_html = "".join([f"<li style='margin-bottom: 8px;'>{change}</li>" for change in changes])
    
    content = f"""
        <h2 style="color: #b45309; margin-top: 0; font-size: 24px;">📢 Event Update</h2>
        <p>Hello {student_name},</p>
        <p>The event <strong>{event_title}</strong> has been updated.</p>
        
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 24px; border-radius: 0 8px 8px 0; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em;">What Changed</h3>
            <ul style="margin: 0; padding-left: 20px; color: #b45309;">
                {changes_html}
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="https://get2gather-cems.vercel.app/events" class="button">View Event Details</a>
        </div>
    """
    return send_email(email, f"📢 Update: {event_title}", get_base_template(content))

# Compatibility alias
def send_otp_email_helper(email, content):
    return send_email(email, "🔑 Verify your email - Get2Gather", get_base_template(content))
