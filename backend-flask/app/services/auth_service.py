import bcrypt
import jwt
from datetime import datetime, timedelta
from app.config.config import get_config
from app.services.supabase_service import supabase_service
import secrets
import hashlib

config = get_config()

class AuthService:
    """Service for authentication operations"""
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate a 6-digit verification code"""
        import random
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt(rounds=10)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def compare_password(password: str, hashed_password: str) -> bool:
        """Compare a password with its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def generate_token(user_id: str, role: str) -> str:
        """Generate a JWT token"""
        payload = {
            'user_id': user_id,
            'role': role,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + config.JWT_ACCESS_TOKEN_EXPIRES
        }
        return jwt.encode(payload, config.JWT_SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode a JWT token"""
        try:
            return jwt.decode(token, config.JWT_SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise Exception('Token has expired')
        except jwt.InvalidTokenError:
            raise Exception('Invalid token')
    
    @staticmethod
    def register(user_data: dict):
        """Register a new user"""
        email = user_data.get('email')
        phone = user_data.get('phone')
        password = user_data.get('password')
        
        # Check if user already exists
        if email:
            existing_user = supabase_service.find_user_by_email(email)
            if existing_user:
                raise Exception('Email already registered')
        
        if phone:
            existing_user = supabase_service.find_user_by_phone(phone)
            if existing_user:
                raise Exception('Phone number already registered')
        
        # Hash password
        password_hash = AuthService.hash_password(password)
        
        # Generate verification code
        verification_code = AuthService.generate_verification_code()
        verification_code_expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Prepare user data
        user_data_to_create = {
            'email': email,
            'phone': phone,
            'password_hash': password_hash,
            'verification_code': verification_code,
            'verification_code_expires_at': verification_code_expires_at.isoformat(),
            'verification_type': 'email' if email else 'phone',
            'is_active': True,
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'date_of_birth': user_data.get('date_of_birth'),
            'address': user_data.get('address'),
            'city': user_data.get('city'),
            'state': user_data.get('state'),
            'country': user_data.get('country', 'US'),
            'postal_code': user_data.get('postal_code'),
            'alternate_email': user_data.get('alternate_email'),
            'alternate_phone': user_data.get('alternate_phone'),
            'role': user_data.get('role', 'patient')
        }
        
        # Create user
        user = supabase_service.create_user(user_data_to_create)
        
        # Remove sensitive data
        user.pop('password_hash', None)
        user.pop('verification_code', None)
        
        return {
            'user': user,
            'verification_code': verification_code
        }
    
    @staticmethod
    def login(identifier: str, password: str):
        """Login a user"""
        # Find user by email or phone
        user = supabase_service.find_user_by_email(identifier)
        if not user:
            user = supabase_service.find_user_by_phone(identifier)
        
        if not user:
            raise Exception('Invalid credentials')
        
        # Check if user is active
        if not user.get('is_active'):
            raise Exception('User account is deactivated')
        
        # Verify password
        if not AuthService.compare_password(password, user.get('password_hash', '')):
            raise Exception('Invalid credentials')
        
        # Check if email is verified
        if not user.get('email_verified') and user.get('email'):
            raise Exception('Email not verified. Please verify your email.')
        
        # Generate token
        token = AuthService.generate_token(user['id'], user.get('role', 'patient'))
        
        # Remove sensitive data
        user.pop('password_hash', None)
        user.pop('verification_code', None)
        
        return {
            'user': user,
            'token': token
        }
    
    @staticmethod
    def verify_email(email: str, code: str):
        """Verify user email"""
        user = supabase_service.find_user_by_email(email)
        if not user:
            raise Exception('User not found')
        
        if user.get('email_verified'):
            raise Exception('Email already verified')
        
        # Check verification code
        if user.get('verification_code') != code:
            raise Exception('Invalid verification code')
        
        # Check if code has expired
        expires_at = user.get('verification_code_expires_at')
        if expires_at:
            try:
                expires_dt = datetime.fromisoformat(expires_at)
                # Handle both naive and aware datetimes
                if expires_dt.tzinfo is None:
                    expires_dt = expires_dt.replace(tzinfo=None)
                    current_time = datetime.utcnow().replace(tzinfo=None)
                else:
                    from datetime import timezone
                    current_time = datetime.now(timezone.utc)
                
                if expires_dt < current_time:
                    raise Exception('Verification code has expired')
            except ValueError:
                raise Exception('Invalid expiration date format')
        
        # Update user
        supabase_service.update_user(user['id'], {
            'email_verified': True,
            'verification_code': None,
            'verification_code_expires_at': None
        })
        
        return {'message': 'Email verified successfully'}
    
    @staticmethod
    def resend_verification(email: str):
        """Resend verification code"""
        user = supabase_service.find_user_by_email(email)
        if not user:
            raise Exception('User not found')
        
        if user.get('email_verified_at'):
            raise Exception('Email already verified')
        
        # Generate new verification code
        verification_code = AuthService.generate_verification_code()
        verification_code_expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Update user
        supabase_service.update_user(user['id'], {
            'verification_code': verification_code,
            'verification_code_expires_at': verification_code_expires_at.isoformat()
        })
        
        return {
            'message': 'Verification code sent',
            'verification_code': verification_code
        }
    
    @staticmethod
    def forgot_password(email: str):
        """Generate password reset token"""
        user = supabase_service.find_user_by_email(email)
        if not user:
            raise Exception('User not found')
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Create reset token record
        supabase_service.create_password_reset_token({
            'user_id': user['id'],
            'token_hash': token_hash,
            'expires_at': expires_at.isoformat(),
            'is_used': False,
            'created_at': datetime.utcnow().isoformat()
        })
        
        return {
            'message': 'Password reset link sent to email',
            'reset_token': reset_token
        }
    
    @staticmethod
    def reset_password(user_id: str, token_hash: str, new_password: str):
        """Reset user password"""
        # Verify token
        token = supabase_service.find_valid_reset_token(user_id, token_hash)
        if not token:
            raise Exception('Invalid or expired reset token')
        
        # Hash new password
        password_hash = AuthService.hash_password(new_password)
        
        # Update password
        supabase_service.update_user(user_id, {
            'password_hash': password_hash
        })
        
        # Mark token as used
        supabase_service.mark_reset_token_as_used(token['id'])
        
        return {'message': 'Password reset successfully'}


# Create a singleton instance
auth_service = AuthService()
