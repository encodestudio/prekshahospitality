from django.urls import path
from .views import BookingRequestCreateView, BookingStatusView

urlpatterns = [
    path('request/', BookingRequestCreateView.as_view(), name='booking-request'),
    path('status/<str:reference>/', BookingStatusView.as_view(), name='booking-status'),
]
