# Standard library imports
from datetime import datetime

# Third-party imports
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()


class Users(db.Model):
    __tablename__ = '__users__'
    user_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    username = db.Column(db.String(20), nullable = False, unique = True)
    email = db.Column(db.String(50), nullable = False, unique = True)
    password = db.Column(db.String(60), nullable = False)
    is_flagged = db.Column(db.Boolean, default = False, nullable = False)  
    is_approved = db.Column(db.Boolean, default = True, nullable = False)
    role = db.Column(db.String(10), nullable = False)
    last_login_at = db.Column(db.DateTime, default = datetime.now)

    ## Relationships
    influencers = db.relationship('Influencers', back_populates = 'users', uselist = False, cascade = 'all, delete-orphan')
    sponsors = db.relationship('Sponsors', back_populates = 'users', uselist = False, cascade = 'all, delete-orphan')

class Influencers(db.Model):
    __tablename__ = '__influencers__'
    influencer_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    name = db.Column(db.String(30), default = 'No name')
    category = db.Column(db.String(50))
    niche = db.Column(db.String(100))
    earnings = db.Column(db.Float(10,2), default = 0)
    platform = db.Column(db.String(), nullable = False)
    reach = db.Column(db.Integer(), nullable = False, default =  0)
    user_id = db.Column(db.Integer, db.ForeignKey('__users__.user_id'), nullable = False)

    ## Relationships
    users = db.relationship('Users', back_populates = 'influencers', uselist = False)
    ad_requests = db.relationship('AdRequests', back_populates = 'influencers', cascade = 'all, delete-orphan')

class Sponsors(db.Model):
    __tablename__ = '__sponsors__'
    sponsor_id = db.Column(db.Integer, primary_key = True, autoincrement = True)
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