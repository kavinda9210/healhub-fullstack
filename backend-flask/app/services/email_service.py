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
    def send_password_reset_email(email: str, reset_token: str, user_name: str = None):
        """Send password reset email"""
        subject = f"{config.APP_NAME} - Password Reset"
        reset_link = f"{config.APP_URL}/reset-password?token={reset_token}"
        
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px;">
                    <h2>Password Reset Request</h2>
                    <p>Hi {user_name or 'User'},</p>
                    <p>We received a request to reset your password. Click the button below to reset it:</p>
                    <p style="text-align: center;">
                        <a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                    </p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this reset, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        text_content = f"Reset your password here: {reset_link}\n\nThis link will expire in 1 hour."
        
        return EmailService.send_email(email, subject, html_content, text_content)
    
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


# Create a singleton instance
email_service = EmailService()
