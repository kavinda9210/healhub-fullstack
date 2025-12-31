# Flask Backend Implementation Guide

This document provides guidance on implementing additional controllers and routes for the Flask backend.

## Adding New Controllers

### 1. Create a New Controller File

**Example: Patient Controller** (`app/controllers/patient_controller.py`)

```python
from flask import request, jsonify
from app.services.supabase_service import supabase_service
from app.middlewares.auth_middleware import patient_required

class PatientController:
    """Controller for patient-related endpoints"""
    
    @staticmethod
    def get_appointments():
        """Get patient's appointments"""
        try:
            user_id = request.user['user_id']
            # Implement appointment fetching logic
            return jsonify({
                'status': 'success',
                'data': []
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400
    
    @staticmethod
    def book_appointment():
        """Book a new appointment"""
        try:
            user_id = request.user['user_id']
            data = request.get_json()
            # Implement appointment booking logic
            return jsonify({
                'status': 'success',
                'message': 'Appointment booked'
            }), 201
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 400

# Create singleton instance
patient_controller = PatientController()
```

## Adding New Routes

### 2. Create New Route Blueprint

**Example: Patient Routes** (`app/routes/patient_routes.py`)

```python
from flask import Blueprint
from app.controllers.patient_controller import patient_controller
from app.middlewares.auth_middleware import auth_required, patient_required

patient_bp = Blueprint('patient', __name__, url_prefix='/api/patient')

@patient_bp.route('/appointments', methods=['GET'])
@auth_required
@patient_required
def get_appointments():
    return patient_controller.get_appointments()

@patient_bp.route('/appointments', methods=['POST'])
@auth_required
@patient_required
def book_appointment():
    return patient_controller.book_appointment()
```

### 3. Register Blueprint in Main App

**Update** `app/__init__.py`:

```python
from app.routes.patient_routes import patient_bp

def create_app(config_class=None):
    # ... existing code ...
    
    # Register blueprints
    app.register_blueprint(patient_bp)
    
    # ... rest of code ...
```

## Adding New Services

### Creating a Service Layer

**Example: Appointment Service** (`app/services/appointment_service.py`)

```python
from app.services.supabase_service import supabase_service
from datetime import datetime

class AppointmentService:
    """Service for appointment operations"""
    
    @staticmethod
    def create_appointment(user_id: str, appointment_data: dict):
        """Create a new appointment"""
        try:
            data = {
                'patient_id': user_id,
                'doctor_id': appointment_data.get('doctor_id'),
                'appointment_date': appointment_data.get('date'),
                'appointment_time': appointment_data.get('time'),
                'reason': appointment_data.get('reason'),
                'status': 'scheduled',
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Insert into appointments table
            response = supabase_service.client.table('appointments').insert(data).execute()
            if response.data:
                return response.data[0]
            raise Exception('Failed to create appointment')
        except Exception as e:
            raise Exception(f'Error creating appointment: {str(e)}')
    
    @staticmethod
    def get_user_appointments(user_id: str):
        """Get appointments for a user"""
        try:
            response = supabase_service.client.table('appointments').select('*').eq('patient_id', user_id).execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f'Error fetching appointments: {str(e)}')

# Singleton instance
appointment_service = AppointmentService()
```

## Adding Request Validation

**Example: Appointment Validation** (`app/middlewares/validation_middleware.py`)

Add this to the validation_middleware.py:

```python
def validate_appointment_booking(f):
    """Validate appointment booking data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        errors = []
        
        if not data.get('doctor_id'):
            errors.append('Doctor ID is required')
        if not data.get('date'):
            errors.append('Appointment date is required')
        if not data.get('time'):
            errors.append('Appointment time is required')
        if not data.get('reason'):
            errors.append('Reason for appointment is required')
        
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function
```

## Database Operations

### Insert Data
```python
response = supabase_service.client.table('table_name').insert({
    'field1': 'value1',
    'field2': 'value2'
}).execute()
```

### Query Data
```python
response = supabase_service.client.table('table_name').select('*').eq('id', id).execute()
data = response.data[0] if response.data else None
```

### Update Data
```python
response = supabase_service.client.table('table_name').update({
    'field1': 'new_value'
}).eq('id', id).execute()
```

### Delete Data
```python
response = supabase_service.client.table('table_name').delete().eq('id', id).execute()
```

## Common Patterns

### Protected Endpoint with Validation
```python
@app.route('/api/endpoint', methods=['POST'])
@auth_required                    # Check user is authenticated
@validate_endpoint_data           # Validate request data
@admin_required                   # Check user is admin
def endpoint_handler():
    user_id = request.user['user_id']
    data = request.get_json()
    # Handle request
    return jsonify({'status': 'success'}), 200
```

### Error Handling
```python
try:
    # Perform operation
    result = some_operation()
    return jsonify({
        'status': 'success',
        'data': result
    }), 200
except ValueError as e:
    return jsonify({
        'status': 'error',
        'message': str(e)
    }), 400
except Exception as e:
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500
```

## Testing Endpoints

### Using cURL

```bash
# POST request with data
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "doctor_id": "123",
    "date": "2024-02-15",
    "time": "10:00",
    "reason": "Checkup"
  }'

# GET request with authentication
curl http://localhost:5000/api/patient/appointments \
  -H "Authorization: Bearer <token>"
```

### Using Python Requests

```python
import requests

# Login
login_response = requests.post('http://localhost:5000/api/auth/login', json={
    'identifier': 'user@example.com',
    'password': 'password123'
})
token = login_response.json()['data']['token']

# Get appointments
headers = {'Authorization': f'Bearer {token}'}
appointments = requests.get('http://localhost:5000/api/patient/appointments', headers=headers)
print(appointments.json())
```

## Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `FLASK_ENV=production`
- [ ] Ensure all controllers are implemented
- [ ] Test all endpoints
- [ ] Set up database backups
- [ ] Configure email settings for production
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting appropriately

## Performance Tips

1. **Use database indexes** on frequently queried fields
2. **Cache responses** for read-heavy endpoints
3. **Implement pagination** for large result sets
4. **Use connection pooling** for database connections
5. **Enable gzip compression** in production
6. **Monitor API response times** and optimize slow queries

## Next Steps

1. Implement all remaining controllers (Doctor, Admin, Ambulance)
2. Add comprehensive error logging
3. Set up unit and integration tests
4. Add API documentation with Swagger
5. Implement caching with Redis
6. Set up CI/CD pipeline
7. Configure monitoring and alerting

---

For more information, refer to the main README.md file.
