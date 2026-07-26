from django.urls import path
from .views import BookingRequestCreateView, BookingStatusView, WhatsAppDeliveryCallbackView

urlpatterns = [
    path('request/', BookingRequestCreateView.as_view(), name='booking-request'),
    path('status/<str:reference>/', BookingStatusView.as_view(), name='booking-status'),
    path('whatsapp-callback/', WhatsAppDeliveryCallbackView.as_view(), name='whatsapp-delivery-callback'),
]
