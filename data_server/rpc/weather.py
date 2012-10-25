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

import ujson
from django.db import models
from django.http import Http404
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseForbidden
from django.core import serializers

from utils import weather

Location = models.get_model(settings.DATA_APP, 'Location')

def update(location_uuid):
    try: location = Location.objects.get_by_natural_key(location_uuid)
    except ObjectDoesNotExist: raise Http404
    if req.user != location.owner:
        return HttpResponseForbidden('Access denied')
    rec = weather.update_location(location)
    if rec:
        return serializers.serialize("json", [rec], use_natural_keys=True, \
                            excludes=('created', 'modified', 'deleted', 'owner'))
