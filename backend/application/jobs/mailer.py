# from flask_mail import Message, Mail
# from flask import current_app as app

# mail = Mail()

# def init_app(app):
#     app.config['MAIL_SERVER'] = 'localhost'
#     app.config['MAIL_PORT'] = 1025 
#     app.config['MAIL_USE_TLS'] = False
#     app.config['MAIL_USE_SSL'] = False
#     app.config['MAIL_USERNAME'] = None 
#     app.config['MAIL_PASSWORD'] = None
#     app.config['MAIL_DEFAULT_SENDER'] = "noreply@adveri.com"
    
#     mail.init_app(app)

# def send_email(to, subject, body):
    
#     sender = "noreply@adveri.com"
#     msg = Message(subject, sender=sender, recipients=[to], html=body)

#     mail.send(msg)

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = 'noreply@adveri.com'
SENDER_PASSWORD = ''

# import logging

# logging.basicConfig(level=logging.INFO)

def send_email(to, subject, body):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = to

    msg.attach(MIMEText(body, 'html')) ## attach multi MIME parts 

    with smtplib.SMTP(host = SMTP_SERVER, port = SMTP_PORT) as client:
        # logging.info(f"Connecting to SMTP server {SMTP_SERVER}:{SMTP_PORT}")
        client.send_message(msg)
        # logging.info(f"Email sent to {to}")
        client.quit()

# send_email('sample@adveri.com', 'TEST EMAIL', '<h1>Hello! Welcome to AdVeri!</h1>')
