# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class LocationCatalogItem(base.Model):
    
    relations = '+all -MembershipProfile -Location -ReservationItem -BuyedItem -Slot'
    
    related_fields = '+all'
    related_relations = 'LocationCatalogElement'
    
    location = models.ForeignKey('Location')
    
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=500, blank=True, null=True)
    jump_type = models.ForeignKey('JumpType', blank=True, null=True)
    jump_type_auto = models.BooleanField(default=False)
    reuseable = models.BooleanField(default=False)
    min_use = models.IntegerField(blank=True, null=True)
    validity_period = models.IntegerField(blank=True, null=True)
    shareable = models.BooleanField(default=False)
    
    specific_workers = models.BooleanField(default=False)
    workers = models.ManyToManyField('Worker')
    specific_aircrafts = models.BooleanField(default=False)
    aircrafts = models.ManyToManyField('Aircraft')
    specific_periods = models.BooleanField(default=False)
    
    class Meta:
        ordering = ["name"]
        
    def __unicode__(self):
        return self.name

class LocationCatalogPrice(base.Model):
    
    relations = '+all -LocationCatalogItem -MembershipProfile -ReservationItem -BuyedItem -Slot'
    
    item = models.ForeignKey('LocationCatalogItem')
    
    currency = models.ForeignKey('Currency')
    price = models.IntegerField()
    default = models.BooleanField(default=False)
    
    def __unicode__(self):
        return str(self.price)
    
class LocationCatalogElement(base.Model):
    
    relations = '+all -LocationCatalogItem -ReservationItem -Slot'
    
    related_fields = '+all'
    
    item = models.ForeignKey('LocationCatalogItem')
    
    recurrence = models.IntegerField(default=1)
    slots = models.IntegerField(default=1)
    altitude = models.IntegerField()
    altitude_unit = models.CharField(max_length=5, choices=ALTITUDE_UNITS, default='ft')
    
class LocationCatalogHire(base.Model):
    
    element = models.ForeignKey('LocationCatalogElement')
    
    worker_type = models.ForeignKey('WorkerType')
    count = models.IntegerField()

