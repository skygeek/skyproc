# -*- coding: utf-8 -*-

#Copyright 2012, Nabil SEFRIOUI
#
#This file is part of Skyproc.
#
#Skyproc is free software: you can redistribute it and/or modify
#it under the terms of the GNU Affero General Public License as 
#published by the Free Software Foundation, either version 3 of 
#the License, or any later version.
#
#Skyproc is distributed in the hope that it will be useful,
#but WITHOUT ANY WARRANTY; without even the implied warranty of
#MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#GNU Affero General Public License for more details.
#
#You should have received a copy of the GNU Affero General Public 
#License along with Skyproc. If not, see <http://www.gnu.org/licenses/>.

from django.db import models
import base
import fields
from choices import *

class Load(base.Model):
    show_created = True
    
    relations = 'Slot'
    
    location = models.ForeignKey('Location')
    aircraft = models.ForeignKey('Aircraft')
    pilot = models.ForeignKey('Worker')
    
    date =  models.DateField(auto_now_add=True)
    number = models.SmallIntegerField()
    state = models.CharField(max_length=1, choices=LOAD_STATES, default='P')
    timer = models.SmallIntegerField(blank=True, null=True)
    
    jumpmaster_slot = models.ForeignKey('Slot', blank=True, null=True, related_name='+')
    note = models.CharField(max_length=100, blank=True, null=True)
    problematic = models.BooleanField(default=False)
    problem = models.CharField(max_length=100, blank=True, null=True)
    
    def __unicode__(self):
        return str(self.date) + ' ' + str(self.number) 
    
    class Meta:
        ordering = ['number']
    

class Slot(base.Model):
    show_created = True
    
    relations = 'Person Phantom'
    
    load = models.ForeignKey('Load')
    person = models.ForeignKey('Person', blank=True, null=True)
    membership_uuid = fields.UUIDField(blank=True, null=True)
    phantom = models.ForeignKey('Phantom', blank=True, null=True)
    worker = models.ForeignKey('Worker', blank=True, null=True)
    
    item = models.ForeignKey('LocationCatalogItem', blank=True, null=True)
    element = models.ForeignKey('LocationCatalogElement', blank=True, null=True)
    price = models.ForeignKey('LocationCatalogPrice', blank=True, null=True)
    payer = models.ForeignKey('Person', blank=True, null=True, related_name='+')
    
    jump_type = models.ForeignKey('JumpType', blank=True, null=True)
    exit_order = models.SmallIntegerField(blank=True, null=True)
    related_slot = models.ForeignKey('Slot', blank=True, null=True)
    worker_type = models.ForeignKey('WorkerType', blank=True, null=True)
    
    is_paid = models.BooleanField(default=True)
    is_ready = models.BooleanField(default=True)
    problematic = models.BooleanField(default=False)
    problem = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        ordering = ['exit_order']
