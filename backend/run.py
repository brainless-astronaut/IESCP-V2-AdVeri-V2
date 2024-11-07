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

    from app.users import auth_bp, create_admin, create_sponsors, create_influencers
    from app.admin import admin_bp
    from app.sponsor import sponsor_bp, create_campaigns
    from app.influencer import influencer_bp

    # Initialize the app context before database operations
    with app.app_context():
        db.create_all()  # Create all database tables
        create_admin()   # Create the admin user if it doesn't exist
        create_sponsors()
        create_influencers()
        create_campaigns()


    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(sponsor_bp)
    app.register_blueprint(influencer_bp)

    return app

app = create_app()

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

def delete_users():
    users = Users.query.filter_by(username = 'i4').first()
    db.session.delete(users)
    db.session.commit()

if __name__ == "__main__":
    app.run(debug=True)
    delete_users()  # Uncomment this line to delete the user with username 'i4' before starting the server.
