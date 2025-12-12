import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import secrets
from datetime import datetime
import base64

# ==========================================
# SHARED STYLES & TEMPLATE
# ==========================================
BRAND_COLOR = "#667eea"
ACCENT_COLOR = "#764ba2"
BG_COLOR = "#f4f7fa"

def get_email_template(title: str, body_content: str, user_name: str = "Student", preview_text: str = "") -> str:
    """
    Returns a responsive, beautifully styled HTML email wrapper.
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
            body {{ font-family: 'Outfit', 'Segoe UI', sans-serif; background-color: {BG_COLOR}; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }}
            .wrapper {{ width: 100%; table-layout: fixed; background-color: {BG_COLOR}; padding-bottom: 40px; }}
            .webkit {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }}
            .header {{ background: linear-gradient(135deg, {BRAND_COLOR} 0%, {ACCENT_COLOR} 100%); padding: 40px 30px; text-align: center; position: relative; }}
            .header h1 {{ margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            .header-icon {{ font-size: 40px; margin-bottom: 10px; display: block; }}
            .wave {{ position: absolute; bottom: 0; left: 0; width: 100%; height: auto; }}
            .content {{ padding: 40px 35px; color: #4a5568; line-height: 1.7; font-size: 16px; }}
            .greeting {{ font-size: 20px; font-weight: 600; color: #2d3748; margin-bottom: 20px; }}
            .btn {{ display: inline-block; background: linear-gradient(135deg, {BRAND_COLOR} 0%, {ACCENT_COLOR} 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; margin: 25px 0; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s; }}
            .btn:hover {{ transform: translateY(-2px); }}
            .data-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: left; }}
            .data-row {{ display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; }}
            .data-row:last-child {{ border-bottom: none; margin-bottom: 0; padding-bottom: 0; }}
            .data-label {{ font-weight: 600; color: #718096; font-size: 14px; }}
            .data-value {{ font-weight: 700; color: #2d3748; font-size: 15px; }}
            .details-list {{ list-style: none; padding: 0; margin: 0; }}
            .details-list li {{ padding: 8px 0; position: relative; padding-left: 20px; }}
            .details-list li::before {{ content: '•'; color: {BRAND_COLOR}; font-weight: bold; position: absolute; left: 0; font-size: 20px; line-height: 1.5; }}
            .footer {{ background-color: #edf2f7; padding: 30px; text-align: center; color: #a0aec0; font-size: 13px; border-top: 1px solid #e2e8f0; }}
            .footer p {{ margin: 5px 0; }}
            .social-links {{ margin-top: 15px; }}
            .social-links a {{ color: {BRAND_COLOR}; text-decoration: none; margin: 0 10px; font-weight: 600; }}
            
            /* Utilities */
            .text-center {{ text-align: center; }}
            .text-highlight {{ color: {BRAND_COLOR}; font-weight: 700; }}
            .otp-box {{ font-size: 42px; font-family: monospace; letter-spacing: 8px; font-weight: 800; color: {BRAND_COLOR}; background: #edf2f7; padding: 20px; border-radius: 12px; display: inline-block; margin: 20px 0; border: 2px dashed {BRAND_COLOR}; }}
            .warning-box {{ background-color: #fffaf0; border-left: 4px solid #ed8936; padding: 15px; color: #9c4221; font-size: 14px; margin-top: 20px; border-radius: 4px; }}
            
            @media only screen and (max-width: 600px) {{
                .content {{ padding: 25px 20px; }}
                .header {{ padding: 30px 20px; }}
            }}
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="webkit">
                <div class="header">
                    <span class="header-icon">✨</span>
                    <h1>{title}</h1>
                </div>
                
                <div class="content">
                    <div class="greeting">Hello, {user_name}! 👋</div>
                    {body_content}
                </div>
                
                <div class="footer">
                    <p>Designed with ❤️ by Get2Gather Team</p>
                    <p>© {datetime.now().year} College Event Management System</p>
                    <div class="social-links">
                        <a href="#">Website</a> • <a href="#">Support</a> • <a href="#">App</a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def _send_email(to_email: str, subject: str, html_content: str, custom_headers=None, images=None) -> bool:
    """Internal helper to send email via SMTP"""
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured, simulating email to {{to_email}}")
        return True

    try:
        msg = MIMEMultipart('related')
        msg['From'] = f"Get2Gather <{{smtp_email}}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        if custom_headers:
            for k, v in custom_headers.items():
                msg[k] = v

        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)
        msg_alternative.attach(MIMEText(html_content, 'html'))

        # Attach images (Content-ID)
        if images:
            for img_data in images:
                image = MIMEImage(img_data['data'])
                image.add_header('Content-ID', f"<{img_data['cid']}>")
                image.add_header('Content-Disposition', 'inline', filename=img_data['filename'])
                msg.attach(image)

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Email sent to {{to_email}}: {{subject}}")
        return True
    
    except Exception as e:
        print(f"❌ Failed to send email to {{to_email}}: {{e}}")
        return False

# ==========================================
# PUBLIC EMAIL FUNCTIONS
# ==========================================

def generate_otp() -> str:
    """Generate a secure 6-digit OTP"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def send_otp_email(email: str, otp: str, user_type: str = "User") -> tuple[bool, str]:
    """Send Enhanced OTP Verification Email"""
    subject = "🔐 Your Verification Code"
    
    body = f"""
    <p>Welcome to <strong>Get2Gather</strong>! We are thrilled to have you join our community.</p>
    <p>To complete your registration as a <strong>{user_type}</strong>, please verify your email address using the One-Time Password (OTP) below:</p>
    
    <div class="text-center">
        <div class="otp-box">{otp}</div>
    </div>
    
    <p>Please enter this code on the verification screen. This code will expire in <strong>10 minutes</strong>.</p>
    
    <div class="warning-box">
        <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our support team will never ask for your OTP.
    </div>
    """
    
    html = get_email_template("Verify Your Email", body, user_name="Future Member")
    
    success = _send_email(email, subject, html)
    return success, "Email sent" if success else "Failed to send"

def send_booking_ticket(email: str, student_name: str, event_title: str, event_date: str, event_time: str, event_venue: str, qr_image: str, qr_data: str = None, ticket_type: str = "attendee") -> bool:
    """Send Visual Booking Ticket"""
    is_vip = ticket_type.lower() == 'vip'
    sub_title = "Events Access Pass" if ticket_type == 'attendee' else f"{ticket_type.capitalize()} Pass"
    
    subject = f"🎟️ Your Ticket: {event_title}"
    
    # Process QR
    images = []
    qr_cid_html = ""
    if qr_image.startswith('data:image'):
        try:
            _, encoded = qr_image.split(",", 1)
            img_data = base64.b64decode(encoded)
            images.append({
                'data': img_data,
                'cid': 'qrcode_image',
                'filename': 'qrcode.png'
            })
            qr_cid_html = '<img src="cid:qrcode_image" alt="Access QR Code" style="width: 200px; height: 200px; margin: 0 auto; display: block; border-radius: 8px; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">'
        except:
             qr_cid_html = "<p>[QR Code Processing Failed]</p>"

    body = f"""
    <p>You are officially confirmed for <strong>{event_title}</strong>! Get ready for an amazing experience.</p>
    
    <div class="data-box">
        <h3 style="margin-top:0; color: {BRAND_COLOR}; text-align: center;">{event_title}</h3>
        <div class="text-center" style="margin-bottom: 20px;">
            {qr_cid_html}
            <p style="font-size: 12px; color: #aaa; margin-top: 5px;">Scan at entry</p>
        </div>
        
        <div class="data-row"><span class="data-label">📅 Date</span> <span class="data-value">{event_date}</span></div>
        <div class="data-row"><span class="data-label">⏰ Time</span> <span class="data-value">{event_time}</span></div>
        <div class="data-row"><span class="data-label">📍 Venue</span> <span class="data-value">{event_venue}</span></div>
        <div class="data-row"><span class="data-label">🎓 Type</span> <span class="data-value" style="text-transform: capitalize;">{ticket_type}</span></div>
    </div>
    
    {f'''
    <div style="background: #eef2ff; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="margin:0; font-size: 13px; color: #666;">Manual Entry Code:</p>
        <code style="font-size: 18px; color: {BRAND_COLOR}; font-weight: bold;">{qr_data}</code>
    </div>
    ''' if qr_data else ''}
    
    <div class="warning-box">
        <strong>📝 Instructions:</strong> Please arrive 15 minutes early. Present this QR code at the registration desk to mark your attendance and earn points!
    </div>
    """
    
    html = get_email_template(sub_title, body, user_name=student_name)
    return _send_email(email, subject, html, images=images)

def send_attendance_confirmation(email: str, student_name: str, event_title: str, event_date: str, event_venue: str, points_earned: int, attendance_type: str = "attendee") -> bool:
    """Send Attendance Success Email"""
    subject = f"🎉 You earned {points_earned} Points!"
    
    body = f"""
    <p>Thanks for joining us at <strong>{event_title}</strong>! We hope you had a great time.</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); color: #fff; padding: 15px 40px; border-radius: 50px; font-size: 24px; font-weight: 800; text-shadow: 0 1px 2px rgba(0,0,0,0.2); box-shadow: 0 6px 12px rgba(253, 185, 49, 0.4);">
            +{points_earned} Points
        </div>
        <p style="color: #718096; margin-top: 10px; font-size: 14px;">Added to your profile</p>
    </div>
    
    <div class="data-box">
        <div class="data-row"><span class="data-label">Event</span> <span class="data-value">{event_title}</span></div>
        <div class="data-row"><span class="data-label">Date</span> <span class="data-value">{event_date}</span></div>
        <div class="data-row"><span class="data-label">Role</span> <span class="data-value" style="text-transform: capitalize;">{attendance_type}</span></div>
    </div>
    
    <p>Keep participating in more events to climb the leaderboard and unlock exclusive rewards! 🏆</p>
    
    <div class="text-center">
        <a href="https://your-app-url.com/student/leaderboard" class="btn">View Leaderboard</a>
    </div>
    """
    
    html = get_email_template("Attendance Confirmed", body, user_name=student_name)
    return _send_email(email, subject, html)

def send_event_update_notification(email: str, student_name: str, event_title: str, changes: list) -> bool:
    """Send Important Update Email"""
    subject = f"📢 Update: {event_title}"
    
    changes_html = "".join([f"<li style='margin-bottom: 8px;'>{change}</li>" for change in changes])
    
    body = f"""
    <p>We're writing to verify you about some changes to the upcoming event <strong>{event_title}</strong>.</p>
    
    <div class="warning-box" style="background-color: #fff9f9; border-left-color: #e53e3e; color: #c53030;">
        <h4 style="margin-top: 0; margin-bottom: 10px;">📅 What Changed:</h4>
        <ul style="margin: 0; padding-left: 20px;">
            {changes_html}
        </ul>
    </div>
    
    <p>Please check the event page for the most up-to-date information.</p>
    
    <div class="text-center">
        <a href="https://your-app-url.com/student/events" class="btn">View Event Details</a>
    </div>
    
    <p>We apologize for any inconvenience!</p>
    """
    
    html = get_email_template("Event Update", body, user_name=student_name)
    return _send_email(email, subject, html)
