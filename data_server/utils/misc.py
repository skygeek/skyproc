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

import uuid
import logging
import cjson
import random
import time
from django.conf import settings

def validate_uuid(uuid_str):
    if isinstance(uuid_str, dict) and uuid_str.has_key('uuid'):
        uuid_str = uuid_str['uuid']
    try: return uuid.UUID(uuid_str).hex
    except Exception, e:
        msg = 'Invalid UUID: %s' % e
        if settings.DEBUG:
            msg += ' (%s)' % uuid_str
            logging.debug(msg)
        else:
            logging.error(msg)
        raise Exception, msg

def formatFullname(person, name_order=None, capitalize=False):
    if name_order is None:
        name_order = person.name_order
    if capitalize:
        first_name = person.first_name[0].upper() + person.first_name[1:].lower()
        last_name = person.last_name.upper()
    else:
        first_name = person.first_name
        last_name = person.last_name
    if name_order == 'FL':
        return first_name + ' ' + last_name
    else:
        return last_name + ' ' + first_name

def get_person_profile(membership):
    ret = {}
    ret['billing_mode'] = 'pre'
    
    if membership.override_profile and membership.billing_mode:
        ret['billing_mode'] = membership.billing_mode
    elif membership.profile:
        ret['billing_mode'] = membership.profile.billing_mode
    
    if ret['billing_mode'] == 'other':
        if membership.override_profile and membership.bill_person:
            ret['bill_person'] = membership.bill_person
        elif membership.profile and membership.profile.bill_person:
            ret['bill_person'] = membership.profile.bill_person
        else:
            ret['billing_mode'] = 'pre'
        
    return ret

def update_prices(price, prices):
    if not price or price == 'N/A':
        return
    price = cjson.decode(price)
    for k,v in price.items():
        if not prices.has_key(k):
            prices[k] = 0
        prices[k] += v

def get_tmp_link():
    link = ''
    for i in range(2):
        link += str(uuid.uuid4()).replace('-','')
    return link[:48]

def fake_processing(a, b):
    for i in range(random.randint(a, b)):
        time.sleep(random.random())
    
