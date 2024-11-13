from collections import defaultdict, current_app as app
from datetime import datetime
from flask import request, jsonify, Blueprint, make_response, send_file
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from .models import *
from sqlalchemy import func
import csv, base64, io, matplotlib.pyplot as plt

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
                Sponsors.industry, func.count(Campaigns.campaign_id).label("campaign_count")
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
    @jwt_required
    @cache.memoize(timeout = 5)
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
                'sponsors': [sponsor.to_dict() for sponsor in sponsors],
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
    @cache.memoize(timeout = 5)
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

class AdminReport(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()

        # Fetch data from the database
        campaigns = Campaigns.query.all()
        approved_sponsors = (
            db.session.query(Users, Sponsors)
            .join(Sponsors, Users.user_id == Sponsors.user_id)
            .filter(Users.is_approved == True)
            .all()
        )
        all_influencers = (
            db.session.query(Users, Influencers)
            .join(Influencers, Users.user_id == Influencers.user_id)
            .all()
        )
        sponsors_to_approve = (
            db.session.query(Users, Sponsors)
            .join(Sponsors, Users.user_id == Sponsors.user_id)
            .filter(Users.is_approved == False)
            .all()
        )

        # Aggregate totals
        total_campaigns = len(campaigns)
        total_approved_sponsors = len(approved_sponsors)
        total_influencers = len(all_influencers)
        total_sponsors_to_approve = len(sponsors_to_approve)
        total_reach = sum(campaign.reach for campaign in campaigns)

        # Campaigns grouped by industry
        campaign_industry = (
            db.session.query(Sponsors.industry)
            .join(Campaigns, Campaigns.sponsor_id == Sponsors.user_id)
            .all()
        )
        
        campaign_industry_counts = defaultdict(int)
        for industry in campaign_industry:
            campaign_industry_counts[industry] += 1

        # Approved sponsors grouped by industry
        sponsor_industry = (
            db.session.query(Sponsors.industry)
            .join(Users, Users.user_id == Sponsors.user_id)
            .filter(Users.is_approved == True)
            .group_by(Sponsors.industry)
            .all()
        )
        
        sponsor_industry_counts = defaultdict(int)
        for sponsor in sponsor_industry:
            sponsor_industry_counts[sponsor.industry] += 1

        # Influencers grouped by category
        influencer_industry = (
            db.session.query(Influencers.category)
            .join(Users, Users.user_id == Influencers.user_id)
            .group_by(Influencers.category)
            .all()
        )
        
        influencer_industry_counts = defaultdict(int)
        for influencer in influencer_industry:
            influencer_industry_counts[influencer.category] += 1

        # Function to create a chart and return it as a file
        def create_chart(data, title, xlabel):
            plt.figure(figsize=(8, 4))
            plt.bar(data.keys(), data.values(), color='#00adb5')
            plt.title(title, color='#eeeeee')
            plt.xlabel(xlabel, color='#eeeeee')
            plt.ylabel('Counts', color='#eeeeee')
            plt.xticks(rotation=45, ha='right', color='#eeeeee')
            plt.yticks(color='#eeeeee')
            plt.gca().set_facecolor('#222831')
            plt.tight_layout()

            # Save the plot to a bytes buffer
            img = io.BytesIO()
            plt.savefig(img, format='png')
            plt.close()
            img.seek(0)
            return img

        # Generate the charts and get in-memory buffers
        campaign_chart_img = create_chart(campaign_industry_counts, "Campaigns by Industry", "Industry")
        sponsor_chart_img = create_chart(sponsor_industry_counts, "Approved Sponsors by Industry", "Industry")
        influencer_chart_img = create_chart(influencer_industry_counts, "Influencers by Category", "Category")

        self.chart_images = {
            'campaign_chart': campaign_chart_img,
            'sponsor_chart': sponsor_chart_img,
            'influencer_chart': influencer_chart_img
        }

        # Return the summarized data along with chart file links
        return jsonify({
            'current_user': current_user,
            'total_campaigns': total_campaigns,
            'total_approved_sponsors': total_approved_sponsors,
            'total_influencers': total_influencers,
            'total_sponsors_to_approve': total_sponsors_to_approve,
            'total_reach': total_reach,
            'campaign_industry_counts': dict(campaign_industry_counts),
            'sponsor_industry_counts': dict(sponsor_industry_counts),
            'influencer_industry_counts': dict(influencer_industry_counts),
            'charts': {
                'campaign_chart': '/download/campaign_chart',
                'sponsor_chart': '/download/sponsor_chart',
                'influencer_chart': '/download/influencer_chart',
            }
        })

admin.add_resource(AdminDashboard, '/admin-dashboard')
admin.add_resource(AdminManageUsers, '/admin-users')
admin.add_resource(AdminManageCamapaigns, '/admin-campaigns')
admin.add_resource(AdminApproveSponsor, '/admin-approve-sponsor')
admin.add_resource(AdminReport, '/admin-report')