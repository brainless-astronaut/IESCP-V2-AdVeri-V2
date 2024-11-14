# Tasks are methods or any jobs that are needed to run asynchronously (by celery) 
# in the background or if we want a method to be scheduled

# Standard library imports
from datetime import datetime, timedelta
import time

# Third-party imports
from celery import shared_task
import flask_excel

# Flask imports
from flask import render_template

# Local application imports
from app.models import *
from .mailer import send_email


@shared_task(ignore_result = False)
def sendHi(user_id):
    user = Users.query.filter_by(user_id=user_id).first()
    return "Hi " + user.username

@shared_task(ignore_result = False)
def add(x,y):
    time.sleep(10)
    return x+y

@shared_task(ignore_result = True)
def daily_login_reminder():
    _24_hrs_ago = datetime.now() - timedelta(hours=24)
    inactive_users = Users.query.filter(
        Users.last_login_at < _24_hrs_ago,
        Users.role.in_(['sponsor', 'influencer'])
    ).all()
    for user in inactive_users:
        template = render_template("static/emails/daily_reminder.html", user=user)
        send_email(user.email, "Login to AdVeri!", template)

@shared_task(ignore_result = True)
def weekly_login_reminder():
    _1_week_ago = datetime.now() - timedelta(days=7)
    inactive_users = Users.query.filter(
        Users.last_login_at < _1_week_ago,
        Users.role.in_(['sponsor', 'influencer'])
    )
    for user in inactive_users:
        template = render_template("/static/emails/weekly_reminder.html", user=user)
        send_email(user.email, "Login to AdVeri!", template)


@shared_task(bind = True, ignore_result = False)
def trigger_reports(self):
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
    # Each of the models have properties (__table__ is one such) 
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
        # wb - write binary
        with open(f'./frontend/downloads/{filename}', 'wb') as file:
            file.write(csv_out.data)
        
        filenames.append(filename)  # Collect the filename

    return filenames  # Return the list of filenames

