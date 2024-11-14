# Standard library imports
from datetime import datetime

# Third-party imports
from flask import request, jsonify, Blueprint, make_response, current_app as app
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

# Local application imports
from .models import *

cache = app.cache

sponsor_bp = Blueprint('sponsor', __name__)
sponsor = Api(sponsor_bp)

class SponsorDashboard(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        current_user = get_jwt_identity()

        campaigns = Campaigns.query.filter_by(sponsor_id = current_user['user_id']).all()
        sent_requests = AdRequests.query.filter_by(initiator = 'sponsor').all()
        received_requests = AdRequests.query.filter_by(initiator = 'influencer').all()

        past_campaigns = [campaign.to_dict() for campaign in campaigns if campaign.end_date <= datetime.now().date()]
        present_campaigns = [campaign.to_dict() for campaign in campaigns if campaign.end_date >= datetime.now().date()]
        future_campaigns = [campaign.to_dict() for campaign in campaigns if campaign.start_date >= datetime.now().date()]

        # campaign_reach = db.session.query(
        #     Campaigns.name,
        #     func.sum(Influencers.reach)
        # ).join(AdRequests, AdRequests.campaign_id == Campaigns.campaign_id) \
        # .join(Influencers, Influencers.id == AdRequests.influencer_id) \
        # .filter(AdRequests.status == 'Accepted') \
        # .group_by(Campaigns.name).all()

        # Mapping result to a dictionary
        # campaign_reach_dict = {name: reach for name, reach in campaign_reach}

        # Get campaign influencer counts without additional list brackets
        campaign_influencer_counts = db.session.query(
            Campaigns.name, 
            func.count(AdRequests.influencer_id).label('influencer_count')
        ).join(AdRequests, AdRequests.campaign_id == Campaigns.campaign_id) \
         .filter(AdRequests.sponsor_id == current_user['user_id'], AdRequests.status == 'accepted') \
         .group_by(Campaigns.name).all()

        # Convert to dictionary safely
        campaign_influencer_counts_dict = {
            campaign: count for campaign, count in campaign_influencer_counts
        } if campaign_influencer_counts else {}
            
        return make_response(jsonify({
            'current_user': current_user,
            'past_campaigns': past_campaigns,
            'present_campaigns': present_campaigns,
            'future_campaigns': future_campaigns,
            'sent_requests': [sent_request.to_dict() for sent_request in sent_requests],
            'received_requests': [received_request.todict() for received_request in received_requests],
            # 'campaign_reach_dict': campaign_reach_dict,
            'campaign_influencer_counts_dict': campaign_influencer_counts_dict,
            'total_campaigns': len(campaigns),
            'total_sent_requests': len(sent_requests),
            'total_received_requests': len(received_requests),
            'total_past_campaigns': len(past_campaigns),
            'total_present_campaigns': len(present_campaigns),
        }), 200)

class SponsorCampaigns(Resource):
    @jwt_required
    @cache.memoize(timeout = 5)
    def get(self):

        try:
            current_user = get_jwt_identity()
            campaigns = Campaigns.query.filter_by(sponsor_id=current_user['user_id']).all()

            your_campaigns = [campaign.to_dict() for campaign in campaigns]

            return make_response(jsonify({
                'current_user': current_user,
                'your_campaigns': your_campaigns
            }), 200)
        except Exception as e:
            print(f"Error: {e}")  # This will help you see what's going wrong in the backend
            return make_response(jsonify({'message': str(e)}), 500)

    @jwt_required
    def post(self, sponsor_id):
        try:
            data = request.get_json()
            new_campaign = Campaigns(
                sponsor_id = sponsor_id,
                name = data.get('name'),
                description = data.get('description'),
                start_date = datetime.strptime(data.get('start_date'), '%d-%m-%Y'),
                end_date = datetime.strptime(data.get('end_date'), '%d-%m-%Y'),
                budget = data.get('budget'),
                visibility = data.get('visibility'),
                goals = data.get('goals')
            )
            db.session.add(new_campaign)
            db.session.commit()
            return make_response(jsonify({'message': 'Campaign created successfully'}), 201)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': str(e)}), 400)
        
    @jwt_required
    def put(self, campaign_id):
        try:
            current_user = get_jwt_identity()
            data = request.get_json()
            campaign = Campaigns.query.filter_by(id = campaign_id, sponsor_id = current_user['user_id']).first()

            if not campaign:
                return make_response(jsonify({'message': 'Campaign not found'}), 404)
            
            campaign.description = data.get('description', campaign.description)
            campaign.start_date = datetime.strptime(data.get('start_date', campaign.start_date.strftime('%d-%m-%Y')), '%d-%m-%Y')
            campaign.end_date = datetime.strptime(data.get('end_date', campaign.end_date.strftime('%d-%m-%Y')), '%d-%m-%Y')
            campaign.budget = data.get('budget', campaign.budget)
            campaign.visibility = data.get('visibility', campaign.visibility)
            campaign.goals = data.get('goals', campaign.goals)

            db.session.commit()
            return make_response(jsonify({'message': 'Campaign updated successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': str(e)}), 400)
    
    @jwt_required
    def delete(self, campaign_id):
        try:
            current_user = get_jwt_identity()
            campaign = Campaigns.query.filter_by(id = campaign_id, sponsor_id = current_user['user_id']).first()

            if not campaign:
                return make_response(jsonify({'message': 'Campaign not found'}), 404)
            
            db.session.delete(campaign)
            db.session.commit()
            return make_response(jsonify({'message': 'Campaign deleted successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': str(e)}), 400)
     
class SponsorRequests(Resource):

    @jwt_required
    @cache.memoize(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()
            your_requests = AdRequests.query.filter_by(sponsor_id=current_user['user_id']).all()

            return {
                'current_user': current_user,
                'your_campaigns': [request.to_dict() for request in your_requests]
            }
        except Exception as e:
            print(f"Error: {e}")  # This will help you see what's going wrong in the backend
            return make_response(jsonify({'message': str(e)}), 500)

    @jwt_required
    def post(self, campaign_id):
        current_user = get_jwt_identity()
        try:
            data = request.get_json()
            new_request = AdRequests(
                camapign_id = campaign_id,
                influencer_id = data.get('influencer_id'),
                sponsor_id = current_user['user_id'],
                initiator ='sponsor',   
                requirements = data.get('requirements'),
                payment_amount = data.get('payment_amount'),
                messages = data.get('messages')
            )
            db.session.add(new_request)
            db.session.commit()
            return make_response(jsonify({'message': 'Request sent successfully'}), 201)

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error occured while sending request. {str(e)}'}))

    @jwt_required
    def put(self, request_id):
        try:
            current_user = get_jwt_identity()

            request = AdRequests.query.get(request_id)

            if not request: 
                return make_response(jsonify({'message': 'Request does not exists.'}))

            if request.influencer_id!= current_user['user_id']: 
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

            if request.influencer_id!= current_user['user_id']: 
                return make_response(jsonify({'message': 'You are not authorized to delete this request.'}))

            db.session.delete(request)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error while deleting request. {str(e)}'}), 500)


# Registering the resource with the API
sponsor.add_resource(SponsorDashboard, '/sponsor-dashboard')
sponsor.add_resource(SponsorCampaigns, 
                     '/sponsor-campaigns/', ## for get - getting campaigns data
                     '/sponsor-campaigns-post/<int:sponsor_id>', ## for post - creating campaigns
                     '/sponsor-campaigns-edit/<int:campaign_id>', ## for put - edit campaigns
                     '/sponsor-campaigns-delete/<int:campaign_id>' ## for delete - deleting the campaign
                    )
sponsor.add_resource(SponsorRequests, 
                     '/sponsor-requests',  # GET: for getting requests data
                     '/sponsor-requests-post/<int:campaign_id>',  # POST: to send a request
                     '/sponsor-requests-edit/<int:request_id>',  # PUT: to edit a request
                     '/sponsor-requests-delete/<int:request_id>'  # DELETE: to delete a request
                    )



## doubt - campaigns have CRUD, how to differentiate routes between campaign view, creation, edit, and delete in  rest api