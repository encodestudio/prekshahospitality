from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from properties.models import Property, RoomCategory


class BookingRequest(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'
    STATUS_NO_SHOW = 'no_show'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_NO_SHOW, 'No Show'),
    ]

    # Guest Details
    guest_name = models.CharField(max_length=300)
    mobile_number = models.CharField(max_length=20)
    email = models.EmailField()
    total_guests = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    number_of_rooms = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    number_of_adults = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    number_of_children = models.PositiveIntegerField(default=0)
    children_ages = models.JSONField(default=list, blank=True, help_text='List of ages for each child')

    # Booking Details
    venue = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True, related_name='bookings')
    room_category = models.ForeignKey(
        RoomCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings'
    )
    check_in_date = models.DateField()
    check_out_date = models.DateField()

    # Status & Tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    booking_reference = models.CharField(max_length=20, unique=True, blank=True)
    special_requests = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking Request'
        verbose_name_plural = 'Booking Requests'

    def __str__(self):
        return f'{self.booking_reference} - {self.guest_name} ({self.check_in_date})'

    def nights(self):
        if self.check_in_date and self.check_out_date:
            return (self.check_out_date - self.check_in_date).days
        return 0

    def save(self, *args, **kwargs):
        if not self.booking_reference:
            import random
            import string
            self.booking_reference = 'PKS' + ''.join(
                random.choices(string.digits, k=7)
            )
        super().save(*args, **kwargs)
