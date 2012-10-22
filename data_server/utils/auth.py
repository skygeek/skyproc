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
import ujson
from django.http import HttpResponse, HttpResponseRedirect, Http404, HttpResponseServerError
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django.contrib.sessions.backends.db import SessionStore
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.conf import settings
from django.db import models

import misc

Person = models.get_model(settings.DATA_APP, 'Person')
EmailValidation = models.get_model(settings.DATA_APP, 'EmailValidation')
PasswordResetRequest = models.get_model(settings.DATA_APP, 'PasswordResetRequest')

def validate_request(req):
    if not req.user.is_authenticated():
        return HttpResponse('Unauthorized access', status=401)
    if req.session.has_key('locked') and req.method != 'GET':
        return HttpResponse('Session locked', status=403)
    return True

def is_email_verified(user):
    p = Person.objects.getOwn(user)
    return EmailValidation.objects.filter(person=p, email=p.email).count() == 0

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
    return HttpResponse(ujson.encode(ret))

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
    p = Person.objects.create(first_name=first_name, last_name=last_name, \
                              email=req.session["srp_name"], owner=user, self_created=True)
    
    # do not require email validation when debuggin
    if settings.DEBUG:
        return
    
    # email validation record
    validation_link = misc.get_tmp_link()
    EmailValidation.objects.create(person=p, email=p.email, validation_link=validation_link)
    
    # send confirmation email
    subject = "Confirm email address for Skyproc.com"
    name = "%s %s" % (p.first_name, p.last_name)
    msg = "Hi %s,\n\n" % name.strip()
    msg += "You're using this inbox as an email address on Skyproc.com.\n\n"
    msg += "To confirm this is correct, please go to https://%s/validate/email/%s\n\n" % \
            (settings.SP_HOME_URL, validation_link)
    msg += "____________\n"
    msg += "Skyproc.com"
    send_mail(subject, msg, settings.SENDER_EMAIL, [p.email])

def create_pwd_reset_request(user):
    p = Person.objects.getOwn(user)
    reset_link = misc.get_tmp_link()
    PasswordResetRequest.objects.create(person=p, reset_link=reset_link)
    
    # do not send email in debug mode
    if settings.DEBUG:
        return
    
    # send pwd reset email
    subject = "Reset password for Skyproc.com"
    name = "%s %s" % (p.first_name, p.last_name)
    msg = "Hi %s,\n\n" % name.strip()
    msg += "Someone (probably you) has requested a new password for your account on Skyproc.com.\n\n"
    msg += "To confirm this and create a new password, please go to https://%s/reset/password/%s\n\n" % \
            (settings.SP_HOME_URL, reset_link)
    msg += "Otherwise, simply ignore this message.\n\n"
    msg += "____________\n"
    msg += "Skyproc.com"
    send_mail(subject, msg, settings.SENDER_EMAIL, [p.email])

def cancel_pwd_reset_request(user):
    p = Person.objects.getOwn(user)
    PasswordResetRequest.objects.filter(person=p).delete()
