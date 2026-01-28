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
from app.services.ai_service import ai_service
import os

config = get_config()

def create_app(config_class=None):
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    if config_class is None:
        config_class = config
    app.config.from_object(config_class)
    
    # CORS setup - ensure origins is a list and apply to API routes
    origins = config.CORS_ORIGINS
    if isinstance(origins, str):
        origins = [origins]

    # In development, allow all origins as a dev fallback to avoid CORS blocking
    # (safe for local development only). In production, use configured origins.
    if getattr(config, 'DEBUG', False):
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    else:
        CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)
    
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

    # Optionally start model training or ensure model is loaded
    try:
        auto_train = os.environ.get('AUTO_TRAIN_MODEL', 'false').lower() in ('1', 'true', 'yes')
        min_acc = float(os.environ.get('REQUIRE_MIN_ACCURACY', '0'))
        if auto_train:
            # If a minimum accuracy is required, run blocking to ensure it
            if min_acc > 0:
                ai_service.train_and_evaluate(epochs=int(os.environ.get('TRAIN_EPOCHS', 10)), blocking=True, min_accuracy=min_acc)
            else:
                # background train
                ai_service.train_and_evaluate(epochs=int(os.environ.get('TRAIN_EPOCHS', 10)), blocking=False)
        else:
            # lazy-load model now (non-blocking) so detection may use stub until model is ready
            try:
                ai_service._load_model()
            except Exception:
                pass
    except Exception as e:
        # Fail early if model training enforcement fails
        print('AI service startup error:', e)
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=config.DEBUG, host='0.0.0.0', port=5000)
