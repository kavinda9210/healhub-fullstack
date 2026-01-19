import bcrypt
import jwt
from datetime import datetime, timedelta
from app.config.config import get_config
from app.services.supabase_service import supabase_service
import secrets

config = get_config()

class AuthService:
    """Service for authentication operations"""

    @staticmethod
    def _validate_date_of_birth(date_of_birth_value):
        if not date_of_birth_value:
            raise Exception('dateOfBirth is required')

        # Accept YYYY-MM-DD or ISO datetime strings
        try:
            if isinstance(date_of_birth_value, str):
                dob_str = date_of_birth_value.strip()
                dob_dt = datetime.fromisoformat(dob_str) if 'T' in dob_str else datetime.strptime(dob_str, '%Y-%m-%d')
                dob = dob_dt.date()
            elif isinstance(date_of_birth_value, datetime):
                dob = date_of_birth_value.date()
            else:
                # Try best-effort string conversion
                dob = datetime.strptime(str(date_of_birth_value), '%Y-%m-%d').date()
        except Exception:
            raise Exception('Invalid dateOfBirth format. Expected YYYY-MM-DD')

        today = datetime.utcnow().date()
        if dob > today:
            raise Exception('dateOfBirth cannot be in the future')

        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < config.MIN_USER_AGE:
            raise Exception(f'User must be at least {config.MIN_USER_AGE} years old')

        return dob.isoformat()
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate a 6-digit verification code"""
        import random
        return str(random.randint(100000, 999999))

    @staticmethod
    def generate_reset_code() -> str:
        """Generate a 6-digit password reset code (fits varchar(6))."""
        return str(secrets.randbelow(900000) + 100000)
    
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
    def generate_token(user_id: str, role: str, session_nonce: int = 0) -> str:
        """Generate a JWT token"""
        payload = {
            'user_id': user_id,
            'role': role,
            'session_nonce': session_nonce,
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
    def register(user_data: dict, admin_create: bool = False):
        """Register a new user"""
        email = user_data.get('email')
        phone = user_data.get('phone')
        password = user_data.get('password')
        role = user_data.get('role', 'patient')
        # DB enum compatibility: some schemas use 'ambulance' instead of 'ambulance_staff'
        if role == 'ambulance_staff':
            role = 'ambulance'
        
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
        
        # Auto-verify admin accounts or when created by admin
        auto_verify = (role == 'admin') or admin_create
        
        # Prepare user data
        dob_iso = AuthService._validate_date_of_birth(user_data.get('date_of_birth'))
        user_data_to_create = {
            'email': email,
            'phone': phone,
            'password_hash': password_hash,
            'verification_code': verification_code,
            'verification_code_expires_at': verification_code_expires_at.isoformat(),
            'verification_type': 'email' if email else 'phone',
            'is_active': True,
            'email_verified': auto_verify,
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'date_of_birth': dob_iso,
            'address': user_data.get('address'),
            'city': user_data.get('city'),
            'state': user_data.get('state'),
            'country': user_data.get('country', 'US'),
            'postal_code': user_data.get('postal_code'),
            'alternate_email': user_data.get('alternate_email'),
            'alternate_phone': user_data.get('alternate_phone'),
            'role': role
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
        
        # Check if email is verified (skip for admin users)
        if not user.get('email_verified') and user.get('email') and user.get('role') != 'admin':
            raise Exception('Email not verified. Please verify your email.')
        
        # Generate token with session nonce
        session_nonce = user.get('session_nonce', 0)
        token = AuthService.generate_token(user['id'], user.get('role', 'patient'), session_nonce)
        
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
        
        # Generate reset code (stored as-is; column is varchar(6))
        reset_code = AuthService.generate_reset_code()
        from datetime import timezone
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Create reset token record
        supabase_service.create_password_reset_token({
            'user_id': user['id'],
            'reset_code': reset_code,
            'expires_at': expires_at.isoformat(),
            'is_used': False,
            'token_type': 'password_reset',
            'created_at': datetime.now(timezone.utc).isoformat()
        })
        
        return {
            'message': 'Password reset link sent to email',
            'reset_token': reset_code
        }
    
    @staticmethod
    def reset_password(user_id: str, reset_code: str, new_password: str):
        """Reset user password"""
        # Verify token
        token = supabase_service.find_valid_reset_token(user_id, reset_code)
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

    @staticmethod
    def request_email_change(user_id: str, new_email: str):
        """Send a verification code to the new email and store a short-lived token."""
        user = supabase_service.find_user_by_id(user_id)
        if not user:
            raise Exception('User not found')

        existing = supabase_service.find_user_by_email(new_email)
        if existing and existing.get('id') != user_id:
            raise Exception('Email already registered')

        code = AuthService.generate_reset_code()
        from datetime import timezone
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        supabase_service.create_password_reset_token({
            'user_id': user_id,
            'reset_code': code,
            'expires_at': expires_at.isoformat(),
            'is_used': False,
            'token_type': 'email_change',
            'created_at': datetime.now(timezone.utc).isoformat(),
        })

        return {'code': code, 'new_email': new_email}

    @staticmethod
    def verify_email_change(user_id: str, new_email: str, code: str):
        """Verify the code and update the user's primary email."""
        token = supabase_service.find_valid_token(user_id=user_id, code=code, token_type='email_change')
        if not token:
            raise Exception('Invalid or expired verification code')

        existing = supabase_service.find_user_by_email(new_email)
        if existing and existing.get('id') != user_id:
            raise Exception('Email already registered')

        user = supabase_service.update_user(user_id, {
            'email': new_email,
            'email_verified': True,
            'verification_type': 'email',
            'verification_code': None,
            'verification_code_expires_at': None,
        })

        supabase_service.mark_reset_token_as_used(token['id'])

        user.pop('password_hash', None)
        user.pop('verification_code', None)

        return {'message': 'Email updated successfully', 'user': user}

    @staticmethod
    def request_phone_change(user_id: str, new_phone: str):
        """Send a verification code (via email) and store a short-lived token."""
        user = supabase_service.find_user_by_id(user_id)
        if not user:
            raise Exception('User not found')

        if not user.get('email'):
            raise Exception('Email is required to verify phone changes')

        existing = supabase_service.find_user_by_phone(new_phone)
        if existing and existing.get('id') != user_id:
            raise Exception('Phone number already registered')

        code = AuthService.generate_reset_code()
        from datetime import timezone
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        supabase_service.create_password_reset_token({
            'user_id': user_id,
            'reset_code': code,
            'expires_at': expires_at.isoformat(),
            'is_used': False,
            'token_type': 'phone_change',
            'created_at': datetime.now(timezone.utc).isoformat(),
        })

        return {'code': code, 'new_phone': new_phone, 'email': user.get('email')}

    @staticmethod
    def verify_phone_change(user_id: str, new_phone: str, code: str):
        """Verify the code and update the user's primary phone."""
        token = supabase_service.find_valid_token(user_id=user_id, code=code, token_type='phone_change')
        if not token:
            raise Exception('Invalid or expired verification code')

        existing = supabase_service.find_user_by_phone(new_phone)
        if existing and existing.get('id') != user_id:
            raise Exception('Phone number already registered')

        user = supabase_service.update_user(user_id, {
            'phone': new_phone,
            'phone_verified': True,
            'verification_type': 'phone',
        })

        supabase_service.mark_reset_token_as_used(token['id'])

        user.pop('password_hash', None)
        user.pop('verification_code', None)

        return {'message': 'Phone updated successfully', 'user': user}

    @staticmethod
    def logout_all(user_id: str):
        """Logout user from all sessions by incrementing session nonce."""
        try:
            user = supabase_service.find_user_by_id(user_id)
            if not user:
                raise Exception('User not found')
            
            current_nonce = user.get('session_nonce', 0)
            new_nonce = current_nonce + 1
            
            # Update session nonce to invalidate all old tokens
            updated_user = supabase_service.update_user(user_id, {'session_nonce': new_nonce})
            
            return {
                'status': 'success',
                'message': 'All sessions logged out successfully'
            }
        except Exception as e:
            raise Exception(f'Error logging out all sessions: {str(e)}')


# Create a singleton instance
auth_service = AuthService()
