# from flask import Flask, jsonify, request
# from flask_jwt_extended import JWTManager
# from flask_sqlalchemy import SQLAlchemy
# from config import Config
# from flask_caching import Cache
# from flask_cors import CORS
# from flask_bcrypt import Bcrypt

# db = SQLAlchemy()
# cache = Cache()
# bcrypt = Bcrypt()

# def create_app():
#     # app = Flask(__name__, template_folder='../frontend', static_folder='../frontend', static_url_path='/static')
#     app = Flask(__name__, template_folder=".../frontend")
#     app.config.from_object(Config)

#     CORS(app ) # add credentials

#     cache.init_app(app)
#     db.init_app(app)
#     jwt = JWTManager(app)

#     from .users import auth_bp, create_admin
    
#     return app