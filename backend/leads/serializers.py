from rest_framework import serializers
from bookings.models import BookingRequest
from bookings.serializers import BookingRequestDetailSerializer
from .models import LeadNote, LeadActivity, ContactInquiry


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message']


class LeadNoteSerializer(serializers.ModelSerializer):
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)

    class Meta:
        model = LeadNote
        fields = ['id', 'note', 'added_by_name', 'created_at']
        read_only_fields = ['added_by_name', 'created_at']


class LeadActivitySerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = LeadActivity
        fields = ['id', 'action', 'action_display', 'description', 'performed_by_name', 'created_at']


class LeadDetailSerializer(BookingRequestDetailSerializer):
    lead_notes = LeadNoteSerializer(many=True, read_only=True)
    activities = LeadActivitySerializer(many=True, read_only=True)

    class Meta(BookingRequestDetailSerializer.Meta):
        fields = BookingRequestDetailSerializer.Meta.fields + ['lead_notes', 'activities']


class LeadStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = ['status', 'admin_notes']
