# Tasks are methods or any jobs that are needed to run asynchronously (by celery) 
# in the background or if we want a method to be scheduled

# Standard library imports
from datetime import datetime, timedelta
import time, os

# Third-party imports
from celery import shared_task
import flask_excel
from jinja2 import Environment, FileSystemLoader

# Flask imports
from flask import render_template, current_app as app

# Local application imports
from application.models import *
from .mailer import send_email

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Path to the current file
EMAIL_TEMPLATES_DIR = os.path.join(BASE_DIR, "emails")

@shared_task(ignore_result = True)
def daily_login_reminder():
    app.logger.info("Daily login reminder task started.")
    # _24_hrs_ago = datetime.now() - timedelta(hours=24)
    _24_hrs_ago = datetime.now() - timedelta(minutes=5)
    inactive_users = Users.query.filter(
        Users.last_login_at < _24_hrs_ago,
        Users.role.in_(['sponsor', 'influencer'])
    ).all()
    email_templates_path = os.path.join(os.path.dirname(__file__), "emails")
    env = Environment(loader=FileSystemLoader(email_templates_path))
    
    try:
        # Load the specific template
        template = env.get_template("daily_reminder.html")
        
        for user in inactive_users:
            rendered_content = template.render(user=user)
            send_email(user.email, "Login to AdVeri!", rendered_content)
    except Exception as e:
        app.logger.error(f"Error in weekly login reminder: {e}")

@shared_task(ignore_result = True)
def weekly_login_reminder():
    _1_week_ago = datetime.now() - timedelta(days=7)
    inactive_users = Users.query.filter(
        Users.last_login_at < _1_week_ago,
        Users.role.in_(['sponsor', 'influencer'])
    )
    email_templates_path = os.path.join(os.path.dirname(__file__), "emails")
    env = Environment(loader=FileSystemLoader(email_templates_path))
    
    try:
        # Load the specific template
        template = env.get_template("weekly_reminder.html")
        
        for user in inactive_users:
            rendered_content = template.render(user=user)
            send_email(user.email, "Login to AdVeri!", rendered_content)
    except Exception as e:
        app.logger.error(f"Error in weekly login reminder: {e}")

@shared_task(bind = True, ignore_result = False)
def trigger_reports(self):
    try:
        campaigns = Campaigns.query.all()

        # Task ID for unique filenames
        task_id = self.request.id

        # Directory for downloads
        downloads_dir = os.path.join(os.path.dirname(__file__), 'downloads')
        os.makedirs(downloads_dir, exist_ok=True)  # Ensure the directory exists
        
        # Dictionary of datasets and corresponding column names
        # Each of the models have properties (__table__ is one such) 
        dataset = {
            'campaigns': (campaigns, [column.name for column in Campaigns.__table__.columns])
        }

        filenames = []
        for name, (data, columns) in dataset.items():
            filename = os.path.join(downloads_dir, f'{task_id}_{name}.csv')
            csv_out = flask_excel.make_response_from_query_sets(data, column_names=columns, file_type='csv')

            # Save CSV to file
            with open(filename, 'wb') as file:
                file.write(csv_out.data)
            
            filenames.append(filename)  # Collect the filename

        return {'status': 'success', 'files': filenames}  # Return the list of filenames
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
    
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
#         filename = f'{name}_data_{task_id}.csv'
#         csv_out = flask_excel.make_response_from_query_sets(data, column_names=columns, file_type='csv')
        
#         # Save CSV to file
#         with open(f'./backend/celery/downloads/{filename}', 'wb') as file:
#             file.write(csv_out.data)
        
#         filenames.append(filename)  # Collect the filename
#     return filenames  # Return the list of filenames

@shared_task(bind=True, ignore_result=False)
def monthly_report(self):
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
        filename = f'{name}_data_{task_id}.csv'
        csv_out = flask_excel.make_response_from_query_sets(data, column_names=columns, file_type='csv')
        
        # Save CSV to file
        file_path = f'./backend/celery/downloads/{filename}'
        with open(file_path, 'wb') as file:
            file.write(csv_out.data)
        
        filenames.append(file_path)  # Collect the full path of the file
    
    # Send email with attachments (CSV files)
    recipient_email = 'admin@adveri.com'  # Specify the recipient's email
    subject = 'Monthy Report'
    body = '<h1 style="font-family: Fira Code, sans-serif;">Please find the attached CSV files</h1>'
    
    send_email(recipient_email, subject, body, attachments=filenames)

    return filenames  # Return the list of filenames