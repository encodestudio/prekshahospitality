from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Amenity, City, CityPhoto, PlaceToVisit, Property, PropertyAmenity,
    PropertyEmail, PropertyPhone, PropertyPhoto, RoomCategory, RoomPhoto,
)


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'photo_preview', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    list_editable = ['is_active']

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:40px;border-radius:4px;" />', obj.photo.url)
        return '—'
    photo_preview.short_description = 'Photo'


class PropertyAmenityInline(admin.TabularInline):
    model = PropertyAmenity
    extra = 1
    autocomplete_fields = ['amenity']


class PropertyPhotoInline(admin.TabularInline):
    model = PropertyPhoto
    extra = 1
    fields = ['photo', 'caption', 'is_primary', 'order', 'photo_preview']
    readonly_fields = ['photo_preview']

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;" />', obj.photo.url)
        return '—'
    photo_preview.short_description = 'Preview'


class RoomPhotoInline(admin.TabularInline):
    model = RoomPhoto
    extra = 1
    fields = ['photo', 'caption', 'is_primary', 'order', 'photo_preview']
    readonly_fields = ['photo_preview']

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;" />', obj.photo.url)
        return '—'
    photo_preview.short_description = 'Preview'


class PropertyPhoneInline(admin.TabularInline):
    model = PropertyPhone
    extra = 1
    fields = ['phone', 'label', 'is_primary', 'order']


class PropertyEmailInline(admin.TabularInline):
    model = PropertyEmail
    extra = 1
    fields = ['email', 'label', 'is_primary', 'order']


class RoomCategoryInline(admin.StackedInline):
    model = RoomCategory
    extra = 0
    show_change_link = True
    fields = [
        'name', 'price_per_night', 'offer_name', 'discount_type', 'discount_value',
        'max_occupancy', 'num_beds', 'bed_type', 'area_sqft', 'is_active', 'order',
    ]


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'location', 'is_active', 'created_at']
    list_filter = ['city', 'is_active']
    search_fields = ['name', 'city__name', 'location', 'address']
    list_editable = ['is_active']
    inlines = [PropertyPhoneInline, PropertyEmailInline, PropertyPhotoInline, PropertyAmenityInline, RoomCategoryInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'city', 'location', 'address', 'is_active')
        }),
        ('Description', {
            'fields': ('short_description', 'description')
        }),
        ('Contact', {
            'fields': ('whatsapp_number',),
            'description': 'Add phone numbers and email addresses below. Mark one of each as primary.',
        }),
        ('Location', {
            'fields': ('latitude', 'longitude'),
            'classes': ('collapse',),
        }),
    )


class PlaceToVisitInline(admin.TabularInline):
    model = PlaceToVisit
    extra = 1
    fields = ['name', 'description', 'distance', 'photo', 'order']


class CityPhotoInline(admin.TabularInline):
    model = CityPhoto
    extra = 1
    fields = ['photo', 'caption', 'is_primary', 'order', 'photo_preview']
    readonly_fields = ['photo_preview']

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;" />', obj.photo.url)
        return '—'
    photo_preview.short_description = 'Preview'


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ['name', 'state', 'is_active', 'created_at']
    list_filter = ['is_active', 'state']
    search_fields = ['name', 'state', 'about']
    list_editable = ['is_active']
    inlines = [PlaceToVisitInline, CityPhotoInline]
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'state', 'is_active')}),
        ('Content', {'fields': ('description', 'about')}),
    )


@admin.register(RoomCategory)
class RoomCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'property', 'price_per_night', 'discount_badge', 'max_occupancy', 'is_active', 'order']
    list_filter = ['property', 'is_active', 'discount_type']
    search_fields = ['name', 'property__name', 'offer_name']
    list_editable = ['price_per_night', 'is_active', 'order']
    inlines = [RoomPhotoInline]
    autocomplete_fields = ['property']
    fieldsets = (
        ('Basic Info', {
            'fields': ('property', 'name', 'description', 'is_active', 'order'),
        }),
        ('Room Details', {
            'fields': ('max_occupancy', 'num_beds', 'bed_type', 'area_sqft'),
        }),
        ('Pricing', {
            'fields': ('price_per_night',),
        }),
        ('Discount / Offer', {
            'fields': ('offer_name', 'discount_type', 'discount_value'),
            'description': 'Leave discount type blank for no discount. Percentage should be between 0 and 100.',
        }),
    )

    def discount_badge(self, obj):
        if not obj.has_discount:
            return '—'
        return format_html(
            '<span style="color:#B8460A;font-weight:600;">{}</span><br>'
            '<span style="color:#888;font-size:11px;text-decoration:line-through;">₹{}</span> '
            '<span style="color:#1a7a3c;font-size:11px;font-weight:600;">₹{}</span>',
            obj.offer_name or 'Discount',
            obj.price_per_night,
            obj.discounted_price_per_night,
        )
    discount_badge.short_description = 'Offer'
