from flask import Flask, jsonify, request, render_template, send_from_directory
from flask_jwt_extended import JWTManager
from app.config import Config
from app.models import *
from flask_caching import Cache
from flask_cors import CORS
from flask_bcrypt import Bcrypt

# db = SQLAlchemy()
# cache = Cache()
# bcrypt = Bcrypt()

cache = Cache()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__, template_folder='../frontend', static_folder='../frontend', static_url_path='/static')
    app.config.from_object(Config)

    CORS(app, support_credentials = True)  # add credentials

    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)
    cache = Cache(app)
    # mailer.init_app(app)

    from app.users import auth_bp, create_admin

    # Initialize the app context before database operations
    with app.app_context():
        db.create_all()  # Create all database tables
        create_admin()   # Create the admin user if it doesn't exist

    app.register_blueprint(auth_bp)

    return app

app = create_app()

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')


if __name__ == "__main__":
    app.run(debug=True)
