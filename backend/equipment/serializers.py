from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Equipment, Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

class EquipmentSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source='location.name', read_only=True)
    responsible_person_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Equipment
        fields = [
            'id', 'inventory_number', 'name', 'serial_number', 'barcode',
            'status', 'location', 'location_name', 'responsible_person',
            'responsible_person_name', 'purchase_date', 'write_off_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'location_name']
    
    def get_responsible_person_name(self, obj):
        if obj.responsible_person:
            return obj.responsible_person.get_full_name() or obj.responsible_person.username
        return '—'
