# Standard library imports
from datetime import timedelta

class Config:
    # General settings
    DEBUG = True
    SECRET_KEY = 'sncuiodbfoa'

    # SQLAlchemy settings
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///adveri.db'

    # JWT settings
    JWT_SECRET_KEY = 'sncuiodbfoa'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)

    # Celery settings
    CELERY_BROKER_URL = 'redis://localhost:6379/1'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/2'
    timezone = 'Asia/Kolkata'

    # Cache settings
    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_URL = 'redis://localhost:6379/0'
    CACHE_DEFAULT_TIMEOUT = 30

    # Mail settings
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 1025