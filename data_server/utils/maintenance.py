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
import time
import datetime
from django.db import models
from django.conf import settings

def purge_deleted():
    start = time.time()
    for m in (
        'Location',
        'Aircraft',
        'ExitRule',
        'CatalogItem',
        'CatalogItemPrice',
        'CatalogItemElement',
        'CatalogItemElementHire',
        'Clearance',
        'Load',
        'Slot',
        'MapObject',
        'LocationCatalogItem',
        'LocationCatalogPrice',
        'LocationCatalogElement',
        'LocationCatalogHire',
        'LocationMembership',
        'MembershipCatalog',
        'MembershipExtraCatalog',
        'MembershipProfile',
        'MembershipProfile',
        'ProfileCatalog',
        'ProfileExtraCatalog',
        'Notification',
        'Worker',
        'Person',
        'Phantom',
        'Account',
        'AccountOperation',
        'BuyedItem',
    ): models.get_model(settings.DATA_APP, m).objects.filter(deleted=True).delete()
    logging.info("Deleted purge complete: %s" % str(time.time()-start))
        
def purge_expired():
    start = time.time()
    now = datetime.datetime.now()
    today = datetime.date.today()
    
    # purge tmp links not used within 24h
    y = now-datetime.timedelta(days=1)
    models.get_model(settings.DATA_APP, 'EmailValidation').objects.filter(created__lte=y).delete()
    models.get_model(settings.DATA_APP, 'PasswordResetRequest').objects.filter(created__lte=y).delete()
    
    # purge expired clearances
    y = today-datetime.timedelta(days=1)
    models.get_model(settings.DATA_APP, 'Clearance').objects.filter(end_date__lte=y).delete()
    models.get_model(settings.DATA_APP, 'Clearance').objects.filter(start_date__lte=y, duration=None).delete()
    for c in models.get_model(settings.DATA_APP, 'Clearance').objects.filter(end_date=None, duration__gt=0):
        if c.unit == 'd': period = datetime.timedelta(days=c.duration-1)
        elif c.unit == 'w': period = datetime.timedelta(weeks=c.duration)
        elif c.unit == 'm': period = datetime.timedelta(days=30)*c.duration+datetime.timedelta(days=1)
        elif c.unit == 'y': period = datetime.timedelta(days=365)*c.duration
        else: period = datetime.timedelta()
        end_date = c.start_date + period
        if end_date <= y:
            c.delete()

    # purge locations archives
    for location in models.get_model(settings.DATA_APP, 'Location').objects.all():
        loads_last = today - datetime.timedelta(days=location.archive_loads_period)
        accounts_last = today - datetime.timedelta(days=location.archive_accounts_period)
        models.get_model(settings.DATA_APP, 'LoadLog').objects.filter(location=location.uuid, date__lte=loads_last).delete()
        models.get_model(settings.DATA_APP, 'AccountOperationLog').objects.filter(location=location.uuid, date__lte=accounts_last).delete()
        for membership in location.locationmembership_set.all():
            for account in membership.account_set.all():
                account.accountoperation_set.filter(created__lte=accounts_last).delete()

    # purge notifications
    last = today-datetime.timedelta(days=30)
    models.get_model(settings.DATA_APP, 'Notification').objects.filter(new=False, created__lte=last).delete()
    
    # purge consumed buyed items
    models.get_model(settings.DATA_APP, 'BuyedItem').objects.filter(consumed=True).delete()
    
    logging.info("Expired purge complete: %s" % str(time.time()-start))
