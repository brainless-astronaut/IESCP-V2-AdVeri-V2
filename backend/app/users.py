from datetime import datetime
from flask import request, jsonify, request, Blueprint
from flask_restful import Api, Resource
from flask_jwt_extended import create_access_token, jwt_required, unset_jwt_cookies
from .models import db, Users, Sponsors, Influencers, bcrypt

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

def create_sponsors():
    try:
        uids = [2, 3, 4]
        unames = ['s1', 's2', 's3']
        emails = ['s1@s1.com', 's2@s2.com', 's3@s3.com']
        pwds = ['s1', 's2', 's3']
        en_names = ['s1', 's2', 's3']
        industry = ['s1', 's2', 's3']
        budget = [2, 3, 4]
        for i in range(len(uids)):
            new_user = Users(
                user_id = uids[i],
                username = unames[i],
                email = emails[i],
                password = pwds[i],
                role = 'sponsor'
            )
            db.session.add(new_user)
            db.session.commit()
            new_sponsor = Sponsors(
                sponsor_id = (i + 1),
                user_id = uids[i],
                entity_name = en_names[i],
                industry = industry[i],
                budget = budget[i]
            )
            db.session.add(new_sponsor)
            db.session.commit()
        
        print('sample sponsor created')

    except Exception as e:
        db.session.rollback()
        print('create sponsor failed.')

def create_influencers():
    try:
        uids = [2, 3, 4]
        unames = ['i1', 'i2', 'i3']
        emails = ['i1@i1.com', 'i2@i2.com', 'i3@i3.com']
        pwds = ['i1', 'i2', 'i3']
        names = ['i1', 'i2', 'i3']
        cates = ['i1', 'i2', 'i3']
        niches = ['i1', 'i2', 'i3']
        for i in range(len(uids)):
            new_user = Users(
                user_id = uids[i],
                username = unames[i],
                email = emails[i],
                password = pwds[i],
                role = 'influencer'
            )
            db.session.add(new_user)
            db.session.commit()
            new_influencer = Sponsors(
                sponsor_id = (i + 1),
                user_id = uids[i],
                name = names[i],
                category = cates[i],
                niche = niches[i]
            )
            db.session.add(new_influencer)
            db.session.commit()
        
        print('sample inf created')

    except Exception as e:
        db.session.rollback()
        print('create inf failed.')
        
class HomePage(Resource):
    def get(self):
        pass

class RegisterPage(Resource):
    def get(self):
        pass

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

            return {'message', 'Sponsor registered successfully!'}, 200
        
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

            return {'message', 'Sponsor registered successfully!'}, 200
        
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
                'id': user.user_id,
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

auth.add_resource(HomePage, '/home')
auth.add_resource(RegisterPage, '/register')
auth.add_resource(SponsorRegistration, '/register-sponsor')
auth.add_resource(InfluencerRegistration, '/register-influencer')
auth.add_resource(UserLogin, '/login')
auth.add_resource(UserLogout, '/logout')