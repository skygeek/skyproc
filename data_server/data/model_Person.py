# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import F
import base
from choices import *

class PersonManager(base.Manager):
    def getOwn(self, owner):
        return self.model.objects.get(owner=owner, self_created=True, deleted=False)
    
class Person(base.Model):
    objects = PersonManager()

    #fields = {
    #    'Location': 'first_name last_name gender picture',
    #    'Reservation': 'first_name last_name',
    #}
    
    rel = '+all -LocationMembership -MembershipProfile -Clearance -Reservation -ReservationItem -Slot'
    relations = {
        'self': rel,
        'other': rel,
        'Reservation': None,
    }
    
    public_fields = 'first_name last_name gender picture'
    
    related_fields = 'first_name last_name'
    

    is_consumer = models.BooleanField(default=True)
    is_pro_jumper = models.BooleanField(default=False)
    is_dz_operator = models.BooleanField(default=True)
    is_tn_operator = models.BooleanField(default=False)
    self_created = models.BooleanField(default=False)
    
    email = models.EmailField(blank=True, null=True)
    
    first_name = models.CharField(max_length=64, blank=True, null=True)
    last_name = models.CharField(max_length=64, blank=True, null=True)
    name_order = models.CharField(max_length=2, choices=NAME_ORDER, default='FL')
    birthday = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDERS, blank=True, null=True)
    
    height_ft = models.SmallIntegerField(blank=True, null=True)
    height_in = models.SmallIntegerField(blank=True, null=True)
    height_cm = models.SmallIntegerField(blank=True, null=True)
    weight_kg = models.SmallIntegerField(blank=True, null=True)
    weight_lb = models.SmallIntegerField(blank=True, null=True)
    
    past_jumps = models.IntegerField(default=0)
    logged_jumps = models.IntegerField(default=0)
    total_jumps = models.IntegerField(default=0)
    jumper_level = models.CharField(max_length=1, choices=JUMPER_LEVEL, blank=True, null=True)
    jump_licenses = models.CharField(max_length=250, blank=True, null=True)
    
    default_jump_type = models.ForeignKey('JumpType', blank=True, null=True, related_name='+')
    default_currency = models.ForeignKey('Currency', blank=True, null=True, related_name='+')
    
    country = models.ForeignKey('Country', blank=True, null=True)
    city = models.ForeignKey('City', blank=True, null=True)
    custom_city = models.CharField(max_length=128, blank=True, null=True)
    postal_address = models.CharField(max_length=250, blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    timezone = models.ForeignKey('Timezone', blank=True, null=True)
    
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
        return self.email if self.email else self.uuid 
    
    def save(self, *args, **kwargs):
        if not hasattr(self, 'jumps_update') or not self.jumps_update:
            if kwargs.has_key('force_insert') and kwargs['force_insert']:
                self.logged_jumps = 0
                self.total_jumps = 0
            else:
                self.logged_jumps = F('logged_jumps')
                self.total_jumps = self.past_jumps + F('logged_jumps')
        super(Person, self).save(*args, **kwargs)


class EmailValidation(models.Model):
    private = True
    
    created =  models.DateTimeField(auto_now_add=True)
    person = models.ForeignKey('Person')
    email = models.EmailField()
    validation_link = models.CharField(max_length=48)
    srp_salt = models.CharField(max_length=32, blank=True, null=True)
    srp_verifier = models.CharField(max_length=128, blank=True, null=True)
    
class PasswordResetRequest(models.Model):
    private = True
    
    created =  models.DateTimeField(auto_now_add=True)
    person = models.ForeignKey('Person')
    reset_link = models.CharField(max_length=48)
    
class Phantom(base.Model):
    isolated = True
    auto_create_related = True
    public_fields = related_fields = '+all'
    
    name = models.CharField(max_length=128)
    phone = models.CharField(max_length=32, blank=True, null=True)
    weight = models.IntegerField(default=80)
