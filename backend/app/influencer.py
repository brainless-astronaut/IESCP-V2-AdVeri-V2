from datetime import datetime
from flask import request, jsonify, request, Blueprint, make_response
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import and_
from .models import *

influencer_bp = Blueprint('influencer', __name__)
influencer = Api(influencer_bp)

class InfluencerDashboard(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()

        sent_requests = AdRequests.query.filter_by(initiator = 'influencer', influencer_id = current_user.user_id).all()
        received_requests = AdRequests.query.filer_by(initiator = 'sponsor', influencer_id = current_user.user_id).all()

        return make_response(jsonify({
            'current_user': current_user,
            'sent_requests': sent_requests,
            'received_requests': received_requests,
            'Total Requests': len()
        }), 200)

class InfluencerRequests(Resource):
    
    @jwt_required
    def get(self):
        try:
            current_user = get_jwt_identity()
            
            public_campaigns = Campaigns.query.filter(
                and_(
                    Campaigns.visibility == 'public',
                    Campaigns.end_date >= datetime.now()
                )
            )

            return make_response(jsonify({'current_user': current_user,
                                        'public_campaigns': public_campaigns}), 200)
        except Exception as e:
            return make_response(jsonify({'message': f'Error while fetching campaign data. {str(e)}'}), 500)
    
    @jwt_required
    def post(self, campaign_id):
        try:
            current_user = get_jwt_identity()

            existing_request = AdRequests.query.filter_by(campaign_id = campaign_id, influencer_id = current_user.user_id).first()

            if existing_request: 
                return make_response(jsonify({'message': 'Request already exists! You need not make a new request for this campaign!'}), 200)
            
            campaign = Campaigns.query.get(campaign_id)

            if not campaign: 
                return make_response(jsonify({'message': 'Campaign does not exists.'}))

            data = request.get_json()

            new_request = AdRequests(
                camapign_id = campaign_id,
                influencer_id = current_user.user_id,
                sponsor_id = campaign.sponsor_id,
                initiator = 'influencer',
                requirements = data.get('requirements'),
                payment_amount = data.get('payment_amount'),
                messages = data.get('messages')
            )
            db.session.add(new_request)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error while making request. {str(e)}'}), 500)
    
    @jwt_required
    def put(self, request_id):
        try:
            current_user = get_jwt_identity()

            request = AdRequests.query.get(request_id)

            if not request: 
                return make_response(jsonify({'message': 'Request does not exists.'}))

            if request.influencer_id!= current_user.user_id: 
                return make_response(jsonify({'message': 'You are not authorized to update this request.'}))

            data = request.get_json()
            action = data.get('action')
            if action == 'update':
                request.requirements = data.get('requirements')
                request.payment_amount = data.get('payment_amount')
                request.messages = data.get('messages')
            elif  action == 'negotiate':
                request.negotiation_amount = data.get('negotiation_amount')
                request.status = 'negotiation'
            elif  action == 'accept':
                request.status = 'accepted'
            elif action == 'rejected': 
                request.status = 'rejected'
        

            db.session.commit()
            return make_response(jsonify({'message': 'Request action performed successfully'}), 200)

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error while updating request. {str(e)}'}), 500)

    @jwt_required
    def delete(self, request_id):
        try:
            current_user = get_jwt_identity()

            request = AdRequests.query.get(request_id)

            if not request: 
                return make_response(jsonify({'message': 'Request does not exists.'}))

            if request.influencer_id!= current_user.user_id: 
                return make_response(jsonify({'message': 'You are not authorized to delete this request.'}))

            db.session.delete(request)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error while deleting request. {str(e)}'}), 500)

influencer.add_resource(InfluencerDashboard, '/influencer-dashboard')
influencer.add_resource(InfluencerRequests, '/influencer-requests')