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
import logging
import httplib
import cPickle
import base64
import threading
import copy
import cjson

from os import path as op

import tornado.web
import tornadio2
import tornadio2.router
import tornadio2.server
import tornadio2.conn

ROOT = op.normpath(op.dirname(__file__))
CONNECTIONS = set()

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
        message = cjson.encode(message)
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
            self.user = cjson.decode(body)
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

# Create router
router = tornadio2.router.TornadioRouter(Connection, {'websocket_check':True})

# Create application
application = tornado.web.Application(
        router.apply_routes([
                    (r"/datachanged", DataChangeHandler),
        ]),
        socket_io_port = 8080, 
)

# setup logging
logging.getLogger().setLevel(logging.DEBUG)

# start server
tornadio2.server.SocketServer(application, ssl_options={
        "certfile": "server.crt",
        "keyfile":  "server.key",
})
