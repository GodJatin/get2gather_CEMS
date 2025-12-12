import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import secrets
from datetime import datetime
import base64

def generate_otp() -> str:
    """Generate a secure 6-digit OTP"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def send_otp_email(email: str, otp: str, user_type: str = "user") -> bool:
    """
    Send OTP email using Gmail SMTP
    
    Args:
        email: Recipient email address
        otp: 6-digit OTP code
        user_type: Type of user (student/organizer)
    
    Returns:
        tuple[bool, str]: (Success status, Error message or success message)
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        msg = "SMTP credentials missing in .env"
        print(f"❌ {msg}")
        return False, msg

    try:
        subject = "Get2Gather - Email Verification Code"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
                body {{
                    font-family: 'Outfit', 'Segoe UI', sans-serif;
                    background-color: #f0f2f5;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 500px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    padding: 40px 20px;
                    text-align: center;
                    color: white;
                }}
                .logo {{
                    width: 60px;
                    height: 60px;
                    background: white;
                    border-radius: 12px;
                    margin: 0 auto 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }}
                .content {{
                    padding: 40px 30px;
                    text-align: center;
                }}
                .otp-box {{
                    background: #f8fafc;
                    border: 2px dashed #cbd5e1;
                    border-radius: 16px;
                    padding: 20px;
                    margin: 30px 0;
                }}
                .otp-code {{
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: 5px;
                    color: #4f46e5;
                    font-family: 'Courier New', monospace;
                }}
                .message {{
                    color: #475569;
                    line-height: 1.6;
                    font-size: 16px;
                    margin-bottom: 20px;
                }}
                .footer {{
                    background: #f8fafc;
                    padding: 20px;
                    text-align: center;
                    color: #94a3b8;
                    font-size: 12px;
                    border-top: 1px solid #e2e8f0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🎓</div>
                    <h1>Get2Gather</h1>
                </div>
                <div class="content">
                    <h2 style="color: #1e293b; margin-top: 0; font-weight: 600;">Verification Code</h2>
                    <p class="message">Welcome! To secure your account, please enter the code below:</p>
                    
                    <div class="otp-box">
                        <div class="otp-code">{otp}</div>
                    </div>
                    
                    <p class="message" style="font-size: 14px; color: #64748b;">
                        This code expires in 10 minutes. If you didn't request this, simply ignore this email.
                    </p>
                </div>
                <div class="footer">
                    &copy; {datetime.now().year} Get2Gather. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = f"Get2Gather <{smtp_email}>"
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        # Connect to Gmail SMTP
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ OTP email sent to {email} via SMTP")
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Failed to send OTP email to {email}: {error_msg}")
        return False, error_msg

def send_booking_ticket(email: str, student_name: str, event_title: str, event_date: str, event_time: str, event_venue: str, qr_image: str, qr_data: str = None, ticket_type: str = "attendee") -> bool:
    """
    Send event ticket with QR code to student
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured, simulating email to {email}")
        print(f"📧 Ticket Email: {student_name} - {event_title} ({ticket_type})")
        if qr_data:
            print(f"🔑 Manual Code: {qr_data}")
        return True

    try:
        subject = f"🎫 Your {ticket_type.capitalize()} Pass - {event_title}"
        
        # Create the root message and set headers
        msg = MIMEMultipart('related')
        msg['From'] = f"Get2Gather <{smtp_email}>"
        msg['To'] = email
        msg['Subject'] = subject
        
        # Create the HTML part
        html_content = f"""

        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
                body {{ font-family: 'Outfit', sans-serif; background: #f0f2f5; margin: 0; padding: 0; }}
                .container {{ max-width: 500px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, {'#0ea5e9 0%, #3b82f6' if ticket_type == 'attendee' else '#ec4899 0%, #d946ef'} 100%); padding: 30px; text-align: center; color: white; }}
                .logo {{ font-size: 30px; margin-bottom: 10px; }}
                .content {{ padding: 30px; }}
                .ticket-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 25px; }}
                .event-title {{ color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 10px 0; }}
                .detail-row {{ display: flex; align-items: center; margin: 8px 0; color: #64748b; font-size: 14px; }}
                .qr-box {{ background: white; padding: 15px; border-radius: 12px; display: inline-block; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }}
                .manual-code {{ background: #f1f5f9; padding: 12px; border-radius: 8px; font-family: monospace; color: #475569; font-size: 14px; margin-top: 15px; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🎫</div>
                    <h1 style="margin:0; font-size:24px;">{ticket_type.capitalize()} Pass</h1>
                </div>
                <div class="content">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <h2 style="margin: 0; color: #1e293b;">Hello {student_name}</h2>
                        <p style="margin: 5px 0; color: #64748b;">You are confirmed for:</p>
                    </div>

                    <div class="ticket-card">
                        <h3 class="event-title">{event_title}</h3>
                        <div class="detail-row">📅 {event_date}</div>
                        <div class="detail-row">🕐 {event_time}</div>
                        <div class="detail-row">📍 {event_venue}</div>
                    </div>

                    <div style="text-align: center;">
                        <div class="qr-box">
                            <img src="cid:qrcode_image" alt="QR Code" width="200" style="display: block;" />
                        </div>
                        <p style="color: #64748b; font-size: 14px;">Scan at entrance</p>
                        
                        {f'<div class="manual-code">Code: {qr_data}</div>' if qr_data else ''}
                    </div>

                    <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 12px; margin-top: 25px;">
                        <strong style="color: #b45309; display: block; margin-bottom: 5px;">⚠️ Instructions</strong>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 13px;">
                            <li>Arrive 15 mins early</li>
                            <li>Have this QR ready</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    &copy; {datetime.now().year} Get2Gather
                </div>
            </div>
        </body>
        </html>
        """
        
        msg_alternative = MIMEMultipart('alternative')
        msg.attach(msg_alternative)
        msg_alternative.attach(MIMEText(html_content, 'html'))

        # Process QR Image for CID
        # qr_image is expected to be "data:image/png;base64,..."
        if qr_image.startswith('data:image'):
            # Extract base64 part
            header, encoded = qr_image.split(",", 1)
            data = base64.b64decode(encoded)
            
            from email.mime.image import MIMEImage
            image = MIMEImage(data)
            image.add_header('Content-ID', '<qrcode_image>')
            image.add_header('Content-Disposition', 'inline', filename='qrcode.png')
            msg.attach(image)

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Ticket email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send ticket email: {str(e)}")
        return False

def send_attendance_confirmation(email: str, student_name: str, event_title: str, event_date: str, event_venue: str, points_earned: int, attendance_type: str = "attendee") -> bool:
    """
    Send confirmation email after successful event check-in
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured, simulating email to {email}")
        print(f"📧 Attendance Confirmation: {student_name} - {event_title} (+{points_earned} pts)")
        return True

    try:
        subject = f"✅ Attendance Confirmed - {event_title}"
        
        html_content = f"""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
                body {{ font-family: 'Outfit', sans-serif; background: #f0f2f5; margin: 0; padding: 0; }}
                .container {{ max-width: 500px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }}
                .content {{ padding: 40px 30px; text-align: center; }}
                .points-circle {{ width: 100px; height: 100px; background: #fbbf24; color: #78350f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 20px; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4); }}
                .event-card {{ background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0; font-size:24px;">Attendance Confirmed!</h1>
                </div>
                <div class="content">
                    <div class="points-circle">+{points_earned}</div>
                    <h2 style="color: #1e293b; margin: 0;">Great job, {student_name}!</h2>
                    <p style="color: #64748b;">Your attendance has been marked.</p>
                    
                    <div class="event-card">
                        <strong style="color: #166534; display: block; margin-bottom: 5px;">{event_title}</strong>
                        <div style="color: #15803d; font-size: 14px;">📅 {event_date} &nbsp;•&nbsp; 📍 {event_venue}</div>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">Points have been added to your profile.</p>
                </div>
                <div class="footer">
                    &copy; {datetime.now().year} Get2Gather
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = f"Get2Gather <{smtp_email}>"
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Attendance confirmation sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send attendance confirmation: {str(e)}")
        return False
def send_event_update_notification(email: str, student_name: str, event_title: str, changes: list) -> bool:
    """
    Send notification email when event details are updated
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured, simulating email to {email}")
        print(f"📧 Event Update: {student_name} - {event_title}")
        return True

    try:
        subject = f"📢 Important Update: {event_title}"
        
        changes_html = "".join([f"<li>{change}</li>" for change in changes])
        
        html_content = f"""
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
                body {{ font-family: 'Outfit', sans-serif; background: #f0f2f5; margin: 0; padding: 0; }}
                .container {{ max-width: 500px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white; }}
                .content {{ padding: 30px; }}
                .changes-box {{ background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 20px 0; }}
                .footer {{ background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0; font-size:24px;">📢 Event Update</h1>
                </div>
                <div class="content">
                    <h2 style="color: #1e293b; margin: 0 0 10px 0;">Hi {student_name},</h2>
                    <p style="color: #64748b;">Update for <strong>{event_title}</strong>:</p>
                    
                    <div class="changes-box">
                        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                            {changes_html}
                        </ul>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">Check the app for latest details.</p>
                </div>
                <div class="footer">
                    &copy; {datetime.now().year} Get2Gather
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = f"Get2Gather <{smtp_email}>"
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Event update email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send event update email: {str(e)}")
        return False

def send_weekly_winner_email(email: str, student_name: str, rank: int, score: int) -> bool:
    """
    Send congratulatory email to weekly winners
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print(f"⚠️ SMTP not configured, simulating email. Rank {rank} Winner: {student_name}")
        return True

    try:
        subject = f"🏆 You are a Weekly Winner! (Rank #{rank})"
        
        medal = "🥇" if rank == 1 else "🥈" if rank == 2 else "🥉" if rank == 3 else "🏅"
        color = "#eab308" if rank == 1 else "#94a3b8" if rank == 2 else "#b45309" if rank == 3 else "#6366f1"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
                body {{ font-family: 'Outfit', sans-serif; background: #0f172a; margin: 0; padding: 0; }}
                .container {{ max-width: 500px; margin: 40px auto; background: #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); color: white; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 60px 20px; text-align: center; }}
                .medal-icon {{ font-size: 80px; margin-bottom: 20px; display: block; filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4)); }}
                .rank-title {{ font-size: 32px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 2px; }}
                .content {{ padding: 40px 30px; text-align: center; }}
                .score-box {{ background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin: 30px 0; border: 1px solid rgba(255, 255, 255, 0.2); }}
                .footer {{ background: #020617; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }}
                .cta-btn {{ display: inline-block; background: {color}; color: white; padding: 12px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 20px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <span class="medal-icon">{medal}</span>
                    <h1 class="rank-title">Rank #{rank}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Weekly Top Performer</p>
                </div>
                <div class="content">
                    <h2 style="margin: 0 0 10px 0;">Congratulations, {student_name}!</h2>
                    <p style="color: #cbd5e1;">You've been simply amazing this week.</p>
                    
                    <div class="score-box">
                        <div style="font-size: 14px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Points Earned</div>
                        <div style="font-size: 48px; font-weight: bold; color: {color};">{score}</div>
                    </div>
                    
                    <p style="color: #cbd5e1; font-size: 14px;">
                        A new badge has been added to your profile. Keep up the great work!
                    </p>
                    
                    <a href="#" class="cta-btn">View Leaderboard</a>
                </div>
                <div class="footer">
                    &copy; {datetime.now().year} Get2Gather
                </div>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart()
        msg['From'] = f"Get2Gather <{smtp_email}>"
        msg['To'] = email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            
        print(f"✅ Winner email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send winner email: {str(e)}")
        return False
