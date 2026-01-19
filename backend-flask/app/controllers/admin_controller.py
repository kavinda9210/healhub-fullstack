from flask import request, jsonify
from app.services.supabase_service import supabase_service
from app.services.auth_service import auth_service
from app.services.email_service import email_service

class AdminController:
    """Admin endpoints for user management"""

    @staticmethod
    def list_users():
        role = request.args.get('role')
        try:
            users = supabase_service.list_users(role=role)
            return jsonify({'status': 'success', 'data': users}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def list_departments():
        try:
            depts = supabase_service.list_departments()
            normalized = []
            for d in (depts or []):
                if not isinstance(d, dict):
                    continue
                dept_id = d.get('id') or d.get('department_id')
                dept_name = d.get('name') or d.get('department_name') or d.get('department')
                normalized.append({
                    **d,
                    'id': dept_id,
                    'name': dept_name,
                })
            return jsonify({'status': 'success', 'data': normalized}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def get_user(user_id):
        try:
            user = supabase_service.find_user_by_id(user_id)
            if not user:
                return jsonify({'status': 'error', 'message': 'User not found'}), 404

            role = user.get('role')
            # UI compatibility
            if role == 'ambulance':
                user['role'] = 'ambulance_staff'

            profile = {}
            if role == 'doctor':
                doctor = supabase_service.get_doctor_by_user_id(user_id)
                if doctor:
                    days = supabase_service.get_doctor_available_days(doctor.get('id'))
                    profile['doctor'] = {
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
                    profile['ambulance'] = {
                        'staffType': staff.get('staff_type'),
                        'vehicleRegistration': staff.get('vehicle_registration_number'),
                        'assignedCity': staff.get('assigned_city'),
                        'assignedState': staff.get('assigned_state'),
                        'shiftType': staff.get('shift_type'),
                        'availableDays': days,
                    }

            return jsonify({'status': 'success', 'data': {**user, **profile}}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def add_user():
        data = request.get_json()
        try:
            if not data.get('dateOfBirth'):
                raise Exception('dateOfBirth is required')

            role_in = data.get('role', 'patient')
            # DB enum compatibility: some schemas use 'ambulance' instead of 'ambulance_staff'
            role_db = 'ambulance' if role_in == 'ambulance_staff' else role_in

            # Convert camelCase to snake_case for backend
            user_data = {
                'first_name': data.get('firstName'),
                'last_name': data.get('lastName'),
                'email': data.get('email'),
                'phone': data.get('phone'),
                'password': data.get('password'),
                'role': role_db,
                'date_of_birth': data.get('dateOfBirth')
            }
            # Use auth_service to handle password hashing, etc.
            result = auth_service.register(user_data, admin_create=True)

            # Role-specific inserts (require explicit payload sections, no defaults)
            role = user_data['role']
            user_id = result['user']['id']
            details = {}
            if role == 'doctor':
                doctor_payload = data.get('doctor') or {}
                supabase_service.upsert_doctor(user_id, doctor_payload)
                details['doctor'] = doctor_payload
            if role in ['ambulance_staff', 'ambulance']:
                amb_payload = data.get('ambulance') or {}
                supabase_service.upsert_ambulance_staff(user_id, amb_payload)
                details['ambulance'] = amb_payload
            
            # Send email notification to the new user
            if result['user'].get('email'):
                try:
                    email_service.send_admin_created_user_email(
                        result['user']['email'],
                        result['user']['first_name'],
                        result['user']['role'],
                        result['verification_code'],
                        data.get('password'),  # Send the original password
                        details
                    )
                except Exception as e:
                    print(f"Email notification error: {str(e)}")
            
            return jsonify({'status': 'success', 'data': result['user']}), 201
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def update_user(user_id):
        data = request.get_json()
        try:
            # Accept camelCase (frontend) and snake_case (legacy)
            role_in = data.get('role') or data.get('role_key') or data.get('role_key'.replace('_', ''))
            role_in = role_in or data.get('role')
            if not role_in:
                existing = supabase_service.find_user_by_id(user_id)
                role_in = (existing or {}).get('role')

            role_db = 'ambulance' if role_in == 'ambulance_staff' else role_in

            updates = {}
            if 'firstName' in data or 'first_name' in data:
                updates['first_name'] = data.get('firstName') if 'firstName' in data else data.get('first_name')
            if 'lastName' in data or 'last_name' in data:
                updates['last_name'] = data.get('lastName') if 'lastName' in data else data.get('last_name')
            if 'phone' in data:
                updates['phone'] = data.get('phone')
            if 'dateOfBirth' in data or 'date_of_birth' in data:
                dob_val = data.get('dateOfBirth') if 'dateOfBirth' in data else data.get('date_of_birth')
                updates['date_of_birth'] = auth_service._validate_date_of_birth(dob_val)
            if role_db:
                updates['role'] = role_db

            user = supabase_service.update_user(user_id, updates) if updates else supabase_service.find_user_by_id(user_id)

            # Role-specific profile updates (partial merge)
            if role_db == 'doctor' and isinstance(data.get('doctor'), dict):
                supabase_service.upsert_doctor_partial(user_id, data.get('doctor'))
            if role_db in ['ambulance', 'ambulance_staff'] and isinstance(data.get('ambulance'), dict):
                supabase_service.upsert_ambulance_staff_partial(user_id, data.get('ambulance'))

            # UI compatibility in response
            if user and user.get('role') == 'ambulance':
                user['role'] = 'ambulance_staff'

            return jsonify({'status': 'success', 'data': user}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def delete_user(user_id):
        try:
            supabase_service.delete_user_cascade(user_id)
            return jsonify({'status': 'success', 'message': 'User deleted'}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

    @staticmethod
    def user_counts():
        try:
            counts = supabase_service.user_counts_by_role()
            return jsonify({'status': 'success', 'data': counts}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400

admin_controller = AdminController()
