import os
from supabase import create_client, Client
from app.config.config import get_config
import secrets

config = get_config()

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_ROLE_KEY
        )

    def list_users(self, role=None, limit=100, offset=0):
        """List users, optionally filtered by role."""
        try:
            query = self.client.table('users').select('*')
            if role:
                if role == 'ambulance_staff':
                    query = query.in_('role', ['ambulance', 'ambulance_staff'])
                else:
                    query = query.eq('role', role)
            query = query.range(offset, offset + limit - 1)
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f'Error listing users: {str(e)}')

    # Departments
    def list_departments(self):
        """List departments (optionally could filter active)."""
        try:
            resp = self.client.table('departments').select('*').execute()
            return resp.data if resp.data else []
        except Exception as e:
            raise Exception(f'Error listing departments: {str(e)}')

    def get_department(self, department_id: str):
        """Get a single department by id."""
        try:
            resp = self.client.table('departments').select('*').eq('id', department_id).single().execute()
            return resp.data if resp.data else None
        except Exception:
            return None

    def delete_user(self, user_id: str):
        """Delete user by ID."""
        try:
            response = self.client.table('users').delete().eq('id', user_id).execute()
            if response.data is not None:
                return True
            raise Exception('Failed to delete user')
        except Exception as e:
            raise Exception(f'Error deleting user: {str(e)}')

    def delete_user_cascade(self, user_id: str):
        """Delete a user and related doctor/ambulance records."""
        try:
            # Doctor records
            doctor = self.client.table('doctors').select('id').eq('user_id', user_id).execute()
            doctor_id = doctor.data[0]['id'] if doctor and doctor.data else None
            if doctor_id:
                self.client.table('doctor_availability').delete().eq('doctor_id', doctor_id).execute()
                self.client.table('doctor_available_days').delete().eq('doctor_id', doctor_id).execute()
                self.client.table('doctors').delete().eq('id', doctor_id).execute()

            # Ambulance staff records
            staff = self.client.table('ambulance_staff').select('id').eq('user_id', user_id).execute()
            staff_id = staff.data[0]['id'] if staff and staff.data else None
            if staff_id:
                self.client.table('ambulance_staff_available_days').delete().eq('staff_id', staff_id).execute()
                self.client.table('ambulance_staff').delete().eq('id', staff_id).execute()

            # User
            self.delete_user(user_id)
            return True
        except Exception as e:
            raise Exception(f'Error deleting user cascade: {str(e)}')

    def user_counts_by_role(self):
        """Get user counts grouped by role."""
        try:
            # Get all users
            response = self.client.table('users').select('role').execute()
            users = response.data if response.data else []
            
            # Count by role
            role_counts = {}
            for user in users:
                role = user.get('role', 'patient')
                role_counts[role] = role_counts.get(role, 0) + 1
            
            # Convert to list format with proper labels
            result = []
            role_labels = {
                'patient': 'Patient',
                'doctor': 'Doctor',
                'admin': 'Admin',
                'ambulance_staff': 'Ambulance Staff',
                'ambulance': 'Ambulance'
            }
            
            for role, count in role_counts.items():
                result.append({
                    'role': role_labels.get(role, role.replace('_', ' ').title()),
                    'count': count,
                    'role_key': role
                })
            
            # Sort by count descending
            result.sort(key=lambda x: x['count'], reverse=True)
            
            return result
        except Exception as e:
            raise Exception(f'Error getting user counts: {str(e)}')

    # --- Doctor helpers ---
    def get_doctor_by_user_id(self, user_id: str):
        try:
            resp = self.client.table('doctors').select('*').eq('user_id', user_id).execute()
            return resp.data[0] if resp.data else None
        except Exception:
            return None

    def get_doctor_available_days(self, doctor_id: str):
        try:
            resp = self.client.table('doctor_available_days').select('day_of_week').eq('doctor_id', doctor_id).execute()
            return [r.get('day_of_week') for r in (resp.data or []) if r.get('day_of_week')]
        except Exception:
            return []

    def get_ambulance_staff_by_user_id(self, user_id: str):
        try:
            resp = self.client.table('ambulance_staff').select('*').eq('user_id', user_id).execute()
            return resp.data[0] if resp.data else None
        except Exception:
            return None

    def get_ambulance_staff_available_days(self, staff_id: str):
        try:
            resp = self.client.table('ambulance_staff_available_days').select('day_of_week').eq('staff_id', staff_id).execute()
            return [r.get('day_of_week') for r in (resp.data or []) if r.get('day_of_week')]
        except Exception:
            return []

    def upsert_doctor(self, user_id: str, payload: dict):
        """Create or update doctor profile for a user."""
        return self._upsert_doctor_internal(user_id=user_id, payload=payload, allow_partial=False)

    def upsert_doctor_partial(self, user_id: str, payload: dict):
        """Update doctor profile allowing partial payload (merges with existing)."""
        return self._upsert_doctor_internal(user_id=user_id, payload=payload, allow_partial=True)

    def _upsert_doctor_internal(self, user_id: str, payload: dict, allow_partial: bool):
        try:
            def _normalize_time(value: str | None) -> str | None:
                if not value:
                    return None
                value = str(value).strip()
                if len(value) == 5 and value.count(':') == 1:
                    return f"{value}:00"
                return value
            dept_id = payload.get('departmentId')
            specialization = payload.get('specialization')
            if dept_id and not specialization:
                dept = self.get_department(dept_id)
                if dept and dept.get('name'):
                    specialization = dept['name']

            existing = self.get_doctor_by_user_id(user_id) if allow_partial else None

            # Merge fields from existing (no new defaults introduced)
            license_number = payload.get('licenseNumber')
            hospital_name = payload.get('hospitalName')
            available_from = _normalize_time(payload.get('availableFrom'))
            available_to = _normalize_time(payload.get('availableTo'))
            available_days = payload.get('availableDays')
            available_date = payload.get('availableDate')
            slot_duration_minutes = payload.get('slotDurationMinutes')

            if existing:
                if license_number is None:
                    license_number = existing.get('license_number')
                if hospital_name is None:
                    hospital_name = existing.get('hospital_name')
                if specialization is None:
                    specialization = existing.get('specialization')
                if dept_id is None:
                    dept_id = existing.get('department_id')
                if available_from is None:
                    available_from = _normalize_time(existing.get('available_from'))
                if available_to is None:
                    available_to = _normalize_time(existing.get('available_to'))

            # Validate required core fields
            if not license_number:
                raise Exception('licenseNumber is required for doctor')
            if not hospital_name:
                raise Exception('hospitalName is required for doctor')
            if not specialization:
                raise Exception('specialization is required for doctor (or select a department)')
            if not available_from:
                raise Exception('availableFrom is required for doctor')
            if not available_to:
                raise Exception('availableTo is required for doctor')

            # Availability tables: only replace when explicitly provided, unless creating new
            should_update_availability = (
                (available_days is not None)
                or (available_date is not None)
                or (slot_duration_minutes is not None)
                or ('availableFrom' in payload)
                or ('availableTo' in payload)
            )

            if not existing:
                should_update_availability = True

            if should_update_availability:
                if not isinstance(available_days, list) or len(available_days) == 0:
                    raise Exception('availableDays is required for doctor (select at least one day)')
                if not available_date:
                    raise Exception('availableDate is required for doctor')
                if slot_duration_minutes in (None, ''):
                    raise Exception('slotDurationMinutes is required for doctor')

            data = {
                'user_id': user_id,
                'specialization': specialization,
                'license_number': license_number,
                'hospital_name': hospital_name,
                'hospital_address': payload.get('hospitalAddress'),
                'hospital_phone': payload.get('hospitalPhone'),
                'experience_years': payload.get('experienceYears'),
                'consultation_fee': payload.get('consultationFee'),
                'available_from': available_from,
                'available_to': available_to,
                'max_patients_per_day': payload.get('maxPatientsPerDay'),
                'rating': payload.get('rating'),
                'is_available': payload.get('isAvailable'),
                'department_id': dept_id
            }
            res = self.client.table('doctors').upsert(data, on_conflict='user_id').execute()
            if not res.data:
                raise Exception('Failed to create doctor profile')
            doctor_id = res.data[0]['id']

            if should_update_availability:
                day_rows = [
                    {
                        'doctor_id': doctor_id,
                        'day_of_week': day,
                        'start_time': available_from,
                        'end_time': available_to,
                        'is_available': True
                    }
                    for day in available_days
                ]
                # Replace availability days (no unique constraint defined in DB)
                self.client.table('doctor_available_days').delete().eq('doctor_id', doctor_id).execute()
                self.client.table('doctor_available_days').insert(day_rows).execute()

                availability_row = {
                    'doctor_id': doctor_id,
                    'available_date': available_date,
                    'start_time': available_from,
                    'end_time': available_to,
                    'slot_duration_minutes': slot_duration_minutes,
                    'is_booked': False
                }
                # Replace daily availability (no unique constraint in DB)
                self.client.table('doctor_availability').delete().eq('doctor_id', doctor_id).execute()
                self.client.table('doctor_availability').insert(availability_row).execute()

            return doctor_id
        except Exception as e:
            raise Exception(f'Error creating doctor profile: {str(e)}')

    # --- Ambulance staff helpers ---
    def upsert_ambulance_staff(self, user_id: str, payload: dict):
        """Create or update ambulance staff profile for a user."""
        return self._upsert_ambulance_staff_internal(user_id=user_id, payload=payload, allow_partial=False)

    def upsert_ambulance_staff_partial(self, user_id: str, payload: dict):
        """Update ambulance staff profile allowing partial payload (merges with existing)."""
        return self._upsert_ambulance_staff_internal(user_id=user_id, payload=payload, allow_partial=True)

    def _upsert_ambulance_staff_internal(self, user_id: str, payload: dict, allow_partial: bool):
        try:
            existing = self.get_ambulance_staff_by_user_id(user_id) if allow_partial else None

            staff_type = payload.get('staffType')
            vehicle_reg = payload.get('vehicleRegistration')
            assigned_city = payload.get('assignedCity')
            assigned_state = payload.get('assignedState')
            available_days = payload.get('availableDays')

            if existing:
                if staff_type is None:
                    staff_type = existing.get('staff_type')
                if vehicle_reg is None:
                    vehicle_reg = existing.get('vehicle_registration_number')
                if assigned_city is None:
                    assigned_city = existing.get('assigned_city')
                if assigned_state is None:
                    assigned_state = existing.get('assigned_state')

            if not staff_type:
                raise Exception('staffType is required for ambulance staff')
            if not vehicle_reg:
                raise Exception('vehicleRegistration is required for ambulance staff')
            if not assigned_city:
                raise Exception('assignedCity is required for ambulance staff')
            if not assigned_state:
                raise Exception('assignedState is required for ambulance staff')

            should_update_days = (available_days is not None) or (not existing)
            if should_update_days:
                if not isinstance(available_days, list) or len(available_days) == 0:
                    raise Exception('availableDays is required for ambulance staff (select at least one day)')

            data = {
                'user_id': user_id,
                'staff_type': staff_type,
                'license_number': payload.get('licenseNumber'),
                'vehicle_registration_number': vehicle_reg,
                'vehicle_type': payload.get('vehicleType'),
                'assigned_city': assigned_city,
                'assigned_state': assigned_state,
                'assigned_region': payload.get('assignedRegion'),
                'base_station_address': payload.get('baseStationAddress'),
                'base_station_phone': payload.get('baseStationPhone'),
                'shift_type': payload.get('shiftType'),
                'shift_start': payload.get('shiftStart'),
                'shift_end': payload.get('shiftEnd'),
                'is_on_duty': payload.get('isOnDuty'),
                'has_advanced_life_support': payload.get('hasALS'),
                'current_location_lat': payload.get('lat'),
                'current_location_lng': payload.get('lng')
            }
            res = self.client.table('ambulance_staff').upsert(data, on_conflict='user_id').execute()
            if not res.data:
                raise Exception('Failed to create ambulance staff profile')
            staff_id = res.data[0]['id']

            if should_update_days:
                day_rows = [
                    {
                        'staff_id': staff_id,
                        'day_of_week': day,
                        'is_available': True
                    }
                    for day in available_days
                ]
                # Replace available days (no unique constraint in DB)
                self.client.table('ambulance_staff_available_days').delete().eq('staff_id', staff_id).execute()
                self.client.table('ambulance_staff_available_days').insert(day_rows).execute()

            return staff_id
        except Exception as e:
            raise Exception(f'Error creating ambulance staff profile: {str(e)}')
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

    # Storage operations
    def upload_user_profile_image(self, user_id: str, filename: str, content_type: str, data: bytes) -> str:
        """Upload a user's profile image to Supabase Storage and return its public URL.

        Requires the bucket (config.SUPABASE_PROFILE_BUCKET) to exist and be public.
        """
        if not filename:
            filename = 'profile'

        ext = os.path.splitext(filename)[1].lower()
        if ext not in {'.jpg', '.jpeg', '.png', '.webp', '.gif'}:
            ext = '.jpg'

        bucket = config.SUPABASE_PROFILE_BUCKET
        object_path = f"avatars/{user_id}/{secrets.token_hex(8)}{ext}"

        try:
            res = self.client.storage.from_(bucket).upload(
                object_path,
                data,
                {
                    'content-type': content_type or 'application/octet-stream',
                    'x-upsert': 'true',
                },
            )
        except Exception as e:
            raise Exception(
                f"Error uploading profile image (bucket '{bucket}'): {str(e)}. "
                "Ensure the bucket exists and is public."
            )

        # Some supabase-py versions return a dict-like object with 'error'
        try:
            err = getattr(res, 'error', None) or (res.get('error') if isinstance(res, dict) else None)
            if err:
                raise Exception(str(err))
        except Exception as e:
            raise Exception(
                f"Error uploading profile image (bucket '{bucket}'): {str(e)}. "
                "Ensure the bucket exists and is public."
            )

        return f"{config.SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket}/{object_path}"
    
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

    def find_valid_token(self, user_id: str, code: str, token_type: str):
        """Find a valid token by user, code, and token_type."""
        try:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc).isoformat()
            response = (
                self.client.table('password_reset_tokens')
                .select('*')
                .eq('user_id', user_id)
                .eq('reset_code', code)
                .eq('token_type', token_type)
                .eq('is_used', False)
                .gt('expires_at', now)
                .execute()
            )
            return response.data[0] if response.data else None
        except Exception:
            return None
    
    def find_valid_reset_token(self, user_id: str, reset_code: str):
        """Find a valid password reset token"""
        try:
            return self.find_valid_token(user_id=user_id, code=reset_code, token_type='password_reset')
        except Exception as e:
            return None
    
    def mark_reset_token_as_used(self, token_id: str):
        """Mark a reset token as used"""
        try:
            response = self.client.table('password_reset_tokens').update({
                'is_used': True
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
