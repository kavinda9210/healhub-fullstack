from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime

from app.config.config import get_config
from app.middlewares.error_middleware import handle_error, APIError
from app.routes.auth_routes import auth_bp
from app.routes.other_routes import (
    admin_bp, patient_bp, doctor_bp, ambulance_bp,
    appointment_bp, prescription_bp, test_bp, reminder_bp, user_bp
)

config = get_config()

def create_app(config_class=None):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    if config_class is None:
        config_class = config
    app.config.from_object(config_class)
    
    # CORS setup
    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)
    
    # Rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=config.RATELIMIT_STORAGE_URL
    )
    
    # Error handlers
    app.register_error_handler(APIError, handle_error)
    app.register_error_handler(Exception, handle_error)
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'success',
            'message': 'HealHub API is running',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(ambulance_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(prescription_bp)
    app.register_blueprint(test_bp)
    app.register_blueprint(reminder_bp)
    app.register_blueprint(user_bp)
    
    # 404 handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'status': 'error',
            'message': f'Route {error.description} not found'
        }), 404
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=config.DEBUG, host='0.0.0.0', port=5000)
