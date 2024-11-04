from datetime import timedelta

class Config:
    DEBUG = True
    SECRET_KEY = 'sncuiodbfoa'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///adveri.db'

    
    JWT_SECRET_KEY = 'sncuiodbfoa'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes = 15)

    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    RESULT_BACKEND = 'redis://localhost:6379/1'
    timezone = 'Asia/Kolkata'

    CACHE_TYPE = 'RedisCache'
    CACHE_REDIS_URL = 'redis://localhost:6379/2'
    CACHE_DEFAULT_TIMEOUT = 900

    REDIS_URL = 'redis://localhost:6379'