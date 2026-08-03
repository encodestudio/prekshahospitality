from decimal import ROUND_HALF_UP, Decimal

from django.core.exceptions import ValidationError
from django.db import models

# RoomCategory below has a field literally named `property`, which shadows the
# `property` builtin inside that class body — alias it here so it stays usable.
_builtin_property = property


class Amenity(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=100, blank=True, help_text='Material UI icon name')
    photo = models.ImageField(upload_to='amenities/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Amenity'
        verbose_name_plural = 'Amenities'
        ordering = ['name']

    def __str__(self):
        return self.name


class Property(models.Model):
    name = models.CharField(max_length=300)
    city = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True, related_name='properties')
    location = models.CharField(max_length=500, help_text='Specific location/area within the city')
    address = models.TextField()
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True)
    amenities = models.ManyToManyField(Amenity, through='PropertyAmenity', blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} - {self.city.name if self.city else "No City"}'

    @property
    def primary_phone(self):
        phone = self.phones.filter(is_primary=True).first() or self.phones.first()
        return phone.phone if phone else ''

    @property
    def primary_email(self):
        email = self.emails.filter(is_primary=True).first() or self.emails.first()
        return email.email if email else ''


class PropertyAmenity(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='property_amenities')
    amenity = models.ForeignKey(Amenity, on_delete=models.CASCADE, related_name='amenity_properties')
    is_highlighted = models.BooleanField(default=False, help_text='Show prominently on property page')

    class Meta:
        unique_together = ('property', 'amenity')
        verbose_name = 'Property Amenity'
        verbose_name_plural = 'Property Amenities'


class PropertyPhoto(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='properties/')
    caption = models.CharField(max_length=300, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Property Photo'
        verbose_name_plural = 'Property Photos'

    def __str__(self):
        return f'{self.property.name} - Photo {self.id}'


class PropertyPhone(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='phones')
    phone = models.CharField(max_length=20)
    label = models.CharField(max_length=100, blank=True, help_text='e.g., Reception, Manager')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_primary', 'order']
        verbose_name = 'Property Phone'
        verbose_name_plural = 'Property Phones'

    def __str__(self):
        return f'{self.property.name} - {self.phone}'


class PropertyEmail(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='emails')
    email = models.EmailField()
    label = models.CharField(max_length=100, blank=True, help_text='e.g., Reservations, Support')
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_primary', 'order']
        verbose_name = 'Property Email'
        verbose_name_plural = 'Property Emails'

    def __str__(self):
        return f'{self.property.name} - {self.email}'


class RoomCategory(models.Model):
    DISCOUNT_TYPE_FLAT = 'flat'
    DISCOUNT_TYPE_PERCENTAGE = 'percentage'
    DISCOUNT_TYPE_CHOICES = [
        (DISCOUNT_TYPE_FLAT, 'Flat Amount (₹)'),
        (DISCOUNT_TYPE_PERCENTAGE, 'Percentage (%)'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='room_categories')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    max_occupancy = models.PositiveIntegerField(default=2)
    num_beds = models.PositiveIntegerField(default=1)
    bed_type = models.CharField(max_length=100, blank=True, help_text='e.g., King, Queen, Twin')
    area_sqft = models.PositiveIntegerField(null=True, blank=True)
    offer_name = models.CharField(max_length=200, blank=True, help_text='e.g., Diwali Offer')
    discount_type = models.CharField(
        max_length=10, choices=DISCOUNT_TYPE_CHOICES, blank=True,
        help_text='Leave blank for no discount',
    )
    discount_value = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Flat amount in ₹, or a percentage from 0-100, depending on the discount type above',
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'price_per_night']
        verbose_name = 'Room Category'
        verbose_name_plural = 'Room Categories'

    def __str__(self):
        return f'{self.property.name} - {self.name}'

    def clean(self):
        super().clean()
        if self.discount_type and self.discount_value is None:
            raise ValidationError({'discount_value': 'Enter a discount value when a discount type is selected.'})
        if self.discount_value is not None and self.discount_value < 0:
            raise ValidationError({'discount_value': 'Discount value cannot be negative.'})
        if self.discount_type == self.DISCOUNT_TYPE_PERCENTAGE and self.discount_value is not None and self.discount_value > 100:
            raise ValidationError({'discount_value': 'Percentage discount cannot exceed 100.'})

    @_builtin_property
    def has_discount(self):
        return bool(self.discount_type and self.discount_value and self.discount_value > 0)

    @_builtin_property
    def discounted_price_per_night(self):
        if not self.has_discount:
            return self.price_per_night
        if self.discount_type == self.DISCOUNT_TYPE_FLAT:
            discounted = self.price_per_night - self.discount_value
        else:
            pct = min(self.discount_value, Decimal(100))
            discounted = self.price_per_night * (1 - (pct / Decimal(100)))
        discounted = max(discounted, Decimal(0))
        return discounted.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class City(models.Model):
    name = models.CharField(max_length=200)
    state = models.CharField(max_length=200, blank=True)
    description = models.CharField(max_length=500, blank=True, help_text='Short tagline/summary')
    about = models.TextField(blank=True, help_text='Detailed description of the city')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'City'
        verbose_name_plural = 'Cities'
        ordering = ['name']

    def __str__(self):
        return f'{self.name}, {self.state}' if self.state else self.name


class PlaceToVisit(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='places')
    name = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    distance = models.CharField(max_length=100, blank=True, help_text='e.g., 2 km from hotel')
    photo = models.ImageField(upload_to='places/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Place to Visit'
        verbose_name_plural = 'Places to Visit'

    def __str__(self):
        return f'{self.city.name} – {self.name}'


class CityPhoto(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='cities/')
    caption = models.CharField(max_length=300, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'City Photo'
        verbose_name_plural = 'City Photos'

    def __str__(self):
        return f'{self.city.name} – Photo {self.id}'


class RoomPhoto(models.Model):
    room_category = models.ForeignKey(RoomCategory, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='rooms/')
    caption = models.CharField(max_length=300, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Room Photo'
        verbose_name_plural = 'Room Photos'

    def __str__(self):
        return f'{self.room_category.name} - Photo {self.id}'
