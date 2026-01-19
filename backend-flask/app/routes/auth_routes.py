from flask import Blueprint
from app.controllers.auth_controller import auth_controller
from app.middlewares.auth_middleware import auth_required, admin_required
from app.middlewares.validation_middleware import (
    validate_register,
    validate_login,
    validate_email_verification,
    validate_forgot_password,
    validate_reset_password,
    validate_change_email_request,
    validate_change_email_verify,
    validate_change_phone_request,
    validate_change_phone_verify
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# Public routes
@auth_bp.route('/register', methods=['POST'])
@validate_register
def register():
    return auth_controller.register()


@auth_bp.route('/login', methods=['POST'])
@validate_login
def login():
    return auth_controller.login()


@auth_bp.route('/verify-email', methods=['POST'])
@validate_email_verification
def verify_email():
    return auth_controller.verify_email()


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    return auth_controller.resend_verification()


@auth_bp.route('/forgot-password', methods=['POST'])
@validate_forgot_password
def forgot_password():
    return auth_controller.forgot_password()


@auth_bp.route('/reset-password', methods=['POST'])
@validate_reset_password
def reset_password():
    return auth_controller.reset_password()


# Protected routes
@auth_bp.route('/profile', methods=['GET'])
@auth_required
def get_profile():
    return auth_controller.get_profile()


@auth_bp.route('/profile', methods=['PUT'])
@auth_required
def update_profile():
    return auth_controller.update_profile()


@auth_bp.route('/profile-picture', methods=['POST'])
@auth_required
def upload_profile_picture():
    return auth_controller.upload_profile_picture()


@auth_bp.route('/change-email/request', methods=['POST'])
@auth_required
@validate_change_email_request
def request_email_change():
    return auth_controller.request_email_change()


@auth_bp.route('/change-email/verify', methods=['POST'])
@auth_required
@validate_change_email_verify
def verify_email_change():
    return auth_controller.verify_email_change()


@auth_bp.route('/change-phone/request', methods=['POST'])
@auth_required
@validate_change_phone_request
def request_phone_change():
    return auth_controller.request_phone_change()


@auth_bp.route('/change-phone/verify', methods=['POST'])
@auth_required
@validate_change_phone_verify
def verify_phone_change():
    return auth_controller.verify_phone_change()


@auth_bp.route('/logout', methods=['POST'])
@auth_required
def logout():
    return auth_controller.logout()


@auth_bp.route('/logout-all', methods=['POST'])
@auth_required
def logout_all():
    return auth_controller.logout_all()
