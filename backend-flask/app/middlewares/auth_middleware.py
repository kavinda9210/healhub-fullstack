from functools import wraps
from flask import request, jsonify
from app.services.auth_service import auth_service
from app.services.supabase_service import supabase_service

def auth_required(f):
    """Middleware to protect routes with JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Get token from Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({
                    'status': 'error',
                    'message': 'Not authorized, no token provided'
                }), 401
            
            token = auth_header.split(' ')[1]
            
            # Verify token
            decoded = auth_service.verify_token(token)
            
            # Get fresh user data from database
            user = supabase_service.find_user_by_id(decoded['user_id'])
            if not user:
                return jsonify({
                    'status': 'error',
                    'message': 'User no longer exists'
                }), 401
            
            # Check session nonce to validate token hasn't been invalidated by logout-all
            token_nonce = decoded.get('session_nonce', 0)
            user_nonce = user.get('session_nonce', 0)
            if token_nonce != user_nonce:
                return jsonify({
                    'status': 'error',
                    'message': 'Session has been invalidated. Please login again.'
                }), 401
            
            if not user.get('is_active'):
                return jsonify({
                    'status': 'error',
                    'message': 'User account is deactivated'
                }), 401
            
            # Store user info in request context. Provide both `id` and `user_id` keys
            # because some handlers expect `user.get('id')` while others use `user_id`.
            request.user = {
                'id': user['id'],
                'user_id': user['id'],
                'role': user.get('role'),
                'email': user.get('email'),
                'phone': user.get('phone'),
                'first_name': user.get('first_name'),
                'last_name': user.get('last_name'),
                'full_name': f"{user.get('first_name')} {user.get('last_name')}"
            }
            
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': 'Not authorized, invalid token'
            }), 401
    
    return decorated_function


def admin_required(f):
    """Middleware to check if user is admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'user') or request.user['role'] != 'admin':
            return jsonify({
                'status': 'error',
                'message': 'Access denied. Admin only area'
            }), 403
        return f(*args, **kwargs)
    
    return decorated_function


def patient_required(f):
    """Middleware to check if user is patient"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'user') or request.user['role'] != 'patient':
            return jsonify({
                'status': 'error',
                'message': 'Access denied. Patient only area'
            }), 403
        return f(*args, **kwargs)
    
    return decorated_function


def doctor_required(f):
    """Middleware to check if user is doctor"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'user') or request.user['role'] != 'doctor':
            return jsonify({
                'status': 'error',
                'message': 'Access denied. Doctor only area'
            }), 403
        return f(*args, **kwargs)
    
    return decorated_function


def ambulance_staff_required(f):
    """Middleware to check if user is ambulance staff"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_role = request.user['role'] if hasattr(request, 'user') else None
        if not user_role or user_role not in ['ambulance_staff', 'ambulance']:
            return jsonify({
                'status': 'error',
                'message': 'Access denied. Ambulance staff only area'
            }), 403
        return f(*args, **kwargs)
    
    return decorated_function


def roles_required(*roles):
    """Middleware to check if user has one of the specified roles"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'user') or request.user['role'] not in roles:
                return jsonify({
                    'status': 'error',
                    'message': f'Access denied. Required roles: {", ".join(roles)}'
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
