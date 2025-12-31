from flask import jsonify
from werkzeug.exceptions import HTTPException

class APIError(Exception):
    """Custom API error"""
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def handle_error(error):
    """Global error handler"""
    if isinstance(error, APIError):
        return jsonify({
            'status': 'error',
            'message': error.message
        }), error.status_code
    
    if isinstance(error, HTTPException):
        return jsonify({
            'status': 'error',
            'message': error.description
        }), error.code
    
    # Log unexpected errors in production
    return jsonify({
        'status': 'error',
        'message': 'Internal server error'
    }), 500
