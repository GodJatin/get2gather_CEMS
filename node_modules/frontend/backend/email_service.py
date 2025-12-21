import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
import os
import secrets
from datetime import datetime
import base64

def generate_otp() -> str:
    return ''.join([str(secrets.randbelow(10)) for _ in range(6)])

def get_base_template(content: str) -> str:
    """
    Returns the standardized HTML wrapper with the Get2Gather design.
    Responsive, clean, and professional.
    """
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* Reset & Base */
            body {{ font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; color: #1a1a1a; }}
            table {{ border-spacing: 0; width: 100%; }}
            td {{ padding: 0; }}
            img {{ border: 0; }}
            
            /* Container */
            .wrapper {{ width: 100%; table-layout: fixed; background-color: #f4f4f5; padding-bottom: 40px; }}
            .webkit {{ max-width: 600px; background-color: #ffffff; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }}
            .outer {{ margin: 0 auto; width: 100%; max-width: 600px; }}
            
            /* Header */
            .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 0; text-align: center; }}
            .logo-text {{ font-size: 32px; font-weight: 800; letter-spacing: -1px; color: #ffffff; margin: 0; padding: 0; background: linear-gradient(to right, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block; }}
            
            /* Content */
            .content-body {{ padding: 40px 30px; background-color: #ffffff; }}
            
            /* Footer */
            .footer {{ background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }}
            .footer-text {{ color: #64748b; font-size: 13px; margin-bottom: 10px; }}
            .social-link {{ color: #94a3b8; text-decoration: none; margin: 0 5px; font-weight: 600; font-size: 12px; }}
            
            /* Components */
            .badge {{ display: inline-block; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }}
            .card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }}
            .btn {{ display: inline-block; background: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px; font-size: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
            
            /* Utilities */
            .text-center {{ text-align: center; }}
            .text-muted {{ color: #64748b; }}
            .mb-2 {{ margin-bottom: 8px; }}
            .mb-4 {{ margin-bottom: 16px; }}
        </style>
    </head>
    <body>
        <center class="wrapper">
            <div class="webkit">
                <table class="outer">
                    <tr>
                        <td>
                            <!-- Header -->
                            <div class="header">
                                <h1 class="logo-text">Get2Gather</h1>
                            </div>
                            
                            <!-- Main Content -->
                            <div class="content-body">
                                {content}
                            </div>
                            
                            <!-- Footer -->
                            <div class="footer">
                                <p class="footer-text">&copy; {datetime.now().year} Get2Gather. Elevating Campus Events.</p>
                                <p class="footer-text">
                                    <a href="#" class="social-link">Instagram</a> • 
                                    <a href="#" class="social-link">Twitter</a> • 
                                    <a href="#" class="social-link">Support</a>
                                </p>
                                <p class="footer-text" style="font-size: 11px; margin-top: 15px;">This is an automated message. Please do not reply directly to this email.</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
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
        
        # Handle Inline Images (CID)
        if image_attachment:
             # image_attachment = {'data': base64_str, 'cid': 'unique_id', 'filename': 'name.png'}
            if isinstance(image_attachment['data'], str) and image_attachment['data'].startswith('data:image'):
                 _, encoded = image_attachment['data'].split(",", 1)
                 data = base64.b64decode(encoded)
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
        import traceback
        traceback.print_exc()
        print(f"❌ Failed to send email: {e}")
        return False

def send_otp_email(email: str, otp: str, user_type: str = "user") -> bool:
    content = f"""
        <div class="text-center">
            <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #1e293b;">Email Verification</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.5;">Welcome to Get2Gather! Use the code below to verify your {user_type} account.</p>
            
            <div style="background: #f1f5f9; letter-spacing: 8px; font-size: 36px; font-family: 'Courier New', monospace; font-weight: 700; color: #334155; padding: 24px; border-radius: 12px; margin: 30px 0; border: 1px dashed #cbd5e1;">
                {otp}
            </div>
            
            <p style="font-size: 14px; color: #94a3b8;">This code expires in 10 minutes.</p>
        </div>
    """
    return send_email(email, "🔑 Verify your email - Get2Gather", get_base_template(content)), "Email sent"

def send_booking_ticket(email: str, student_name: str, event_title: str, event_date: str, event_time: str, event_venue: str, qr_image: str, qr_data: str = None, ticket_type: str = "attendee") -> bool:
    # Styles based on type
    is_volunteer = ticket_type == "volunteer"
    accent_color = "#ec4899" if is_volunteer else "#8b5cf6"
    bg_color = "#fdf2f8" if is_volunteer else "#f5f3ff"
    text_color = "#be185d" if is_volunteer else "#7c3aed"
    label = "Volunteer Pass" if is_volunteer else "Event Ticket"

    content = f"""
        <!-- Ticket Header -->
        <div class="text-center">
            <span class="badge" style="background-color: {accent_color}; color: white;">{label}</span>
            <h2 style="margin: 20px 0 5px 0; font-size: 26px; color: #1e293b; line-height: 1.2;">{event_title}</h2>
            <p style="color: #64748b; margin: 0; font-size: 16px;">Confirmed for <strong>{student_name}</strong></p>
        </div>

        <!-- Event Details Card -->
        <div class="card" style="background-color: {bg_color}; border-color: {bg_color};">
            <table width="100%">
                <tr>
                    <td style="padding-bottom: 15px;">
                        <strong style="color: {text_color}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Date</strong><br>
                        <span style="font-size: 16px; color: #334155;">{event_date}</span>
                    </td>
                    <td style="padding-bottom: 15px;">
                        <strong style="color: {text_color}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Time</strong><br>
                        <span style="font-size: 16px; color: #334155;">{event_time}</span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong style="color: {text_color}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Venue</strong><br>
                        <span style="font-size: 16px; color: #334155;">{event_venue}</span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- QR Code Section -->
        <div class="text-center" style="margin: 30px 0;">
            <p style="font-weight: 600; margin-bottom: 15px; color: #334155;">Scan at Entrance</p>
            <div style="display: inline-block; padding: 15px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <img src="cid:qrcode_image" alt="QR Code" style="width: 200px; height: 200px; display: block;" />
            </div>
            
            {f'''
            <div style="margin-top: 20px;">
                <p style="font-size: 13px; color: #64748b; margin-bottom: 5px;">Trouble scanning?</p>
                <div style="font-family: monospace; background: #f1f5f9; color: #475569; padding: 8px 16px; border-radius: 8px; display: inline-block; font-weight: bold; border: 1px solid #e2e8f0;">{qr_data}</div>
            </div>
            ''' if qr_data else ''}
        </div>

        <!-- Important Instructions (Requested) -->
        <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 20px; text-align: left;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
                <strong style="color: #92400e; font-size: 15px;">Important Instructions</strong>
            </div>
            <ul style="margin: 0; padding-left: 24px; color: #b45309; font-size: 14px; line-height: 1.6;">
                <li style="margin-bottom: 5px;">Arrive at the venue on time.</li>
                <li style="margin-bottom: 5px;"><strong>Scan the QR code above</strong> at the entrance to mark your attendance.</li>
                <li style="margin-bottom: 5px;">If scanning fails, provide the manual code to the organizer.</li>
                <li style="margin-bottom: 5px;">Points will be credited <strong>ONLY after scanning</strong>.</li>
                <li>Keep this email accessible on your phone for quick entry.</li>
            </ul>
        </div>
    """
    
    img_data = {'data': qr_image, 'cid': 'qrcode_image', 'filename': 'ticket_qr.png'}
    return send_email(email, f"🎟️ Your Ticket: {event_title}", get_base_template(content), img_data)

def send_attendance_confirmation(email: str, student_name: str, event_title: str, event_date: str, event_venue: str, points_earned: int, attendance_type: str = "attendee") -> bool:
    content = f"""
        <div class="text-center">
            <div style="width: 60px; height: 60px; background: #dcfce7; color: #16a34a; border-radius: 50%; font-size: 30px; line-height: 60px; margin: 0 auto 20px;">✓</div>
            <h2 style="margin: 0 0 10px 0; color: #166534; font-size: 24px;">Attendance Verified!</h2>
            <p style="color: #64748b; font-size: 16px;">Thanks for joining us, {student_name}.</p>
        </div>

        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #bbf7d0; border-radius: 16px; padding: 30px; margin: 30px 0; text-align: center;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #15803d; font-weight: 700; margin-bottom: 8px;">Points Earned</div>
            <div style="font-size: 48px; font-weight: 800; color: #14532d; letter-spacing: -1px; line-height: 1;">+{points_earned}</div>
        </div>

        <div class="card">
            <h3 style="font-size: 14px; text-transform: uppercase; color: #94a3b8; margin: 0 0 15px 0; letter-spacing: 1px;">Event Summary</h3>
            <p style="margin: 5px 0; font-size: 15px;"><strong>{event_title}</strong></p>
            <p style="margin: 5px 0; font-size: 14px; color: #64748b;">📅 {event_date} &nbsp;•&nbsp; 📍 {event_venue}</p>
        </div>
        
        <!-- Engagement Section (Requested) -->
        <div class="text-center" style="margin-top: 40px; padding-top: 30px; border-top: 1px dashed #e2e8f0;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #1e293b;">Hungry for more?</h3>
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
                There are plenty more events happening around campus. <br>Check them out and keep building your profile!
            </p>
            <a href="https://get2gather-cems.vercel.app/events" class="btn">Explore Upcoming Events</a>
        </div>
    """
    return send_email(email, f"✅ Attendance: {event_title}", get_base_template(content))

def send_event_update_notification(email: str, student_name: str, event_title: str, changes: list) -> bool:
    changes_html = "".join([f"<li style='margin-bottom: 10px;'>{change}</li>" for change in changes])
    
    content = f"""
        <div style="border-left: 4px solid #f59e0b; padding-left: 20px; margin-bottom: 30px;">
            <h2 style="color: #b45309; margin: 0 0 5px 0; font-size: 24px;">Event Update</h2>
            <p style="color: #78350f; font-size: 16px; margin: 0;">Important changes for <strong>{event_title}</strong></p>
        </div>
        
        <p style="margin-bottom: 20px; color: #334155;">Hello {student_name},</p>
        
        <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 12px; padding: 24px;">
            <h3 style="margin: 0 0 15px 0; font-size: 15px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">What Changed</h3>
            <ul style="margin: 0; padding-left: 20px; color: #b45309; font-size: 15px;">
                {changes_html}
            </ul>
        </div>
        
        <div class="text-center" style="margin-top: 30px;">
            <a href="https://get2gather-cems.vercel.app/events" class="btn" style="background: #ffffff; color: #b45309; border: 1px solid #d97706;">View Updated Details</a>
        </div>
    """
    return send_email(email, f"📢 Update: {event_title}", get_base_template(content))
