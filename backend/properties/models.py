from django.db import models


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
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
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


class RoomCategory(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='room_categories')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    max_occupancy = models.PositiveIntegerField(default=2)
    num_beds = models.PositiveIntegerField(default=1)
    bed_type = models.CharField(max_length=100, blank=True, help_text='e.g., King, Queen, Twin')
    area_sqft = models.PositiveIntegerField(null=True, blank=True)
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
