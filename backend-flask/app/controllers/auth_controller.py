from flask import request, jsonify
from app.services.auth_service import auth_service
from app.services.email_service import email_service
from app.services.supabase_service import supabase_service
import hashlib

class AuthController:
    """Controller for authentication endpoints"""
    
    @staticmethod
    def register():
        """Register a new user"""
        try:
            data = request.get_json()
            
            # Prepare user data
            user_data = {
                'first_name': data.get('firstName'),
                'last_name': data.get('lastName'),
                'date_of_birth': data.get('dateOfBirth'),
                'address': data.get('address'),
                'city': data.get('city'),
                'state': data.get('state'),
                'country': data.get('country', 'US'),
                'postal_code': data.get('postalCode'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'alternate_email': data.get('alternateEmail'),
                'alternate_phone': data.get('alternatePhone'),
                'password': data.get('password'),
                'role': 'patient'  # Default role
            }
            
            # Register user
            result = auth_service.register(user_data)
            
            # Send verification email if email is provided
            if result['user'].get('email'):
                try:
                    email_service.send_verification_email(
                        result['user']['email'],
                        result['verification_code']
                    )
                except Exception as e:
                    print(f"Email send error: {str(e)}")
            
            return jsonify({
                'status': 'success',
                'message': 'Registration successful. Please verify your email.',
                'data': {'user': result['user']}
            }), 201
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def login():
        """Login user"""
        try:
            data = request.get_json()
            identifier = data.get('identifier')
            password = data.get('password')
            
            # Login user
            result = auth_service.login(identifier, password)
            
            # Define role-based dashboard information
            role_dashboards = {
                'patient': {
                    'dashboardRoute': '/patient/dashboard',
                    'dashboardName': 'Patient Dashboard',
                    'permissions': ['view_profile', 'book_appointments', 'view_prescriptions'],
                    'features': ['appointments', 'prescriptions', 'reminders', 'health_records']
                },
                'doctor': {
                    'dashboardRoute': '/doctor/dashboard',
                    'dashboardName': 'Doctor Dashboard',
                    'permissions': ['view_profile', 'manage_appointments', 'write_prescriptions', 'view_patients'],
                    'features': ['appointments', 'patients', 'prescriptions', 'schedule', 'reports']
                },
                'admin': {
                    'dashboardRoute': '/admin/dashboard',
                    'dashboardName': 'Admin Dashboard',
                    'permissions': ['manage_users', 'manage_appointments', 'view_reports', 'system_settings'],
                    'features': ['user_management', 'system_monitoring', 'reports', 'settings']
                },
                'ambulance_staff': {
                    'dashboardRoute': '/ambulance/dashboard',
                    'dashboardName': 'Ambulance Dashboard',
                    'permissions': ['view_calls', 'update_status', 'view_location'],
                    'features': ['emergency_calls', 'routing', 'status_tracking']
                }
            }
            
            user_role = result['user'].get('role', 'patient')
            dashboard_info = role_dashboards.get(user_role, role_dashboards['patient'])
            
            return jsonify({
                'status': 'success',
                'message': 'Login successful',
                'data': {
                    'user': result['user'],
                    'token': result['token'],
                    'dashboard': dashboard_info
                }
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 401
    
    @staticmethod
    def verify_email():
        """Verify user email"""
        try:
            data = request.get_json()
            email = data.get('email')
            code = data.get('code')
            
            result = auth_service.verify_email(email, code)
            
            return jsonify({
                'status': 'success',
                'message': 'Email verified successfully'
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def resend_verification():
        """Resend verification code"""
        try:
            data = request.get_json()
            email = data.get('email')
            
            if not email:
                return jsonify({
                    'status': 'error',
                    'message': 'Email is required'
                }), 400
            
            result = auth_service.resend_verification(email)
            
            # Send email
            user = supabase_service.find_user_by_email(email)
            if user:
                try:
                    email_service.send_verification_email(
                        email,
                        result['verification_code']
                    )
                except Exception as e:
                    print(f"Email send error: {str(e)}")
            
            return jsonify({
                'status': 'success',
                'message': 'Verification code sent to your email'
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def forgot_password():
        """Request password reset"""
        try:
            data = request.get_json()
            email = data.get('email')
            
            if not email:
                return jsonify({
                    'status': 'error',
                    'message': 'Email is required'
                }), 400
            
            result = auth_service.forgot_password(email)
            
            # Send password reset email
            user = supabase_service.find_user_by_email(email)
            if user:
                try:
                    email_service.send_password_reset_email(
                        email,
                        result['reset_token'],
                        user.get('first_name', 'User')
                    )
                except Exception as e:
                    print(f"Email send error: {str(e)}")
            
            return jsonify({
                'status': 'success',
                'message': 'Password reset link sent to your email'
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def reset_password():
        """Reset password"""
        try:
            data = request.get_json()
            user_id = data.get('userId')
            reset_token = data.get('token')
            new_password = data.get('password')
            
            # Hash the token
            token_hash = hashlib.sha256(reset_token.encode()).hexdigest()
            
            # Reset password
            result = auth_service.reset_password(user_id, token_hash, new_password)
            
            return jsonify({
                'status': 'success',
                'message': 'Password reset successfully'
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def get_profile():
        """Get user profile"""
        try:
            user_id = request.user['user_id']
            user = supabase_service.find_user_by_id(user_id)
            
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User not found'
                }), 404
            
            # Remove sensitive data
            user.pop('password_hash', None)
            user.pop('verification_code', None)
            
            return jsonify({
                'status': 'success',
                'data': user
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def update_profile():
        """Update user profile"""
        try:
            user_id = request.user['user_id']
            data = request.get_json()
            
            # Allowed fields to update
            allowed_fields = [
                'first_name', 'last_name', 'date_of_birth',
                'address', 'city', 'state', 'country', 'postal_code',
                'phone', 'alternate_email', 'alternate_phone'
            ]
            
            updates = {k: v for k, v in data.items() if k in allowed_fields}
            
            if not updates:
                return jsonify({
                    'status': 'error',
                    'message': 'No valid fields to update'
                }), 400
            
            user = supabase_service.update_user(user_id, updates)
            
            # Remove sensitive data
            user.pop('password_hash', None)
            user.pop('verification_code', None)
            
            return jsonify({
                'status': 'success',
                'message': 'Profile updated successfully',
                'data': user
            }), 200
        
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def logout():
        """Logout user"""
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        }), 200


# Create a singleton instance
auth_controller = AuthController()
