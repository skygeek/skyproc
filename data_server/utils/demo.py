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

import datetime
from django.db import models
from django.conf import settings

import weather

def load_demo_data(location):
    
    if not location.load_demo_data:
        return
    
    Location = models.get_model(settings.DATA_APP, 'Location')
    Currency = models.get_model(settings.DATA_APP, 'Currency')
    Aircraft = models.get_model(settings.DATA_APP, 'Aircraft')
    Worker = models.get_model(settings.DATA_APP, 'Worker')
    SpokenLang = models.get_model(settings.DATA_APP, 'SpokenLang')
    WorkerType = models.get_model(settings.DATA_APP, 'WorkerType')
    LocationCatalogItem = models.get_model(settings.DATA_APP, 'LocationCatalogItem')
    LocationCatalogPrice = models.get_model(settings.DATA_APP, 'LocationCatalogPrice')
    LocationCatalogElement = models.get_model(settings.DATA_APP, 'LocationCatalogElement')
    LocationCatalogHire = models.get_model(settings.DATA_APP, 'LocationCatalogHire')
    JumpType = models.get_model(settings.DATA_APP, 'JumpType')
    Person = models.get_model(settings.DATA_APP, 'Person')
    MembershipProfile = models.get_model(settings.DATA_APP, 'MembershipProfile')
    LocationMembership = models.get_model(settings.DATA_APP, 'LocationMembership')
    ProfileExtraCatalog = models.get_model(settings.DATA_APP, 'ProfileExtraCatalog')
    Clearance = models.get_model(settings.DATA_APP, 'Clearance')
    
    en_sp = SpokenLang.objects.get(lang='EN')
    pilot_role = WorkerType.objects.get(type='pilot')
    aff_role = WorkerType.objects.get(type='aff_inst')
    tandem_role = WorkerType.objects.get(type='tandem_inst')
    video_role = WorkerType.objects.get(type='videoman')
    coach_role = WorkerType.objects.get(type='coach')
    dollar = Currency.objects.get(code='USD')
    euro = Currency.objects.get(code='EUR')
    tandem_jump = JumpType.objects.get(type='tandem') 
    aff_jump = JumpType.objects.get(type='aff')
    belly_jump = JumpType.objects.get(type='belly')
    hpop_jump = JumpType.objects.get(type='hpop')
    no_jump = JumpType.objects.get(type='no_jump')
    
    now = datetime.datetime.now()
    
    a = Aircraft()
    a.owner = location.owner
    a.location = location
    a.type = 'Caravan'
    a.registration = 'N-X-100'
    a.max_slots = 14
    a.save(force_insert=True)
    
    a = Aircraft()
    a.owner = location.owner
    a.location = location
    a.type = 'Pilatus'
    a.registration = 'N-X-211'
    a.max_slots = 10
    a.save(force_insert=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Pilot 1'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (pilot_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Pilot 2'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (pilot_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Tandem Instructor 1'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (tandem_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Tandem Instructor 2'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (tandem_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Videoman 1'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (video_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Videoman 2'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (video_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'AFF Instructor 1'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (aff_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'AFF Instructor 2'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (aff_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Coach 1'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (coach_role,)
    w.save(force_update=True)
    
    w = Worker()
    w.owner = location.owner
    w.location = location
    w.name = 'Coach 2'
    w.save(force_insert=True)
    w.spoken_langs = (en_sp,)
    w.roles = (coach_role,)
    w.save(force_update=True)

    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'Tandem Jump'
    i.jump_type = tandem_jump
    i.jump_type_auto = True
    i.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 200
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 250
    p.default = True
    p.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = tandem_role
    h.count = 1
    h.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'Tandem + Video'
    i.jump_type = tandem_jump
    i.jump_type_auto = True
    i.save(force_insert=True)
    def_item = LocationCatalogItem.objects.get(pk=i.pk)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 250
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 300
    p.default = True
    p.save(force_insert=True)
    def_price = LocationCatalogPrice.objects.get(pk=p.pk)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = tandem_role
    h.count = 1
    h.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = video_role
    h.count = 1
    h.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'AFF Program'
    i.jump_type = aff_jump
    i.jump_type_auto = True
    i.reuseable = True
    i.min_use = 1
    i.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 1200
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 1500
    p.default = True
    p.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.recurrence = 4
    e.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = aff_role
    h.count = 1
    h.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.recurrence = 3
    e.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = aff_role
    h.count = 2
    h.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = '13,000 feet Jump Ticket'
    i.jump_type = belly_jump
    i.save(force_insert=True)
    def_member_item = LocationCatalogItem.objects.get(pk=i.pk)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 20
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 20
    p.default = True
    p.save(force_insert=True)
    def_member_price = LocationCatalogPrice.objects.get(pk=p.pk)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = '4,000 feet Jump Ticket'
    i.jump_type = hpop_jump
    i.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 10
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 10
    p.default = True
    p.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 4000
    e.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'Video Jump'
    i.jump_type = belly_jump
    i.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 80
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 100
    p.default = True
    p.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = video_role
    h.count = 1
    h.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'Coached Jump'
    i.jump_type = belly_jump
    i.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 100
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 150
    p.default = True
    p.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 13000
    e.save(force_insert=True)
    h = LocationCatalogHire()
    h.owner = location.owner
    h.element = e
    h.worker_type = coach_role
    h.count = 1
    h.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'Passenger Slot'
    i.jump_type = no_jump
    i.jump_type_auto = True
    i.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 25
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 25
    p.default = True
    p.save(force_insert=True)
    e = LocationCatalogElement()
    e.owner = location.owner
    e.item = i
    e.altitude = 0
    e.save(force_insert=True)
    
    i = LocationCatalogItem()
    i.owner = location.owner
    i.location = location
    i.name = 'Rigg Rental'
    i.jump_type = no_jump
    i.jump_type_auto = True
    i.save(force_insert=True)
    rigg_item = LocationCatalogItem.objects.get(pk=i.pk)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = euro
    p.price = 20
    p.default = True
    p.save(force_insert=True)
    p = LocationCatalogPrice()
    p.owner = location.owner
    p.item = i
    p.currency = dollar
    p.price = 20
    p.default = True
    p.save(force_insert=True)
    
    p = MembershipProfile()
    p.owner = location.owner
    p.location = location
    p.name = 'Demo Profile'
    p.billing_mode = 'post'
    p.credit_line = 5000
    p.currency = dollar
    p.default_catalog_item = def_member_item
    p.default_catalog_price = def_member_price
    p.save(force_insert=True)
    def_profile = MembershipProfile.objects.get(pk=p.pk)
    e = ProfileExtraCatalog()
    e.owner = location.owner
    e.profile = p
    e.item = rigg_item
    e.save(force_insert=True)
    
    p = Person()
    p.owner = location.owner
    p.first_name = 'Jane'
    p.last_name = 'DOE'
    p.email = 'jane@doe.com'
    p.gender = 'F'
    p.self_created = False
    p.save(force_insert=True)
    m = LocationMembership()
    m.owner = location.owner
    m.location = location
    m.person = p
    m.join_type = 'I'
    m.approved = True
    m.new_approval = False
    m.profile = def_profile
    m.save(force_insert=True)
    c = Clearance()
    c.owner = location.owner
    c.location = location
    c.person = p
    c.approved = True
    c.new_approval = False
    c.start_date = now
    c.duration = 1
    c.unit = 'y'
    c.save(force_insert=True)
    
    p = Person()
    p.owner = location.owner
    p.first_name = 'John'
    p.last_name = 'DOE'
    p.email = 'john@doe.com'
    p.gender = 'M'
    p.self_created = False
    p.save(force_insert=True)
    m = LocationMembership()
    m.owner = location.owner
    m.location = location
    m.person = p
    m.join_type = 'I'
    m.approved = True
    m.new_approval = False
    m.profile = def_profile
    m.save(force_insert=True)
    c = Clearance()
    c.owner = location.owner
    c.location = location
    c.person = p
    c.approved = True
    c.new_approval = False
    c.start_date = now
    c.duration = 1
    c.unit = 'y'
    c.save(force_insert=True)
    
    for i in range(1,10):
        p = Person()
        p.owner = location.owner
        p.first_name = ''
        p.last_name = 'member %s' % i
        p.email = 'member%s@nowhere.com' % i
        p.self_created = False
        p.save(force_insert=True)
        m = LocationMembership()
        m.owner = location.owner
        m.location = location
        m.person = p
        m.join_type = 'I'
        m.approved = True
        m.new_approval = False
        m.profile = def_profile
        m.save(force_insert=True)
        c = Clearance()
        c.owner = location.owner
        c.location = location
        c.person = p
        c.approved = True
        c.new_approval = False
        c.start_date = now
        c.duration = 1
        c.unit = 'y'
        c.save(force_insert=True)
    
    location.currencies = (dollar,euro)
    location.default_currency = dollar
    location.public = False
    location.lmanager_default_catalog_item = def_item
    location.lmanager_default_catalog_price = def_price
    location.load_demo_data = False
    location.save(force_update=True)
    
    weather.update_location(location)
