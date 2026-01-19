import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config.config import get_config

config = get_config()

class EmailService:
    """Service for sending emails"""
    
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
        """Send an email"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = config.EMAIL_USER
            msg['To'] = to_email
            
            # Attach text and HTML parts
            if text_content:
                msg.attach(MIMEText(text_content, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))
            
            # Send email
            with smtplib.SMTP(config.EMAIL_HOST, config.EMAIL_PORT) as server:
                server.starttls()
                server.login(config.EMAIL_USER, config.EMAIL_PASS)
                server.send_message(msg)
            
            return {'status': 'success', 'message': 'Email sent successfully'}
        except Exception as e:
            raise Exception(f'Error sending email: {str(e)}')
    
    @staticmethod
    def send_verification_email(email: str, verification_code: str):
        """Send verification email"""
        subject = f"{config.APP_NAME} - Email Verification"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Welcome to {config.APP_NAME}!</h2>
                    <p>Please verify your email address by entering the verification code below:</p>
                    <h1 style="color: #4CAF50; text-align: center; letter-spacing: 5px;">{verification_code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        text_content = f"Your verification code is: {verification_code}\n\nThis code will expire in 10 minutes."
        
        return EmailService.send_email(email, subject, html_content, text_content)
    
    @staticmethod
    def send_password_reset_email(email: str, reset_token: str, user_id: str = None, user_name: str = None):
        """Send password reset email"""
        subject = f"{config.APP_NAME} - Password Reset"
        reset_code = reset_token
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Password Reset Request</h2>
                    <p>Hi {user_name or 'User'},</p>
                    <p>We received a request to reset your password. Use the reset code below in the app:</p>
                    <h1 style="color: #4CAF50; text-align: center; letter-spacing: 5px;">{reset_code}</h1>
                    <p><strong>User ID:</strong> {user_id or ''}</p>
                    <p>This code will expire in 1 hour.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        if user_id:
            text_content = (
                f"Your password reset code is: {reset_code}\n"
                f"User ID: {user_id}\n\n"
                "This code will expire in 1 hour."
            )
        else:
            text_content = f"Your password reset code is: {reset_code}\n\nThis code will expire in 1 hour."
        
        return EmailService.send_email(email, subject, html_content, text_content)

    @staticmethod
    def send_email_change_code(new_email: str, code: str, user_name: str = None):
        """Send email change verification code to the new email."""
        subject = f"{config.APP_NAME} - Confirm Email Change"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Confirm Email Change</h2>
                    <p>Hi {user_name or 'User'},</p>
                    <p>Use the verification code below to confirm your new email address:</p>
                    <h1 style="color: #4CAF50; text-align: center; letter-spacing: 5px;">{code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this change, you can ignore this email.</p>
                </div>
            </body>
        </html>
        """
        text_content = f"Your email change code is: {code}\n\nThis code will expire in 10 minutes."
        return EmailService.send_email(new_email, subject, html_content, text_content)

    @staticmethod
    def send_phone_change_code(to_email: str, code: str, new_phone: str, user_name: str = None):
        """Send phone change verification code (sent to current email)."""
        subject = f"{config.APP_NAME} - Confirm Phone Change"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Confirm Phone Change</h2>
                    <p>Hi {user_name or 'User'},</p>
                    <p>We received a request to change your phone number to <strong>{new_phone}</strong>.</p>
                    <p>Use the verification code below to confirm:</p>
                    <h1 style="color: #4CAF50; text-align: center; letter-spacing: 5px;">{code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this change, you can ignore this email.</p>
                </div>
            </body>
        </html>
        """
        text_content = (
            f"Phone change requested to: {new_phone}\n"
            f"Your phone change code is: {code}\n\n"
            "This code will expire in 10 minutes."
        )
        return EmailService.send_email(to_email, subject, html_content, text_content)
    
    @staticmethod
    def send_welcome_email(email: str, user_name: str, role: str):
        """Send welcome email"""
        subject = f"Welcome to {config.APP_NAME}!"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Welcome to {config.APP_NAME}, {user_name}!</h2>
                    <p>Your account as a <strong>{role}</strong> has been successfully created.</p>
                    <p>You can now log in and start using {config.APP_NAME}.</p>
                    <p style="text-align: center;">
                        <a href="{config.APP_URL}/login" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Login</a>
                    </p>
                </div>
            </body>
        </html>
        """
        text_content = f"Welcome to {config.APP_NAME}! Your account has been created as a {role}. Log in here: {config.APP_URL}/login"
        
        return EmailService.send_email(email, subject, html_content, text_content)

    @staticmethod
    def send_admin_created_user_email(email: str, user_name: str, role: str, verification_code: str, password: str, details: dict | None = None):
        """Send email notification when admin creates a user"""
        subject = f"{config.APP_NAME} - Your Account Has Been Created"

        role_details_html = ''
        if details:
            parts = []
            doctor = details.get('doctor') if isinstance(details, dict) else None
            ambulance = details.get('ambulance') if isinstance(details, dict) else None

            if doctor:
                dept_name = doctor.get('departmentName')
                if dept_name:
                    parts.append(f"<p><strong>Department:</strong> {dept_name}</p>")
                specialization = doctor.get('specialization')
                if specialization:
                    parts.append(f"<p><strong>Specialization:</strong> {specialization}</p>")
                hospital_name = doctor.get('hospitalName')
                if hospital_name:
                    parts.append(f"<p><strong>Hospital:</strong> {hospital_name}</p>")
                license_number = doctor.get('licenseNumber')
                if license_number:
                    parts.append(f"<p><strong>License #:</strong> {license_number}</p>")

            if ambulance:
                staff_type = ambulance.get('staffType')
                if staff_type:
                    parts.append(f"<p><strong>Staff Type:</strong> {staff_type}</p>")
                vehicle_reg = ambulance.get('vehicleRegistration')
                if vehicle_reg:
                    parts.append(f"<p><strong>Vehicle Registration:</strong> {vehicle_reg}</p>")
                city = ambulance.get('assignedCity') or ''
                state = ambulance.get('assignedState') or ''
                if city or state:
                    parts.append(f"<p><strong>Assigned City/State:</strong> {city}{', ' if city and state else ''}{state}</p>")

            if parts:
                role_details_html = (
                    "<div style=\"background-color:#eef7ff;padding:15px;border-radius:5px;margin:20px 0;\">"
                    "<h3 style=\"margin-top:0;\">Role Details</h3>"
                    + "".join(parts)
                    + "</div>"
                )
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Welcome to {config.APP_NAME}!</h2>
                    <p>Hi {user_name},</p>
                    <p>An administrator has created an account for you.</p>
                    
                                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                                <p><strong>Role:</strong> {role.replace('_', ' ').title()}</p>
                                                <p><strong>Email:</strong> {email}</p>
                                                <p><strong>Temporary Password:</strong> {password}</p>
                                        </div>

                    {role_details_html}
                    
                    <p>Your account is already verified and ready to use. Please verify your email using the code below:</p>
                    <h1 style="color: #4CAF50; text-align: center; letter-spacing: 5px;">{verification_code}</h1>
                    
                    <p style="color: #ff9800;"><strong>Important:</strong> Please change your password after your first login for security.</p>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="{config.APP_URL}/login" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Login Now</a>
                    </p>
                </div>
            </body>
        </html>
        """
        
        # Build plaintext details
        role_lines = []
        if details and details.get('doctor'):
            d = details['doctor']
            if d.get('departmentName'): role_lines.append(f"Department: {d.get('departmentName')}")
            if d.get('specialization'): role_lines.append(f"Specialization: {d.get('specialization')}")
            if d.get('hospitalName'): role_lines.append(f"Hospital: {d.get('hospitalName')}")
            if d.get('licenseNumber'): role_lines.append(f"License #: {d.get('licenseNumber')}")
        if details and details.get('ambulance'):
            a = details['ambulance']
            if a.get('staffType'): role_lines.append(f"Staff Type: {a.get('staffType')}")
            if a.get('vehicleRegistration'): role_lines.append(f"Vehicle Registration: {a.get('vehicleRegistration')}")
            city = a.get('assignedCity')
            state = a.get('assignedState')
            if city or state: role_lines.append(f"Assigned City/State: {city or ''}, {state or ''}")

        text_content = f"""Welcome to {config.APP_NAME}!

Hi {user_name},

An administrator has created an account for you.

Account Details:
- Role: {role.replace('_', ' ').title()}
- Email: {email}
- Temporary Password: {password}

Verification Code: {verification_code}

Your account is already verified and ready to use.

IMPORTANT: Please change your password after your first login for security.

{('\n'.join(role_lines) + '\n\n') if role_lines else ''}
Login here: {config.APP_URL}/login
"""
        
        return EmailService.send_email(email, subject, html_content, text_content)


# Create a singleton instance
email_service = EmailService()
