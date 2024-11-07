from datetime import datetime
from flask import request, jsonify, Blueprint, make_response
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from .models import *
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)
admin = Api(admin_bp)

class AdminDashboard(Resource):
    @jwt_required()
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
        sponsors_by_industry = Users.query.filter_by(role='sponsor', is_flagged=False) \
            .with_entities(Sponsors.industry, func.count(Sponsors.id)).join(Sponsors, Users.id == Sponsors.user_id) \
            .group_by(Sponsors.industry).all()

        campaigns_by_industry = Campaigns.query.filter_by(is_flagged=False) \
            .with_entities(Campaigns.industry, func.count(Campaigns.id)).group_by(Campaigns.industry).all()

        # Prepare data for charts
        sponsors_distribution = {industry: count for industry, count in sponsors_by_industry}
        campaigns_distribution = {industry: count for industry, count in campaigns_by_industry}

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
        }), 200)

class AdminManageUsers(Resource):
    @jwt_required
    def get(self):
        try:
            current_user = get_jwt_identity()

            influencers = Users.query.join(Influencers).filter(Users.influencers != None, Users.flagged == False).all()
            sponsors = Users.query.join(Sponsors).filter(Users.sponsors != None, Users.flagged == False).all()

            flagged_influencers = Users.query.join(Influencers).filter(Users.influencers != None, Users.flagged == True).all()
            flagged_sponsors = Users.query.join(Sponsors).filter(Users.sponsors != None, Users.flagged == True).all()

            return make_response(jsonify({
                'current_user': current_user,
                'influencers': [influencer.to_dict() for influencer in influencers],
                'sponsors': [sponsor.to_dict() for sposnor in sponsors],
                'flagged_influencers': [flagged_influencer.to_dict() for flagged_influencer in flagged_influencers],
                'flagged_sponsors': [flagged_sponsor.to_dict() for flagged_sponsor in flagged_sponsors],
                }), 200)
        
        except Exception as e:
            return make_response(request({'message': 'Failed to retrieve users.'}, 500))
    
    @jwt_required
    def post(self):
        try:
            data = request.get_json()

            user_id = data.get('user_id')
            action = data.get('action')
            user = Users.query.filter_by(user_id = user_id)
            if action == 'flag':
                user.is_flagged = True
            elif action == 'unflag':
                user.is_flagged = False
            elif action == 'delete':
                user.delete() 
            else:
                return make_response(request({'message': 'Invalid action.'}, 400))
            
            db.session.commit()
            return make_response(request({'message': 'Action performed successfully!'}, 200))
        
        except Exception as e:
            db.session.rollback()
            return make_response(request({'message':  'Action failed.'}, 500))
        
class AdminManageCamapaigns(Resource):
    @jwt_required
    def get(self):
        current_user = get_jwt_identity()

        campaigns = Campaigns.query.filter_by(is_flagged=False).all()

        flagged_campaigns = Campaigns.query.filter_by(is_flagged=False).all()

        return make_response(jsonify({
            'current_user': current_user,
            'campaigns': [campaign.to_dict() for campaign in campaigns],
            'flagged_campaigns': [flagged_campaign.to_dict() for flagged_campaign in flagged_campaigns]
            }), 200)
    
    @jwt_required
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
                return make_response(request({'message': 'Invalid action.'}, 400))
            
            db.session.commit()
            return make_response(request({'message': 'Action performed successfully!'}, 200))
        
        except Exception as e:
            db.session.rollback()
            return make_response(request({'message':  'Action failed.'}, 500))

class AdminApproveSponsor(Resource):
    @jwt_required
    def get(self):
        try:
            current_user = get_jwt_identity()

            sponsors_to_approve = Users.query.filter_by(role='sponsor', is_approved=False).all()

            return make_response(jsonify({
                'current_user': current_user,
                'sponsors_to_approve': sponsors_to_approve
            }), 200)
        except Exception as e:
            return make_response(request({'message': 'Failed to retrieve sponsors to approve.'}, 500))
    
    @jwt_required
    def post(self):
        try:
            data = request.get_json()

            user_id = data.get('user_id')
            user = Users.query.filter_by(user_id = user_id)
            user.is_approved = True
            db.session.commit()
            return make_response(request({'message': 'Sponsor approved successfully!'}, 200))
        
        except Exception as e:
            db.session.rollback()
            return make_response(request({'message':  'Failed to approve sponsor.'}, 500))

admin.add_resource(AdminDashboard, '/admin-dashboard')
admin.add_resource(AdminManageUsers, '/admin-users')
admin.add_resource(AdminManageCamapaigns, '/admin-campaigns')
admin.add_resource(AdminApproveSponsor, '/admin-approve-sponsor')