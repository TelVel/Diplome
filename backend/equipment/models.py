from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Location(models.Model):
    """Местоположение"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Equipment(models.Model):
    """Основная карточка оборудования"""
    STATUS_CHOICES = [
        ('active', 'В эксплуатации'),
        ('repair', 'В ремонте'),
        ('written_off', 'Списано'),
    ]

    inventory_number = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, blank=True)
    barcode = models.CharField(max_length=100, unique=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    responsible_person = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    purchase_date = models.DateField(null=True, blank=True)
    write_off_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.inventory_number} - {self.name}"
