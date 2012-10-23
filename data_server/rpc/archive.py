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
from django.http import Http404
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseForbidden

JumpLog = models.get_model(settings.DATA_APP, 'JumpLog')
Person = models.get_model(settings.DATA_APP, 'Person')

def create_jump(jump_data):
    jump_data['owner'] = Person.objects.getOwn(req.user).uuid
    r = JumpLog(**jump_data)
    r.save(force_insert=True)
    return r.number

def edit_jump(jump_data):
    try: jump_log = JumpLog.objects.get(uuid=jump_data['uuid'])
    except ObjectDoesNotExist: raise Http404
    if Person.objects.getOwn(req.user).uuid != jump_log.owner:
        return HttpResponseForbidden('Access denied')
    try: del jump_data['owner']
    except KeyError: pass
    for k, v in jump_data.iteritems():
        setattr(jump_log, k, v)
    jump_log.save(force_update=True)

def delete_jump(jump_uuid):
    try: jump_log = JumpLog.objects.get(uuid=jump_uuid)
    except ObjectDoesNotExist: raise Http404
    if Person.objects.getOwn(req.user).uuid != jump_log.owner:
        return HttpResponseForbidden('Access denied')
    jump_log.delete()
