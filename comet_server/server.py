#!/usr/bin/env python

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

import sys
import os
import pwd
import logging
import httplib
import cPickle
import base64
import threading
import copy
import ssl
import ujson
import tempfile
from os import path as op

import tornado.web
import tornadio2
import tornadio2.router
import tornadio2.server
import tornadio2.conn

class DataChangeHandler(tornado.web.RequestHandler):
    def post(self):
        if self.request.remote_ip != '127.0.0.1':
            return
        try: message = cPickle.loads(base64.b64decode(self.get_argument('msg')))
        except: return
        DataChangeDispatcher(message)
        
class DataChangeDispatcher(threading.Thread):

    def __init__(self, message):
        threading.Thread.__init__(self)
        self.message = message
        self.start()

    def run(self):
        message = {}
        message['type'] = 'datachanged'
        message['data'] = copy.copy(self.message)
        del message['data']['user']
        del message['data']['session']
        message = ujson.encode(message)
        for conn in CONNECTIONS:
            if conn.user and conn.user['username'] == self.message['user'] \
            and conn.session_id != self.message['session']:
                try: conn.send(message)
                except Exception, e:
                    logging.error("Failed to send data change notification to session %s: %s" % (conn.session_id, e))
        
class Connection(tornadio2.conn.SocketConnection):
    
    def __authenticate_user(self, session_id):
        conn = httplib.HTTPSConnection("127.0.0.1")
        conn.request("GET", "/session/%s" % session_id)
        r = conn.getresponse()
        if r.status == 200: body = r.read()
        else: body = None
        conn.close()
        if body:
            self.user = ujson.decode(body)
            self.session_id = session_id
            CONNECTIONS.add(self)
            log_msg = ["Connection authenticated"]
            log_msg.append("remote-address=%s" % self.infos.ip)
            log_msg.append("user=%s" % self.user['username'])
            log_msg.append("session-id=%s" % self.session_id)
            logging.info(', '.join(log_msg))

    def on_open(self, infos):
        self.infos = infos
        self.user = None
        self.session_id = None
        
    def on_message(self, msg):
        if self.user is None:
            if msg.startswith('sp:'):
                self.__authenticate_user(msg[3:])
        if self.user is None:
            # Closing unauthenticated connection
            self.close()
            
    def on_close(self):
        try: CONNECTIONS.remove(self)
        except KeyError: pass 
        log_msg = ["Connection closed"]
        log_msg.append("remote-address=%s" % self.infos.ip)
        if self.user:
            log_msg.append("user=%s" % self.user['username'])
        if self.session_id:
            log_msg.append("session-id=%s" % self.session_id)
        logging.info(', '.join(log_msg))
 

private_dir = '/opt/skyproc/comet/var'
def get_private_copy(src):
    if not src: return
    f, p = tempfile.mkstemp(prefix='.', dir=private_dir)
    src_file = open(src, 'r')
    os.write(f, src_file.read())
    src_file.close()
    os.close(f)
    os.system("chown %s %s" % (settings.COMET_USER, p))
    return p

# setup logging level
logging.getLogger().setLevel(logging.INFO)

# import django settings
sys.path.append('/opt/skyproc/data_server')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "data_server.settings")
from django.conf import settings

# clean private dir
os.system("rm -rf %s >/dev/null 2>&1" % private_dir)
os.system("mkdir -p %s" % private_dir)
os.system("chown %s %s" % (settings.COMET_USER, private_dir))
os.system("chmod 500 %s" % private_dir)

# set socket ssl options
ssl_options = {}
ssl_options['certfile'] = get_private_copy(settings.COMET_CERT_FILE)
ssl_options['keyfile'] = get_private_copy(settings.COMET_KEY_FILE)
ssl_options['ca_certs'] = get_private_copy(settings.COMET_CA_CERT)
if ssl_options['ca_certs']: ssl_options['cert_reqs'] = ssl.CERT_OPTIONAL

# drop privileges
os.setuid(pwd.getpwnam(settings.COMET_USER)[2])

# global connections list
CONNECTIONS = set()

# Create router
router = tornadio2.router.TornadioRouter(Connection, {'websocket_check':True})

# Create application
application = tornado.web.Application(
        router.apply_routes([
                    (r"/datachanged", DataChangeHandler),
        ]),
        socket_io_port = settings.COMET_PORT, 
)

# start server
tornadio2.server.SocketServer(application, ssl_options=ssl_options)
