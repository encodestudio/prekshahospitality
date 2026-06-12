from django.db import models
from django.contrib.auth.models import User
from bookings.models import BookingRequest


class ContactInquiry(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=300)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Inquiry'
        verbose_name_plural = 'Contact Inquiries'

    def __str__(self):
        return f'{self.name} — {self.subject}'


class LeadNote(models.Model):
    booking = models.ForeignKey(BookingRequest, on_delete=models.CASCADE, related_name='lead_notes')
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lead Note'
        verbose_name_plural = 'Lead Notes'

    def __str__(self):
        return f'Note for {self.booking.booking_reference} by {self.added_by}'


class LeadActivity(models.Model):
    ACTION_CREATED = 'created'
    ACTION_STATUS_CHANGED = 'status_changed'
    ACTION_NOTE_ADDED = 'note_added'
    ACTION_EMAIL_SENT = 'email_sent'
    ACTION_WHATSAPP_SENT = 'whatsapp_sent'
    ACTION_CALLED = 'called'

    ACTION_CHOICES = [
        (ACTION_CREATED, 'Booking Created'),
        (ACTION_STATUS_CHANGED, 'Status Changed'),
        (ACTION_NOTE_ADDED, 'Note Added'),
        (ACTION_EMAIL_SENT, 'Email Sent'),
        (ACTION_WHATSAPP_SENT, 'WhatsApp Sent'),
        (ACTION_CALLED, 'Called Guest'),
    ]

    booking = models.ForeignKey(BookingRequest, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    description = models.TextField()
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lead Activity'
        verbose_name_plural = 'Lead Activities'

    def __str__(self):
        return f'{self.get_action_display()} - {self.booking.booking_reference}'


class LeadAdmin(models.Model):
    """Extended profile for lead management admins."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lead_admin_profile')
    assigned_properties = models.ManyToManyField(
        'properties.Property', blank=True, related_name='assigned_admins'
    )
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Lead Admin'
        verbose_name_plural = 'Lead Admins'

    def __str__(self):
        return f'Lead Admin: {self.user.get_full_name() or self.user.username}'
