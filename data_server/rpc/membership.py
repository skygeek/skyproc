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

from data import comet

Person = models.get_model(settings.DATA_APP, 'Person')
Location = models.get_model(settings.DATA_APP, 'Location')
LocationMembership = models.get_model(settings.DATA_APP, 'LocationMembership')

def __get_membership_rec(membership_uuid):
    try: rec = LocationMembership.objects.get_by_natural_key(membership_uuid)
    except ObjectDoesNotExist: raise Http404
    # ownership verification
    if rec.person != Person.objects.getOwn(req.user):
        return False
    return rec

def __delete_membership(membership_uuid):
    rec = __get_membership_rec(membership_uuid)
    if rec is False: return HttpResponseForbidden('Access denied')
    rec.delete()
    comet.Notifier(req, rec, 'delete')

def rejectInvitation(membership_uuid):
    return __delete_membership(membership_uuid)
    
def acceptInvitation(membership_uuid):
    rec = __get_membership_rec(membership_uuid)
    if rec is False: return HttpResponseForbidden('Access denied')
    rec.approved = True
    rec.save(force_update=True)
    comet.Notifier(req, rec, 'update')
    rec.post_save()
    
def ackInvitation(membership_uuid):
    rec = __get_membership_rec(membership_uuid)
    if rec is False: return HttpResponseForbidden('Access denied')
    rec.new_approval = False
    rec.save(force_update=True)

def leaveLocation(membership_uuid):
    return __delete_membership(membership_uuid)

def cancelRequest(membership_uuid):
    return __delete_membership(membership_uuid)

def emailExists(email):
    try:
        Person.objects.get(email=email, deleted=False)
        return True
    except ObjectDoesNotExist:
        return False
