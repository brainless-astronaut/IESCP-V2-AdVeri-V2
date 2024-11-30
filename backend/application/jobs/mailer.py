import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = 'localhost'
SMTP_PORT = 1025
SENDER_EMAIL = 'noreply@adveri.com'
SENDER_PASSWORD = ''

def send_email(to, subject, body):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL
    msg['To'] = to

    msg.attach(MIMEText(body, 'html')) ## attach multi MIME parts 

    with smtplib.SMTP(host = SMTP_SERVER, port = SMTP_PORT) as client:
        client.send_message(msg)
        client.quit()

send_email('sample@adveri.com', 'TEST EMAIL', '<h1>Hello! Welcome to AdVeri!</h1>')
