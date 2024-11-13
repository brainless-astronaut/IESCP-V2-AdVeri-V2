from celery.schedules import crontab
from flask import current_app as app
from tasks import daily_login_reminder, weekly_login_reminder, trigger_reports

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periofic_task(crontab(hour=10, minute=30), daily_login_reminder.s(), name = 'Daily Login Reminder')
    sender.add_periodic_task(crontab(hour=10, minute=30, day_of_week="monday"), weekly_login_reminder.s(), name = 'Weekly Login Reminder')
    sender.add_periodic_task(crontab(hour=10, minute=30, day_of_month=1), trigger_reports.s(), name = 'Monthly report (20 sec tst)')
