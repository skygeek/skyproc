# -*- coding: utf-8 -*-

from django.db import models
from django.conf import settings
import base
from choices import *

from utils import demo

class Location(base.Model):
    show_all = True
    immediate_delete = True
    
    relations = '+all -LocationMembership -Reservation -Account'
    
    public_fields = '+all'
    public_relations = 'Country City Aircraft Worker MapObject WeatherObservation'
    
    related_fields = '+all'
    related_relations = 'Country City Aircraft Worker Load LocationCatalogItem MapObject WeatherObservation'
    
    name = models.CharField(max_length=128)
    type = models.CharField(max_length=1, choices=LOCATIONS_TYPE, default='D')
    load_demo_data = models.BooleanField(default=False)
    
    country = models.ForeignKey('Country')
    city = models.ForeignKey('City', blank=True, null=True)
    custom_city = models.CharField(max_length=128, blank=True, null=True)
    postal_address = models.CharField(max_length=250, blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    website = models.CharField(max_length=128, blank=True, null=True)
    email = models.CharField(max_length=128, blank=True, null=True)
    picture = models.TextField(blank=True, null=True)
    short_description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True)
    timezone = models.ForeignKey('Timezone', blank=True, null=True)
    
    airport_name = models.CharField(max_length=128, blank=True, null=True)
    airport_icao = models.CharField(max_length=4, blank=True, null=True)
    
    map_type = models.CharField(max_length=16, default='hybrid')
    map_zoom = models.SmallIntegerField(default=12)
    map_latitude  = models.CharField(max_length=32, blank=True, null=True)
    map_longitude  = models.CharField(max_length=32, blank=True, null=True)
    terrain_latitude  = models.CharField(max_length=32, blank=True, null=True)
    terrain_longitude  = models.CharField(max_length=32, blank=True, null=True)
    terrain_elevation  = models.IntegerField(blank=True, null=True)
    landing_area  = models.IntegerField(blank=True, null=True)
    
    currencies = models.ManyToManyField('Currency')
    default_currency = models.ForeignKey('Currency', blank=True, null=True, related_name='+')
    payment_accept_cash = models.BooleanField(default=True)
    payment_accept_cc = models.BooleanField(default=False)
    payment_accept_cc_visa = models.BooleanField(default=False)
    payment_accept_cc_mastercard = models.BooleanField(default=False)
    payment_accept_cc_discover = models.BooleanField(default=False)
    payment_accept_cc_amex = models.BooleanField(default=False)
    payment_accept_cc_diners = models.BooleanField(default=False)
    payment_accept_cc_maestro = models.BooleanField(default=False)
    payment_accept_cc_cirrus = models.BooleanField(default=False)
    payment_accept_other = models.BooleanField(default=False)
    payment_others = models.CharField(max_length=128, blank=True, null=True)
    
    member_auto_accept = models.BooleanField(default=False)
    
    reservation_interval = models.IntegerField(default=30)
    reservation_start = models.TimeField(default='08:00:00')
    reservation_end = models.TimeField(default='20:00:00')
    
    lboard_full_grids_count = models.SmallIntegerField(default=1)
    lboard_compact_grids_count = models.SmallIntegerField(default=2)
    lboard_hide_title = models.BooleanField(default=False)
    lboard_hide_headers = models.BooleanField(default=False)
    lboard_auto_scroll_interval = models.SmallIntegerField(default=5)
    lboard_auto_scroll_offset = models.SmallIntegerField(default=300)
    lboard_theme = models.CharField(max_length=32, default='black')
    
    lmanager_loads_auto_validate = models.BooleanField(default=True)
    lmanager_deny_invalid_loads = models.BooleanField(default=False)
    lmanager_default_catalog_item = models.ForeignKey('LocationCatalogItem', blank=True, null=True, related_name='+')
    lmanager_default_catalog_price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True, related_name='+')
    
    public = models.BooleanField(default=False)
    use_clearances = models.BooleanField(default=True)
    enable_self_manifesting = models.BooleanField(default=True)
    share_account_data = models.BooleanField(default=True)
    pwd_protect_manage = models.BooleanField(default=False)
    archive_loads_period = models.SmallIntegerField(default=365)
    archive_accounts_period = models.SmallIntegerField(default=365)
    
    class Meta:
        ordering = ["name"]
    
    def __unicode__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        super(Location, self).save(*args, **kwargs)
        if kwargs.has_key('force_insert') and kwargs['force_insert']:
            # create default profile
            profile = models.get_model(settings.DATA_APP, 'MembershipProfile')()
            profile.owner = self.owner
            profile.location = self
            profile.name = 'Default'
            profile.default = True
            profile.save()
            # demo data
            if self.load_demo_data:
                demo.load_demo_data(self)
            
class MapObject(base.Model):
    isolated = True
    related_fields = '+all'
    public_fields = '+all'
    
    location = models.ForeignKey('Location')
    
    type = models.ForeignKey('AreaType')
    name = models.CharField(max_length=128, blank=True, null=True)
    description = models.CharField(max_length=500, blank=True, null=True)
    mapdata = models.TextField()
    
class WeatherObservation(base.Model):
    related_fields = '+all'
    public_fields = '+all'
    
    location = models.ForeignKey('Location')
    
    station = models.CharField(max_length=64, blank=True, null=True)
    datetime = models.DateTimeField(blank=True, null=True)
    sunrise = models.DateTimeField(blank=True, null=True)
    sunset = models.DateTimeField(blank=True, null=True)
    clouds = models.CharField(max_length=16, blank=True, null=True)
    temperature = models.CharField(max_length=16, blank=True, null=True)
    dew_point = models.CharField(max_length=16, blank=True, null=True)
    wind_speed = models.CharField(max_length=16, blank=True, null=True)
    wind_direction = models.CharField(max_length=16, blank=True, null=True)
    humidity = models.CharField(max_length=16, blank=True, null=True)
    qnh = models.CharField(max_length=16, blank=True, null=True)
    
