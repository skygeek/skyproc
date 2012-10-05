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

from data import comet

def undelete(model_name, record_uuid):
    model = models.get_model(settings.DATA_APP, model_name)
    if model is None:
        raise Http404
    try: rec = model.objects.get_by_natural_key(record_uuid)
    except ObjectDoesNotExist: raise Http404
    if rec.owner != req.user:
        return HttpResponseForbidden('Access denied')    
    rec.deleted = False
    rec.save(force_update=True)
    comet.Notifier(req, rec, 'create')
    