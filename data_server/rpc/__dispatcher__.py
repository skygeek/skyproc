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

from django.http import HttpResponse, Http404, HttpResponseServerError
from django.conf import settings
import logging
import cjson
import pprint

from utils import auth

def dispatch(req, rpc_path):
    # auth
    r = auth.is_user_authenticated(req)
    if r is not True:
        return r
    
    # respond only to POST requests
    if req.method != 'POST':
        raise Http404
    
    try:
        path = rpc_path.split('/')
        if len(path) < 2:
            raise Exception
        func_name = path[-1]
        path = '.'.join(path[:-1])
    except Exception, e:
        msg = "Invalid request"
        if settings.DEBUG:
            msg += ": %s (%s)" % (e, rpc_path)
        return HttpResponseServerError(msg)
    try:
        module = __import__(path, globals(), locals(), [func_name], -1)
        module.req = req
    except ImportError:
        raise Http404
    except Exception, e:
        msg = "Module error"
        if settings.DEBUG:
            msg += ": %s (%s)" % (e, rpc_path)
        return HttpResponseServerError(msg)
    if hasattr(module, func_name):
        f = getattr(module, func_name)
    else:
        raise Http404
    
    # decode args
    try:
        args = cjson.decode(req.body)
    except Exception, e:
        msg = 'JSON decode error: %s' % (e)
        if settings.DEBUG:
            msg += ' (%s)' % req.body
            logging.debug(msg)
        return HttpResponseServerError(msg)
    
    # execute function
    try:
        if isinstance(args, list):
            ret = f(*args)
        elif isinstance(args, dict):
            ret = f(**args)
        else:
            ret = f(args)
    except Http404:
        raise
    except Exception, e:
        if settings.DEBUG:
            msg = "%s(%s) error: %s" % (f.__name__, args, e)
            logging.debug(msg)
        else:
            msg = "%s() error: %s" % (f.__name__, e)
        return HttpResponseServerError(msg)
    
    if settings.DEBUG:
        logging.debug('='*60)
        logging.debug("User: %s" % req.user)
        logging.debug("Module: %s" % module)
        logging.debug("Function: %s" % f)
        logging.debug("Args: %s" % args)
        logging.debug("Return:")
        logging.debug(pprint.pformat(ret))
        logging.debug('='*60)
        
    if isinstance(ret, HttpResponse):
        return ret
    
    # encode return value
    try:
        r = cjson.encode(ret)
    except Exception, e:
        msg = 'JSON encode error'
        if settings.DEBUG:
            msg += ': %s (%s)' % (e, ret)
            logging.debug(msg)
        return HttpResponseServerError(msg)
    
    return HttpResponse(r)
