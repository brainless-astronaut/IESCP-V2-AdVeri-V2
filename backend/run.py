from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from app.config import Config
from app.models import *
from flask_caching import Cache
from app.jobs.celery_factory import celery_init_app
from flask_cors import CORS
from flask_bcrypt import Bcrypt
# from app.jobs import mailer, tasks, workers

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

if __name__ == "__main__":
    app.run(debug=True)
