# Standard library imports
from datetime import datetime, timedelta, timezone

# Third-party imports
from flask import request, jsonify, Blueprint, make_response, current_app as app
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

# Celery imports
from celery.result import AsyncResult
from .jobs.tasks import trigger_reports

# Local application imports
from .models import *

cache = app.cache

sponsor_bp = Blueprint('sponsor', __name__)
sponsor = Api(sponsor_bp)

## Defining IST timezone
IST = timezone(timedelta(hours=5, minutes=30))

class SponsorDashboard(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()

            total_campaigns = Campaigns.query.filter_by(sponsor_id = current_user['user_id']).count()
            sent_requests_count = AdRequests.query.filter_by(initiator = 'sponsor').count()
            received_requests_count = AdRequests.query.filter_by(initiator = 'influencer').count()

            past_campaigns_count = Campaigns.query.filter(
                Campaigns.sponsor_id == current_user['user_id'],
                Campaigns.end_date <= datetime.today()
            ).count()
            
            present_campaigns_count = Campaigns.query.filter(
                Campaigns.sponsor_id == current_user['user_id'],
                Campaigns.start_date <= datetime.today(),                                      
                Campaigns.end_date >= datetime.today()
            ).count()
            
            future_campaigns_count = Campaigns.query.filter(
                Campaigns.sponsor_id == current_user['user_id'],
                Campaigns.start_date >= datetime.today()
            ).count()

            # campaign_reach = db.session.query(
            #     Campaigns.name,
            #     func.sum(Influencers.reach)
            # ).join(AdRequests, AdRequests.campaign_id == Campaigns.campaign_id) \
            # .join(Influencers, Influencers.influencer_id == AdRequests.influencer_id) \
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
                'past_campaigns_count': past_campaigns_count,
                'present_campaigns_count': present_campaigns_count,
                'future_campaigns_count': future_campaigns_count,
                'sent_requests_count': sent_requests_count,
                'received_requests_count': received_requests_count,
                # 'campaign_reach_dict': campaign_reach_dict,
                'campaign_influencer_counts_dict': campaign_influencer_counts_dict,
                'total_campaigns': total_campaigns,
            }), 200)
        except Exception as e:
            return make_response(jsonify({'message': f'Error occured while retreiving data. More information:\n{str(e)}'}), 500)

class SponsorCampaigns(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()
            search_query = request.args.get('search', '').strip()
            campaigns = (
                Campaigns.query.filter(
                    Campaigns.name.ilike(f'%{search_query}%') |
                    Campaigns.description.ilike(f'%{search_query}%'),
                    Campaigns.sponsor_id==current_user['user_id']
                ).all()
                if search_query
                else Campaigns.query.filter_by(sponsor_id=current_user['user_id']).all()
            )

            campaigns_list = []
            today = datetime.today().date()

            for campaign in campaigns:
                if campaign.start_date and campaign.end_date:
                    days_passed = (today - campaign.start_date).days
                    total_days = (campaign.end_date - campaign.start_date).days
                    progress = (days_passed / total_days) * 100 if total_days > 0 else 0
                    if progress >= 100:
                        progress = f'Completed on {campaign.end_date}'
                else:
                    progress = 'Unknown'

                joined_influencers = db.session.query(Influencers.name).join(
                    AdRequests, Influencers.user_id == AdRequests.influencer_id
                ).filter(
                    AdRequests.campaign_id == campaign.campaign_id,
                    AdRequests.status == 'Accepted'
                ).all()

                campaigns_list.append({
                    'campaign': campaign.to_dict(),
                    'progress': progress,
                    'joined_influencers': [name for name, in joined_influencers] or []
                })


            ## Listing
            flagged_campaigns = Campaigns.query.filter_by(sponsor_id = current_user['user_id'], is_flagged = True).all()


            ## Inlfuencers to send requests to:
            ## getting current sponsors industry tomatch the infleuncers category
            sponsor = Sponsors.query.filter_by(user_id = current_user['user_id']).first()

                
            sponsor_industry = sponsor.industry if sponsor else None


            influencers = (
                Influencers.query.filter_by(category=sponsor_industry).all()
                if sponsor_industry
                else Influencers.query.all()
            )

            print(f"Query Results: {joined_influencers}")  # Ensure this is not None
            print(f"Flagged Campaigns: {flagged_campaigns}")
            print(f"Influencers: {[influencer.to_dict() for influencer in influencers]}")

            return make_response(jsonify({
                'campaigns': campaigns_list,
                'flagged_campaigns': flagged_campaigns,
                'influencers': [influencer.to_dict() for influencer in influencers]
            }), 200)
        except Exception as e:
            return make_response(jsonify({"message": f"Error occured in retrieving data. More information:\n{str(e)}"}), 500)

    @jwt_required()
    def post(self):
        try:
            current_user = get_jwt_identity()
            data = request.get_json()
            action = data.get('action')
            if action == 'create':
                try: 
                    new_campaign = Campaigns(
                        sponsor_id = current_user['user_id'],
                        name = data.get('name'),
                        description = data.get('description'),
                        start_date = (
                            datetime.strptime(data.get('start_date'), '%Y-%m-%d')
                            .replace(tzinfo=timezone.utc)
                            .astimezone(IST)
                            .date()
                            if data.get('start_date') else datetime.today(IST)
                        ),
                        end_date = (
                            datetime.strptime(data.get('end_date'), '%Y-%m-%d')
                            .replace(tzinfo=timezone.utc)
                            .astimezone(IST)
                            .date()
                            if data.get('end_date') else datetime.today(IST)
                        ),
                        budget = data.get('budget'),
                        visibility = data.get('visibility'),
                        goals = data.get('goals')
                    )
                    db.session.add(new_campaign)
                    db.session.commit()
                    return make_response(jsonify({'message': 'Campaign created successfully'}), 201)
                        
                except Exception as e:
                    db.session.rollback()
                    return make_response(jsonify({'message': f'Error occured while creating campaign. More information:\n{str(e)}'}), 500)
            elif action == 'send':
                try:
                    campaign_id = data.get('campaign_id')
                    influencer_ids = data.get('influencer_ids')
                    for influencer_id in influencer_ids:
                        new_request = AdRequests(
                            campaign_id = campaign_id,
                            influencer_id = influencer_id,
                            sponsor_id = current_user['user_id'],
                            initiator ='sponsor',   
                            requirements = data.get('requirements'),
                            payment_amount = data.get('payment_amount'),
                            messages = data.get('messages')
                        )
                        db.session.add(new_request)
                    db.session.commit()
                    return make_response(jsonify({'message': 'Request(s) sent successfully'}), 201)

                except Exception as e:
                    db.session.rollback()
                    return make_response(jsonify({'message': f'Error occured while sending request. {str(e)}'}))

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error occured. More information:\n{str(e)}'}), 500)   
            
    @jwt_required()
    def put(self):
        try:
            current_user = get_jwt_identity()
            data = request.get_json()
            campaign_id = data.get('campaign_id')
            campaign = Campaigns.query.filter_by(campaign_id = campaign_id, sponsor_id = current_user['user_id']).first()

            if not campaign:
                return make_response(jsonify({'message': 'Campaign not found'}), 404)

            if campaign.sponsor_id!= current_user['user_id']: 
                return make_response(jsonify({'message': 'You are not authorized to update this campaign.'}), 401)
            
            campaign.description = data.get('description', campaign.description)
            campaign.start_date = (
                datetime.strptime(data.get('start_date'), '%Y-%m-%d').replace(tzinfo=timezone.utc).astimezone(IST).date()
                if data.get('start_date') else campaign.start_date
            )
            campaign.end_date = (
                datetime.strptime(data.get('end_date'), '%Y-%m-%d').replace(tzinfo=timezone.utc).astimezone(IST).date()
                if data.get('end_date') else campaign.end_date
            )
            campaign.budget = data.get('budget', campaign.budget)
            campaign.visibility = data.get('visibility', campaign.visibility)
            campaign.goals = data.get('goals', campaign.goals)

            db.session.commit()
            return make_response(jsonify({'message': 'Campaign updated successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error occured while editing campaign. More information:\n{str(e)}'}), 500)
    
    @jwt_required()
    def delete(self):
        try:
            current_user = get_jwt_identity()
            print('raw request data:', request.data)
            print(current_user['user_id'])
            data = request.get_json()
            print('Received data:', data)  # Log the incoming data
            campaign_id = data.get('campaign_id')
            print('campaign_id:', campaign_id)
            campaign = Campaigns.query.filter_by(campaign_id = campaign_id, sponsor_id = current_user['user_id']).first()

            if not campaign:
                return make_response(jsonify({'message': 'Campaign not found'}), 404)

            if campaign.sponsor_id!= current_user['user_id']: 
                return make_response(jsonify({'message': 'You are not authorized to delete this campaign.'}))
            
            db.session.delete(campaign)
            db.session.commit()
            return make_response(jsonify({'message': 'Campaign deleted successfully'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error occured while deleting campaign. More information:\n{str(e)}'}), 500)
     
class SponsorRequests(Resource):
    @jwt_required()
    @cache.memoize(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()
            sent_requests = AdRequests.query.filter_by(
                sponsor_id = current_user['user_id'], 
                initiator = 'sponsor'
            ).all()

            received_requests = AdRequests.query.filter_by(
                sponsor_id = current_user['user_id'],
                initiator = 'influencer'
            ).all()

            sent_requests_list = [
                {
                    'campaign_id': request.campaign_id,
                    'influencer_id': request.influencer_id,
                    'requirements': request.requirements,
                    'payment_amount': request.payment_amount,
                    'negotiation_amount': request.negotiation_amount if request.negotiation_amount != 0 else 'Negotiation is not initiated.',
                    'messages': request.messages,
                    'status': request.status
                }
                for request in sent_requests
            ]

            received_requests_list = [
                {
                    'campaign_id': request.campaign_id,
                    'influencer_id': request.influencer_id,
                    'requirements': request.requirements,
                    'payment_amount': request.payment_amount,
                    'negotiation_amount': request.negotiation_amount if request.negotiation_amount != 0 else 'Negotiation is not initiated.',
                    'messages': request.messages,
                    'status': request.status
                }
                for request in received_requests
            ]


            return make_response(jsonify({
                'current_user': current_user,
                'sent_requests': sent_requests_list,
                'received_requests': received_requests_list
            }), 200)

        except Exception as e:
            print(f"Error: {e}")  # This will help you see what's going wrong in the backend
            return make_response(jsonify({'message': str(e)}), 500)

    @jwt_required()
    def post(self):
        try:
            current_user = get_jwt_identity()
            data = request.get_json()
            campaign_id = data.get('campaign_id')
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

    @jwt_required()
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

    @jwt_required()
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

class SponsorReports(Resource):
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

# Registering the resource with the API
sponsor.add_resource(SponsorDashboard, '/sponsor-dashboard')
sponsor.add_resource(SponsorCampaigns, '/sponsor-campaigns/')
sponsor.add_resource(SponsorRequests, '/sponsor-requests')
sponsor.add_resource(SponsorReports, '/sponsor-reports')
