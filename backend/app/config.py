from datetime import timedelta

class Config:
    DEBUG = True
    SECRET_KEY = 'sncuiodbfoa'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///adveri.db'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'

    JWT_SECRET_KEY = 'sncuiodbfoa'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes = 15)

    CELERY_BROKER_URL = 'redis://localhost:6379/1'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/2'
    timezone = 'Asia/Kolkata'

    CACHE_REDIS_PORT = 6379
    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_URL = 'redis://localhost:6379/0'
    CACHE_DEFAULT_TIMEOUT = 30

    MAIL_PORT = 1025
    MAIL_SERVER = 'localhost'