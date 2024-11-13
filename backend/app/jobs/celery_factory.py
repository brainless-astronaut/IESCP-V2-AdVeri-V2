from celery import Celery, Task
from flask import Flask

class CeleryConfig():
    broker_url = 'redis://localhost:6379/0' ## stores the tasks
    result_backend = 'redis://localhost:6379/1' ## stores the results
    timezone = 'Asia/Kolkata' ## for celery beat

# from documentation
# taking in flask application and returns celery instance
def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(CeleryConfig)
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app