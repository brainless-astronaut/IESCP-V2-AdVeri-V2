from datetime import datetime
from flask import request, jsonify, request, Blueprint
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from .models import *

influencer_bp = Blueprint('influencer', __name__)
influencer = Api(influencer_bp)

class InfluencerDashboard(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()

        campaigns = Campaigns.query.filter_by(visibility = 'public').all()
        sent_requests = AdRequests.query.filter_by(initiator = 'influencer').all()
        received_requests = AdRequests.query.filer_by(initiator = 'sponsor').all()

        past_campaigns = [campaign for campaign in campaigns if campaign.end_date <= datetime.now()]
        present_campaigns = [campaign for campaign in campaigns if campaign.end_date >= datetime.now()]
        future_campaigns = [campaign for campaign in campaigns if campaign.start_date >= datetime.now()]
        

        return {
            'current_user': current_user,
            'campaigns': campaigns,
            'sent_requests': sent_requests,
            'received_requests': received_requests,
            'past_campaigns': past_campaigns,
            'present_campaigns': present_campaigns,
            'future_campaigns': future_campaigns,
            'total_campaigns': len(campaigns),
        }

influencer.add_resource(InfluencerDashboard, '/influencer-dashboard')