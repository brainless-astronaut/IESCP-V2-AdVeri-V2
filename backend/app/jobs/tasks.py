# from celery import shared_task
# import time

# import flask_excel
# from app.models import *

# @shared_task(bind=True, ignore_result=False)
# def create_csv(self):
#     campaigns = Campaigns.query.all()
#     approved_sponsors = (
#         db.session.query(Users, Sponsors)
#         .join(Sponsors, Users.user_id == Sponsors.user_id)
#         .filter(Users.is_approved == True)
#         .all()
#     )
#     all_influencers = (
#         db.session.query(Users, Influencers)
#         .join(Influencers, Users.user_id == Influencers.user_id)
#         .all()
#     )
#     sponsors_to_approve = (
#         db.session.query(Users, Sponsors)
#         .join(Sponsors, Users.user_id == Sponsors.user_id)
#         .filter(Users.is_approved == False)
#         .all()
#     )

#     # Task ID for unique filenames
#     task_id = self.request.id
    
#     # Dictionary of datasets and corresponding column names
#     datasets = {
#         'campaigns': (campaigns, [column.name for column in Campaigns.__table__.columns]),
#         'approved_sponsors': (approved_sponsors, [column.name for column in Users.__table__.columns + Sponsors.__table__.columns]),
#         'all_influencers': (all_influencers, [column.name for column in Users.__table__.columns + Influencers.__table__.columns]),
#         'sponsors_to_approve': (sponsors_to_approve, [column.name for column in Users.__table__.columns + Sponsors.__table__.columns])
#     }

#     # Loop through each dataset to generate and save CSV files
#     filenames = []
#     for name, (data, columns) in datasets.items():
#         filename = f'{task_id}_{name}_data.csv'
#         csv_out = flask_excel.make_response_from_query_sets(data, column_names=columns, file_type='csv')
        
#         # Save CSV to file
#         with open(f'./backend/celery/downloads/{filename}', 'wb') as file:
#             file.write(csv_out.data)
        
#         filenames.append(filename)  # Collect the filename

#     return filenames  # Return the list of filenames

# Tasks are methods or any jobs that are needed to run asynchronously (by celery) 
# in the background or if we want a method to be scheduled

from jobs.workers import celery
from models import *
from celery.schedules import crontab
from datetime import datetime, timedelta
from jobs.mailer import send_email
from flask import render_template
import flask_excel

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(20, monthly_reports.s(), name = 'Monthly report (20 sec tst)')

@celery.task
def sendHi(user_id):
    user = Users.query.filter_by(user_id=user_id).first()
    return "Hi " + user.username

@celery.task
def add():
    return 3 + 4

@celery.task
def send_daily_email():
    _24_hrs_ago = datetime.now() - timedelta(hours=24)
    inactive_users = Users.query.filter(
        Users.last_login_at < _24_hrs_ago,
        Users.role.in_(['sponsor', 'influencer'])
    ).all()
    count, message = 0, ''
    for user in inactive_users:
        message = f'Hey {user.username}!\nWe\'ve noticed that you account was inactive in the past 24 hours.\nLog in to AdVeri view your progress!'
        count += 1
        template = render_template("static/emails/daily_remainder.html", user=user, message=message)
        send_email(user.email, "Login to Adveri!", template)
    return f'Login remainder sent to {count} inactive users!'

@celery.task
def monthly_reports(self):
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

    # Task ID for unique filenames
    task_id = self.request.id
    
    # Dictionary of datasets and corresponding column names
    datasets = {
        'campaigns': (campaigns, [column.name for column in Campaigns.__table__.columns]),
        'approved_sponsors': (approved_sponsors, [column.name for column in Users.__table__.columns + Sponsors.__table__.columns]),
        'all_influencers': (all_influencers, [column.name for column in Users.__table__.columns + Influencers.__table__.columns]),
        'sponsors_to_approve': (sponsors_to_approve, [column.name for column in Users.__table__.columns + Sponsors.__table__.columns])
    }

    # Loop through each dataset to generate and save CSV files
    filenames = []
    for name, (data, columns) in datasets.items():
        filename = f'{task_id}_{name}_data.csv'
        csv_out = flask_excel.make_response_from_query_sets(data, column_names=columns, file_type='csv')
        
        # Save CSV to file
        with open(f'./frontend/downloads/{filename}', 'wb') as file:
            file.write(csv_out.data)
        
        filenames.append(filename)  # Collect the filename

    return filenames  # Return the list of filenames

