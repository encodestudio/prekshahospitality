import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import BookingRequest
from .serializers import BookingRequestCreateSerializer, BookingRequestDetailSerializer

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
