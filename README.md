Commands to run the project:

Redis:
    cd backend
    redis-server

Mail Hog:
    cd backend
    ~/go/bin/MailHog

Celery worker:
    cd backend
    celery -A run:celery_app worker -l INFO

Celery beat:
    cd backend
    celery -A run:celery_app beat --max-interval 1 -l info

Flask - application:
    cd backend
    python run.py