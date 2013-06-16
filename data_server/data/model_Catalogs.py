# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class CatalogItem(base.Model):
    
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=500, blank=True, null=True)
    jump_type = models.ForeignKey('JumpType', blank=True, null=True)
    jump_type_auto = models.BooleanField(default=False)
    reuseable = models.BooleanField(default=False)
    min_use = models.IntegerField(blank=True, null=True)
    validity_period = models.IntegerField(blank=True, null=True)
    shareable = models.BooleanField(default=False)
    
    class Meta:
        ordering = ["name"]
        
    def __unicode__(self):
        return self.name

class CatalogItemPrice(base.Model):
    
    item = models.ForeignKey('CatalogItem')
    currency = models.ForeignKey('Currency')
    #price = models.IntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    default = models.BooleanField(default=False)
    
    def __unicode__(self):
        return str(self.price)
    
class CatalogItemElement(base.Model):
    
    item = models.ForeignKey('CatalogItem')
    
    recurrence = models.IntegerField(default=1)
    slots = models.IntegerField(default=1)
    altitude = models.IntegerField()
    altitude_unit = models.CharField(max_length=5, choices=ALTITUDE_UNITS, default='ft')
    
    
class CatalogItemElementHire(base.Model):
    
    element = models.ForeignKey('CatalogItemElement')
    
    worker_type = models.ForeignKey('WorkerType')
    count = models.IntegerField()
