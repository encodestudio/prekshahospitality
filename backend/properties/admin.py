from django.contrib import admin
from django.utils.html import format_html
from .models import Amenity, City, CityPhoto, PlaceToVisit, Property, PropertyAmenity, PropertyPhoto, RoomCategory, RoomPhoto


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


class RoomCategoryInline(admin.StackedInline):
    model = RoomCategory
    extra = 0
    show_change_link = True
    fields = ['name', 'price_per_night', 'max_occupancy', 'num_beds', 'bed_type', 'area_sqft', 'is_active', 'order']


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'location', 'is_active', 'created_at']
    list_filter = ['city', 'is_active']
    search_fields = ['name', 'city__name', 'location', 'address']
    list_editable = ['is_active']
    inlines = [PropertyPhotoInline, PropertyAmenityInline, RoomCategoryInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'city', 'location', 'address', 'is_active')
        }),
        ('Description', {
            'fields': ('short_description', 'description')
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'whatsapp_number')
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
    list_display = ['name', 'property', 'price_per_night', 'max_occupancy', 'is_active', 'order']
    list_filter = ['property', 'is_active']
    search_fields = ['name', 'property__name']
    list_editable = ['price_per_night', 'is_active', 'order']
    inlines = [RoomPhotoInline]
    autocomplete_fields = ['property']
