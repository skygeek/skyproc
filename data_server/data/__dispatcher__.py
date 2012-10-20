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
import uuid
import datetime
import ujson
import pprint

import logging
from django.db import models
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core import serializers
from django.http import HttpResponse, Http404, HttpResponseServerError, \
    HttpResponseForbidden, HttpResponseNotAllowed, HttpResponseBadRequest         
from django.conf import settings

import comet
from utils import auth, misc

""" Helpers
"""

def __get_model(model_name):
    model = models.get_model(settings.DATA_APP, model_name)
    if model and (not hasattr(model, 'private') or not model.private):
        return model
    raise Http404

def __get_fields(model, config):
    fields_list = ['uuid']
    for f in ('created', 'modified'):
        if hasattr(model, 'show_'+f) and getattr(model, 'show_'+f):
            fields_list.append(f)
        
    if config['public_view']:
        if hasattr(model, 'public_fields'):
            fields_def = model.public_fields
        else:
            fields_def = ''
    elif config['related_view']:
        if hasattr(model, 'related_fields'):
            fields_def = model.related_fields
        else:
            fields_def = ''
    else:
        if hasattr(model, 'fields'):
            fields_def = model.fields
        else:
            fields_def = '+all'
            
    if isinstance(fields_def, (str, unicode)):
        fields = {}
        fields['self'] = fields['other'] = fields_def
    elif isinstance(fields_def, dict):
        fields = fields_def
        if not fields.has_key('self'):
            fields['self'] = '' if config['public_view'] or config['related_view'] else '+all'
        if not fields.has_key('other'):
            fields['other'] = '' if config['public_view'] or config['related_view'] else '+all'
    else:
        return fields_list

    if model is config['model']:
        fields = fields['self']
    elif fields.has_key(config['model']._meta.object_name):
        fields = fields[config['model']._meta.object_name]
    else:
        fields = fields['other']
        
    if not fields:
        return fields_list
        
    include_all = False
    include_list = []
    exclude_list = []
    for i in fields.split():
        if i.lower() == '+all':
            include_all = True
            continue
        if i.startswith('-'):
            exclude_list.append(i[1:])
        else:
            include_list.append(i)
    
    for field in model._meta.local_fields:
        if field.name in settings.RESERVED_MODEL_FIELDS:
            continue
        if include_all:
            if field.name in exclude_list:
                continue
        else:
            if field.name not in include_list:
                continue
        fields_list.append(field.name)
        
    return fields_list
    
def __filter_fields(fields, filter):
    filtered_fields = []
    for i in fields:
        if i != 'uuid' and i not in filter:
            continue
        filtered_fields.append(i)
    return filtered_fields

def __include_relation(model, config, related_model):
    if hasattr(related_model, 'private') and related_model.private:
        return
    if config['public_view']:
        if not hasattr(model, 'public_relations') or not model.public_relations:
            return
        relations_def = model.public_relations
    elif config['related_view']:
        if not hasattr(model, 'related_relations') or not model.related_relations:
            return
        relations_def = model.related_relations
    else:    
        if not hasattr(model, 'relations'):
            return True
        if not model.relations:
            return
        relations_def = model.relations
    
    if isinstance(relations_def, (str, unicode)):
        relations = {}
        relations['self'] = relations['other'] = relations_def
    elif isinstance(relations_def, dict):
        relations = relations_def
        if not relations.has_key('self'):
            relations['self'] = '' if config['public_view'] or config['related_view'] else '+all'
        if not relations.has_key('other'):
            relations['other'] = '' if config['public_view'] or config['related_view'] else '+all'
    else:
        return

    if model is config['model']:
        relations = relations['self']
    elif relations.has_key(config['model']._meta.object_name):
        relations = relations[config['model']._meta.object_name]
    else:
        relations = relations['other']
        
    if not relations:
        return
        
    include_all = False
    include_list = []
    exclude_list = []
    for i in relations.split():
        if i.lower() == '+all':
            include_all = True
            continue
        if i.startswith('-'):
            exclude_list.append(i[1:])
        else:
            include_list.append(i)
    
    if include_all:
        return related_model._meta.object_name not in exclude_list
    else:
        return related_model._meta.object_name in include_list
    
def __get_related_relations(model, config, store_object, caller_model, depth):
    # avoid recursive call to the root model
    if model is config['model']:
        return
    relations = __get_model_relations(model, config, caller_model, depth+1)
    if relations:
        store_object['relations'] = relations
        # add relations to fields list (if not exists)
        for f in relations.keys():
            if f not in store_object['fields']:
                store_object['fields'].append(f)

def __get_model_relations(model, config, caller_model=None, depth=0):
    
    # check isolated flag
    if hasattr(model, 'isolated') and model.isolated:
        return
    
    # check relations_depth flag
    if hasattr(config['model'], 'relations_depth') and depth > config['model'].relations_depth:
        return
    
    if settings.DEBUG:
        logging.debug('GET RELATIONS (%s) %s => %s' % (depth, caller_model, model))
    
    relations = {}
    
    # fk fields
    for field in model._meta.local_fields:
        if field.rel and field.name not in settings.RESERVED_MODEL_FIELDS and field.related.parent_model is not caller_model \
        and field.related_query_name() != '+' and __include_relation(model, config, field.related.parent_model):
            relations[field.name] = {}
            relations[field.name]['fields'] = __get_fields(field.related.parent_model, config)
            relations[field.name]['use_natural_keys'] = True
            __get_related_relations(field.related.parent_model, config, relations[field.name], model, depth)

    # m2m fields
    for field in model._meta.many_to_many:
        if __include_relation(model, config, field.related.parent_model):
            relations[field.name] = {}
            relations[field.name]['fields'] = __get_fields(field.related.parent_model, config)
            relations[field.name]['use_natural_keys'] = True
            __get_related_relations(field.related.parent_model, config, relations[field.name], model, depth)
            # add field to fields list at depth 1 only
            if model is config['model']:
                config['fields'].append(field.name)

    # related fk
    for rel in model._meta.get_all_related_objects():
        if __include_relation(model, config, rel.model):
            r_name = rel.model._meta.object_name.lower() + '_set'
            relations[r_name] = {}
            relations[r_name]['fields'] = __get_fields(rel.model, config)
            relations[r_name]['use_natural_keys'] = True
            __get_related_relations(rel.model, config, relations[r_name], model, depth)
        
    return relations
        
def __handle_m2m_fields(config): 
    for k,v in config['m2m_data'].items():
        m2m_field = getattr(config['rec'], k)
        m2m_field.clear()
        if v: m2m_field.add(*v)

def __execute_taks(req, config, tasks):
    #DEBUG_TASKS = settings.DEBUG
    DEBUG_TASKS = False
    failed_task = False
    for t in tasks:
        if DEBUG_TASKS:
            logging.debug('T'*60)
            logging.debug("Task: %s" % t)            
            logging.debug("Before: %s" % config)
        ret = t(req, config)
        if ret is None:
            if DEBUG_TASKS:
                logging.debug("CONFIG NOT CHANGED")
                logging.debug('T'*60)
        elif isinstance(ret, dict):
            if DEBUG_TASKS:
                logging.debug("After: %s" % config)
                logging.debug('T'*60)
            config = ret
        else:
            failed_task = True
            break
            
    if settings.DEBUG:
        logging.debug('C'*60)
        for k,v in config.iteritems():
            logging.debug("%s: %s" % (k, v))
        logging.debug('C'*60)
        
    if failed_task:
        return ret
    
    return config

""" Tasks
"""

def __parse_params(req, config):
    for k,l in req.GET.lists():
        v = []
        for i in l:
            try: i = ujson.decode(i)
            except: pass
            v.append(i)
        if len(v) == 1 and k not in ('fields',):
            v = v[0] 
        config['params'][k] = v
        
    return config

def __translate_path(req, config):
    data_path = config['data_path'].strip().split('/')
    config['public_view'] = False
    config['related_view'] = False
    if data_path[0].endswith('_P'):
        config['model_name'] = data_path[0][:-2]
        config['public_view'] = True
    elif data_path[0].endswith('_R'):
        config['model_name'] = data_path[0][:-2]
        config['related_view'] = True
    else:
        config['model_name'] = data_path[0]
    if config['public_view'] and req.method != 'GET':
        return HttpResponseNotAllowed('Not Allowed') 
    try: config['record_uuid'] = misc.validate_uuid(data_path[1])
    except IndexError:
        if req.method == 'GET':
            config['record_uuid'] = None
        else:
            return HttpResponseBadRequest("Bad Request")
    return config

def __load_model(req, config):
    config['model'] = __get_model(config['model_name'])
    if config['public_view'] and not hasattr(config['model'], 'public_fields'):
        raise Http404
    if config['related_view'] and not hasattr(config['model'], 'related_field'):
        raise Http404
    try:
        config['model']._meta.get_field_by_name('owner')
        config['anonymous'] = False
    except models.FieldDoesNotExist:
        config['anonymous'] = True
    config['archive'] = hasattr(config['model'], 'archive') and config['model'].archive
    if config['archive'] and req.method != 'GET':
        return HttpResponseNotAllowed('Not Allowed')
    return config

def __check_ownership(req, config):
    if not hasattr(config['rec'], 'owner'):
        if settings.DEBUG:
            logging.debug('ANONYMOUS MODELS HAS NO OWNERSHIP FIELD')
        return HttpResponseNotAllowed('Not Allowed')
    if config['rec'].owner.pk != req.user.pk:
        if settings.DEBUG:
            logging.debug('OWNERSHIP VERIFICATION FAILED')
        return HttpResponseForbidden('Access denied')

def __construct_fields(req, config):
    fields = __get_fields(config['model'], config)
    if config['params'].has_key('fields'):
        config['fields'] = __filter_fields(fields, config['params']['fields'])
    else:
        config['fields'] = fields 
    return config
          
def __construct_filters(req, config):    
    # get filters if any
    if config['params'].has_key('filter'):
        for filter in config['params']['filter']:
            try: field = config['model']._meta.get_field_by_name(filter['property'])[0]
            except: field = None
            if field and isinstance(field, models.ForeignKey):
                config['filters']['%s__uuid' % filter['property']] = misc.validate_uuid(filter['value'])
                continue
            config['filters'][filter['property']] = filter['value']
    # query filter
    if config['params'].has_key('query_field') and config['params'].has_key('query') and config['params']['query']:
        config['filters']['%s__istartswith' % config['params']['query_field']] = config['params']['query']
    # filter by ownership, unless public_view, related_view or anonymous is True
    if not config['anonymous'] and not config['public_view'] and not config['related_view'] and not config['archive']:
        config['filters']['owner'] = req.user
    # filter by given uuid if any
    if config['record_uuid']:
        config['filters']['uuid'] = config['record_uuid']
    # filter by related field
    if config['related_view']:
        config['filters'][config['model'].related_field] = __get_model('Person').objects.getOwn(req.user)
    # filter by related field for archive tables
    if config['archive']:
        config['filters']['owner'] = __get_model('Person').objects.getOwn(req.user).uuid
    # check show_all flag if filters is empty in a GET request
    # otherwise this would return all rows in the table !
    if req.method == 'GET' and not config['filters'] and \
    (not hasattr(config['model'], 'show_all') or not config['model'].show_all): 
        return HttpResponseNotAllowed('Not Allowed')
    # hide rows marked as deleted. anonymous and archive models doesn't have a deleted field
    if not config['anonymous'] and not config['archive']:
        config['filters']['deleted'] = False
    return config

def __construct_sorters(req, config):
    if config['params'].has_key('sort'):
        order_by = []
        for i in config['params']['sort']:
            if i['direction'] == 'DESC': order_by.append('-%s' % i['property'])
            else: order_by.append(i['property'])
        if order_by:
            config['order_by'] = order_by
            return config 

def __construct_distinct(req, config):
    if config['params'].has_key('distinct_select') and config['params']['distinct_select']:
        config['distinct_fields'] = []
        if config['params'].has_key('distinct_fields') and config['params']['distinct_fields']:
            if isinstance(config['params']['distinct_fields'], list):
                config['distinct_fields'] += config['params']['distinct_fields']
            elif isinstance(config['params']['distinct_fields'], (str, unicode)):
                config['distinct_fields'].append(config['params']['distinct_fields'])
        # adjust sorters
        if config['distinct_fields']:
            if not config.has_key('order_by') or not config['order_by']:
                config['order_by'] = []
            if config['order_by']:
                order_fields = [x.replace('-','') for x in config['order_by']]
                config['distinct_fields'] = order_fields + config['distinct_fields']
            config['order_by'] += config['distinct_fields']
        return config
    
def __construct_relations(req, config):
    relations = __get_model_relations(config['model'], config)
    if relations:
        config['relations'] = relations
        return config

def __pick_record(req, config):
    try:
        config['rec'] = config['model'].objects.get(uuid=config['record_uuid'])
    except ObjectDoesNotExist:
        if req.method == 'DELETE' and hasattr(config['model'], 'ignore_unexistant_delete') \
        and config['model'].ignore_unexistant_delete:
            return HttpResponse()
        raise Http404
    return config

def __check_create_permission(req, config):
    return
    # check (via django default perms) if user can create a new record
    perm = "%s.add_%s" % (settings.DATA_APP, config['model_name'].lower())
    if not req.user.has_perm(perm):
        if settings.DEBUG:
            logging.debug('CREATE ACCESS DENIED')
        return HttpResponseForbidden('Access denied')
    return config

def __decode_body(req, config):
    try:
        config['body'] = ujson.decode(req.body)
        return config
    except Exception, e:
        msg = 'JSON decode error: %s' % (e)
        if settings.DEBUG:
            logging.debug(msg + ' (%s)' % req.body)
        raise Exception, msg

def __prepare_record_data(req, config):
    # a new record, add uuid and owner
    if not config.has_key('rec'):
        config['rec_data']['uuid'] = config['record_uuid']
        config['rec_data']['owner'] = req.user
    
    # body
    body_data = {}
    for k, v in config['body'].iteritems():
        if k in settings.RESERVED_MODEL_FIELDS: continue
        try: field = config['model']._meta.get_field_by_name(k)[0]
        except:
            if settings.DEBUG:
                logging.debug("UNKNOWN FIELD '%s'" % k)
            return HttpResponseBadRequest("Bad Request")
        
        if settings.DEBUG:
            logging.debug("BODY FIELD: %s => %s" % (k, field))
        
        # fk field
        if isinstance(field, models.ForeignKey):
            if v:
                # get uuid
                if isinstance(v, dict):
                    if v.has_key('uuid'):
                        uuid_pk = misc.validate_uuid(v['uuid'])
                    else:
                        if settings.DEBUG:
                            logging.debug("INVALID FKEY DICT VALUE: %s" % v)
                        return HttpResponseBadRequest("Bad Request")
                else:
                    uuid_pk = misc.validate_uuid(v)
                # get record
                m = field.related.parent_model
                try: body_data[k] = m.objects.get_by_natural_key(uuid_pk)
                except ObjectDoesNotExist:
                    if isinstance(v, dict) and hasattr(m, 'auto_create_related') and m.auto_create_related:
                        v['owner'] = req.user
                        body_data[k] = m.objects.create(**v)
                    else:
                        if settings.DEBUG:
                            logging.debug("RECORD NOT FOUND: %s/%s" % (m._meta.object_name, v))
                        raise Http404
            elif field.null:
                body_data[k] = None
            else:
                if settings.DEBUG:
                    logging.debug("FIELD '%s' CANNOT BE NULL" % k)
                return HttpResponseBadRequest("Bad Request")
        # m2m field
        elif isinstance(field, models.ManyToManyField):
            related_model = field.related.parent_model
            if isinstance(v, list):
                config['m2m_data'][field.name] = []
                for i in v:
                    try:
                        related_uuid = misc.validate_uuid(i)
                    except:
                        if settings.DEBUG:
                            logging.debug('CANNOT FIND UUID IN RELATED FIELD: %s' % i)
                        return HttpResponseBadRequest("Bad Request")
                    try:
                        related_rec = related_model.objects.get_by_natural_key(related_uuid)
                    except ObjectDoesNotExist:
                        if isinstance(i, dict) and hasattr(related_model, 'auto_create_related') and related_model.auto_create_related:
                            i['owner'] = req.user
                            related_rec = related_model.objects.create(**i)
                        else:
                            if settings.DEBUG:
                                logging.debug("RELATED M2M RECORD NOT FOUND: %s/%s" % (related_model._meta.object_name, related_uuid))
                            raise Http404
                    config['m2m_data'][field.name].append(related_rec)
        # related field
        elif isinstance(field, models.related.RelatedObject):
            if v:
                try:
                    related_rec = field.model.objects.get_by_natural_key(misc.validate_uuid(v))
                except ObjectDoesNotExist:
                    if isinstance(v, dict) and hasattr(field.model, 'auto_create_related') and field.model.auto_create_related:
                        v['owner'] = req.user
                        related_rec = field.model.objects.create(**v)
                    else:
                        if settings.DEBUG:
                            logging.debug("RELATED RECORD NOT FOUND: %s/%s" % (field.model._meta.object_name, v))
                        raise Http404
                config['related_field'] = getattr(related_rec, field.field.name) 
        # plain field
        else:
            body_data[k] = v
                        
    # the client sent no data
    # silently ignore the request...
    if not body_data and not config['m2m_data']:
        if settings.DEBUG:
            logging.debug('W'*1000)
            logging.debug('PUT REQUEST WITH NO DATA !')
        return HttpResponse()
        #return HttpResponseBadRequest("Bad Request")
    
    # update config
    config['rec_data'].update(body_data)
    return config

""" GET
"""
def __GET(req, data_path):
    
    # config object
    config = {
        'data_path': data_path,
        'params': {},
        'fields': [],
        'filters': {},
        'relations': [],
    }
    
    # define tasks (order is important)
    tasks = (
        __parse_params,
        __translate_path,
        __load_model,
        __construct_fields,
        __construct_filters,
        __construct_sorters,
        __construct_distinct,
        __construct_relations,
    )
    
    # run tasks
    config = __execute_taks(req, config, tasks)
    if isinstance(config, HttpResponse):
        return config
    
    # construct QuerySet object with filters
    qs = config['model'].objects.filter(**config['filters'])
    
    # set order if any
    if config.has_key('order_by'):
        qs = qs.order_by(*config['order_by'])
        
    # set distinct
    if config.has_key('distinct_fields'):
        qs = qs.distinct(*config['distinct_fields'])

    # request with pagging
    if config['params'].has_key('start') and config['params'].has_key('limit'):
        # get the total of all records
        total = qs.count()
        qs = qs[config['params']['start']:config['params']['start']+config['params']['limit']]
    # get all records
    else:
        total = len(qs)
    
    # raise 404 if a requested unique record if not found
    if total == 0 and config['record_uuid']:
        if settings.DEBUG:
            logging.debug('OBJECT NOT FOUND')
        raise Http404
    
    # serialize the QuerySet
    json_data = serializers.serialize("json", qs,
        use_natural_keys=True, 
        fields=config['fields'], 
        relations=config['relations']
    )
        
    # wrap json data with total
    ret = """{"data": %s, "total": %s}""" % (json_data, total)
    return ret

""" POST
"""
def __POST(req, data_path):
    
    # config object
    config = {
        'data_path': data_path,
        'rec_data': {},
        'm2m_data': {},
    }
    
    # define tasks (order is important)
    tasks = (
        __translate_path,
        __load_model,
        __check_create_permission,
        __decode_body,
        __prepare_record_data,
    )
    
    # run tasks
    config = __execute_taks(req, config, tasks)
    if isinstance(config, HttpResponse):
        return config
    
    # save data into database
    try:
        # create record
        config['rec'] = config['model'](**config['rec_data'])
        # validate
        try: config['rec'].full_clean()
        except ValidationError, e:
            if settings.DEBUG:
                msg = 'VALIDATION ERROR'
                msg += ': %s' % e.message_dict
                logging.debug(msg)
            return HttpResponseBadRequest("Bad Request")
        # save
        config['rec'].save(force_insert=True)
        
        # add this record to a a related record
        if config.has_key('related_field'):
            config['related_field'].add(config['rec'])
        # add m2m fields
        __handle_m2m_fields(config)
        comet.Notifier(req, config['rec'], 'create')
        # post save handler
        if hasattr(config['rec'], 'post_save'):
            getattr(config['rec'], 'post_save')()
    except Exception, e:
        raise
        msg = 'POST ERROR'
        if settings.DEBUG:
            msg += ': %s' % e
            logging.debug(msg)
        raise Exception, msg

""" PUT
"""
def __PUT(req, data_path):
    
    # config object
    config = {
        'data_path': data_path,
        'rec_data': {},
        'm2m_data': {},
    }
    
    # define tasks (order is important)
    tasks = (
        __translate_path,
        __load_model,
        __pick_record,
        __check_ownership,
        __decode_body,
        __prepare_record_data,
    )
    
    # run tasks
    config = __execute_taks(req, config, tasks)
    if isinstance(config, HttpResponse):
        return config
    
    # send data to database
    try:            
        # rec_data can be empty if case only m2m fields are updated
        if config['rec_data']:
            for k, v in config['rec_data'].iteritems():
                setattr(config['rec'], k, v)
            # validate record
            try: config['rec'].full_clean()
            except ValidationError, e:
                if settings.DEBUG:
                    msg = 'VALIDATION ERROR'
                    msg += ': %s' % e.message_dict
                    logging.debug(msg)
                return HttpResponseBadRequest("Bad Request")
            # save
            config['rec'].save(force_update=True)
        # add m2m fields
        __handle_m2m_fields(config)
        comet.Notifier(req, config['rec'], 'update')
        # post save handler
        if hasattr(config['rec'], 'post_save'):
            getattr(config['rec'], 'post_save')()
    except Exception, e:
        msg = 'PUT ERROR'
        if settings.DEBUG:
            msg += ': %s' % e
            logging.debug(msg)
        raise Exception, msg

""" DELETE
"""
def __DELETE(req, data_path):
    
    # config object
    config = {
        'data_path': data_path,
    }
    
    # define tasks (order is important)
    tasks = (
        __translate_path,
        __load_model,
        __pick_record,
        __check_ownership,
    )
    
    # run tasks
    config = __execute_taks(req, config, tasks)
    if isinstance(config, HttpResponse):
        return config
        
    # mark the record as deleted
    config['rec'].deleted = True
    config['rec'].save(force_update=True)
    comet.Notifier(req, config['rec'], 'delete')

""" Main
""" 
def dispatch(req, data_path):
    
    valid = auth.validate_request(req)
    if valid is not True:
        return valid

    if settings.DEBUG:
        logging.debug('='*60)
        logging.debug("User: %s" % req.user)
        logging.debug("Method: %s" % req.method)
        logging.debug("Data path: %s" % data_path)
        try: logging.debug("%s: %s" % (req.method, getattr(req, req.method)))
        except: pass
        start_time = time.time()
    
    # get handler
    if req.method not in ('GET','POST', 'PUT','DELETE'):
        raise Http404
    try:
        handler = globals()['__%s' % req.method]
    except KeyError:
        raise Http404
    
    # execute handler
    try:
        ret = handler(req, data_path)
    except Http404:
        raise
    except Exception, e:
        raise
        msg = 'HDLR ERROR: %s %s' % (req.method, data_path)
        if settings.DEBUG:
            msg += ': %s' % e
            logging.debug(msg)
        return HttpResponseServerError(msg)
    
    if settings.DEBUG:
        exec_time = time.time()-start_time
        if req.method == 'GET':
            logging.debug("Return:")
            try: logging.debug(pprint.pformat(ujson.decode(ret)))
            except: logging.debug('%s' % ret)
            try: logging.debug("Length: %s" % len(ret))
            except: pass
        logging.debug("Time: %s" % exec_time)
        logging.debug('='*60)
    
    # return the HttpResponse returned by the handler
    if isinstance(ret, HttpResponse):
        return ret
    
    r = HttpResponse()
    if req.method == 'GET':
        r.write(ret) 
    return r
