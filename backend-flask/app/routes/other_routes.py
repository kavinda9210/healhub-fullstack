from flask import Blueprint, jsonify, request
from app.middlewares.auth_middleware import (
    auth_required,
    admin_required,
    patient_required,
    doctor_required,
    ambulance_staff_required,
)
from app.controllers.admin_controller import admin_controller
from app.services.supabase_service import supabase_service
from app.services.ai_service import ai_service
from app.services.ai_service import ai_service

doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')
test_bp = Blueprint('test', __name__, url_prefix='/api/test')
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')
patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')
ambulance_bp = Blueprint('ambulance', __name__, url_prefix='/api/ambulance')
appointment_bp = Blueprint('appointment', __name__, url_prefix='/api/appointment')
prescription_bp = Blueprint('prescription', __name__, url_prefix='/api/prescription')
reminder_bp = Blueprint('reminder', __name__, url_prefix='/api/reminder')
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/departments', methods=['GET'])
@auth_required
def list_departments_for_users():
    try:
        depts = supabase_service.list_departments()
        # normalize to {id,name} for UI
        normalized = []
        for d in (depts or []):
            if not isinstance(d, dict):
                continue
            normalized.append({
                **d,
                'id': d.get('id') or d.get('department_id'),
                'name': d.get('name') or d.get('department_name') or d.get('department'),
            })
        return jsonify({'status': 'success', 'data': normalized}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# Simple dashboard endpoints for each role
@patient_bp.route('/dashboard', methods=['GET'])
@auth_required
@patient_required
def patient_dashboard():
    return jsonify({
        'status': 'success',
        'message': 'Patient dashboard data',
        'role': 'patient',
        'user': getattr(request, 'user', None)
    }), 200


# Image detection endpoint: accept multipart/form-data with 'image' file
@patient_bp.route('/detect', methods=['POST'])
@auth_required
@patient_required
def detect_skin_issue():
    try:
        # Accept file upload
        img = None
        if 'image' in request.files:
            f = request.files['image']
            img = f.read()
        else:
            body = request.get_json(silent=True) or {}
            img_b64 = body.get('imageBase64')
            if img_b64:
                import base64
                img = base64.b64decode(img_b64)

        if not img:
            return jsonify({'status': 'error', 'message': 'No image provided'}), 400

        result = ai_service.detect(img)

        # Find doctors that match the recommended specialization
        specialization = result.get('specialization')
        doctors = []
        try:
            doctors = supabase_service.find_doctors_by_specialization(specialization)
        except Exception:
            doctors = []

        return jsonify({'status': 'success', 'data': {'detection': result, 'doctors': doctors}}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@doctor_bp.route('/dashboard', methods=['GET'])
@auth_required
@doctor_required
def doctor_dashboard():
    return jsonify({
        'status': 'success',
        'message': 'Doctor dashboard data',
        'role': 'doctor',
        'user': getattr(request, 'user', None)
    }), 200

@ambulance_bp.route('/dashboard', methods=['GET'])
@auth_required
@ambulance_staff_required
def ambulance_dashboard():
    return jsonify({
        'status': 'success',
        'message': 'Ambulance staff dashboard data',
        'role': 'ambulance_staff',
        'user': getattr(request, 'user', None)
    }), 200

# Admin user management endpoints
@admin_bp.route('/departments', methods=['GET'])
@auth_required
@admin_required
def list_departments():
    return admin_controller.list_departments()

@admin_bp.route('/users', methods=['GET'])
@auth_required
@admin_required
def list_users():
    return admin_controller.list_users()

@admin_bp.route('/users/<user_id>', methods=['GET'])
@auth_required
@admin_required
def get_user(user_id):
    return admin_controller.get_user(user_id)

@admin_bp.route('/users', methods=['POST'])
@auth_required
@admin_required
def add_user():
    return admin_controller.add_user()

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@auth_required
@admin_required
def update_user(user_id):
    return admin_controller.update_user(user_id)

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@auth_required
@admin_required
def delete_user(user_id):
    return admin_controller.delete_user(user_id)

@admin_bp.route('/user-counts', methods=['GET'])
@auth_required
@admin_required
def user_counts():
    return admin_controller.user_counts()


# Appointment booking (patient)
@appointment_bp.route('/book', methods=['POST'])
@auth_required
@patient_required
def book_appointment():
    try:
        payload = request.get_json() or {}
        user = getattr(request, 'user', {})
        patient_id = user.get('id')
        doctor_id = payload.get('doctorId') or payload.get('doctor_id')
        appointment_date = payload.get('appointmentDate') or payload.get('appointment_date')
        reason = payload.get('reason') or payload.get('notes')

        if not doctor_id or not appointment_date:
            return jsonify({'status': 'error', 'message': 'doctorId and appointmentDate required'}), 400

        appt = {
            'patient_id': patient_id,
            'doctor_id': doctor_id,
            'appointment_date': appointment_date,
            'reason': reason,
            'status': 'booked'
        }
        # check slot is still available
        try:
            date_only = appointment_date.split('T')[0]
            slots = supabase_service.get_available_slots(doctor_id, date_only)
            if appointment_date not in slots:
                return jsonify({'status': 'error', 'message': 'Requested slot is not available'}), 409
        except Exception:
            # if slot check fails, continue to try booking
            pass

        saved = supabase_service.create_appointment(appt)

        # Create a reminder entry for the appointment
        try:
            rem = {
                'user_id': patient_id,
                'title': 'Appointment reminder',
                'message': f'Appointment with doctor {doctor_id} on {appointment_date}',
                'scheduled_at': appointment_date,
                'type': 'appointment',
                'meta': {'appointment_id': saved.get('id') if saved else None}
            }
            supabase_service.create_reminder(rem)
        except Exception:
            pass

        return jsonify({'status': 'success', 'data': saved}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Reminders: list and create for authenticated user
@reminder_bp.route('/', methods=['GET'])
@auth_required
def list_reminders():
    try:
        user = getattr(request, 'user', None)
        if not user:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        reminders = supabase_service.get_reminders_for_user(user.get('id'))
        return jsonify({'status': 'success', 'data': reminders}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@reminder_bp.route('/', methods=['POST'])
@auth_required
def create_reminder():
    try:
        user = getattr(request, 'user', None)
        if not user:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        payload = request.get_json() or {}
        payload['user_id'] = user.get('id')
        saved = supabase_service.create_reminder(payload)
        return jsonify({'status': 'success', 'data': saved}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Patient image upload -> AI detection
@patient_bp.route('/detect', methods=['POST'])
@auth_required
@patient_required
def detect_image():
    try:
        if 'image' not in request.files:
            return jsonify({'status': 'error', 'message': 'No image provided'}), 400
        f = request.files['image']
        data = f.read()
        detection = ai_service.detect(data)

        # find doctors by specialization
        doctors = []
        try:
            spec = detection.get('specialization')
            if spec:
                doctors = supabase_service.find_doctors_by_specialization(spec)
        except Exception:
            doctors = []

        return jsonify({'status': 'success', 'data': {'detection': detection, 'doctors': doctors}}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# AI status - useful for debugging model availability
@patient_bp.route('/ai/status', methods=['GET'])
@auth_required
def ai_status():
    try:
        # don't require patient role; just report model status
        st = {
            'ready': getattr(ai_service, '_ready', False),
            'has_model': ai_service.model is not None,
            'classes': ai_service.classes or [],
        }
        return jsonify({'status': 'success', 'data': st}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Get available slots for a doctor on a date
@appointment_bp.route('/slots', methods=['GET'])
@auth_required
def get_slots():
    try:
        doctor_id = request.args.get('doctorId') or request.args.get('doctor_id')
        date = request.args.get('date')
        if not doctor_id or not date:
            return jsonify({'status': 'error', 'message': 'doctorId and date required'}), 400
        slots = supabase_service.get_available_slots(doctor_id, date)
        return jsonify({'status': 'success', 'data': slots}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Doctor profile / availability endpoints
@doctor_bp.route('/profile', methods=['GET'])
@auth_required
@doctor_required
def get_doctor_profile():
    try:
        user = getattr(request, 'user', None)
        if not user:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        doc = supabase_service.get_doctor_by_user_id(user.get('id'))
        if not doc:
            return jsonify({'status': 'success', 'data': None}), 200
        days = supabase_service.get_doctor_available_days(doc.get('id'))
        doc['availableDays'] = days
        return jsonify({'status': 'success', 'data': doc}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


@doctor_bp.route('/availability', methods=['POST'])
@auth_required
@doctor_required
def set_availability():
    try:
        payload = request.get_json() or {}
        user = getattr(request, 'user', None)
        if not user:
            return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        # Use upsert_doctor_partial to update availability
        supabase_service.upsert_doctor_partial(user.get('id'), payload)
        return jsonify({'status': 'success', 'message': 'Availability updated'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
