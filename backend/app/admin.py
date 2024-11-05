from datetime import datetime
from flask import request, jsonify, Blueprint
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from .models import *
from sqlalchemy import func
# import matplotlib.pyplot as plt

admin_bp = Blueprint('admin', __name__)
admin = Api(admin_bp)

class AdminDashboard(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()

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

        return jsonify({
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
        }), 200


admin.add_resource(AdminDashboard, '/admin-dashboard')