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

import time
import django.contrib.auth
from django.conf import settings 
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.shortcuts import render_to_response
from django.middleware import csrf
from django.core import context_processors
from django.db import models
from django.contrib.auth.models import User

from utils import auth
from utils import weather
from utils import misc

Person = models.get_model(settings.DATA_APP, 'Person')
EmailValidation = models.get_model(settings.DATA_APP, 'EmailValidation')
PasswordResetRequest = models.get_model(settings.DATA_APP, 'PasswordResetRequest')

def login(req, prod=None):
    if req.user.is_authenticated() and not req.session.has_key('locked'):
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
    c['link_text'] = "Return"
    return render_to_response('login_msg.html', c)

def validate_email(req, validation_link):
    try: v = EmailValidation.objects.get(validation_link=validation_link)
    except EmailValidation.DoesNotExist: raise Http404
    v.delete()
    user = django.contrib.auth.authenticate(username=v.email, M=(None, None))
    django.contrib.auth.login(req, user)
    c = {}
    c['title'] = "Account activated"
    c['msg'] = "%s has been confirmed as your Skyproc email address. Thank you for registering !" % v.email
    c['link_text'] = "Enter Skyproc"
    return render_to_response('login_msg.html', c)

def reset_password(req, reset_link):
    
    if req.method == 'GET' and reset_link:
        try: r = PasswordResetRequest.objects.get(reset_link=reset_link)
        except PasswordResetRequest.DoesNotExist: raise Http404
        c = context_processors.csrf(req)
        c['email'] = r.person.email
        return render_to_response('pwd_reset.html', c)
        
    if req.method == 'POST':
        try:
            user = User.objects.get(username=req.POST['s_email'])
            auth.create_pwd_reset_request(user)
        except:
            misc.fake_processing(2, 5) # dont return too quickly
        # always return "mail sent" message even if no message was sent
        # otherwise it can be possible to check if an email exists in the database
        c = {}
        c['title'] = "Mail sent !"
        c['msg'] = "Check your email inbox, you will have received an email containing the link to reset your password."
        c['link_text'] = "Return"
        return render_to_response('login_msg.html', c)
    
    raise Http404

def password_reset_succeeded(req):
    c = {}
    c['title'] = "Password changed !"
    c['msg'] = "Your new password has been saved."
    c['link_text'] = "Enter Skyproc"
    return render_to_response('login_msg.html', c)


# webcron
def weather_update(req):
    if req.META['REMOTE_ADDR'] != '127.0.0.1':
        raise Http404
    weather.update()
    return HttpResponse()


