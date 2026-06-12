from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AmenityViewSet, CityViewSet, CityPhotoViewSet,
    PlaceToVisitViewSet, PropertyViewSet, RoomCategoryViewSet,
)

router = DefaultRouter()
router.register(r'amenities', AmenityViewSet, basename='amenity')
router.register(r'cities', CityViewSet, basename='city')
router.register(r'cities-places', PlaceToVisitViewSet, basename='city-place')
router.register(r'cities-photos', CityPhotoViewSet, basename='city-photo')
router.register(r'rooms/list', RoomCategoryViewSet, basename='room-category')
router.register(r'', PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),
]
