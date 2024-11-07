from datetime import datetime
from flask import request, jsonify, request, Blueprint, make_response
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from .models import *
from sqlalchemy import func

sponsor_bp = Blueprint('sponsor', __name__)
sponsor = Api(sponsor_bp)

def create_campaigns():
    try: 
        cids = [1,2,3]
        sids = [1,2,3]
        names = ['a', 'b', 'c']
        descs = ['a', 'b', 'c']
        starts = ['11-10-2024', '01-10-2024', '03-12-2024']
        ends = ['11-11-2024', '01-11-2024', '03-1-2025']
        budget = [1, 2, 3]
        visi = ['public', 'private', 'public']
        goals = [1, 2, 3]

        for i in range(len(cids)):
            exisiting_campaign = Campaigns.query.filter_by(name=names[i]).first()
            if not exisiting_campaign:
                new_campaign = Campaigns(
                    campaign_id =  cids[i],
                    sponsor_id = sids[i],
                    name = names[i],
                    description = descs[i],
                    start_date = datetime.strptime(starts[i], '%d-%m-%Y'),
                    end_date = datetime.strptime(ends[i], '%d-%m-%Y'),
                    budget = budget[i],
                    visibility = visi[i],
                    goals = goals[i]
                )
                db.session.add(new_campaign)
                db.session.commit()
        
        print('campaigns created')
    except Exception as e:
        db.session.rollback()
        print('create campaigns failed.')

class SponsorDashboard(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()

        campaigns = Campaigns.query.filter_by(sponsor_id = current_user.user_id).all()
        sent_requests = AdRequests.query.filter_by(initiator = 'sponsor').all()
        received_requests = AdRequests.query.filer_by(initiator = 'influencer').all()

        past_campaigns = [campaign for campaign in campaigns if campaign.end_date <= datetime.now()]
        present_campaigns = [campaign for campaign in campaigns if campaign.end_date >= datetime.now()]
        future_campaigns = [campaign for campaign in campaigns if campaign.start_date >= datetime.now()]

        campaign_reach = db.session.query(
            Campaigns.name,
            func.sum(Influencers.reach)
        ).join(AdRequests, AdRequests.campaign_id == Campaigns.id) \
        .join(Influencers, Influencers.id == AdRequests.influencer_id) \
        .filter(AdRequests.status == 'Accepted') \
        .group_by(Campaigns.name).all()

        # Mapping result to a dictionary
        campaign_reach_dict = {name: reach for name, reach in campaign_reach}

        campaign_influencer_counts = [
            db.session.query(
                Campaigns.name, 
                func.count(AdRequests.influencer_id).label('influencer_count')
            )
            .join(AdRequests, AdRequests.campaign_id == Campaigns.id)
            .filter(AdRequests.sponsor_id == current_user.user_id, AdRequests.status == 'accepted')
            .group_by(Campaigns.name)
            .all()
        ]

        campaign_influencer_counts_dict = {campaign: count for campaign, count in campaign_influencer_counts}
     
            
        return make_response(jsonify({
            'current_user': current_user,
            'past_campaigns': past_campaigns,
            'present_campaigns': present_campaigns,
            'future_campaigns': future_campaigns,
            'sent_requests': sent_requests,
            'received_requests': received_requests,
            'campaign_reach_dict': campaign_reach_dict,
            'campaign_influencer_counts_dict': campaign_influencer_counts_dict,
            'total_campaigns': len(campaigns),
            'total_sent_requests': len(sent_requests),
            'total_received_requests': len(received_requests),
            'total_past_campaigns': len(past_campaigns),
            'total_present_campaigns': len(present_campaigns),
        }), 200)

class SponsorCreateCampaign(Resource):
    @jwt_required
    def post(self):
        current_user = get_jwt_identity()

        try:
            data = request.get_json()
            new_campaign = Campaigns(
                sponsor_id = current_user.user_id,
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

class SponsorEditCampaign(Resource):
    @jwt_required
    def put(self, campaign_id):
        try:
            current_user = get_jwt_identity()
            data = request.get_json()
            campaign = Campaigns.query.filter_by(id = campaign_id, sponsor_id = current_user.user_id).first()

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
            campaign = Campaigns.query.filter_by(id = campaign_id, sponsor_id = current_user.user_id).first()

            if not campaign:
                return make_response(jsonify({'message': 'Campaign not found'}), 404)
            
            db.session.delete(campaign)
            db.session.commit()
            return make_response(jsonify({'message': 'Campaign deleted successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': str(e)}), 400) 

class SponsorSendRequest(Resource):
    @jwt_required
    def post(self, campaign_id):
        current_user = get_jwt_identity()
        try:
            data = request.get_json()

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error occured while sending request. {str(e)}'}))



# Registering the resource with the API
sponsor.add_resource(SponsorDashboard, '/sponsor-dashboard')
sponsor.add_resource(SponsorCreateCampaign, '/sponsor-create-campaign')
sponsor.add_resource(SponsorEditCampaign, '/sponsor-edit-campaign')


## doubt - campaigns have CRUD, how to differentiate routes between campaign view, creation, edit, and delete in  rest api