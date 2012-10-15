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
import uuid
import cjson
from django.http import HttpResponse, HttpResponseRedirect, Http404, HttpResponseServerError
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django.contrib.sessions.backends.db import SessionStore
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.conf import settings
from django.db import models

from recaptcha.client import captcha

Person = models.get_model(settings.DATA_APP, 'Person')
EmailValidation = models.get_model(settings.DATA_APP, 'EmailValidation')

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
    p = Person.objects.create(first_name=first_name, last_name=last_name, \
                              email=req.session["srp_name"], owner=user, self_created=True)
    validation_link = ''
    for i in range(4):
        validation_link += str(uuid.uuid4()).replace('-','')
    EmailValidation.objects.create(person=p, email=p.email, validation_link=validation_link)
    
    # send confirmation email
    subject = "Confirm email address for Skyproc.com"
    msg = "Hi %s %s,\n\n" % (p.first_name, p.last_name)
    msg += "You're using this inbox as an email address on Skyproc.com.\n\n"
    msg += "To confirm this is correct, please go to https://www.skyproc.com/validate/email/%s\n\n" % validation_link
    msg += "____________________\n"
    msg += "Skyproc.com"
    
    send_mail(subject, msg, settings.SENDER_EMAIL, [p.email])
    
    
    
def validate_captcha(challenge, response, remoteip):
    return captcha.submit(challenge, response, settings.CAPTCHA_PK, remoteip)
 
