from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Amenity, City, CityPhoto, PlaceToVisit, Property, RoomCategory
from .serializers import (
    AmenitySerializer,
    CityDetailSerializer,
    CityListSerializer,
    CityPhotoSerializer,
    PlaceToVisitSerializer,
    PropertyListSerializer,
    PropertyDetailSerializer,
    RoomCategorySerializer,
)


class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenity.objects.filter(is_active=True)
    serializer_class = AmenitySerializer
    permission_classes = [permissions.AllowAny]


class PropertyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Property.objects.filter(is_active=True).prefetch_related(
        'photos', 'property_amenities__amenity', 'room_categories__photos'
    )
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city']

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        return PropertyDetailSerializer

    @action(detail=True, methods=['get'])
    def rooms(self, request, pk=None):
        property_obj = self.get_object()
        rooms = RoomCategory.objects.filter(
            property=property_obj, is_active=True
        ).prefetch_related('photos')
        serializer = RoomCategorySerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.filter(is_active=True).prefetch_related('places', 'photos')

    def get_serializer_class(self):
        if self.action == 'list':
            return CityListSerializer
        return CityDetailSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class PlaceToVisitViewSet(viewsets.ModelViewSet):
    serializer_class = PlaceToVisitSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city']

    def get_queryset(self):
        return PlaceToVisit.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class CityPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = CityPhotoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['city']

    def get_queryset(self):
        return CityPhoto.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_destroy(self, instance):
        instance.photo.delete(save=False)
        instance.delete()


class RoomCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoomCategory.objects.filter(is_active=True).prefetch_related('photos')
    serializer_class = RoomCategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['property']
