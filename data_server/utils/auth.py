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
import logging
import cjson
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django.contrib.sessions.backends.db import SessionStore
from django.core.exceptions import ObjectDoesNotExist
from data import models

def is_user_authenticated(req):
    if req.user.is_authenticated():
        return True
    return HttpResponse('Unauthorized access', status=401)

def validate_session_id(req, session_id):
    if req.META['REMOTE_ADDR'] != '127.0.0.1':
        raise Http404    
    try:
        session = Session.objects.get(pk=session_id, expire_date__gt=datetime.datetime.now())
        session_data = SessionStore().decode(session.session_data)
        user = User.objects.get(pk=session_data['_auth_user_id'])
        if not user.is_authenticated(): raise ObjectDoesNotExist
    except ObjectDoesNotExist: raise Http404
    ret = {'username': user.username}
    return HttpResponse(cjson.encode(ret))

def register_sp_user(req, user):
    # split name
    try:
        fullname = req.POST['fullname'].strip().split()
        if len(fullname) == 0:
            raise Exception
        elif len(fullname) == 1:
            first_name = fullname[0]
            last_name = ''
        else:
            first_name = fullname[0]
            last_name = ' '.join(fullname[1:])
    except:
        first_name = last_name = ''
    # create Person record owned by the associated django user
    models.Person(first_name=first_name, last_name=last_name, email=req.session["srp_name"], owner=user).save(self_create=True)
