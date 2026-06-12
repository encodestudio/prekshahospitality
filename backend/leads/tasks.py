import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def send_contact_inquiry_emails(inquiry_id):
    from .models import ContactInquiry
    inquiry = ContactInquiry.objects.get(id=inquiry_id)
    context = {'inquiry': inquiry, 'frontend_url': settings.FRONTEND_URL}

    # Auto-reply to sender
    send_mail(
        subject='We received your message — Preksha Hospitality',
        message=render_to_string('emails/contact_inquiry_confirmation.txt', context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[inquiry.email],
        html_message=render_to_string('emails/contact_inquiry_confirmation.html', context),
        fail_silently=False,
    )
    logger.info('Contact inquiry confirmation sent to %s', inquiry.email)

    # Notification to the hospitality team
    contact_email = getattr(settings, 'CONTACT_EMAIL', 'contact@prekshahospitality.com')
    send_mail(
        subject=f'[New Inquiry] {inquiry.subject} — {inquiry.name}',
        message=render_to_string('emails/contact_inquiry_notification.txt', context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[contact_email],
        html_message=render_to_string('emails/contact_inquiry_notification.html', context),
        fail_silently=False,
    )
    logger.info('Contact inquiry notification sent to %s', contact_email)
