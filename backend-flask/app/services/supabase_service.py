import os
from supabase import create_client, Client
from app.config.config import get_config

config = get_config()

class SupabaseService:
    """Service for Supabase database operations"""
    
    def __init__(self):
        self.client: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_ROLE_KEY
        )
    
    # User operations
    def create_user(self, user_data: dict):
        """Create a new user"""
        try:
            response = self.client.table('users').insert(user_data).execute()
            if response.data:
                return response.data[0]
            raise Exception('Failed to create user')
        except Exception as e:
            raise Exception(f'Error creating user: {str(e)}')
    
    def find_user_by_email(self, email: str):
        """Find user by email"""
        try:
            response = self.client.table('users').select('*').eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            return None
    
    def find_user_by_phone(self, phone: str):
        """Find user by phone"""
        try:
            response = self.client.table('users').select('*').eq('phone', phone).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            return None
    
    def find_user_by_id(self, user_id: str):
        """Find user by ID"""
        try:
            response = self.client.table('users').select('*').eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            raise Exception(f'Error finding user: {str(e)}')
    
    def update_user(self, user_id: str, updates: dict):
        """Update user by ID"""
        try:
            response = self.client.table('users').update(updates).eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            raise Exception('Failed to update user')
        except Exception as e:
            raise Exception(f'Error updating user: {str(e)}')
    
    def update_user_by_email(self, email: str, updates: dict):
        """Update user by email"""
        try:
            response = self.client.table('users').update(updates).eq('email', email).execute()
            if response.data:
                return response.data[0]
            raise Exception('Failed to update user')
        except Exception as e:
            raise Exception(f'Error updating user: {str(e)}')
    
    def get_all_users(self, limit: int = 100, offset: int = 0):
        """Get all users with pagination"""
        try:
            response = self.client.table('users').select('*').range(offset, offset + limit - 1).execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f'Error fetching users: {str(e)}')
    
    # Password reset tokens
    def create_password_reset_token(self, token_data: dict):
        """Create a password reset token"""
        try:
            response = self.client.table('password_reset_tokens').insert(token_data).execute()
            if response.data:
                return response.data[0]
            raise Exception('Failed to create reset token')
        except Exception as e:
            raise Exception(f'Error creating reset token: {str(e)}')
    
    def find_valid_reset_token(self, user_id: str, token_hash: str):
        """Find a valid password reset token"""
        try:
            from datetime import datetime
            now = datetime.utcnow().isoformat()
            response = (self.client.table('password_reset_tokens')
                       .select('*')
                       .eq('user_id', user_id)
                       .eq('token_hash', token_hash)
                       .eq('is_used', False)
                       .gt('expires_at', now)
                       .execute())
            return response.data[0] if response.data else None
        except Exception as e:
            return None
    
    def mark_reset_token_as_used(self, token_id: str):
        """Mark a reset token as used"""
        try:
            from datetime import datetime
            response = self.client.table('password_reset_tokens').update({
                'is_used': True,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', token_id).execute()
            if response.data:
                return response.data[0]
            raise Exception('Failed to mark token as used')
        except Exception as e:
            raise Exception(f'Error updating token: {str(e)}')
    
    def cleanup_expired_tokens(self):
        """Delete expired password reset tokens"""
        try:
            from datetime import datetime
            now = datetime.utcnow().isoformat()
            response = self.client.table('password_reset_tokens').delete().lt('expires_at', now).execute()
            return True
        except Exception as e:
            raise Exception(f'Error cleaning up tokens: {str(e)}')


# Create a singleton instance
supabase_service = SupabaseService()
