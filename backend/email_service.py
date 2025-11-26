import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import secrets
from datetime import datetime

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
        bool: True if email sent successfully, False otherwise
    """
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")

    if not smtp_email or not smtp_password:
        print("❌ SMTP credentials missing in .env")
        return False

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
        return True
        
    except Exception as e:
        print(f"❌ Failed to send OTP email to {email}: {str(e)}")
        return False
