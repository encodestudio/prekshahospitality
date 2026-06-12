from rest_framework import serializers
from .models import Amenity, City, CityPhoto, PlaceToVisit, Property, PropertyAmenity, PropertyPhoto, RoomCategory, RoomPhoto


class PlaceToVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaceToVisit
        fields = ['id', 'city', 'name', 'description', 'distance', 'photo', 'order']


class CityPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CityPhoto
        fields = ['id', 'city', 'photo', 'caption', 'is_primary', 'order']


class CityListSerializer(serializers.ModelSerializer):
    place_count = serializers.SerializerMethodField()
    photo_count = serializers.SerializerMethodField()

    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'description', 'is_active', 'place_count', 'photo_count', 'created_at']

    def get_place_count(self, obj):
        return obj.places.count()

    def get_photo_count(self, obj):
        return obj.photos.count()


class CityDetailSerializer(serializers.ModelSerializer):
    places = PlaceToVisitSerializer(many=True, read_only=True)
    photos = CityPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'description', 'about', 'is_active', 'places', 'photos', 'created_at', 'updated_at']


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'description', 'icon', 'photo', 'is_active']


class RoomPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomPhoto
        fields = ['id', 'photo', 'caption', 'is_primary', 'order']


class RoomCategorySerializer(serializers.ModelSerializer):
    photos = RoomPhotoSerializer(many=True, read_only=True)
    property_id = serializers.IntegerField(source='property.id', read_only=True)

    class Meta:
        model = RoomCategory
        fields = [
            'id', 'property_id', 'name', 'description', 'price_per_night',
            'max_occupancy', 'num_beds', 'bed_type', 'area_sqft',
            'is_active', 'order', 'photos',
        ]


class PropertyPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyPhoto
        fields = ['id', 'photo', 'caption', 'is_primary', 'order']


class PropertyAmenitySerializer(serializers.ModelSerializer):
    amenity = AmenitySerializer(read_only=True)

    class Meta:
        model = PropertyAmenity
        fields = ['amenity', 'is_highlighted']


class PropertyListSerializer(serializers.ModelSerializer):
    city_id = serializers.IntegerField(source='city.id', read_only=True, allow_null=True)
    city_name = serializers.CharField(source='city.name', read_only=True, allow_null=True)
    primary_photo = serializers.SerializerMethodField()
    starting_price = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'city_id', 'city_name', 'location', 'short_description',
            'is_active', 'primary_photo', 'starting_price', 'room_count',
        ]

    def get_primary_photo(self, obj):
        photo = obj.photos.filter(is_primary=True).first() or obj.photos.first()
        if photo:
            request = self.context.get('request')
            return request.build_absolute_uri(photo.photo.url) if request else photo.photo.url
        return None

    def get_starting_price(self, obj):
        prices = [r.price_per_night for r in obj.room_categories.all() if r.is_active]
        return min(prices) if prices else None

    def get_room_count(self, obj):
        return sum(1 for r in obj.room_categories.all() if r.is_active)


class PropertyDetailSerializer(serializers.ModelSerializer):
    city_id = serializers.IntegerField(source='city.id', read_only=True, allow_null=True)
    city_name = serializers.CharField(source='city.name', read_only=True, allow_null=True)
    photos = PropertyPhotoSerializer(many=True, read_only=True)
    property_amenities = PropertyAmenitySerializer(many=True, read_only=True)
    room_categories = RoomCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'city_id', 'city_name', 'location', 'address',
            'description', 'short_description',
            'latitude', 'longitude',
            'phone', 'email', 'whatsapp_number',
            'is_active',
            'photos', 'property_amenities', 'room_categories',
        ]
