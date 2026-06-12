from django.conf import settings
from django.core.mail import send_mail
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

    # ── Guest confirmation ────────────────────────────────────────────────────
    guest_subject = (
        f'Booking Request Received — {booking.booking_reference} | {booking.venue.name}'
    )
    send_mail(
        subject=guest_subject,
        message=render_to_string('emails/booking_confirmation.txt', context),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[booking.email],
        html_message=render_to_string('emails/booking_confirmation.html', context),
        fail_silently=False,
    )
    logger.info('Booking confirmation email sent to guest for %s', booking.booking_reference)

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

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[booking.email],
        html_message=html_message,
        fail_silently=False,
    )
    logger.info('Booking status update email sent for %s → %s', booking.booking_reference, booking.status)
