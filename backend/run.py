# Standard Library Imports - None as I am initializing my app here

# Third-Party Imports - Libraries that have been installed to run this app.
from flask import Flask, send_from_directory, jsonify
from flask_jwt_extended import JWTManager
from flask_caching import Cache
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# Local Application Imports - These are my application modules that are modularized in the app folder.
from app.config import Config
from app.models import *
from app.jobs.celery_factory import celery_init_app
from app.jobs.tasks import add
from celery.result import AsyncResult

def create_app():
    app = Flask(__name__, template_folder='../frontend', static_folder='../frontend', static_url_path='/static')
    app.config.from_object(Config)

    CORS(app, support_credentials = True)  # add credentials

    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    cache = Cache(app)
    app.cache = cache

    app.app_context().push()
    # mailer.init_app(app)

    # # Configuring Celery
    # celery = workers.celery
    # celery.conf.update(
    #     broker_url=app.config["CELERY_BROKER_URL"],
    #     result_backend=app.config["CELERY_RESULT_BACKEND"],
    # )

    # celery.Task = workers.ContextTask

    from app.users import auth_bp, create_admin
    from app.admin import admin_bp
    from app.sponsor import sponsor_bp
    from app.influencer import influencer_bp

    # Initialize the app context before database operations
    with app.app_context():
        db.create_all()  # Create all database tables
        create_admin()   # Create the admin user if it doesn't exist


    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(sponsor_bp)
    app.register_blueprint(influencer_bp)

    return app

app = create_app()

celery_app = celery_init_app(app)

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

cache = app.cache

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time' : str(datetime.now())}

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id' : task.id}

@app.get('/get-celery-data/<id>')
def get_celery(id):
    result = AsyncResult(id)
    if result.ready():
        return jsonify({'result': result.result}), 200
    else:
        return jsonify({'message': 'task not ready'}), 405

if __name__ == "__main__":
    app.run(debug=True)
