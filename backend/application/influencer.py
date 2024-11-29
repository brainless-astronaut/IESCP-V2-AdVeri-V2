# Standard library imports
from datetime import datetime

# Third-party imports
from flask import request, jsonify, Blueprint, make_response, current_app as app
from flask_restful import Api, Resource
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import and_, func, or_

# Local application imports
from .models import *

# Initialize cache and blueprint
cache = app.cache
influencer_bp = Blueprint('influencer', __name__)
influencer = Api(influencer_bp)


class InfluencerDashboard(Resource):
    @jwt_required()
    @cache.cached(timeout = 5)
    def get(self):
        current_user = get_jwt_identity()

        influencer_id = current_user['user_id']

        # Count total ad requests for the influencer
        requests_count = AdRequests.query.filter(
            AdRequests.influencer_id == influencer_id
        ).count()

        # Count of pending requests
        pending_requests_count = AdRequests.query.filter(
            AdRequests.influencer_id == influencer_id,
            AdRequests.status == 'Pending'
        ).count()

        # Count of requests in negotiation state
        negotiation_requests_count = AdRequests.query.filter(
            AdRequests.influencer_id == influencer_id,
            AdRequests.status == 'Negotiation'
        ).count()

        # Count accepted campaigns for the influencer
        joined_campaigns_count = AdRequests.query.filter(
            AdRequests.influencer_id == influencer_id,
            AdRequests.status == 'Accepted'
        ).count()

        # Calculate total earnings from accepted campaigns
        earnings = db.session.query(
            func.sum(AdRequests.payment_amount)
        ).filter(
            AdRequests.influencer_id == influencer_id,
            AdRequests.status == 'Accepted'
        ).scalar()

        # Fetch earnings by campaign for accepted campaigns
        earnings_by_campaign = [
            {
                "campaign_name": campaign_name,
                "payment_amount": payment_amount
            }
            for payment_amount, campaign_name in db.session.query(
                AdRequests.payment_amount,
                Campaigns.name
            ).join(
                Campaigns, AdRequests.campaign_id == Campaigns.campaign_id
            ).filter(
                AdRequests.influencer_id == influencer_id,
                AdRequests.status == 'Accepted'
            ).all()
        ]

        # Fetch earnings by industry for accepted campaigns
        earnings_by_industry = [
            {
                "industry": industry,
                "total_payment": total_payment,
                "campaign_count": campaign_count
            }
            for industry, total_payment, campaign_count in db.session.query(
                Sponsors.industry,
                func.sum(AdRequests.payment_amount).label('total_payment'),
                func.count(Campaigns.name).label('campaign_count')
            ).join(
                Campaigns, AdRequests.campaign_id == Campaigns.campaign_id
            ).join(
                Sponsors, Campaigns.sponsor_id == Sponsors.user_id
            ).filter(
                AdRequests.influencer_id == influencer_id,
                AdRequests.status == 'Accepted'
            ).group_by(
                Sponsors.industry
            ).all()
        ]

        # dataset = {
        #     'current_user': current_user,
        #     'requests_count': requests_count,
        #     'pending_requests_count': pending_requests_count,
        #     'negotiation_requests_count': negotiation_requests_count,
        #     'joined_campaigns_count': joined_campaigns_count,
        #     'earnings': earnings,
        #     'earnings_by_campaign': earnings_by_campaign,
        #     'earnings_by_industry': earnings_by_industry
        # }

        # print(dataset) ## debug


        return make_response(jsonify({
            'current_user': current_user,
            'requests_count': requests_count,
            'pending_requests_count': pending_requests_count,
            'negotiation_requests_count': negotiation_requests_count,
            'joined_campaigns_count': joined_campaigns_count,
            'earnings': earnings,
            'earnings_by_campaign': earnings_by_campaign,
            'earnings_by_industry': earnings_by_industry
        }), 200)

class InfluencerSendRequests(Resource):

    @jwt_required()
    @cache.cached(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()

            influencer_id = current_user['user_id']

            if not influencer_id:
                return make_response(jsonify({'message': 'You are not authorized to acceess this page!'}), 401)

            # Get the search query from URL parameters
            search_query = request.args.get('search_query', '').strip()

            public_campaigns = Campaigns.query.filter_by(visibility = 'public')

            if search_query:
                public_campaigns = public_campaigns.filter(
                    or_(
                        Campaigns.name.contains(search_query),
                        Campaigns.description.contains(search_query)
                    )
                )

            public_campaigns_details = []

            today = datetime.today().date()

            for campaign in public_campaigns:
                days_passed = (today - campaign.start_date).days
                total_days = (campaign.end_date - campaign.start_date).days
                progress = (days_passed / total_days) * 100 if total_days > 0 else 0
                if progress >= 100:
                    progress = f'Completed on {campaign.end_date}'

                public_campaigns_details.append({
                    'campaign': campaign.to_dict(),
                    'progress': progress
                })

            # print([campaign for campaign in public_campaigns_details])

            print(public_campaigns_details)

            return make_response(jsonify({
                'current_user': current_user,
                'public_campaigns': public_campaigns_details
                }), 200)
        except Exception as e:
            return make_response(jsonify({'message': f'Error while fetching campaign data. {str(e)}'}), 500)
        
    @jwt_required()
    def post(self):
        try:
            current_user = get_jwt_identity()
            influencer_id = current_user['user_id']

            if not influencer_id: 
                return make_response(jsonify({'message': 'You are not authorized to acceess this page!'}), 401)

            data = request.get_json()
            campaign_id = data.get('campaign_id', None)
            payment_amount = data.get('payment_amount', None)
            requirements = data.get('requirements', None)
            messages = data.get('messages', None)
            sponsor_id = Campaigns.query.filter_by(campaign_id=campaign_id).first().sponsor_id


            if not all([payment_amount, requirements, messages]):
                return make_response(jsonify({'message': 'All fields are required.'}), 400)
            
            if not sponsor_id:
                return make_response(jsonify({'message': 'Sponsor does not exist.'}), 400)
            
            if not campaign_id:
                return make_response(jsonify({'message': 'Campaign does not exist.'}), 400)
            

            new_request = AdRequests(
                influencer_id = influencer_id,
                campaign_id = campaign_id,
                payment_amount = payment_amount,
                requirements = requirements,
                messages = messages,
                sponsor_id = sponsor_id,
                initiator = 'influencer',
                status = 'Pending'
            )
            db.session.add(new_request)
            db.session.commit()

            return make_response(jsonify({'message': 'Request sent successfully.'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error while sending request. {str(e)}'}), 500)

class InfluencerManageRequests(Resource):

    @jwt_required()
    @cache.cached(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()

            influencer_id = current_user['user_id']

            if not influencer_id:
                return make_response(jsonify({'message': 'You are not authorized to acceess this page!'}), 401)
            
            # Extract search_query from query parameters
            search_query = request.args.get('search_query', '').strip()
        
            ad_requests_query = AdRequests.query.filter(
                AdRequests.influencer_id == influencer_id
            ).join(Campaigns)

            if search_query:
                ad_requests_query = ad_requests_query.filter(
                    Campaigns.name.ilike(f'%{search_query}%') |
                    AdRequests.status.ilike(f'%{search_query}%')
                )

            ad_requests = [
                {
                    "request_id": req.request_id,
                    "campaign": {"name": req.campaigns.name},
                    "messages": req.messages,
                    "requirements": req.requirements,
                    "payment_amount": req.payment_amount,
                    "negotiation_amount": req.negotiation_amount,
                    "status": req.status,
                }
                for req in ad_requests_query.all()
            ]
            
            return make_response(jsonify({
                'current_user': current_user,
                'ad_requests': ad_requests
            }), 200)

        except Exception as e:
            return make_response(jsonify({'message': f'Error while fetching requests. {str(e)}'}), 500)

    @jwt_required()
    def put(self):
        try:
            current_user = get_jwt_identity()
            influencer_id = current_user['user_id']
            
            if not influencer_id:
                return make_response(jsonify({'message': 'You are not authorized to acceess this page!'}), 401)
            
            data = request.get_json()

            request_id = data.get('request_id', None)
            action = data.get('action', None)
            
            if not request_id:
                return make_response(jsonify({'message': 'Request ID is required.'}), 400)
            
            ad_request = AdRequests.query.filter_by(request_id=request_id).first()
            campaign = Campaigns.query.filter_by(campaign_id=ad_request.campaign_id).first()
            sponsor = Sponsors.query.filter_by(user_id = campaign.sponsor_id).first()
            influencer = Influencers.query.filter_by(user_id = ad_request.influencer_id).first()

            if not ad_request:
                return make_response(jsonify({'message': 'Request does not exist.'}), 400)

            if not campaign:
                return make_response(jsonify({'message': 'Campaign does not exist.'}), 400)
            
            if not sponsor:
                return make_response(jsonify({'message': 'Sponsor does not exist.'}), 400)
            
            if action == 'accept':
                # amount = 0
                # if ad_request.negotiation_amount:
                #     amount = ad_request.negotiation_amount
                # else:
                #     amount = ad_request.payment_amount
                
                # if amount > 0:
                #     if sponsor.budget >= amount and campaign.budget >= amount:
                #         sponsor.budget -= amount
                #         campaign.budget -= amount
                #         influencer.earnings += amount
                #         ad_request.status = 'Accepted'
                #     else: 
                #         return make_response(jsonify({'message': 'Can\'t accept request as the sponsor faces budget constraints.'}), 400)
                # else:
                #     return make_response(jsonify({'message': 'Amount should be greater than zero.'}), 400)

                amount = 0
                if ad_request.negotiation_amount and ad_request.negotiation_amount > 0:
                    amount = ad_request.negotiation_amount
                else:
                    amount = ad_request.payment_amount
                if amount > 0:
                    if sponsor.budget >= amount:
                        influencer.earnings += amount
                        campaign.budget -= amount
                        sponsor.budget -= amount
                        ad_request.status = 'Accepted'
                    else:
                        return {'message': 'Insufficient budget.'}, 400
                else:
                    return {'message': 'Amount must be greater than zero.'}
                
            elif action == 'negotiate':
                negotiation_amount = float(data.get('negotiation_amount', 0))
                
                if not negotiation_amount:
                    return make_response(jsonify({'message': 'Negotiation amount is required.'}), 400)
                
                ad_request.negotiation_amount = negotiation_amount
                ad_request.status = 'Negotiating'
            elif action == 'reject':
                ad_request.status = 'Rejected'
            elif action == 'revoke':
                db.session.delete(ad_request)
            
            db.session.commit()
            
            return make_response(jsonify({'message': 'Request updated successfully.'}), 200)
        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({'message': f'Error while updating request. {str(e)}'}), 500)
        
class InfluencerJoinedCampaigns(Resource):

    @jwt_required()
    @cache.cached(timeout = 5)
    def get(self):
        try:
            current_user = get_jwt_identity()
            influencer_id = current_user['user_id']

            if not influencer_id:
                return make_response(jsonify({'message': 'You are not authorized to acceess this page!'}), 401)
            
            # Extract search_query from query parameters
            search_query = request.args.get('search_query', '').strip()

            campaigns = Campaigns.query.join(AdRequests, Campaigns.campaign_id == AdRequests.campaign_id).filter(
            AdRequests.influencer_id == influencer_id,
            AdRequests.status == 'Accepted').all()

            if search_query:
                campaigns = Campaigns.query.filter(
                    Campaigns.name.ilike(f'%{search_query}%') |
                    Campaigns.description.ilike(f'%{search_query}%')
                ).all()

            campaign_details = []
            joined_influencers = []
            today = datetime.today().date()
            for campaign in campaigns:
                days_passed = (today - campaign.start_date).days
                total_days = (campaign.end_date - campaign.start_date).days
                progress = (days_passed / total_days) * 100 if total_days > 0 else 0
                if progress >= 100:
                    progress = f'Completed on {campaign.end_date}'

                joined_influencers = db.session.query(Influencers.name).join(
                    AdRequests, Influencers.user_id == AdRequests.influencer_id
                ).filter(
                    AdRequests.campaign_id == campaign.campaign_id,
                    AdRequests.status == 'Accepted'
                ).all()

                campaign_details.append({
                    'campaign': campaign.to_dict(),
                    'progress': progress,
                    'joined_influencers': [influencer.name for influencer, in joined_influencers]
                })

                return make_response(jsonify({
                    'current_user': current_user,
                    'campaign_details': campaign_details
                }))
        except Exception as e:
            return make_response(jsonify({'message': f'Error while fetching campaigns. {str(e)}'}), 500)
            



influencer.add_resource(InfluencerDashboard, '/influencer-dashboard')
influencer.add_resource(InfluencerSendRequests, '/influencer-send-requests')
influencer.add_resource(InfluencerManageRequests, '/influencer-manage-requests')
influencer.add_resource(InfluencerJoinedCampaigns, '/influencer-joined-campaigns')