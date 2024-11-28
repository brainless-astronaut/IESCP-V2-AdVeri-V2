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

# @shared_task(ignore_result = False)
# def sendHi(user_id):
#     user = Users.query.filter_by(user_id=user_id).first()
#     return "Hi " + user.username

# @shared_task(ignore_result = False)
# def add(x,y):
#     time.sleep(10)
#     return x+y

@shared_task(ignore_result = True)
def email_reminder(to, subject, body):
    send_email(to, subject, body)

@shared_task(ignore_result = True)
def daily_login_reminder():
    app.logger.info("Daily login reminder task started.")
    _24_hrs_ago = datetime.now() - timedelta(hours=24)
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