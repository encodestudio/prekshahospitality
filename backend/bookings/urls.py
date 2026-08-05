from django.urls import path
from .views import (
    BookingRequestCreateView, BookingStatusView, BookingTicketPDFView,
    PolicyPDFView, WhatsAppDeliveryCallbackView,
)

urlpatterns = [
    path('request/', BookingRequestCreateView.as_view(), name='booking-request'),
    path('status/<str:reference>/', BookingStatusView.as_view(), name='booking-status'),
    path('policy-pdf/', PolicyPDFView.as_view(), name='booking-policy-pdf'),
    path('ticket/<str:reference>/', BookingTicketPDFView.as_view(), name='booking-ticket-pdf'),
    path('whatsapp-callback/', WhatsAppDeliveryCallbackView.as_view(), name='whatsapp-delivery-callback'),
]
