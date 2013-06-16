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

Location = models.get_model(settings.DATA_APP, 'Location')
Account = models.get_model(settings.DATA_APP, 'Account')

def get_grand_total(location_uuid, negativeOnly, positiveOnly,currencies):
    try: location = Location.objects.get_by_natural_key(location_uuid)
    except ObjectDoesNotExist: raise Http404
    if req.user != location.owner:
        return HttpResponseForbidden('Access denied')
    ret = {}
    filters = {}
    filters['membership__location'] = location
    if negativeOnly: filters['balance__lt'] = 0
    if positiveOnly: filters['balance__gt'] = 0
    if currencies: filters['currency__uuid__in'] = currencies
    for account in Account.objects.filter(**filters):
        if not ret.has_key(account.currency.code):
            ret[account.currency.code] = 0
        ret[account.currency.code] += account.balance
    for i in ret:
        ret[i] = str(ret[i])
    return ret

