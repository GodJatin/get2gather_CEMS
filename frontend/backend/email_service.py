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
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }}
                .container {{
                    max-width: 600px;
                    margin: 40px auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 30px;
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    margin: 0;
                    font-size: 28px;
                    font-weight: 600;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .otp-box {{
                    background: #f8f9fa;
                    border: 2px dashed #667eea;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 25px 0;
                }}
                .otp-code {{
                    font-size: 36px;
                    font-weight: bold;
                    letter-spacing: 8px;
                    color: #667eea;
                    font-family: 'Courier New', monospace;
                }}
                .message {{
                    color: #333;
                    line-height: 1.6;
                    font-size: 16px;
                }}
                .footer {{
                    background: #f8f9fa;
                    padding: 20px 30px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }}
                .warning {{
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Get2Gather</h1>
                </div>
                <div class="content">
                    <h2 style="color: #333; margin-top: 0;">Email Verification Required</h2>
                    <p class="message">Hello!</p>
                    <p class="message">Thank you for registering with Get2Gather. To complete your {user_type} registration, please use the verification code below:</p>
                    
                    <div class="otp-box">
                        <div style="color: #666; font-size: 14px; margin-bottom: 10px;">Your Verification Code</div>
                        <div class="otp-code">{otp}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⏰ This code will expire in 10 minutes.</strong><br>
                        If you didn't request this code, please ignore this email.
                    </div>
                    
                    <p class="message">For security reasons, never share this code with anyone.</p>
                </div>
                <div class="footer">
                    <p>Get2Gather - College Event Management System</p>
                    <p style="margin: 5px 0;">This is an automated email, please do not reply.</p>
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
                body {{ font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, {'#667eea 0%, #764ba2' if ticket_type == 'attendee' else '#d946ef 0%, #f43f5e'} 100%); padding: 30px; text-align: center; color: white; }}
                .ticket {{ background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px; border: 2px dashed #667eea; }}
                .qr-section {{ text-align: center; margin: 20px 0; }}
                .manual-code {{ background: #eef2ff; padding: 15px; margin: 15px 20px; border-radius: 8px; text-align: center; border: 1px solid #c7d2fe; }}
                .code-text {{ font-family: monospace; font-size: 16px; font-weight: bold; color: #4338ca; word-break: break-all; }}
                .instructions {{ background: #fff3cd; padding: 15px; margin: 20px; border-radius: 8px; border-left: 4px solid #ffc107; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Get2Gather</h1>
                    <h2 style="margin: 10px 0;">{'🎫 Attendee Pass' if ticket_type == 'attendee' else '🤝 Volunteer Pass'}</h2>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333;">Hello {student_name}!</h2>
                    <p style="font-size: 16px; color: #666;">You're confirmed for:</p>
                    
                    <div class="ticket">
                        <h3 style="margin: 0 0 15px 0; color: #333;">{event_title}</h3>
                        <p style="margin: 5px 0;"><strong>📅 Date:</strong> {event_date}</p>
                        <p style="margin: 5px 0;"><strong>🕐 Time:</strong> {event_time}</p>
                        <p style="margin: 5px 0;"><strong>📍 Venue:</strong> {event_venue}</p>
                    </div>
                    
                    <div class="qr-section">
                        <p style="font-weight: bold; color: #333;">Show this QR code at the event:</p>
                        <img src="cid:qrcode_image" alt="Event QR Code" style="max-width: 250px; border: 2px solid #ddd; border-radius: 8px; padding: 10px; background: white;" />
                    </div>

                    {f'''
                    <div class="manual-code">
                        <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Having trouble scanning? Use this code:</p>
                        <div class="code-text">{qr_data}</div>
                    </div>
                    ''' if qr_data else ''}
                    
                    <div class="instructions">
                        <h4 style="margin-top: 0;">⚠️ Important Instructions:</h4>
                        <ul style="margin: 10px 0;">
                            <li>Arrive at the venue on time</li>
                            <li><strong>Scan this QR code at the entrance to mark your attendance</strong></li>
                            <li>If scanning fails, provide the manual code above to the organizer</li>
                            <li>Points will be credited ONLY after scanning</li>
                            <li>Keep this email accessible on your phone</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666; text-align: center; margin-top: 30px;">See you at the event! 🎉</p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                    <p>Get2Gather - College Event Management System</p>
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
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }}
                .points-badge {{ background: #fbbf24; color: #78350f; padding: 10px 20px; border-radius: 50px; font-size: 24px; font-weight: bold; display: inline-block; margin: 20px 0; }}
                .event-details {{ background: #f8f9fa; padding: 20px; margin: 20px; border-radius: 8px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">✅ Attendance Confirmed!</h1>
                </div>
                <div style="padding: 30px; text-align: center;">
                    <h2 style="color: #333;">Thank You, {student_name}!</h2>
                    <p style="font-size: 16px; color: #666;">You successfully {'attended' if attendance_type == 'attendee' else 'volunteered at'}:</p>
                    
                    <div class="event-details">
                        <h3 style="margin: 0 0 10px 0; color: #333;">{event_title}</h3>
                        <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> {event_date}</p>
                        <p style="margin: 5px 0; color: #666;"><strong>📍 Venue:</strong> {event_venue}</p>
                    </div>
                    
                    <div class="points-badge">
                        +{points_earned} Points Earned! 🎉
                    </div>
                    
                    <p style="color: #666; line-height: 1.6; margin-top: 30px;">
                        Your points have been credited to your account. Keep participating in more events to earn rewards!
                    </p>
                    
                    <p style="color: #666; margin-top: 20px;">
                        <strong>Thank you for being a part of Get2Gather!</strong><br>
                        We hope you enjoyed the event. Continue exploring and participating in campus activities through our platform.
                    </p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                    <p>Get2Gather - College Event Management System</p>
                    <p style="margin: 5px 0;">Keep participating, keep earning! 🚀</p>
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
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white; }}
                .changes-box {{ background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin: 20px 0; }}
                .changes-list {{ margin: 0; padding-left: 20px; color: #92400e; }}
                .changes-list li {{ margin-bottom: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">📢 Event Update</h1>
                </div>
                <div style="padding: 30px;">
                    <h2 style="color: #333;">Hello {student_name},</h2>
                    <p style="font-size: 16px; color: #666;">There have been some changes to an upcoming event you registered for:</p>
                    
                    <h3 style="margin: 20px 0 10px 0; color: #333;">{event_title}</h3>
                    
                    <div class="changes-box">
                        <strong style="display: block; margin-bottom: 10px; color: #b45309;">Updated Details:</strong>
                        <ul class="changes-list">
                            {changes_html}
                        </ul>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Please check the event page for the latest information.
                    </p>
                    
                    <p style="color: #666; margin-top: 20px;">
                        See you there!
                    </p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
                    <p>Get2Gather - College Event Management System</p>
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
