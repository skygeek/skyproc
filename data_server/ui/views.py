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

import django.contrib.auth 
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render_to_response
from django.middleware import csrf
from django.core import context_processors
from django.db import models
from django.conf import settings

from utils import auth

Person = models.get_model(settings.DATA_APP, 'Person')

def login(req, prod=None):
    if req.user.is_authenticated():
        if prod is None:
            prod = not settings.DEBUG
        u = Person.objects.getOwn(req.user)
        t = 'wapp_prod.html' if prod else 'wapp_dev.html'
        r = render_to_response(t)
        r.set_cookie('sp_user', req.user.username, secure=True)
        r.set_cookie('sp_session', req.COOKIES['sessionid'], secure=True)
        r.set_cookie('sp_id', u.uuid, secure=True)
        return r
    else:
        return render_to_response('login.html', context_processors.csrf(req))

def prod(req):
    return login(req, True)

def logout(req):
    django.contrib.auth.logout(req)
    r = HttpResponseRedirect('/')
    r.delete_cookie('sessionid')
    r.delete_cookie('sp_user')
    r.delete_cookie('sp_session')
    r.delete_cookie('sp_id')
    return r

def registration_succeeded(req):
    c = {}
    c['title'] = "Registration succeeded !"
    c['msg'] = "Check your email inbox, you will have received an email containing the link to activate your account."
    return render_to_response('login_msg.html', c)

def password_reset_succeeded(req):
    c = {}
    c['title'] = "Mail sent !"
    c['msg'] = "Check your email inbox, you will have received an email containing the link to reset your password."
    return render_to_response('login_msg.html', c)
    
def validate_registration(req):
    # FIXME: complete validation and error notification
        
    result = auth.validate_captcha(req.POST['challenge'], req.POST['response'], req.META['REMOTE_ADDR'])
    if result.is_valid:
        return HttpResponse()
    else:
        return HttpResponse(result.error_code)

