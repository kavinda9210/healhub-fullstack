from flask import request, jsonify
from functools import wraps
from email_validator import validate_email, EmailNotValidError
import re

def validate_request_json(f):
    """Middleware to ensure request is JSON"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        return f(*args, **kwargs)
    return decorated_function


def validate_register(f):
    """Validate registration data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        errors = []
        
        # Check required fields
        if not data.get('firstName'):
            errors.append('First name is required')
        if not data.get('lastName'):
            errors.append('Last name is required')
        if not data.get('email') and not data.get('phone'):
            errors.append('Email or phone is required')
        if not data.get('password'):
            errors.append('Password is required')
        if not data.get('confirmPassword'):
            errors.append('Confirm password is required')
        
        # Validate email
        if data.get('email'):
            try:
                validate_email(data.get('email'), check_deliverability=False)
            except EmailNotValidError:
                errors.append('Invalid email address')
        
        # Validate phone
        if data.get('phone'):
            if not re.match(r'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$', data.get('phone')):
                errors.append('Invalid phone number')
        
        # Validate password length
        if data.get('password') and len(data.get('password')) < 8:
            errors.append('Password must be at least 8 characters long')
        
        # Check passwords match
        if data.get('password') != data.get('confirmPassword'):
            errors.append('Passwords do not match')
        
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_login(f):
    """Validate login data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        errors = []
        
        if not data.get('identifier'):
            errors.append('Email or phone is required')
        if not data.get('password'):
            errors.append('Password is required')
        
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_email_verification(f):
    """Validate email verification data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        errors = []
        
        if not data.get('email'):
            errors.append('Email is required')
        if not data.get('code'):
            errors.append('Verification code is required')
        
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_forgot_password(f):
    """Validate forgot password data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        
        if not data.get('email'):
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': ['Email is required']
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_reset_password(f):
    """Validate password reset data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({
                'status': 'error',
                'message': 'Request must be JSON'
            }), 400
        
        data = request.get_json()
        errors = []
        
        if not data.get('userId'):
            errors.append('User ID is required')
        if not data.get('token'):
            errors.append('Reset token is required')
        if not data.get('password'):
            errors.append('New password is required')
        if not data.get('confirmPassword'):
            errors.append('Confirm password is required')
        
        if data.get('password') and len(data.get('password')) < 8:
            errors.append('Password must be at least 8 characters long')
        
        if data.get('password') != data.get('confirmPassword'):
            errors.append('Passwords do not match')
        
        if errors:
            return jsonify({
                'status': 'error',
                'message': 'Validation failed',
                'errors': errors
            }), 400
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_change_email_request(f):
    """Validate change email request data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'Request must be JSON'}), 400

        data = request.get_json()
        errors = []
        new_email = data.get('newEmail')
        if not new_email:
            errors.append('New email is required')
        else:
            try:
                validate_email(new_email, check_deliverability=False)
            except EmailNotValidError:
                errors.append('Invalid email address')

        if errors:
            return jsonify({'status': 'error', 'message': 'Validation failed', 'errors': errors}), 400

        return f(*args, **kwargs)

    return decorated_function


def validate_change_email_verify(f):
    """Validate change email verify data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'Request must be JSON'}), 400

        data = request.get_json()
        errors = []
        new_email = data.get('newEmail')
        code = data.get('code')
        if not new_email:
            errors.append('New email is required')
        else:
            try:
                validate_email(new_email, check_deliverability=False)
            except EmailNotValidError:
                errors.append('Invalid email address')
        if not code:
            errors.append('Verification code is required')

        if errors:
            return jsonify({'status': 'error', 'message': 'Validation failed', 'errors': errors}), 400

        return f(*args, **kwargs)

    return decorated_function


def validate_change_phone_request(f):
    """Validate change phone request data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'Request must be JSON'}), 400

        data = request.get_json()
        errors = []
        new_phone = data.get('newPhone')
        if not new_phone:
            errors.append('New phone is required')
        elif not re.match(r'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$', new_phone):
            errors.append('Invalid phone number')

        if errors:
            return jsonify({'status': 'error', 'message': 'Validation failed', 'errors': errors}), 400

        return f(*args, **kwargs)

    return decorated_function


def validate_change_phone_verify(f):
    """Validate change phone verify data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'Request must be JSON'}), 400

        data = request.get_json()
        errors = []
        new_phone = data.get('newPhone')
        code = data.get('code')
        if not new_phone:
            errors.append('New phone is required')
        elif not re.match(r'^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$', new_phone):
            errors.append('Invalid phone number')
        if not code:
            errors.append('Verification code is required')

        if errors:
            return jsonify({'status': 'error', 'message': 'Validation failed', 'errors': errors}), 400

        return f(*args, **kwargs)

    return decorated_function
