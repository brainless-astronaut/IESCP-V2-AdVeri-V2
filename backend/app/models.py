from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

# class Users(db.Model):
#     __tablename__ = 'users'
#     id = db.Column(db.Integer, primary_key = True, autoincrement = True)
#     username = db.Column(db.String(80), nullable = False, unique = True)
#     email = db.Column(db.String(120), nullable = False, unique = True)
#     password = db.Column(db.String(), nullable = False)
#     role = db.Column(db.String(), nullable = False)
#     approved = db.Column(db.Boolean, default = False, nullable = False)
#     is_flagged = db.Column(db.Boolean, default = False, nullable = False)
#     last_login_at = db.Column(db.DateTime, default = datetime.now)

#     sponsor = db.relationship('Sponsors', backref = 'users', lazy = True)
#     influencer = db.relationship('Influencers', backref = 'users', lazy = True)
#     campaigns = db.relationship('Campaigns', backref = 'users', lazy = True)
#     requests = db.relationship('AdRequests', backref = 'users', lazy = True)
#     sent_requests = db.relationship('AdRequests', foreign_keys = 'AdRequests.sender_id', backref = 'sender', lazy = True)
#     received_requests = db.relationship('AdRequests', foreign_keys = 'AdRequests.receiver_id', backref = 'receiver', lazy = True)

# class Sponsors(db.Model):
#     __tablename__ = 'sponsors'
#     id = db.Column(db.Integer, primary_key = True, autoincrement = True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     entity_name = db.Column(db.String, nullable = False, unique = True)
#     industry = db.Column(db.String, nullable = False)
#     budget = db.Column(db.Float, nullable = False)
    
# class Influencers(db.Model):
#     __tablename__ = 'influencers'
#     id = db.Column(db.Integer, primary_key = True, autoincrement = True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     first_name = db.Column(db.String(25), nullable = False)
#     last_name = db.Column(db.String(25), nullable = False)
#     dob = db.Column(db.DateTime, nullable = False)
#     gender = db.Column(db.String(1), nullable = False)
#     niche = db.Column(db.String, nullable = False)
#     industry = db.Column(db.String, nullable = False)
#     earnings = db.Column(db.Float)

#     platforms = db.relationship('InfluencerPlatform', back_populates = 'influencer', cascade = 'all, delete-orphan')
#     # ad_requests = db.relationship('AdRequests', back_populates = 'influencer', cascade = 'all, delete-orphan')

# class InfluencerPlatform(db.Model):
#     __tablename__ = 'inf_platforms'
#     id = db.Column(db.Integer, primary_key = True, autoincrement = True)
#     user_id = db.Column(db.Integer, db.ForeignKey('influencers.user_id'), nullable = False)
#     platform = db.Column(db.String(), nullable = False)
#     reach = db.Column(db.Integer(), nullable = False, default = 0)

#     influencer = db.relationship('Influencer', back_populates = 'platform', uselist = False)

# class Campaigns(db.Model):
#     __tablename__ = 'campaigns'
#     id = db.Column(db.Integer, primary_key = True, autoincrement = True)
#     sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsors.user_id'))
#     name = db.Column(db.String(), nullable = False, unique = True)
#     description = db.Column(db.String(), nullable = False)
#     start_date = db.Column(db.DateTime, nullable = False, default = datetime.now)
#     end_date = db.Column(db.DateTime, nullable = False)
#     budget = db.Column(db.Float, nullable = False)
#     goals = db.Column(db.Integer, nullable = False)
#     visibility = db.Column(db.String, nullable = False, default = 'public')
#     campaign_reach = db.Column(db.Integer, nullable = False, default = 0)
#     goals_met = db.Column(db.Boolean, default = False)

#     ad_requests = db.relationship('AdRequests', back_populates = 'campaign', cascade = 'all, delete-orphan')
#     joined_influencers = db.relationship('JoinedInfluencers', back_populates = 'campaign', cascade = 'all, delete-orphan')

#     def __init__(self):
#         self.goals_met = self.goals =  self.campaign_reach

# class AdRequests(db.Model):
#     __tablename__ = 'ad_requests'
#     id = db.Column(db.Integer, primary_key = True, autoincrement = True)
#     sent_by = db.Column(db.String, nullable = False)
#     sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'))
#     campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'))
#     message = db.Column(db.String, nullable = False)
#     requirements = db.Column(db.String, nullable = False)
#     payment_amount = db.Column(db.Float, nullable = False)
#     negotiated_amount = db.Column(db.Float, nullable = False, default = 0)
#     status = db.Column(db.String, nullable = False)

#     campaign = db.relationship('Campaigns', back_populates = 'ad_requests')
#     joined_influencers = db.relationship('JoinedInfluencers', back_populates = 'ad_requests', cascade = 'all, delete-orphan')

class Users(db.Model):
    __tablename__ = '__users__'
    user_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    username = db.Column(db.String(20), nullable = False, unique = True)
    email = db.Column(db.String(50), nullable = False, unique = True)
    password = db.Column(db.String(60), nullable = False)
    role = db.Column(db.String(10), nullable = False)
    is_approved = db.Column(db.Boolean, default = True, nullable = False)
    is_flagged = db.Column(db.Boolean, default = False, nullable = False)
    last_login_at = db.Column(db.DateTime, default = datetime.now)
    # name = db.Column(db.String(50), default = 'No Name')
    # profile_picture = db.Column(db.String(50), default = 'user_default.svg')

    ## Relationships
    influencers = db.relationship('Influencers', back_populates = 'users', uselist = False, cascade = 'all, delete-orphan')
    sponsors = db.relationship('Sponsors', back_populates = 'users', uselist = False, cascade = 'all, delete-orphan')

class Influencers(db.Model):
    __tablename__ = '__influencers__'
    influencer_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    name = db.Column(db.String(30), default = 'No name')
    category = db.Column(db.String(50))
    niche = db.Column(db.String(100))
    # bio = db.Column(db.String(50))
    earnings = db.Column(db.Float(10,2), default = 0)
    user_id = db.Column(db.Integer, db.ForeignKey('__users__.user_id'), nullable = False)

    ## Relationships
    users = db.relationship('Users', back_populates = 'influencers', uselist = False)
    platforms = db.relationship('InfluencerPlatforms', back_populates = 'influencers', cascade = 'all, delete-orphan')
    ad_requests = db.relationship('AdRequests', back_populates = 'influencers', cascade = 'all, delete-orphan')

class InfluencerPlatforms(db.Model):
    __tablename__ = '__influencer_platforms__'
    influence_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    platform = db.Column(db.String(20), nullable = False)
    reach = db.Column(db.Integer, nullable = False)
    url = db.Column(db.String(50), nullable = False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('__influencers__.influencer_id'), nullable = False)

    ## Relationships
    influencers = db.relationship('Influencers', back_populates = 'platforms', uselist = False)

class Sponsors(db.Model):
    __tablename__ = '__sponsors__'
    sponsor_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    # website = db.Column(db.String(40))
    entity_name = db.Column(db.String(50), default = 'No Name')
    industry = db.Column(db.String(50))
    budget = db.Column(db.Float(10,2), default = 0)
    user_id = db.Column(db.Integer, db.ForeignKey('__users__.user_id'), nullable = False)

    ## Relationships
    users = db.relationship('Users', back_populates = 'sponsors', uselist = False)
    campaigns = db.relationship('Campaigns', back_populates = 'sponsors', cascade = 'all, delete-orphan')
    ad_requests = db.relationship('AdRequests', back_populates = 'sponsors', cascade = 'all, delete-orphan')

class Campaigns(db.Model):
    __tablename__ = '__campaigns__'
    campaign_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('__sponsors__.sponsor_id'), nullable = False)
    is_flagged = db.Column(db.String(5), default = 'False')
    name = db.Column(db.String(60), nullable = False)
    description = db.Column(db.String(60), nullable = False)
    start_date = db.Column(db.Date, nullable = False)
    end_date = db.Column(db.Date, nullable = False)
    budget = db.Column(db.Float(10,2), nullable = False)
    visibility = db.Column(db.String(10), nullable = False)
    goals = db.Column(db.String(60), nullable = False)
    
    ## Relationships
    sponsors = db.relationship('Sponsors', back_populates = 'campaigns')
    ad_requests = db.relationship('AdRequests', back_populates = 'campaigns', cascade = 'all, delete-orphan')

class AdRequests(db.Model):
    __tablename__ = '__ad_requests__'
    request_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('__campaigns__.campaign_id'), nullable = False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('__influencers__.influencer_id'), nullable = False)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('__sponsors__.sponsor_id'), nullable = False)
    is_flagged = db.Column(db.String(5), default = 'False')
    initiator = db.Column(db.String(10), nullable = False)
    requirements = db.Column(db.String(60), nullable = False)
    payment_amount = db.Column(db.Numeric(10,2), nullable = False)
    negotiation_amount = db.Column(db.Numeric(10,2), default = 0.0)
    messages = db.Column(db.String(60), nullable = False)
    status = db.Column(db.String(10), nullable = False, default = 'Pending')
    
    ## Relationships
    campaigns = db.relationship('Campaigns', back_populates = 'ad_requests')
    influencers = db.relationship('Influencers', back_populates = 'ad_requests')
    sponsors = db.relationship('Sponsors', back_populates = 'ad_requests')