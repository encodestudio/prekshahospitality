import logging

from rest_framework import generics, status as drf_status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from bookings.models import BookingRequest
from bookings.serializers import BookingManagerUpdateSerializer
from bookings.tasks import send_booking_status_update
from .models import LeadNote, LeadActivity
from .serializers import (
    LeadDetailSerializer,
    LeadStatusUpdateSerializer,
    LeadNoteSerializer,
    ContactInquirySerializer,
)

logger = logging.getLogger(__name__)


class LeadPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class IsLeadAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or hasattr(request.user, 'lead_admin_profile')
        )


class LeadListView(generics.ListAPIView):
    serializer_class = LeadDetailSerializer
    permission_classes = [IsLeadAdmin]
    pagination_class = LeadPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'venue']
    search_fields = ['booking_reference', 'guest_name', 'mobile_number', 'email']
    ordering_fields = ['created_at', 'check_in_date', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs = BookingRequest.objects.select_related(
            'venue', 'room_category'
        ).prefetch_related('lead_notes', 'activities')
        if hasattr(user, 'lead_admin_profile') and not user.is_staff:
            assigned = user.lead_admin_profile.assigned_properties.all()
            qs = qs.filter(venue__in=assigned)
        return qs


class LeadCreateView(generics.CreateAPIView):
    serializer_class = BookingManagerUpdateSerializer
    permission_classes = [IsLeadAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        LeadActivity.objects.create(
            booking=booking,
            action=LeadActivity.ACTION_CREATED,
            description=f'Booking created manually by {request.user.username}',
            performed_by=request.user,
        )
        refreshed = (
            BookingRequest.objects.select_related('venue', 'room_category')
            .prefetch_related('lead_notes__added_by', 'activities__performed_by')
            .get(pk=booking.pk)
        )
        return Response(
            LeadDetailSerializer(refreshed, context={'request': request}).data,
            status=drf_status.HTTP_201_CREATED,
        )


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsLeadAdmin]

    def get_queryset(self):
        return (
            BookingRequest.objects.select_related('venue', 'room_category')
            .prefetch_related('lead_notes__added_by', 'activities__performed_by')
        )

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return BookingManagerUpdateSerializer
        return LeadDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_status = instance.status
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        if instance.status != old_status:
            LeadActivity.objects.create(
                booking=instance,
                action=LeadActivity.ACTION_STATUS_CHANGED,
                description=f'Status changed from {old_status} to {instance.status}',
                performed_by=request.user,
            )
            if instance.status in (BookingRequest.STATUS_CONFIRMED, BookingRequest.STATUS_CANCELLED):
                try:
                    send_booking_status_update(instance.id)
                except Exception as exc:
                    logger.error('Status update email failed for %s: %s', instance.booking_reference, exc)

        refreshed = (
            BookingRequest.objects.select_related('venue', 'room_category')
            .prefetch_related('lead_notes__added_by', 'activities__performed_by')
            .get(pk=instance.pk)
        )
        return Response(LeadDetailSerializer(refreshed, context={'request': request}).data)


class LeadStatusUpdateView(generics.UpdateAPIView):
    queryset = BookingRequest.objects.all()
    serializer_class = LeadStatusUpdateSerializer
    permission_classes = [IsLeadAdmin]
    http_method_names = ['patch']

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        instance = serializer.save()
        LeadActivity.objects.create(
            booking=instance,
            action=LeadActivity.ACTION_STATUS_CHANGED,
            description=f'Status changed from {old_status} to {instance.status}',
            performed_by=self.request.user,
        )
        if instance.status in (BookingRequest.STATUS_CONFIRMED, BookingRequest.STATUS_CANCELLED):
            try:
                send_booking_status_update(instance.id)
            except Exception as exc:
                logger.error('Status update email failed for %s: %s', instance.booking_reference, exc)


class LeadNoteCreateView(generics.CreateAPIView):
    serializer_class = LeadNoteSerializer
    permission_classes = [IsLeadAdmin]

    def perform_create(self, serializer):
        booking_id = self.kwargs['booking_id']
        booking = BookingRequest.objects.get(id=booking_id)
        note = serializer.save(booking=booking, added_by=self.request.user)
        LeadActivity.objects.create(
            booking=booking,
            action=LeadActivity.ACTION_NOTE_ADDED,
            description=f'Note added: {note.note[:100]}',
            performed_by=self.request.user,
        )


class LeadStatsView(APIView):
    permission_classes = [IsLeadAdmin]

    def get(self, request):
        qs = BookingRequest.objects.all()
        if hasattr(request.user, 'lead_admin_profile') and not request.user.is_staff:
            assigned = request.user.lead_admin_profile.assigned_properties.all()
            qs = qs.filter(venue__in=assigned)
        return Response({
            'total': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'confirmed': qs.filter(status='confirmed').count(),
            'cancelled': qs.filter(status='cancelled').count(),
            'completed': qs.filter(status='completed').count(),
        })


class ContactInquiryCreateView(generics.CreateAPIView):
    serializer_class = ContactInquirySerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = serializer.save()
        try:
            from .tasks import send_contact_inquiry_emails
            send_contact_inquiry_emails(inquiry.id)
        except Exception as exc:
            logger.error('Contact inquiry email failed for inquiry #%s: %s', inquiry.id, exc)
        return Response(
            {'message': 'Your message has been sent. We will get back to you shortly.'},
            status=drf_status.HTTP_201_CREATED,
        )
