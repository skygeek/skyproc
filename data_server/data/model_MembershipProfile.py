# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class MembershipProfile(base.Model):
    
    relations = '+all -Location -LocationMembership -LocationCatalogItem -LocationCatalogPrice'
    
    location = models.ForeignKey('Location')
    
    name = models.CharField(max_length=128)
    default = models.BooleanField(default=False)
    
    billing_mode = models.CharField(max_length=10, choices=BILLING_MODES, default='pre')
    credit_line = models.IntegerField(blank=True, null=True)
    currency = models.ForeignKey('Currency', blank=True, null=True)
    bill_person = models.ForeignKey('Person', blank=True, null=True)
    
    default_catalog_item = models.ForeignKey('LocationCatalogItem', blank=True, null=True)
    default_catalog_price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True)
    catalog_access = models.BooleanField(default=False)
    
    class Meta:
        ordering = ["name"]
        
    def __unicode__(self):
        return self.name
