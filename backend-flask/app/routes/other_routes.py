from flask import Blueprint, jsonify
from app.middlewares.auth_middleware import auth_required, admin_required

# Placeholder blueprints for other routes
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')
patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')
doctor_bp = Blueprint('doctor', __name__, url_prefix='/api/doctor')
ambulance_bp = Blueprint('ambulance', __name__, url_prefix='/api/ambulance')
appointment_bp = Blueprint('appointment', __name__, url_prefix='/api/appointment')
prescription_bp = Blueprint('prescription', __name__, url_prefix='/api/prescription')
test_bp = Blueprint('test', __name__, url_prefix='/api/test')
reminder_bp = Blueprint('reminder', __name__, url_prefix='/api/reminder')
user_bp = Blueprint('user', __name__, url_prefix='/api/user')


# Add placeholder routes to prevent errors
@admin_bp.route('/dashboard', methods=['GET'])
@auth_required
@admin_required
def admin_dashboard():
    return jsonify({'message': 'Admin Dashboard'}), 200


@patient_bp.route('/dashboard', methods=['GET'])
@auth_required
def patient_dashboard():
    return jsonify({'message': 'Patient Dashboard'}), 200


@doctor_bp.route('/dashboard', methods=['GET'])
@auth_required
def doctor_dashboard():
    return jsonify({'message': 'Doctor Dashboard'}), 200


@ambulance_bp.route('/dashboard', methods=['GET'])
@auth_required
def ambulance_dashboard():
    return jsonify({'message': 'Ambulance Dashboard'}), 200
