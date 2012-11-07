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
import ujson
from django.db import models
from django.db.models import F
from django.http import Http404
from django.conf import settings
from django.db.models import Max
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseForbidden
from django.core import serializers

from data import comet
from utils import misc

Person = models.get_model(settings.DATA_APP, 'Person')
Load = models.get_model(settings.DATA_APP, 'Load')
Slot = models.get_model(settings.DATA_APP, 'Slot')
LoadLog = models.get_model(settings.DATA_APP, 'LoadLog')
SlotLog = models.get_model(settings.DATA_APP, 'SlotLog')
JumpLog = models.get_model(settings.DATA_APP, 'JumpLog')
LocationMembership = models.get_model(settings.DATA_APP, 'LocationMembership')
Account = models.get_model(settings.DATA_APP, 'Account')
AccountOperation = models.get_model(settings.DATA_APP, 'AccountOperation')
BuyedItem = models.get_model(settings.DATA_APP, 'BuyedItem')
JumpType = models.get_model(settings.DATA_APP, 'JumpType')
LocationCatalogItem = models.get_model(settings.DATA_APP, 'LocationCatalogItem')
LocationCatalogPrice = models.get_model(settings.DATA_APP, 'LocationCatalogPrice')

def __get_item_total_slots(item):
    total_slots = 0
    for e in item.locationcatalogelement_set.filter(deleted=False):
        total_slots += e.recurrence*e.slots
    return total_slots 

def __bill_item(membership, item, price, bill_for_member):
    # get account
    try: account = Account.objects.get(membership=membership, currency=price.currency, deleted=False)
    except ObjectDoesNotExist:
        account = Account.objects.create(owner=membership.location.owner, membership=membership, 
                                         currency=price.currency)
    note_append = ''
    if bill_for_member:
        note_append += " for '%s'" % \
            misc.formatFullname(bill_for_member.person, Person.objects.getOwn(req.user).name_order, True)        
    if item.reuseable:
        # BuyedItem save() method will create AccountOperation and update balance
        BuyedItem.objects.create(owner=membership.location.owner, membership=membership, 
                    item=item, price=price, consuming=True, usage_count=1, operation_note_append=note_append)
    else:
        # create operation to update balance
        # one shot items are not saved in BuyedItem to save space on memberships because
        # BuyedItem records are carried out with memberships records
        AccountOperation.objects.create(owner=membership.location.owner, account=account, type='B', 
                                        amount=price.price, note="Billed '%s'%s" % (item.name, note_append))

def __bill_extra_items(membership, p, bill_for_member):
    if bill_for_member: p = misc.get_person_profile(bill_for_member)
    for i in p['extra_items']:
        if i['price']:
            __bill_item(membership, i['item'], i['price'], bill_for_member)
    
def __bill_slot(slot, membership=None, bill_for_member=None):
    ret = {}
    
    if membership is None:
        membership = LocationMembership.objects.get(person=slot.person, location=slot.load.location, deleted=False)
            
    pp = misc.get_person_profile(membership)
    billing_mode = pp['billing_mode']
    
    if billing_mode == 'other' and bill_for_member:
        billing_mode = 'post'
    
    if billing_mode == 'other':
        try: payer_membership = LocationMembership.objects.get(person=pp['bill_person'], location=slot.load.location, deleted=False)
        except:
            payer_membership = None
            billing_mode = 'post'
        if payer_membership:
            req_person = Person.objects.getOwn(req.user)
            ret['payer'] = misc.formatFullname(pp['bill_person'], req_person.name_order, True)
            ret.update(__bill_slot(slot, payer_membership, membership))
            return ret

    # bill extra items if any
    # extra items are always billed even if billing mode is 'none'
    __bill_extra_items(membership, pp, bill_for_member)
    
    # if item or price is not set, set billing to none
    # only 'pre' and 'post' billing modes are processed
    if not slot.item or not slot.price:
        billing_mode = 'none'

    # at this stage prepaid and postpaid mode are the same
    # because even if limits are reached, user forced the
    # load. 
    if billing_mode in ('pre', 'post'):
        ret['payment_type'] = 'prepaid' if billing_mode == 'pre' else 'postpaid'
        # buyed item
        buyed_item = None
        buyed_items_rs = BuyedItem.objects.filter(membership=membership, item=slot.item, price=slot.price, consumed=False, deleted=False)
        buyed_items_count = buyed_items_rs.count()
        if buyed_items_count == 1:
            buyed_item = buyed_items_rs[0]
        elif buyed_items_count > 1:
            agg = buyed_items_rs.aggregate(Max('usage_count'))
            buyed_item = buyed_items_rs.filter(usage_count=agg['usage_count__max'])[0]
        # found a buyed item
        if buyed_item:
            if slot.item.reuseable:
                total_slots = __get_item_total_slots(slot.item)
                if buyed_item.usage_count+1 == total_slots:
                    buyed_item.consumed = True
                    buyed_item.consuming = False
                else:
                    buyed_item.consuming = True
                buyed_item.usage_count = F('usage_count') + 1
            else:
                buyed_item.usage_count = 1
                buyed_item.consumed = True
            buyed_item.save(force_update=True)
            # item is already paid
            ret['has_buyed_item'] = True
        else:
            __bill_item(membership, slot.item, slot.price, bill_for_member)
    
    return ret

def __archive_person_slot(slot, del_options):
    ret = {}
    # archive jump
    if not del_options.has_key('delLogbook') or not del_options['delLogbook']:
        jump_log = {}
        jump_log['owner'] = slot.person.uuid
        jump_log['location'] = slot.load.location.uuid
        jump_log['location_name'] = slot.load.location.name
        jump_log['aircraft_type'] = slot.load.aircraft.type
        jump_log['date'] = slot.load.date
        if slot.jump_type: jump_log['jump_type'] = slot.jump_type.label
        else: jump_log['jump_type'] = 'N/A'
        if slot.element: jump_log['altitude'] = '%s%s' % (slot.element.altitude, slot.element.altitude_unit)
        else: jump_log['altitude'] = 'N/A'
        JumpLog.objects.create(**jump_log)
    if (not del_options.has_key('noBalance') or not del_options['noBalance']):
        ret.update(__bill_slot(slot))
    return ret

def archive_load(load_uuid, note, del_options={}):
    
    try: load = Load.objects.get_by_natural_key(load_uuid)
    except ObjectDoesNotExist: raise Http404
    
    req_person = Person.objects.getOwn(req.user)
    if req.user != load.owner:
        return HttpResponseForbidden('Access denied')
        
    load_log = {}
    load_log['owner'] = req_person.uuid
    load_log['location'] = load.location.uuid
    load_log['aircraft'] = load.aircraft.uuid
    load_log['aircraft_reg'] = load.aircraft.registration
    load_log['pilot'] = load.pilot.uuid
    load_log['pilot_name'] = load.pilot.name
    load_log['date'] = load.date
    load_log['number'] = load.number
    load_log['total_slots'] = 0
    load_log['prepaid_slots'] = 0
    load_log['postpaid_slots'] = 0
    load_log['unpaid_slots'] = 0
    load_log['staff_slots'] = 0
    if note: load_log['note'] = note
    
    slots_log = []
    prices = {}
    
    for slot in load.slot_set.filter(deleted=False):
        
        # skip empty slot
        if not slot.person and not slot.phantom and not slot.worker and not slot.item:
            continue
        
        slot_log = {}
        slot_log['owner'] = req_person.uuid
        
        if slot.person:
            slot_log['jumper'] = slot.person.uuid
            slot_log['jumper_name'] = misc.formatFullname(slot.person, req_person.name_order, True)
        elif slot.phantom:
            slot_log['jumper_name'] = slot.phantom.name
        elif slot.worker:
            slot_log['jumper'] = slot.worker.uuid
            slot_log['jumper_name'] = slot.worker.name
        else:
            slot_log['jumper_name'] = 'N/A'
            
        if slot.worker_type:
            slot_log['catalog_item'] = slot.worker_type.label
            slot_log['is_worker'] = True
        elif slot.item:
            slot_log['catalog_item'] = slot.item.name
        else:
            slot_log['catalog_item'] = 'N/A'
            
        slot_log['exit_order'] = slot.exit_order
                
        slot_log['payment_type'] = 'none'
        
        if slot.person:
            slot_log.update(__archive_person_slot(slot, del_options))
        elif slot.phantom and slot.is_paid:
            slot_log['payment_type'] = 'prepaid'
        
        # slot price
        if not slot.worker_type:
            if slot.price:
                price = slot.price.price
                # zero price for buyed items, they are already paid
                if slot_log.has_key('has_buyed_item') and slot_log['has_buyed_item']:
                    price = 0
                    del slot_log['has_buyed_item']
                slot_log['catalog_price'] = ujson.encode({slot.price.currency.code:price})
                if not prices.has_key(slot.price.currency.code):
                    prices[slot.price.currency.code] = 0
                prices[slot.price.currency.code] += price
            else:
                slot_log['catalog_price'] = 'N/A'
        
        # counters
        load_log['total_slots'] += 1
        if slot.worker_type:
            load_log['staff_slots'] += 1
            slot_log['payment_type'] = ''
        elif slot_log['payment_type'] == 'none':
            load_log['unpaid_slots'] += 1
        elif slot_log['payment_type'] == '':
            pass
        else:
            load_log['%s_slots' % slot_log['payment_type']] += 1
            
        # label
        labels = {
            '': '',
            'none': 'Unpaid',
            'prepaid': 'Prepaid',
            'postpaid': 'Postpaid',
        }
        slot_log['payment'] = labels[slot_log['payment_type']]
        
        slots_log.append(slot_log)
            
    load_log['prices'] = ujson.encode(prices)
        
    if not del_options.has_key('delLoad') or not del_options['delLoad']:
        load_log_rec = LoadLog.objects.create(**load_log)
        for i in slots_log:
            i['load'] = load_log_rec
            SlotLog.objects.create(**i)
        
    # delete the load
    load.delete()

def delete_load(load_uuid, del_options):
    archive_load(load_uuid, None, del_options)

# members functions

def take_slot(person_uuid, load_uuid, user_data):
    
    req_person = Person.objects.getOwn(req.user)
    if req_person.uuid != person_uuid:
        return HttpResponseForbidden('Access denied')
    
    try: load = Load.objects.get_by_natural_key(load_uuid)
    except ObjectDoesNotExist: raise Http404
    
    if not load.location.enable_self_manifesting or load.state not in ('P', 'B'):
        raise Http404
    
    try: membership = LocationMembership.objects.get(location=load.location, person=req_person, deleted=False)
    except ObjectDoesNotExist: return HttpResponseForbidden('Access denied')
    
    if not misc.is_clear_member(membership):
        return HttpResponseForbidden('Access denied')
    
    pp = misc.get_person_profile(membership)
    
    if not isinstance(user_data, dict):
        user_data = {}
    
    slot_data = {}
    slot_data['load'] = load
    slot_data['owner'] = load.owner
    slot_data['person'] = req_person
    slot_data['membership_uuid'] = membership.uuid
    
    slot_data['item'] = None
    slot_data['element'] = None
    slot_data['price'] = None
    slot_data['payer'] = None
    
    # item and price
    user_default_item = None
    if pp['catalog_access']:
        try: user_default_item = LocationCatalogItem.objects.get_by_natural_key(user_data['item'])
        except: pass 
    if user_default_item and pp['available_items'].has_key(user_default_item.uuid):
        slot_data['item'] = user_default_item
        slot_data['price'] = pp['available_items'][user_default_item.uuid]
    elif pp['default_item']:
        slot_data['item'] = pp['default_item']
        if pp['default_price']: slot_data['price'] = pp['default_price']
        else: slot_data['price'] = misc.get_default_price(membership, pp['default_item'])
        
    # account check
    if slot_data['item'] and slot_data['price']:
        if not misc.check_member_account(membership, pp, slot_data['item'], slot_data['price']):
            return HttpResponseForbidden('Boarding denied')
    else:
        return HttpResponseForbidden('No default catalog item')
        
    # element
    if slot_data['item'] and not slot_data['element']:
        try: slot_data['element'] = slot_data['item'].locationcatalogelement_set.filter(deleted=False)[0]
        except: pass
        
    # payer
    if pp['billing_mode'] == 'other':
        slot_data['payer'] = pp['bill_person']
        
    # jump type
    try: user_jump_type = JumpType.objects.get_by_natural_key(user_data['jump_type'])
    except: user_jump_type = None
    if user_jump_type: slot_data['jump_type'] = user_jump_type
    if slot_data['item'] and slot_data['item'].jump_type and slot_data['item'].jump_type_auto:
        slot_data['jump_type'] = slot_data['item'].jump_type
    
    # exit order
    max_exit_order = Slot.objects.filter(load__uuid=load_uuid, deleted=False).aggregate(Max('exit_order'))['exit_order__max']
    if max_exit_order is None: slot_data['exit_order'] = 1
    else: slot_data['exit_order'] = max_exit_order+1 
    
    # save slot
    s = Slot.objects.create(**slot_data)
    
    # notify
    comet.Notifier(None, s, 'create', True)
    return serializers.serialize("json", [s],
        use_natural_keys=True, 
        fields=['uuid', 'created', 'load', 'person', 'membership_uuid', 'item', 'element', 'jump_type', 'exit_order'], 
        relations={
            'person': {'fields': ['uuid', 'first_name', 'last_name'], 'use_natural_keys': True},
        }
    )

def cancel_slot(person_uuid, load_uuid):
    req_person = Person.objects.getOwn(req.user)
    if req_person.uuid != person_uuid:
        return HttpResponseForbidden('Access denied')    
    try: load = Load.objects.get_by_natural_key(load_uuid)
    except ObjectDoesNotExist: raise Http404
    
    if not load.location.enable_self_manifesting or load.state != 'P':
        raise Http404
    
    removed_slots = []
    for s in Slot.objects.filter(person__uuid=person_uuid, load__uuid=load_uuid, deleted=False):
        for r in Slot.objects.filter(load__uuid=load_uuid, related_slot=s, deleted=False):
            comet.Notifier(None, r, 'delete', True)
            removed_slots.append(r.uuid)
            r.delete()
        comet.Notifier(None, s, 'delete', True)
        removed_slots.append(s.uuid)
        s.delete()
    return removed_slots
