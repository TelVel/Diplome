from django.contrib import admin
from .models import Equipment, Location
# Register your models here.
@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['inventory_number', 'name', 'status', 'write_off_date']
    list_filter = ['status', 'location']
    search_fields = ['inventory_number', 'name']

admin.site.register(Location)
