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


# Raw probabilities endpoint for debugging: returns classes and probabilities
@patient_bp.route('/detect/raw', methods=['POST'])
@auth_required
@patient_required
def detect_raw():
    try:
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

        classes, probs = ai_service.predict_proba(img)
        return jsonify({'status': 'success', 'data': {'classes': classes, 'probs': probs}}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


@patient_bp.route('/detect/all', methods=['POST'])
@auth_required
@patient_required
def detect_all():
    try:
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

        res = ai_service.detect_all(img)

        # find doctors for ensemble_label if present
        doctors = []
        try:
            spec = None
            # map ensemble label to specialization via ai_service.detect mapping
            if res.get('ensemble_label'):
                # call detect() to get specialization for that label
                det = ai_service.detect(img)
                spec = det.get('specialization')
            if spec:
                doctors = supabase_service.find_doctors_by_specialization(spec)
        except Exception:
            doctors = []

        return jsonify({'status': 'success', 'data': {'detection': res, 'doctors': doctors}}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# Feedback / correction endpoint: accept image + correct_label, add to dataset and retrain (small run)
@patient_bp.route('/detect/feedback', methods=['POST'])
@auth_required
@patient_required
def detect_feedback():
    try:
        img = None
        label = None
        if 'image' in request.files:
            f = request.files['image']
            img = f.read()
        else:
            body = request.get_json(silent=True) or {}
            img_b64 = body.get('imageBase64')
            label = body.get('correctLabel') or body.get('correct_label')
            if img_b64:
                import base64
                img = base64.b64decode(img_b64)

        # label might be in form field
        if not label and 'correct_label' in request.form:
            label = request.form.get('correct_label')
        if not label and 'correctLabel' in request.form:
            label = request.form.get('correctLabel')

        if not img or not label:
            return jsonify({'status': 'error', 'message': 'image and correct_label required'}), 400

        # save image to dataset/train/<label>/ with unique name
        import os, uuid
        base = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'AIWoundOrrashDettector')
        save_dir = os.path.join(base, 'dataset', 'train', label)
        os.makedirs(save_dir, exist_ok=True)
        fname = f'user_correct_{uuid.uuid4().hex}.jpg'
        fpath = os.path.join(save_dir, fname)
        with open(fpath, 'wb') as wf:
            wf.write(img)

        # run a short transfer training synchronously (small epochs)
        try:
            import subprocess, sys, shutil
            tools_py = os.path.join(os.path.dirname(base), 'tools', 'transfer_train.py')
            # call using the same python executable
            proc = subprocess.run([sys.executable, tools_py], cwd=os.path.dirname(base), capture_output=True, text=True)
            # transfer_train.py by default writes AIWoundAndRashDetector_mobilenet.h5 —
            # copy it to the preferred filename so the service picks it up
            gen = os.path.join(base, 'AIWoundAndRashDetector_mobilenet.h5')
            preferred = os.path.join(base, 'AIWoundAndRashDetector.h5')
            try:
                if os.path.exists(gen):
                    shutil.copyfile(gen, preferred)
            except Exception:
                # ignore copy errors, continue to attempt reload
                pass

            # reload models in service
            try:
                ai_service._ready = False
                ai_service._load_model()
            except Exception:
                pass
        except Exception as e:
            return jsonify({'status': 'error', 'message': f'retraining failed: {str(e)}'}), 500

        # check whether model reloaded successfully
        reload_ok = getattr(ai_service, 'keras_model', None) is not None or getattr(ai_service, 'model', None) is not None
        # run detection again on same image (may fall back to stub)
        try:
            new_res = ai_service.detect_all(img)
        except Exception as e:
            new_res = {'error': str(e)}

        out = {
            'retrain_stdout': proc.stdout if 'proc' in locals() else '',
            'retrain_stderr': proc.stderr if 'proc' in locals() else '',
            'detection_after_retrain': new_res,
            'model_reloaded': bool(reload_ok)
        }

        if not reload_ok:
            return jsonify({'status': 'error', 'message': 'Retrain completed but model failed to reload; see retrain_stderr', 'data': out}), 500

        return jsonify({'status': 'success', 'data': out}), 200
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
