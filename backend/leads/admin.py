from django.contrib import admin
from .models import LeadNote, LeadActivity, LeadAdmin as LeadAdminProfile, ContactInquiry


class LeadNoteInline(admin.TabularInline):
    model = LeadNote
    extra = 0
    readonly_fields = ['added_by', 'created_at']


class LeadActivityInline(admin.TabularInline):
    model = LeadActivity
    extra = 0
    readonly_fields = ['action', 'description', 'performed_by', 'created_at']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(LeadAdminProfile)
class LeadAdminProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'is_active']
    list_filter = ['is_active']
    filter_horizontal = ['assigned_properties']


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['name', 'email', 'phone', 'subject', 'message', 'created_at']
    ordering = ['-created_at']

    def has_add_permission(self, request):
        return False
