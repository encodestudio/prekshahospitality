from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
import logging

logger = logging.getLogger(__name__)


def send_booking_confirmation_email(booking_id):
    """Send booking-received confirmation to the guest, and alert the booking manager."""
    from .models import BookingRequest
    booking = BookingRequest.objects.select_related('venue', 'room_category').get(id=booking_id)

    context = {
        'booking': booking,
        'property': booking.venue,
        'nights': booking.nights(),
        'frontend_url': settings.FRONTEND_URL,
        'manage_url': f'{settings.FRONTEND_URL}/manage',
    }

    # ── Guest confirmation (copied to the bookings team) ───────────────────────
    guest_subject = (
        f'Booking Request Received — {booking.booking_reference} | {booking.venue.name}'
    )
    guest_recipients = [booking.email]
    if settings.BOOKINGS_TEAM_EMAIL:
        guest_recipients.append(settings.BOOKINGS_TEAM_EMAIL)
    send_mail(
        subject=guest_subject,
        message=render_to_string('emails/booking_confirmation.txt', context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=guest_recipients,
        html_message=render_to_string('emails/booking_confirmation.html', context),
        fail_silently=False,
    )
    logger.info('Booking confirmation email sent to %s for %s', guest_recipients, booking.booking_reference)

    # ── Manager notification ──────────────────────────────────────────────────
    manager_email = getattr(settings, 'BOOKING_MANAGER_EMAIL', None)
    if manager_email:
        manager_subject = (
            f'[New Booking] {booking.booking_reference} — {booking.guest_name} '
            f'| {booking.venue.name} | {booking.check_in_date.strftime("%d %b %Y")}'
        )
        send_mail(
            subject=manager_subject,
            message=render_to_string('emails/booking_manager_notification.txt', context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[manager_email],
            html_message=render_to_string('emails/booking_manager_notification.html', context),
            fail_silently=False,
        )
        logger.info('Manager notification email sent to %s for %s', manager_email, booking.booking_reference)


def send_booking_status_update(booking_id):
    """Send confirmed/cancelled status update to the guest. Called directly (no Celery required)."""
    from .models import BookingRequest
    booking = BookingRequest.objects.select_related('venue', 'room_category').get(id=booking_id)

    if booking.status == BookingRequest.STATUS_CONFIRMED:
        subject = f'Booking Confirmed! — {booking.booking_reference}'
        status_emoji = '✅'
        status_text = 'CONFIRMED'
    elif booking.status == BookingRequest.STATUS_CANCELLED:
        subject = f'Booking Cancelled — {booking.booking_reference}'
        status_emoji = '❌'
        status_text = 'CANCELLED'
    else:
        return

    context = {
        'booking': booking,
        'property': booking.venue,
        'nights': booking.nights(),
        'status_emoji': status_emoji,
        'status_text': status_text,
        'frontend_url': settings.FRONTEND_URL,
    }

    html_message = render_to_string('emails/booking_status_update.html', context)
    plain_message = render_to_string('emails/booking_status_update.txt', context)

    recipients = [booking.email]
    if settings.BOOKINGS_TEAM_EMAIL:
        recipients.append(settings.BOOKINGS_TEAM_EMAIL)

    email = EmailMultiAlternatives(
        subject=subject,
        body=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
    )
    email.attach_alternative(html_message, 'text/html')

    if booking.status == BookingRequest.STATUS_CONFIRMED:
        try:
            from .pdf import generate_booking_ticket_pdf
            ticket_pdf = generate_booking_ticket_pdf(booking)
            email.attach(f'Preksha-Ticket-{booking.booking_reference}.pdf', ticket_pdf, 'application/pdf')
        except Exception as exc:
            logger.error('Booking ticket PDF generation failed for %s: %s', booking.booking_reference, exc)

    email.send(fail_silently=False)
    logger.info('Booking status update email sent to %s for %s → %s', recipients, booking.booking_reference, booking.status)


def send_booking_confirmation_whatsapp(booking_id):
    """Send a WhatsApp booking-received message to the guest via the ICS WABA API."""
    from .models import BookingRequest
    from .whatsapp_client import send_whatsapp_template

    booking = BookingRequest.objects.select_related('venue').get(id=booking_id)

    send_whatsapp_template(
        to=booking.mobile_number,
        template_name=settings.ICS_WHATSAPP_REQUEST_TEMPLATE,
        placeholders=[
            booking.guest_name,
            booking.venue.name if booking.venue else '',
            booking.booking_reference,
            booking.check_in_date.strftime('%d %b %Y'),
            booking.check_out_date.strftime('%d %b %Y'),
        ],
        smsgid=booking.booking_reference,
    )
    logger.info('Booking confirmation WhatsApp sent for %s', booking.booking_reference)


def send_booking_status_whatsapp(booking_id):
    """Send a WhatsApp status-update message to the guest via the ICS WABA API."""
    from .models import BookingRequest
    from .whatsapp_client import send_whatsapp_template

    booking = BookingRequest.objects.select_related('venue').get(id=booking_id)
    venue_name = booking.venue.name if booking.venue else ''

    if booking.status == BookingRequest.STATUS_CONFIRMED:
        template_name = settings.ICS_WHATSAPP_CONFIRMED_TEMPLATE
        placeholders = [
            booking.guest_name,
            venue_name,
            booking.booking_reference,
            booking.check_in_date.strftime('%d %b %Y'),
            booking.check_out_date.strftime('%d %b %Y'),
        ]
    elif booking.status == BookingRequest.STATUS_CANCELLED:
        template_name = 'booking_cancelled'
        placeholders = [
            booking.guest_name,
            venue_name,
            booking.booking_reference,
            booking.check_in_date.strftime('%d %b %Y'),
        ]
    else:
        return

    send_whatsapp_template(
        to=booking.mobile_number,
        template_name=template_name,
        placeholders=placeholders,
        smsgid=booking.booking_reference,
    )
    logger.info('Booking status WhatsApp sent for %s → %s', booking.booking_reference, booking.status)

    if booking.status == BookingRequest.STATUS_CONFIRMED:
        try:
            send_booking_ticket_whatsapp(booking.id)
        except Exception as exc:
            logger.error(
                'Booking ticket WhatsApp document failed for %s (requires the "%s" Document-header '
                'template to exist and be approved on the ICS WABA dashboard): %s',
                booking.booking_reference, settings.ICS_WHATSAPP_TICKET_TEMPLATE, exc,
            )


def send_booking_ticket_whatsapp(booking_id):
    """
    Send the boarding-pass style booking ticket PDF as a WhatsApp document.

    Requires a Document-header WhatsApp template (name configured via
    ICS_WHATSAPP_TICKET_TEMPLATE, default "booking_ticket") to already exist and be
    approved in the ICS/WhatsApp Business template gallery — that approval happens
    outside this codebase, via the ICS dashboard. Until it exists, this will fail
    (callers should treat it as best-effort, same as the rest of the WhatsApp sends).
    """
    from .models import BookingRequest
    from .whatsapp_client import send_whatsapp_template

    booking = BookingRequest.objects.select_related('venue').get(id=booking_id)
    venue_name = booking.venue.name if booking.venue else ''
    ticket_url = f'{settings.BACKEND_URL}/api/bookings/ticket/{booking.booking_reference}/'

    send_whatsapp_template(
        to=booking.mobile_number,
        template_name=settings.ICS_WHATSAPP_TICKET_TEMPLATE,
        placeholders=[
            booking.guest_name,
            venue_name,
            booking.booking_reference,
            booking.check_in_date.strftime('%d %b %Y'),
            booking.check_out_date.strftime('%d %b %Y'),
        ],
        smsgid=booking.booking_reference,
        media_url=ticket_url,
    )
    logger.info('Booking ticket WhatsApp document sent for %s (%s)', booking.booking_reference, ticket_url)
