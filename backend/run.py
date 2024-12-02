# Standard Library Imports - None as I am initializing my app here

# Third-Party Imports - Libraries that have been installed to run this app.
from flask import Flask, send_from_directory, jsonify
from flask_jwt_extended import JWTManager
from flask_caching import Cache
from flask_cors import CORS
import flask_excel as excel

# Local Application Imports - These are my application modules that are modularized in the app folder.
from application.config import Config
from application.models import *
from application.jobs.celery_factory import celery_init_app


cache = Cache(config={'CACHE_TYPE': 'RedisCache'})

def create_app():
    app = Flask(__name__, template_folder='../frontend', static_folder='../frontend', static_url_path='/static')
    app.config.from_object(Config)

    CORS(app, resources={r"/*": {"origins": "*"}}, support_credentials = True)  

    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    cache = Cache(app)
    app.cache = cache

    app.app_context().push()
    # mailer.init_app(app)

    from application.users import auth_bp, create_admin
    from application.admin import admin_bp
    from application.sponsor import sponsor_bp
    from application.influencer import influencer_bp

    # Initialize the app context before database operations
    with app.app_context():
        db.create_all()  # Create all database tables
        create_admin()   # Create the admin user if it doesn't exist


    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(sponsor_bp)
    app.register_blueprint(influencer_bp)

    excel.init_excel(app)

    return app

app = create_app()

celery_app = celery_init_app(app)

import application.jobs.celery_schedule

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
