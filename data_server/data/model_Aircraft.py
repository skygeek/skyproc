# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class Aircraft(base.Model):
    immediate_delete = True
    
    public_fields = 'type max_slots'
    
    relations = {
        'self': '+all -Load',
        'Location': '+all -Load',
        'other': None,
    }
    
    fields = {
        'self': '+all',
        'Location': '+all',
        'other': 'type registration name max_slots',
    }
    
    related_fields = 'type registration name max_slots'
        
    location = models.ForeignKey('Location')
    
    type = models.CharField(max_length=32)
    registration = models.CharField(max_length=16)
    name = models.CharField(max_length=128, blank=True, null=True)
    description = models.CharField(max_length=500, blank=True, null=True)
    
    altitude_unit = models.CharField(max_length=5, choices=ALTITUDE_UNITS, default='ft')
    weight_unit = models.CharField(max_length=5, choices=WEIGHT_UNITS, default='lb')
    
    max_slots = models.IntegerField()
    max_altitude = models.IntegerField(blank=True, null=True)
    gross_weight = models.IntegerField(blank=True, null=True)
    min_slots = models.IntegerField(blank=True, null=True)
    min_income = models.IntegerField(blank=True, null=True)
    min_income_currency = models.ForeignKey('Currency', blank=True, null=True)
    
    takeoff_time = models.IntegerField(blank=True, null=True)
    climb_time = models.IntegerField(blank=True, null=True)
    descent_time = models.IntegerField(blank=True, null=True)
    
    refuel_time = models.IntegerField(blank=True, null=True)
    lifts_per_refuel = models.IntegerField(blank=True, null=True)
    available_fulltime = models.BooleanField(default=True)
    unrestricted_pilots = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('location', 'registration')
        
    def __unicode__(self):
        return self.registration

class ExitRule(base.Model):
    
    aircraft = models.ForeignKey('Aircraft')
    
    altitude = models.IntegerField(default=0)
    max_exits = models.IntegerField()
    wait_time = models.IntegerField()
    alignment_time = models.IntegerField(blank=True, null=True)
    
    class Meta:
        ordering = ["altitude"]
