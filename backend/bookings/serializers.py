from rest_framework import serializers
from django.utils import timezone
from .models import BookingRequest


class BookingRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = [
            'guest_name', 'mobile_number', 'email',
            'total_guests', 'number_of_rooms', 'number_of_adults',
            'number_of_children', 'children_ages',
            'venue', 'room_category',
            'check_in_date', 'check_out_date',
            'special_requests',
        ]

    def validate(self, data):
        check_in = data.get('check_in_date')
        check_out = data.get('check_out_date')
        today = timezone.now().date()

        if check_in and check_in < today:
            raise serializers.ValidationError({'check_in_date': 'Check-in date cannot be in the past.'})

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({'check_out_date': 'Check-out date must be after check-in date.'})

        num_children = data.get('number_of_children', 0)
        children_ages = data.get('children_ages', [])

        if num_children > 0 and len(children_ages) != num_children:
            raise serializers.ValidationError({
                'children_ages': f'Please provide age for each of the {num_children} children.'
            })

        num_adults = data.get('number_of_adults', 0)
        total = data.get('total_guests', 0)
        if num_adults + num_children != total:
            raise serializers.ValidationError({
                'total_guests': 'Total guests must equal adults + children.'
            })

        return data


class BookingRequestDetailSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='venue.name', read_only=True)
    room_category_name = serializers.CharField(source='room_category.name', read_only=True)
    number_of_nights = serializers.SerializerMethodField()

    class Meta:
        model = BookingRequest
        fields = [
            'id', 'booking_reference', 'status',
            'guest_name', 'mobile_number', 'email',
            'total_guests', 'number_of_rooms', 'number_of_adults',
            'number_of_children', 'children_ages',
            'venue', 'property_name',
            'room_category', 'room_category_name',
            'check_in_date', 'check_out_date', 'number_of_nights',
            'special_requests', 'admin_notes', 'created_at', 'updated_at',
        ]

    def get_number_of_nights(self, obj):
        return obj.nights()


class BookingManagerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingRequest
        fields = [
            'guest_name', 'mobile_number', 'email',
            'total_guests', 'number_of_rooms', 'number_of_adults',
            'number_of_children', 'children_ages',
            'venue', 'room_category',
            'check_in_date', 'check_out_date',
            'status', 'special_requests', 'admin_notes',
        ]

    def validate(self, data):
        instance = self.instance
        check_in = data.get('check_in_date', getattr(instance, 'check_in_date', None))
        check_out = data.get('check_out_date', getattr(instance, 'check_out_date', None))

        # On create only: block past check-in dates
        if instance is None and check_in and check_in < timezone.now().date():
            raise serializers.ValidationError({'check_in_date': 'Check-in date cannot be in the past.'})

        if check_in and check_out and check_out <= check_in:
            raise serializers.ValidationError({'check_out_date': 'Check-out date must be after check-in date.'})

        num_children = data.get('number_of_children', getattr(instance, 'number_of_children', 0))
        children_ages = data.get('children_ages', getattr(instance, 'children_ages', []))
        if num_children > 0 and len(children_ages) != num_children:
            raise serializers.ValidationError({
                'children_ages': f'Please provide age for each of the {num_children} children.'
            })
        return data
