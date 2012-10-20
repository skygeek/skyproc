# -*- coding: utf-8 -*-

from django.db import models
import base
import fields

class GlobalSearch(base.AnonymousModel):
    show_all = True
    
    search_text = models.TextField()
    item_model = models.CharField(max_length=64)
    item_uuid = fields.UUIDField()

class AreaType(base.AnonymousModel):
    show_all = True
    isolated = True
    
    type = models.CharField(max_length=16)
    label = models.CharField(max_length=128)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        ordering = ["order_index"]
    
    def __unicode__(self):
        return "%s. %s" % (self.order_index, self.label)

class WorkerType(base.AnonymousModel):
    show_all = True
    isolated = True
    
    public_fields = '+all'
    related_fields = '+all'
     
    type = models.CharField(max_length=16)
    label = models.CharField(max_length=128)
    plural_label = models.CharField(max_length=128)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        ordering = ["order_index"]
    
    def __unicode__(self):
        return "%s. %s" % (self.order_index, self.label)
    
class SpokenLang(base.AnonymousModel):
    show_all = True
    isolated = True
    
    lang = models.CharField(max_length=2)
    label = models.CharField(max_length=32)
    
    class Meta:
        ordering = ["label"]
    
    def __unicode__(self):
        return self.label

class Timezone(base.AnonymousModel):
    show_all = True
    isolated = True
    
    public_fields = '+all'
    related_fields = '+all'
    
    name = models.CharField(max_length=64)
    country_code = models.CharField(max_length=2)
    utc_offset = models.DecimalField(max_digits=4, decimal_places=2)
    utc_offset_label = models.CharField(max_length=10)
    
    class Meta:
        ordering = ["name"]
    
    def __unicode__(self):
        return self.name

class Country(base.AnonymousModel):
    show_all = True
    isolated = True
    
    public_fields = '+all'
    related_fields = '+all'
    
    iso_code = models.CharField(max_length=2)
    iso_name_EN = models.CharField(max_length=100)
    iso_name_FR = models.CharField(max_length=100)
    
    def __unicode__(self):
        return self.iso_name_EN

class City(base.AnonymousModel):
    isolated = True
    
    public_fields = '+all'
    related_fields = '+all'
    
    country = models.ForeignKey(Country)
    name = models.CharField(max_length=100)
    geonameid  = models.CharField(max_length=16)
    latitude  = models.CharField(max_length=32)
    longitude  = models.CharField(max_length=32)
    
    class Meta:
        ordering = ["name"]
    
    def __unicode__(self):
        return self.name
    
class Currency(base.AnonymousModel):
    show_all = True
    isolated = True
    
    code = models.CharField(max_length=10)
    name = models.CharField(max_length=64)
    
    class Meta:
        ordering = ["code"]
    
    def __unicode__(self):
        return "%s (%s)" % (self.code, self.name)
    
class JumpType(base.AnonymousModel):
    show_all = True
    isolated = True
    
    type = models.CharField(max_length=16)
    label = models.CharField(max_length=128)
    order_index = models.IntegerField(default=0)
    
    class Meta:
        ordering = ["order_index"]
    
    def __unicode__(self):
        return "%s. %s" % (self.order_index, self.label)
