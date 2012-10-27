# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class Worker(base.Model):
    
    relations = {
        'self': '+all -ReservationHire -Load -Slot',
        'other': None,
        'Location': '+all -ReservationHire -Load -Slot',
    }
    
    public_fields = 'name available_fulltime'
    public_relations = 'WorkerType'
    
    related_fields = 'name available_fulltime'
    related_relations = 'WorkerType'
        
    location = models.ForeignKey('Location')
    
    name = models.CharField(max_length=128)
    birthday = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDERS, blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    email = models.CharField(max_length=64, blank=True, null=True)
    postal_address = models.CharField(max_length=250, blank=True, null=True)
    
    weight_kg = models.SmallIntegerField(blank=True, null=True)
    weight_lb = models.SmallIntegerField(blank=True, null=True)
    
    spoken_langs = models.ManyToManyField('SpokenLang')
    roles = models.ManyToManyField('WorkerType')
    available_fulltime = models.BooleanField(default=True)
    employee = models.BooleanField(default=True)
        
    def __unicode__(self):
        return self.name
