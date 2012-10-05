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

from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.middleware import csrf
from django.core import context_processors
from django.contrib import auth
from django.db import models
from django.conf import settings

Person = models.get_model(settings.DATA_APP, 'Person')

def __home(req, prod):
    if req.user.is_authenticated():
        u = Person.objects.getOwn(req.user)
        t = 'wapp_prod.html' if prod else 'wapp_dev.html'
        r = render_to_response(t)
        r.set_cookie('csrftoken', csrf.get_token(req))
        r.set_cookie('sp_user', req.user.username)
        r.set_cookie('sp_cookie', req.COOKIES['sessionid'])
        r.set_cookie('sp_id', u.uuid)
        return r
    else:
        c = {}
        c.update(context_processors.csrf(req))
        return render_to_response('home.html', c)

def home(req):
    return __home(req, False)
    
def prod(req):
    return __home(req, True)

def logout(req):
    auth.logout(req)
    r = HttpResponseRedirect('/')
    r.delete_cookie('sessionid')
    r.delete_cookie('csrftoken')
    r.delete_cookie('sp_cookie')
    r.delete_cookie('sp_user')
    return r
