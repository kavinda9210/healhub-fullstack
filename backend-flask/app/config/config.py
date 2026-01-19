import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # CORS
    CORS_ORIGINS = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    
    # Supabase
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    SUPABASE_PROFILE_BUCKET = os.environ.get('SUPABASE_PROFILE_BUCKET', 'profile-images')
    
    # Email
    EMAIL_HOST = os.environ.get('EMAIL_HOST')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USER = os.environ.get('EMAIL_USER')
    EMAIL_PASS = os.environ.get('EMAIL_PASS')
    
    # App
    APP_NAME = os.environ.get('APP_NAME', 'HealHub')
    APP_URL = os.environ.get('APP_URL', 'http://localhost:3000')

    # Validation
    MIN_USER_AGE = int(os.environ.get('MIN_USER_AGE', 13))
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = 'memory://'


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    ENVIRONMENT = 'development'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    ENVIRONMENT = 'production'


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    ENVIRONMENT = 'testing'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


config_dict = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}


def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config_dict.get(env, DevelopmentConfig)
