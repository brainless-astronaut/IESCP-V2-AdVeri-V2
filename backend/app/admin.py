# Standard library imports
from collections import defaultdict
from datetime import datetime
import os

# Flask imports
from flask import (
    jsonify, Blueprint, make_response, send_file, request,
    current_app as app, send_from_directory
)
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required

# SQLAlchemy and database imports
from sqlalchemy import func
from .models import *

# Celery imports
from celery.result import AsyncResult
from .jobs.tasks import trigger_reports

# Initialize cache and blueprint
cache = app.cache
admin_bp = Blueprint('admin', __name__)
admin = Api(admin_bp)


class AdminDashboard(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        current_user = get_jwt_identity()
        print('token', current_user) ## debugging point

        # Basic counts
        sponsors_count = Users.query.filter_by(role='sponsor', is_approved=True, is_flagged=False).count()
        influencers_count = Users.query.filter_by(role='influencer', is_flagged=False).count()
        campaigns_count = Campaigns.query.filter_by(is_flagged=False).count()

        # Additional counts
        sponsors_to_approve_count = Users.query.filter_by(role='sponsor', is_approved=False).count()
        flagged_sponsors_count = Users.query.filter_by(role='sponsor', is_flagged=True).count()
        flagged_influencers_count = Users.query.filter_by(role='influencer', is_flagged=True).count()
        flagged_campaigns_count = Campaigns.query.filter_by(is_flagged=True).count()

        # Industry distribution counts
        sponsors_by_industry = db.session.query(Sponsors.industry, func.count(Sponsors.user_id)) \
            .select_from(Users).join(Sponsors, Users.user_id == Sponsors.user_id) \
            .filter(Users.role == 'sponsor', Users.is_flagged == False) \
            .group_by(Sponsors.industry).all()

        campaigns_by_industry = db.session.query(
                Sponsors.industry, func.count(Campaigns.campaign_id).label('campaign_count')
            ) \
            .join(Sponsors, Campaigns.sponsor_id == Sponsors.user_id) \
            .group_by(Sponsors.industry) \
            .all()
        
        # influencers_by_industry = db.session.query(Influencers.category, func.count(Influencers.user_id)) \
        #     .select_from(Users).join(Influencers, Users.user_id == Influencers.user_id) \
        #     .filter(Users.role == 'influencer', Users.is_flagged == False) \
        #     .group_by(Influencers.category).all()

        # Prepare data for charts
        sponsors_distribution = {industry: count for industry, count in sponsors_by_industry}
        campaigns_distribution = {industry: count for industry, count in campaigns_by_industry}
        # influencers_distribution = {industry: count for industry, count in influencers_by_industry}

        return make_response(jsonify({
            'current_user': current_user,
            'sponsors_count': sponsors_count,
            'influencers_count': influencers_count,
            'campaigns_count': campaigns_count,
            'sponsors_to_approve_count': sponsors_to_approve_count,
            'flagged_sponsors_count': flagged_sponsors_count,
            'flagged_influencers_count': flagged_influencers_count,
            'flagged_campaigns_count': flagged_campaigns_count,
            'sponsors_distribution': sponsors_distribution,
            'campaigns_distribution': campaigns_distribution
            # 'influencers_distribution': influencers_distribution
        }), 200)

class AdminManageUsers(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        try:
            #Getting jwt_identity
            current_user = get_jwt_identity()

            ## serach functionality
            # search_query = request.args.get('search_query', '')
            # users = Users.query.filter(Users.username.ilike(f'%{search_query}%')).all()
            # user_ids = [user.id for user in users]

            ## Getting data
            influencers = Influencers.query.join(Users).filter(
                Users.user_id == Influencers.user_id,
                Users.role == 'influencer',
                Users.is_flagged == False
            ).all()

            sponsors = Sponsors.query.join(Users).filter(
                Users.user_id == Sponsors.user_id,
                Users.role == 'sponsor',
                Users.is_flagged == False,
                Users.is_approved == True
            ).all()

            flagged_users = Users.query.filter(
                Users.is_flagged == True,
                Users.is_approved == True
            ).all()
            
            ## dict conversions
            influencers_list = [
                {
                    'user_id': user.user_id,
                    'username': user.username,
                    'email': user.email,
                    'name': influencer.name,
                    'category': influencer.category,
                    'niche': influencer.niche,
                    'reach': influencer.reach,
                    'platform': influencer.platform,
                    'earnings': influencer.earnings
                }
                for influencer in influencers
                if (user := Users.query.get(influencer.user_id))
            ]
            
            sponsors_list = [
                {
                    'user_id': user.user_id,
                    'username': user.username,
                    'email': user.email,
                    'entity_name': sponsor.entity_name,
                    'industry': sponsor.industry,
                    'budget': sponsor.budget
                }
                for sponsor in sponsors
                if (user := Users.query.get(sponsor.user_id))
            ]
            
            flagged_users_list = [
                {
                    'user_id': user.user_id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
                for user in flagged_users
            ]

            response_data = {
                'current_user': current_user,
                'influencers': influencers_list,
                'sponsors': sponsors_list,
                'flagged_users': flagged_users_list
            }
            return make_response(jsonify(response_data), 200)

        except Exception as e:
            return {'message': f'Failed to retrieve users. {str(e)}'}, 500

    @jwt_required()
    def post(self):        
        try:
            print("Headers:", request.headers)
            
            # Debugging: Log the JWT identity
            current_user = get_jwt_identity()
            print("JWT Identity:", current_user)            

            data = request.get_json()

            user_id = data.get('user_id')
            # user_id = user_id
            action = data.get('action')
            user = Users.query.filter_by(user_id = user_id).first()
            
            if not user:
                return {'message', 'User not found.'}, 404

            if action == 'flag':
                user.is_flagged = True
            elif action == 'unflag':
                user.is_flagged = False
            else:
                return {'message': 'Invalid action.'}, 400
            
            db.session.commit()
            return {'message': 'Action performed successfully!'}, 200
        
        except Exception as e:
            db.session.rollback()
            return {'message': f'Action failed. Error {str(e)}'}, 500
        
class AdminManageCamapaigns(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        current_user = get_jwt_identity()

        search_query = request.args.get('search', '')

        ## Filter unflagged campaigns
        campaigns = Campaigns.query.filter(
            Campaigns.is_flagged == False,
            Campaign.name.ilike(f'%{search_query}%') | Campaign.description.ilike(f'%{search_query}%')
        ).all()

        flagged_campaigns = Campaigns.query.filter(
            Campaigns.is_flagged == True,
            Campaign.name.ilike(f'%{search_query}%') | Campaign.description.ilike(f'%{search_query}%')
        ).all()

        return make_response(jsonify({
            'current_user': current_user,
            'campaigns': [campaign.to_dict() for campaign in campaigns],
            'flagged_campaigns': [flagged_campaign.to_dict() for flagged_campaign in flagged_campaigns]
            }), 200)
    
    @jwt_required()
    def post(self):
        try:
            data = request.get_json()

            campaign_id = data.get('campaign_id')
            action = data.get('action')
            campaign = Campaigns.query.filter_by(campaign_id = campaign_id)
            if action == 'flag':
                campaign.is_flagged = True
            elif action == 'unflag':
                campaign.is_flagged = False
            elif action == 'delete':
                campaign.delete() 
            else:
                return make_response(jsonify({'message': 'Invalid action.'}, 400))
            
            db.session.commit()
            return make_response(jsonify({'message': 'Action performed successfully!'}, 200))
        
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': 'Action failed.'}, 500))

class AdminApproveSponsor(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()

            sponsors_to_approve = Users.query.filter_by(role='sponsor', is_approved=False).all()

            return make_response(jsonify({
                'current_user': current_user,
                'sponsors_to_approve': sponsors_to_approve
            }), 200)
        except Exception as e:
            return make_response(jsonify({'message': 'Failed to retrieve sponsors to approve.'}, 500))
    
    @jwt_required()
    def post(self):
        try:
            data = request.get_json()

            user_id = data.get('user_id')
            user = Users.query.filter_by(user_id = user_id)
            user.is_approved = True
            db.session.commit()
            return make_response(jsonify({'message': 'Sponsor approved successfully!'}, 200))
        
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': 'Failed to approve sponsor.'}, 500))

# class AdminReports(Resource):
#     @jwt_required()
#     def get(self):
#         # delay is given to indicate that it is a celery task.
#         task = trigger_reports.delay()
#         result = AsyncResult(task.id)

#         if result.ready():
#             return send_file(f'/frontend/downloads/{result.result}'), 200
#         else:
#             return {'message' : 'Task not ready.'}, 405

class AdminReports(Resource):
    @jwt_required()
    def post(self):
        '''Initiate the CSV generation task and return the task ID.'''
        task = trigger_reports.delay()
        return {'task_id': task.id}, 202  # Return task_id for client to poll

    @jwt_required()
    def get(self, task_id):
        '''Check the status of a report and send the file if ready.'''
        download_dir = './frontend/downloads/'

        # Check the task status using Celery
        result = AsyncResult(task_id)
        if result.ready():
            # Check for files that start with the task_id
            files = [f for f in os.listdir(download_dir) if f.startswith(task_id)]
            
            if files:
                # Send the first matching file for download
                return send_from_directory(download_dir, files[0], as_attachment=True)
            else:
                return {'message': 'File not found, but task is complete.'}, 404
        else:
            return {'message': 'Task not ready.'}, 202

admin.add_resource(AdminDashboard, '/admin-dashboard')
# admin.add_resource(AdminManageUsers, 
#                     '/admin-users', 
#                     '/admin-users/<int:user_id>'
#                   )
admin.add_resource(AdminManageUsers, '/admin-users')
admin.add_resource(AdminManageCamapaigns, 
                    '/admin-campaigns'
                    '/admin-campaigns/<int:user_id>'
                    )
admin.add_resource(AdminApproveSponsor, '/admin-approve-sponsor/<int:sponsor_id>')
admin.add_resource(AdminReports, '/admin-reports', '/admin-reports/<string:task_id>')

