from celery import Celery
from flask import current_app as app

celery = Celery("Backend Jobs")

class ContextTask(celery.Task):
    def __call__(self, *args, **kwargs): # overiting call method with app_context()
        with app.app_context():
            return self.run(*args, **kwargs) # arguments and keyword arguments