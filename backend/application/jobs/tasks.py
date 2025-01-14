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
    _24_hrs_ago = datetime.now() - timedelta(hours=2)
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

@shared_task(ignore_result = True)
def pending_requests_reminder():
    pending_requests = AdRequests.query.filter(
        AdRequests.status == 'Pending'
    )
    pending_requests_counts = {}
    usernames = {}
    for request in pending_requests:
        influencer = Users.query.filter_by(user_id=request.influencer_id).first()
        sponsor = Users.query.filter_by(user_id=request.sponsor_id).first()

        # Count the pending requests for each influencer
        if influencer.user_id not in pending_requests_counts:
            pending_requests_counts[influencer.user_id] = 1
            usernames[influencer.user_id] = influencer.username
        pending_requests_counts[influencer.user_id] += 1

        if sponsor.user_id not in pending_requests_counts:
            pending_requests_counts[sponsor.user_id] = 1
            usernames[sponsor.user_id] = sponsor.username
        pending_requests_counts[sponsor.user_id] += 1

    email_templates_path = os.path.join(os.path.dirname(__file__), "emails")
    env = Environment(loader=FileSystemLoader(email_templates_path))

    try: 
        template = env.get_template("pending_request_reminder.html")


        # Send email to influencers and sponsors with the counts of pending requests
        for user_id, counts in pending_requests_counts:
            rendered_content = template.render(username = usernames[user_id], counts = counts)
            send_email(user_id, 'Pending Requests Reminder', rendered_content)

    except Exception as e:
        app.logger.error(f"Error in sending pending requests reminder: {e}")



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

@shared_task(bind=True, ignore_result=False)
def monthly_report(self):
    # Fetching campaigns (this is already returning ORM objects)
    campaigns = Campaigns.query.all()
    
    # Fetching approved sponsors
    approved_sponsors = (
        db.session.query(Users, Sponsors)
        .join(Sponsors, Users.user_id == Sponsors.user_id)
        .filter(Users.is_approved == True)
        .all()
    )
    
    # Fetching all influencers
    all_influencers = (
        db.session.query(Users, Influencers)
        .join(Influencers, Users.user_id == Influencers.user_id)
        .all()
    )

    
    # Fetching sponsors to approve
    sponsors_to_approve = (
        db.session.query(Users, Sponsors)
        .join(Sponsors, Users.user_id == Sponsors.user_id)
        .filter(Users.is_approved == False)
        .all()
    )

    # Prepare data for the report
    report_data = {
        "campaigns": campaigns,
        "approved_sponsors": approved_sponsors,
        "all_influencers": all_influencers,
        "sponsors_to_approve": sponsors_to_approve,
    }

    print(report_data)

    # Render the HTML template using Jinja2
    email_templates_path = os.path.join(os.path.dirname(__file__), "emails")
    env = Environment(loader=FileSystemLoader(email_templates_path))
    
    # Add `getattr` function to Jinja2 environment
    env.globals.update(getattr=getattr)

    try:
        # Load and render the HTML template
        template = env.get_template("monthly_report.html")
        html_content = template.render(data=report_data)

        # Send email with the rendered HTML
        recipient_email = 'admin@adveri.com'
        subject = 'Monthly Report'
        send_email(recipient_email, subject, html_content)

        app.logger.info(f"Monthly report sent to {recipient_email}")
        return f"Monthly report sent to {recipient_email}"

    except Exception as e:
        app.logger.error(f"Error in monthly report task: {e}")
        raise

