# -*- coding: utf-8 -*-

# Copyright 2012, Nabil SEFRIOUI
#
# This file is part of Skyproc.
#
# Skyproc is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as 
# published by the Free Software Foundation, either version 3 of 
# the License, or any later version.
#
# Skyproc is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public 
# License along with Skyproc. If not, see <http://www.gnu.org/licenses/>.

from django.db import models
import base
import fields
from choices import *


class LoadLog(base.ArchiveModel):
    archive = True
    
    location = fields.UUIDField()
    aircraft = fields.UUIDField()
    pilot = fields.UUIDField()
    aircraft_reg = models.CharField(max_length=16)
    pilot_name = models.CharField(max_length=64)
    date =  models.DateField()
    number = models.SmallIntegerField()
    total_slots = models.SmallIntegerField()
    prepaid_slots = models.SmallIntegerField()
    postpaid_slots = models.SmallIntegerField()
    unpaid_slots = models.SmallIntegerField()
    staff_slots = models.SmallIntegerField()
    prices = models.CharField(max_length=512)
    note = models.CharField(max_length=200, blank=True, null=True)
    
class SlotLog(base.ArchiveModel):
    archive = True
    
    load = models.ForeignKey('LoadLog')
    jumper = fields.UUIDField(blank=True, null=True)    
    jumper_name = models.CharField(max_length=64)
    is_worker = models.BooleanField(default=False)
    catalog_item = models.CharField(max_length=64)
    exit_order = models.SmallIntegerField()
    catalog_price = models.CharField(max_length=64, blank=True, null=True)
    payer = models.CharField(max_length=64, blank=True, null=True)
    payment = models.CharField(max_length=64)
    payment_type = models.CharField(max_length=16)

class JumpLog(base.ArchiveModel):
    archive = True
    
    location = fields.UUIDField()
    location_name = models.CharField(max_length=64)
    aircraft_type = models.CharField(max_length=32)
    date =  models.DateField()
    jump_type = models.CharField(max_length=32)
    altitude = models.CharField(max_length=32)
    note = models.CharField(max_length=100, blank=True, null=True)
    
class AccountOperationLog(base.ArchiveModel):
    archive = True
    
    location = fields.UUIDField()
    date =  models.DateField()
    type = models.CharField(max_length=1, choices=ACCOUNT_OPERATIONS)
    amount = models.CharField(max_length=64)
    currency = models.CharField(max_length=5)
    note = models.CharField(max_length=200)
    
    