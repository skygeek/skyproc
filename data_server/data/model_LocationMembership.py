# -*- coding: utf-8 -*-

from django.db import models
from django.conf import settings
import base
import comet
from choices import *
from utils import misc

class LocationMembership(base.Model):
    ignore_unexistant_delete = True
    
    relations = 'Person Account BuyedItem MembershipCatalog MembershipExtraCatalog'
    
    related_field = 'person'
    related_fields = 'location join_type approved new_approval'
    related_relations = 'Location Account'
    
    location = models.ForeignKey('Location')
    person = models.ForeignKey('Person')
    
    join_type = models.CharField(max_length=1, choices=JOIN_TYPE)
    approved = models.BooleanField(default=False)
    new_approval = models.BooleanField(default=True)
     
    profile = models.ForeignKey('MembershipProfile', blank=True, null=True)
    override_profile = models.BooleanField(default=False)
    
    billing_mode = models.CharField(max_length=10, choices=BILLING_MODES, blank=True, null=True)
    credit_line = models.IntegerField(blank=True, null=True)
    currency = models.ForeignKey('Currency', blank=True, null=True, related_name='+')
    bill_person = models.ForeignKey('Person', blank=True, null=True, related_name='+')
    
    default_catalog_item = models.ForeignKey('LocationCatalogItem', blank=True, null=True, related_name='+')
    default_catalog_price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True, related_name='+')
    catalog_access = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        notify_location = False
        # receive join request
        if self.owner != self.location.owner:
            self.owner = self.location.owner
            self.join_type = 'R'
            if self.location.member_auto_accept:
                self.approved = True
                notify_location = True
            try: self.profile = self.location.membershipprofile_set.get(default=True)
            except: pass
        super(LocationMembership, self).save(*args, **kwargs)
        # auto join notification
        if notify_location:
            loc_p = models.get_model(settings.DATA_APP, 'Person').objects.getOwn(self.location.owner)
            notif_data = {}
            notif_data['owner'] = self.location.owner
            notif_data['type'] = 'auto_join'
            notif_data['text'] = misc.formatFullname(self.person, loc_p.name_order, True)
            notif_data['text2'] = self.location.name
            if self.person.picture:
                notif_data['picture'] = self.person.picture
            else:
                notif_data['picture'] = '/static/images/globe.png'
            notif = models.get_model(settings.DATA_APP, 'Notification').objects.create(**notif_data)
            message = {}
            message['model'] = 'Notification'
            message['operation'] = 'create'
            message['uuid'] = notif.uuid
            message['user'] = notif_data['owner'].username
            message['session'] = None
            comet.Notifier().postMessage(message)
        # delete
        # mark person deleted if person is not self created
        if self.deleted and not self.person.self_created and self.person.owner == self.location.owner:
            self.person.deleted = True
            self.person.save(force_update=True)
            
    def post_save(self):
        if not self.approved or not self.new_approval:
            return
        # notification data
        notif_data = {}
        if self.join_type == 'R':
            notif_data['owner'] = self.person.owner
            notif_data['type'] = 'join_accept'
            notif_data['text'] = self.location.name
            notif_data['picture'] = self.location.picture  
        elif self.join_type == 'I':
            loc_p = models.get_model(settings.DATA_APP, 'Person').objects.getOwn(self.location.owner)
            notif_data['owner'] = self.location.owner
            notif_data['type'] = 'invite_accept'
            notif_data['text'] = misc.formatFullname(self.person, loc_p.name_order, True)
            notif_data['picture'] = self.person.picture
        if not notif_data['picture']:
            notif_data['picture'] = '/static/images/globe.png'
        # create notification
        notif = models.get_model(settings.DATA_APP, 'Notification').objects.create(**notif_data)
        # comet notify
        message = {}
        message['model'] = 'Notification'
        message['operation'] = 'create'
        message['uuid'] = notif.uuid
        message['user'] = notif_data['owner'].username
        message['session'] = None
        comet.Notifier().postMessage(message)

class MembershipCatalog(base.Model):
    isolated = True
    
    membership = models.ForeignKey('LocationMembership')
    
    item = models.ForeignKey('LocationCatalogItem')
    price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True)
    
class MembershipExtraCatalog(base.Model):
    isolated = True
    
    membership = models.ForeignKey('LocationMembership')
    
    item = models.ForeignKey('LocationCatalogItem')
    price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True)
