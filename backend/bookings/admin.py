from django.contrib import admin
from django.utils.html import format_html
from .models import BookingRequest
from .tasks import send_booking_status_update, send_booking_status_whatsapp


@admin.register(BookingRequest)
class BookingRequestAdmin(admin.ModelAdmin):
    list_display = [
        'booking_reference', 'guest_name', 'mobile_number', 'email',
        'venue', 'room_category', 'check_in_date', 'check_out_date',
        'total_guests', 'status_badge', 'created_at',
    ]
    list_filter = ['status', 'venue', 'check_in_date', 'created_at']
    search_fields = ['booking_reference', 'guest_name', 'mobile_number', 'email']
    readonly_fields = ['booking_reference', 'created_at', 'updated_at', 'num_nights']
    list_editable = []
    date_hierarchy = 'created_at'
    ordering = ['-created_at']

    fieldsets = (
        ('Booking Reference', {
            'fields': ('booking_reference', 'status', 'created_at', 'updated_at')
        }),
        ('Guest Information', {
            'fields': ('guest_name', 'mobile_number', 'email')
        }),
        ('Stay Details', {
            'fields': (
                'venue', 'room_category',
                'check_in_date', 'check_out_date', 'num_nights',
                'number_of_rooms',
            )
        }),
        ('Guest Composition', {
            'fields': ('total_guests', 'number_of_adults', 'number_of_children', 'children_ages')
        }),
        ('Notes', {
            'fields': ('special_requests', 'admin_notes'),
            'classes': ('collapse',),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': '#FF9800',
            'confirmed': '#4CAF50',
            'cancelled': '#F44336',
            'completed': '#2196F3',
            'no_show': '#9E9E9E',
        }
        color = colors.get(obj.status, '#000')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 8px;border-radius:4px;font-size:11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def num_nights(self, obj):
        return obj.nights()
    num_nights.short_description = 'Nights'

    def save_model(self, request, obj, form, change):
        if change:
            old_obj = BookingRequest.objects.get(pk=obj.pk)
            old_status = old_obj.status
        else:
            old_status = None
        super().save_model(request, obj, form, change)
        if change and old_status != obj.status and obj.status in [
            BookingRequest.STATUS_CONFIRMED, BookingRequest.STATUS_CANCELLED
        ]:
            try:
                send_booking_status_update(obj.id)
            except Exception as exc:
                import logging
                logging.getLogger(__name__).error(
                    'Status update email failed for %s: %s', obj.booking_reference, exc
                )
            try:
                send_booking_status_whatsapp(obj.id)
            except Exception as exc:
                import logging
                logging.getLogger(__name__).error(
                    'Status update WhatsApp failed for %s: %s', obj.booking_reference, exc
                )
