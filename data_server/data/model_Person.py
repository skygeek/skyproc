# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class PersonManager(base.Manager):
    def getOwn(self, owner):
        return self.model.objects.get(owner=owner, self_created=True, deleted=False)
    
class Person(base.Model):
    objects = PersonManager()

    fields = {
        'LocationMembership': 'first_name last_name gender picture',
        'Location': 'first_name last_name gender picture', # via Clearance
        'Reservation': 'first_name last_name', # via Clearance
    }
    
    rel = '+all -LocationMembership -MembershipProfile -Clearance -Reservation -ReservationItem -Slot'
    relations = {
        'self': rel,
        'other': rel,
        'Reservation': None,
    }
    
    public_fields = 'first_name last_name gender picture'
        
    is_consumer = models.BooleanField(default=True)
    is_pro_jumper = models.BooleanField(default=False)
    is_dz_operator = models.BooleanField(default=True)
    is_tn_operator = models.BooleanField(default=False)
    self_created = models.BooleanField(default=True)
    
    email = models.EmailField()
    
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64)
    name_order = models.CharField(max_length=2, choices=NAME_ORDER, default='FL')
    birthday = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDERS, blank=True, null=True)
    
    country = models.ForeignKey('Country', blank=True, null=True)
    city = models.ForeignKey('City', blank=True, null=True)
    custom_city = models.CharField(max_length=128, blank=True, null=True)
    postal_address = models.CharField(max_length=250, blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    
    lang = models.CharField(max_length=2, choices=LANGS, default='EN')
    date_format = models.CharField(max_length=10, choices=DATE_FORMATS, default='m/d/Y')
    time_format = models.CharField(max_length=10, choices=TIME_FORMATS, default='h:i A')
    
    altitude_unit = models.CharField(max_length=5, choices=ALTITUDE_UNITS, default='ft')
    speed_unit = models.CharField(max_length=5, choices=SPEED_UNITS, default='kmh')
    distance_unit = models.CharField(max_length=5, choices=DISTANCE_UNITS, default='m')
    weight_unit = models.CharField(max_length=5, choices=WEIGHT_UNITS, default='kg')
    temperature_unit = models.CharField(max_length=5, choices=TEMPERATURE_UNITS, default='c')
    week_start = models.SmallIntegerField(default=1)
    
    picture = models.TextField(blank=True, null=True)
    
    def __unicode__(self):
        return self.email
    
    def save(self, *args, **kwargs):
        self_create = kwargs.has_key('self_create') and kwargs['self_create']
        force_insert = kwargs.has_key('force_insert') and kwargs['force_insert']
        if force_insert and not self_create:
            self.self_created = False
        if kwargs.has_key('self_create'):
            del kwargs['self_create']
        super(Person, self).save(*args, **kwargs)


class Phantom(base.Model):
    isolated = True
    auto_create_related = True
    
    name = models.CharField(max_length=128)
    phone = models.CharField(max_length=32, blank=True, null=True)
    weight = models.IntegerField(default=100)
    