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

import logging
from django.db import models
from django.http import Http404
from django.conf import settings
from django.http import HttpResponseForbidden
from django.core.exceptions import ObjectDoesNotExist

from utils import misc

Location = models.get_model(settings.DATA_APP, 'Location')
Aircraft = models.get_model(settings.DATA_APP, 'Aircraft')
LoadLog = models.get_model(settings.DATA_APP, 'LoadLog')

def get_data(location_uuid, start_date, end_date):
    try: location = Location.objects.get_by_natural_key(location_uuid)
    except ObjectDoesNotExist: raise Http404
    if req.user != location.owner:
        return HttpResponseForbidden('Access denied')
    
    data = {}
    data['totals'] = {}
    data['totals']['loads'] = 0
    data['totals']['slots'] = 0
    data['totals']['staff'] = 0
    data['totals']['prices'] = {}
    for i in ('prepaid', 'postpaid', 'unpaid', 'none'):
        data['totals'][i] = {}
        data['totals'][i]['count'] = 0
        data['totals'][i]['prices'] = {}
    data['pilot'] = {}
    data['aircraft'] = {}
    data['catalog'] = {}
    data['role'] = {}

    # period filter
    filters = {'location':location.uuid}
    if start_date and end_date:
        filters['date__gte'] = start_date
        filters['date__lte'] = end_date
    elif start_date:
        filters['date'] = start_date
    elif end_date:
        filters['date__lte'] = end_date
    # get loads
    for load in LoadLog.objects.filter(**filters):
        # load data
        data['totals']['loads'] += 1
        # pilot
        if not data['pilot'].has_key(load.pilot_name):
            data['pilot'][load.pilot_name] = 0
        data['pilot'][load.pilot_name] += 1
        # aircraft
        if not data['aircraft'].has_key(load.aircraft_reg):
            data['aircraft'][load.aircraft_reg] = {}
            data['aircraft'][load.aircraft_reg]['loads'] = 0
            data['aircraft'][load.aircraft_reg]['slots'] = 0
        data['aircraft'][load.aircraft_reg]['loads'] += 1
        # get slots
        for slot in load.slotlog_set.all():
            # slot data
            data['totals']['slots'] += 1
            data['aircraft'][load.aircraft_reg]['slots'] += 1
            # worker
            if slot.is_worker:
                data['totals']['staff'] += 1
                if not data['role'].has_key(slot.catalog_item):
                    data['role'][slot.catalog_item] = 0
                data['role'][slot.catalog_item] += 1
            # jumper
            else:
                if slot.payment_type:
                    data['totals'][slot.payment_type]['count'] += 1
                    misc.update_prices(slot.catalog_price, data['totals']['prices'])
                    misc.update_prices(slot.catalog_price, data['totals'][slot.payment_type]['prices'])
                    if not data['catalog'].has_key(slot.catalog_item):
                        data['catalog'][slot.catalog_item] = {}
                        data['catalog'][slot.catalog_item]['count'] = 0
                        data['catalog'][slot.catalog_item]['prices'] = {}
                    data['catalog'][slot.catalog_item]['count'] += 1
                    misc.update_prices(slot.catalog_price, data['catalog'][slot.catalog_item]['prices'])
                        
    # calculate aircraft usage ratios
    for k,v in data['aircraft'].items():
        try:
            aircraft = Aircraft.objects.get(owner=location.owner, deleted=False, registration=k)
            v['usage'] = int(round((v['slots']*100)/(v['loads']*aircraft.max_slots), 0))
        except:
            v['usage'] = None
        
    return data

