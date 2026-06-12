from django.urls import path
from .views import (
    LeadListView,
    LeadDetailView,
    LeadCreateView,
    LeadStatusUpdateView,
    LeadNoteCreateView,
    LeadStatsView,
    ContactInquiryCreateView,
)

urlpatterns = [
    path('', LeadListView.as_view(), name='lead-list'),
    path('stats/', LeadStatsView.as_view(), name='lead-stats'),
    path('create/', LeadCreateView.as_view(), name='lead-create'),
    path('contact/', ContactInquiryCreateView.as_view(), name='contact-inquiry'),
    path('<int:pk>/', LeadDetailView.as_view(), name='lead-detail'),
    path('<int:pk>/status/', LeadStatusUpdateView.as_view(), name='lead-status-update'),
    path('<int:booking_id>/notes/', LeadNoteCreateView.as_view(), name='lead-note-create'),
]
