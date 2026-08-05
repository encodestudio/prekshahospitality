import logging
from django.http import HttpResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import BookingRequest
from .serializers import BookingRequestCreateSerializer, BookingRequestDetailSerializer
from .pdf import generate_booking_ticket_pdf, generate_policy_pdf

logger = logging.getLogger(__name__)


class BookingRequestCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = BookingRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()

            # Send confirmation email — failure must never block the booking response
            try:
                from .tasks import send_booking_confirmation_email
                send_booking_confirmation_email(booking.id)
            except Exception as exc:
                logger.error(
                    'Booking confirmation email failed for %s: %s',
                    booking.booking_reference, exc,
                )

            # Send confirmation WhatsApp — failure must never block the booking response
            try:
                from .tasks import send_booking_confirmation_whatsapp
                send_booking_confirmation_whatsapp(booking.id)
            except Exception as exc:
                logger.error(
                    'Booking confirmation WhatsApp failed for %s: %s',
                    booking.booking_reference, exc,
                )

            detail_serializer = BookingRequestDetailSerializer(booking)
            return Response(
                {
                    'message': 'Booking request submitted successfully!',
                    'booking': detail_serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingStatusView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            booking = BookingRequest.objects.select_related(
                'venue', 'room_category'
            ).get(booking_reference=reference)
            serializer = BookingRequestDetailSerializer(booking)
            return Response(serializer.data)
        except BookingRequest.DoesNotExist:
            return Response(
                {'error': 'Booking not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )


class PolicyPDFView(APIView):
    """Public download of the General Booking Policy + Cancellation & Refund Policy as a PDF."""
    permission_classes = [AllowAny]

    def get(self, request):
        pdf_bytes = generate_policy_pdf()
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Preksha-Hospitality-Booking-Policy.pdf"'
        return response


class BookingTicketPDFView(APIView):
    """Public download of a booking's boarding-pass style confirmation ticket, keyed by reference."""
    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            booking = BookingRequest.objects.select_related('venue', 'room_category').get(
                booking_reference=reference
            )
        except BookingRequest.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        pdf_bytes = generate_booking_ticket_pdf(booking)
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Preksha-Ticket-{booking.booking_reference}.pdf"'
        return response


class WhatsAppDeliveryCallbackView(APIView):
    """
    Delivery-status callback for the ICS WABA API (see doc section 4.1).
    ICS calls this URL with the message's status whenever it changes
    (sent/delivered/read/failed) — register the deployed URL with ICS.
    """
    permission_classes = [AllowAny]

    def _handle(self, request):
        params = request.query_params
        logger.info(
            'WhatsApp delivery callback: status=%s mobile=%s mid=%s smsgid=%s sender=%s notes=%s time=%s',
            params.get('qStatus'), params.get('qMobile'), params.get('qMsgRef'),
            params.get('SMSMSGID'), params.get('SENDERID'), params.get('NOTES'), params.get('qDTime'),
        )
        return Response({'status': 'ok'})

    def get(self, request):
        return self._handle(request)

    def post(self, request):
        return self._handle(request)
