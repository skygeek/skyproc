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

import httplib
import urllib
import logging
import cPickle
import base64
import cjson
from django.db import models
from django.conf import settings
from django.core import serializers

class Notifier:
    
    def __init__(self, req=None, record=None, operation=None):
        self.req = req
        self.record = record
        self.operation = operation
        if self.req:
            custom_handler = 'on' + record._meta.object_name + operation[0].upper() + operation[1:]
            model_handler = 'on' + record._meta.object_name + 'Change'
            if hasattr(self, custom_handler): getattr(self, custom_handler)()
            elif hasattr(self, model_handler): getattr(self, model_handler)()
            else: self.notify() 
        
    def postMessage(self, message):
        try:
            params = urllib.urlencode({'msg': base64.b64encode(cPickle.dumps(message))})
            headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
            conn = httplib.HTTPSConnection("%s:%s" % (settings.COMET_SERVER, settings.COMET_PORT))
            conn.request("POST", "/datachanged", params, headers)
            r = conn.getresponse()
            conn.close()
            if r.status != 200 and settings.DEBUG:
                logging.debug('COMET NOTIFICATION POST FAILED: %s'% r.reason)
        except Exception, e:
            if settings.DEBUG:
                logging.debug('COMET NOTIFICATION FAILED: %s'% e)
            
    def notify(self):
        message = {}
        message['model'] = self.record._meta.object_name
        message['operation'] = self.operation
        message['uuid'] = self.record.uuid
        message['user'] = self.req.user.username
        message['session'] = self.req.COOKIES['sessionid']
        self.postMessage(message)
        
    def onLocationMembershipChange(self):
        self.notify()
        # join request
        if (not (self.record.approved and not self.record.new_approval)) or self.operation == 'delete':
            if self.req.user != self.record.owner:
                message = {}
                message['model'] = 'LocationMembership'
                message['operation'] = self.operation
                message['uuid'] = self.record.uuid
                message['user'] = self.record.location.owner.username
                message['session'] = None
                self.postMessage(message)
            else: # invite
                message = {}
                message['model'] = 'LocationMembership_R'
                message['operation'] = self.operation
                message['uuid'] = self.record.uuid
                message['user'] = self.record.person.owner.username
                message['session'] = None
                self.postMessage(message)

    def onClearanceChange(self):
        # operation by person: clearance request/cancel
        # notify owner
        if self.req.user != self.record.location.owner:
            message = {}
            message['model'] = 'Clearance_R'
            message['operation'] = self.operation
            message['uuid'] = self.record.uuid
            message['user'] = self.req.user.username
            message['session'] = self.req.COOKIES['sessionid']
            self.postMessage(message)
            message = {}
            message['model'] = 'Clearance'
            message['operation'] = self.operation
            message['uuid'] = self.record.uuid
            message['user'] = self.record.location.owner.username
            message['session'] = None
            self.postMessage(message)
        # operations by owner
        # notify person
        else:
            self.notify()
            # notify for reject
            if self.operation == 'delete':
                message = {}
                message['model'] = 'Clearance_R'
                message['operation'] = self.operation
                message['uuid'] = self.record.uuid
                message['user'] = self.record.person.owner.username
                message['session'] = None
                self.postMessage(message)
            # notify for accept
            elif self.record.approved and self.record.new_approval:
                notif_data = {}
                notif_data['owner'] = self.record.person.owner
                notif_data['type'] = 'got_clearance'
                notif_data['text'] = self.record.location.name
                notif_data['text2'] = serializers.serialize('json', [self.record], fields=('start_date','end_date','duration','unit'))
                notif_data['picture'] = self.record.person.picture if self.record.person.picture else '/static/images/globe.png' 
                # create notification
                notif = models.get_model(settings.DATA_APP, 'Notification').objects.create(**notif_data)
                # comet notify
                message = {}
                message['model'] = 'Clearance_R'
                message['operation'] = self.operation
                message['uuid'] = self.record.uuid
                message['user'] = self.record.person.owner.username
                message['session'] = None
                self.postMessage(message)
                message = {}
                message['model'] = 'Notification'
                message['operation'] = 'create'
                message['uuid'] = notif.uuid
                message['user'] = self.record.person.owner.username
                message['session'] = None
                self.postMessage(message)
                # new_approval ==> false
                self.record.new_approval = False
                self.record.save(force_update=True)
