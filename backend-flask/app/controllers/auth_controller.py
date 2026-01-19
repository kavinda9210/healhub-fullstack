from flask import request, jsonify
from app.services.auth_service import auth_service
from app.services.email_service import email_service
from app.services.supabase_service import supabase_service

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
                        user.get('id'),
                        user.get('first_name', 'User')
                    )
                except Exception as e:
                    print(f"Email send error: {str(e)}")
            
            return jsonify({
                'status': 'success',
                'message': 'Password reset code sent to your email',
                'data': {
                    'email': email,
                    'userId': user.get('id') if user else None
                }
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

            # Reset password
            result = auth_service.reset_password(user_id, reset_token, new_password)
            
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

            role = user.get('role')
            # UI compatibility
            if role == 'ambulance':
                user['role'] = 'ambulance_staff'

            # Include role-specific profile data
            if role == 'doctor':
                doctor = supabase_service.get_doctor_by_user_id(user_id)
                if doctor:
                    days = supabase_service.get_doctor_available_days(doctor.get('id'))
                    user['doctor'] = {
                        'departmentId': doctor.get('department_id'),
                        'specialization': doctor.get('specialization'),
                        'hospitalName': doctor.get('hospital_name'),
                        'licenseNumber': doctor.get('license_number'),
                        'availableFrom': doctor.get('available_from'),
                        'availableTo': doctor.get('available_to'),
                        'availableDays': days,
                    }

            if role in ['ambulance', 'ambulance_staff']:
                staff = supabase_service.get_ambulance_staff_by_user_id(user_id)
                if staff:
                    days = supabase_service.get_ambulance_staff_available_days(staff.get('id'))
                    user['ambulance'] = {
                        'staffType': staff.get('staff_type'),
                        'vehicleRegistration': staff.get('vehicle_registration_number'),
                        'assignedCity': staff.get('assigned_city'),
                        'assignedState': staff.get('assigned_state'),
                        'shiftType': staff.get('shift_type'),
                        'availableDays': days,
                    }
            
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

            if not isinstance(data, dict):
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid request body'
                }), 400

            if 'email' in data or 'phone' in data:
                return jsonify({
                    'status': 'error',
                    'message': 'Email/phone cannot be changed here. Use the change-email/change-phone verification flow.'
                }), 400
            
            # Allowed fields to update
            allowed_fields = [
                'first_name', 'last_name', 'date_of_birth',
                'address', 'city', 'state', 'country', 'postal_code',
                'alternate_email', 'alternate_phone',
                'profile_image_url'
            ]
            

            if 'date_of_birth' in updates and updates.get('date_of_birth'):
                updates['date_of_birth'] = auth_service._validate_date_of_birth(updates.get('date_of_birth'))
            updates = {k: v for k, v in data.items() if k in allowed_fields}
            
            has_role_updates = isinstance(data.get('doctor'), dict) or isinstance(data.get('ambulance'), dict)
            if not updates and not has_role_updates:
                return jsonify({
                    'status': 'error',
                    'message': 'No valid fields to update'
                }), 400
            
            user = supabase_service.update_user(user_id, updates)
            
            # Remove sensitive data
            user.pop('password_hash', None)
            user.pop('verification_code', None)

            if user.get('role') == 'ambulance':
                user['role'] = 'ambulance_staff'
            
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
    def request_email_change():
        """Request changing the user's primary email (requires verification)."""
        try:
            user_id = request.user['user_id']
            data = request.get_json()
            new_email = data.get('newEmail')
            if not new_email:
                return jsonify({'status': 'error', 'message': 'New email is required'}), 400

            result = auth_service.request_email_change(user_id, new_email)

            user = supabase_service.find_user_by_id(user_id)
            if user:
                try:
                    email_service.send_email_change_code(new_email, result['code'], user.get('first_name', 'User'))
                except Exception as e:
                    print(f"Email send error: {str(e)}")

            return jsonify({
                'status': 'success',
                'message': 'Verification code sent to new email',
                'data': {'newEmail': new_email}
            }), 200

        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def verify_email_change():
        """Verify email change code and update the email."""
        try:
            user_id = request.user['user_id']
            data = request.get_json()
            new_email = data.get('newEmail')
            code = data.get('code')
            if not new_email or not code:
                return jsonify({'status': 'error', 'message': 'New email and code are required'}), 400

            result = auth_service.verify_email_change(user_id, new_email, code)

            return jsonify({
                'status': 'success',
                'message': 'Email updated successfully',
                'data': result.get('user')
            }), 200

        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def request_phone_change():
        """Request changing the user's primary phone (requires verification)."""
        try:
            user_id = request.user['user_id']
            data = request.get_json()
            new_phone = data.get('newPhone')
            if not new_phone:
                return jsonify({'status': 'error', 'message': 'New phone is required'}), 400

            result = auth_service.request_phone_change(user_id, new_phone)
            user = supabase_service.find_user_by_id(user_id)
            if user and user.get('email'):
                try:
                    email_service.send_phone_change_code(user['email'], result['code'], new_phone, user.get('first_name', 'User'))
                except Exception as e:
                    print(f"Email send error: {str(e)}")

            return jsonify({
                'status': 'success',
                'message': 'Verification code sent',
                'data': {'newPhone': new_phone}
            }), 200

        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def verify_phone_change():
        """Verify phone change code and update the phone."""
        try:
            user_id = request.user['user_id']
            data = request.get_json()
            new_phone = data.get('newPhone')
            code = data.get('code')
            if not new_phone or not code:
                return jsonify({'status': 'error', 'message': 'New phone and code are required'}), 400

            result = auth_service.verify_phone_change(user_id, new_phone, code)

            return jsonify({
                'status': 'success',
                'message': 'Phone updated successfully',
                'data': result.get('user')
            }), 200

        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def upload_profile_picture():
        """Upload a profile picture and update the user's profile_image_url."""
        try:
            user_id = request.user['user_id']
            file = request.files.get('file') or request.files.get('image')

            if not file:
                return jsonify({
                    'status': 'error',
                    'message': 'No file provided. Use form-data field "file".'
                }), 400

            content_type = getattr(file, 'mimetype', None) or ''
            if not content_type.startswith('image/'):
                return jsonify({
                    'status': 'error',
                    'message': 'Only image uploads are allowed'
                }), 400

            data = file.read()
            if not data:
                return jsonify({
                    'status': 'error',
                    'message': 'Empty file'
                }), 400

            max_bytes = 5 * 1024 * 1024
            if len(data) > max_bytes:
                return jsonify({
                    'status': 'error',
                    'message': 'File too large (max 5MB)'
                }), 400

            image_url = supabase_service.upload_user_profile_image(
                user_id=user_id,
                filename=getattr(file, 'filename', ''),
                content_type=content_type,
                data=data,
            )

            user = supabase_service.update_user(user_id, {
                'profile_image_url': image_url
            })

            user.pop('password_hash', None)
            user.pop('verification_code', None)

            return jsonify({
                'status': 'success',
                'message': 'Profile picture updated successfully',
                'data': {
                    'profile_image_url': image_url,
                    'user': user
                }
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

    @staticmethod
    def logout_all():
        """Logout user from all sessions"""
        try:
            user_id = request.user['user_id']
            result = auth_service.logout_all(user_id)
            return jsonify(result), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400


# Create a singleton instance
auth_controller = AuthController()
