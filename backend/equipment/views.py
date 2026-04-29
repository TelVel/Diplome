from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Equipment, Location
from .serializers import EquipmentSerializer, LocationSerializer
from rest_framework.permissions import IsAuthenticated

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'location']
    search_fields = ['inventory_number', 'name', 'barcode', 'serial_number']
    ordering_fields = ['inventory_number', 'name', 'status', 'write_off_date', 'purchase_data', 'location__name']
    ordering = ['inventory_number']
