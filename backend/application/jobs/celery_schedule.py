from celery.schedules import crontab
from flask import current_app as app
from .tasks import daily_login_reminder, weekly_login_reminder, monthly_report

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # every 10 seconds
    # sender.add_periodic_task(10.0, email_reminder.s('students@gmail', 'reminder to login', '<h1> hello everyone </h1>') )
    sender.add_periodic_task(crontab(hour=11, minute=10), daily_login_reminder.s(), name = 'Daily Login Reminder')
    sender.add_periodic_task(crontab(hour=11, minute=10, day_of_week="sunday"), weekly_login_reminder.s(), name = 'Weekly Login Reminder')
    sender.add_periodic_task(crontab(hour=13, minute=49, day_of_month="1"), monthly_report.s(), name = 'Monthly Report')