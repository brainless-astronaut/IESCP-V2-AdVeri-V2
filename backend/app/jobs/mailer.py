from flask_mail import Message, Mail
from flask import current_app as app

mail = Mail()

def init_app(app):
    app.config['MAIL_SERVER'] = 'localhost'
    app.config['MAIL_PORT'] = 1025  # MailHog's default port
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = None  # No auth needed for MailHog
    app.config['MAIL_PASSWORD'] = None
    app.config['MAIL_DEFAULT_SENDER'] = "noreply@adveri.com"
    
    mail.init_app(app)

def send_email(to, subject, body):
    
    sender = "noreply@adveri.com"
    msg = Message(subject, sender=sender, recipients=[to], html=body)

    mail.send(msg)