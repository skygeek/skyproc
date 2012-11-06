# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class Reservation(base.Model):
    
    relations = '+all -Location'
    
    location = models.ForeignKey('Location')
    
    StartDate = models.DateTimeField()
    EndDate = models.DateTimeField()
    Title = models.CharField(max_length=200, blank=True, null=True)
    CalendarId = models.SmallIntegerField(default=1)
    
    flexible = models.BooleanField(default=False)
    until_time = models.TimeField(blank=True, null=True)
    confirmed = models.BooleanField(default=False)
    note = models.CharField(max_length=100, blank=True, null=True)
    
    manual_billing = models.BooleanField(default=False)
    payment = models.CharField(max_length=1, choices=PAYMENT_STATUS, default='N')
    deposit_amount = models.IntegerField(blank=True, null=True)
    deposit_currency = models.ForeignKey('Currency', blank=True, null=True)
    payer = models.ForeignKey('Person', blank=True, null=True)
    
    aircrafts = models.ManyToManyField('Aircraft')
    
    class Meta:
        ordering = ["created"]

class ReservationItem(base.Model):
    
    relations = 'Person Phantom ReservationHire'
    
    reservation = models.ForeignKey('Reservation')
    
    item = models.ForeignKey('LocationCatalogItem')
    element = models.ForeignKey('LocationCatalogElement')
    jump_type = models.ForeignKey('JumpType', blank=True, null=True)
    price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True)
        
    persons = models.ManyToManyField('Person')
    phantoms = models.ManyToManyField('Phantom')    
    
    class Meta:
        ordering = ["created"]

class ReservationHire(base.Model):
    
    relations = None
    
    item = models.ForeignKey('ReservationItem')
    
    worker = models.ForeignKey('Worker')
    role = models.ForeignKey('WorkerType')
    
    