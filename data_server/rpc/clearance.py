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
from django.http import Http404
from django.conf import settings
from django.http import HttpResponseForbidden
from django.core.exceptions import ObjectDoesNotExist

from data import comet

Clearance = models.get_model(settings.DATA_APP, 'Clearance')
Person = models.get_model(settings.DATA_APP, 'Person')

def __get_clearance_rec(clearance_uuid):
    try: rec = Clearance.objects.get_by_natural_key(clearance_uuid)
    except ObjectDoesNotExist: raise Http404
    # ownership verification
    if rec.person != Person.objects.getOwn(req.user):
        return False
    return rec

def __delete_clearance(clearance_uuid):
    rec = __get_clearance_rec(clearance_uuid)
    if rec is False: return HttpResponseForbidden('Access denied')
    rec.delete()
    comet.Notifier(req, rec, 'delete')

def hasOne(location_uuid, person_uuid):
    r = Clearance.objects.filter(deleted=False, location__uuid=location_uuid, person__uuid=person_uuid, \
                                 start_date__gte=datetime.date.today().strftime('%Y-%m-%d'))
    return r.count() > 0

def cancel(clearance_uuid):
    __delete_clearance(clearance_uuid)

