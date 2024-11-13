from datetime import datetime
from flask import request, jsonify, request, Blueprint, current_app as app
from flask_restful import Api, Resource
from flask_jwt_extended import create_access_token, jwt_required, unset_jwt_cookies
from .models import db, Users, Sponsors, Influencers, bcrypt

cache = app.cache

auth_bp = Blueprint('auth', __name__)
auth = Api(auth_bp)

def create_admin():
    try:
        existing_admin = Users.query.filter_by(username = 'admin').first()

        if not existing_admin:
            admin = Users(
                username = 'admin',
                email = 'admin@adveri.com',
                password = bcrypt.generate_password_hash('root'),
                role = 'admin'
            )
            db.session.add(admin)
            db.session.commit()
            print('Admin created successfully! Status code: 200')
    except Exception as e:
        db.session.rollback()
        print(f'Error occured while creating admin: {str(e)}')

class SponsorRegistration(Resource):
    def post(self):
        try:
            data = request.get_json()  # Parse JSON data
            if not data:
                return {"message": "No data provided"}, 400
            
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role') ## change to hardcode role = 'sposnor'
            entity_name = data.get('entity_name')
            industry = data.get('industry')
            budget = data.get('budget')

            existing_user = Users.query.filter_by(username = username, password = password).first()

            if existing_user:
                return {'message': 'User already exists.'}, 400
            
            if not all([username, email, password, role, entity_name, industry, budget]):
                return {'message': 'All fields are required.'}, 400
            
            new_user = Users(
                username = username,
                email = email,
                password = bcrypt.generate_password_hash(password),
                is_approved = False,
                role = role
            )

            db.session.add(new_user)
            db.session.commit()

            sponsor_id = new_user.user_id
            new_sponsor = Sponsors(
                user_id = sponsor_id,
                entity_name = entity_name,
                industry = industry,
                budget = budget
            )

            db.session.add(new_sponsor)
            db.session.commit()

            return {'message': 'Sponsor registered successfully!'}, 200
        
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error while creating sponsor: {str(e)}'}, 500
        
class InfluencerRegistration(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return {"message": "No data provided"}, 400
            
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role')
            name = data.get('name')
            category = data.get('category')
            niche = data.get('niche')

            existing_user = Users.query.filter_by(username = username, password = password).first()

            if existing_user:
                return {'message': 'User already exists.'}, 400
            
            if not all([username, email, password, role, name, category, niche]):
                return {'message': 'All fields are required.'}, 400
            
            new_user = Users(
                username = username,
                email = email,
                password = bcrypt.generate_password_hash(password),
                role = role
            )

            db.session.add(new_user)
            db.session.commit()

            infleuncer_id = new_user.user_id
            new_sponsor = Influencers(
                user_id = infleuncer_id,
                name = name,
                category = category,
                niche = niche
            )

            db.session.add(new_sponsor)
            db.session.commit()

            return {'message': 'Influencer registered successfully!'}, 200
        
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error while creating sponsor: {str(e)}'}, 500
     
class UserLogin(Resource):
    def post(self):
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')

            if not all([username, password]):
                return {'message': 'Please provide username and password'}, 400

            user = Users.query.filter_by(username = username).first()

            if not (user and bcrypt.check_password_hash(user.password, password)):
                return {'message': 'Invalid credentials.'}, 401
            
            access_token = create_access_token(identity = {
                'user_id': user.user_id,
                'username': user.username,
                'role': user.role
            })

            user.last_login_at = datetime.now()
            db.session.commit()

            return {"message": "Login successful", "access_token": access_token}, 200
        
        except Exception as e:
            db.session.rollback()
            return {'message': f'Error while logging user: {str(e)}'}, 500

class UserLogout(Resource):
    @jwt_required()
    def post(self):
        response = {"message": "Logout successful"}
        unset_jwt_cookies(response)
        return response, 200

auth.add_resource(SponsorRegistration, '/register-sponsor')
auth.add_resource(InfluencerRegistration, '/register-influencer')
auth.add_resource(UserLogin, '/')
auth.add_resource(UserLogout, '/logout')