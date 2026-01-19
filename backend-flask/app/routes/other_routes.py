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
