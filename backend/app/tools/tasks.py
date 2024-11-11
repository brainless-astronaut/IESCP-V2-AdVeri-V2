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

from tools.workers import celery
from models import *
from celery.schedules import datetime, timedelta
from tools.mailer import send_email
from flask import render_template


@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(20, monthly_report.s(), name = 'Monthly report (20 sec tst)')

@celery.task
def sendHi(userid):
    user = Users.query.filter_by(id=userid).first()
    return "Hi " + user.username
