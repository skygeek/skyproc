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

from django.db import models
from django.http import Http404
from django.conf import settings
import inspect
import logging

def __get_field_lists(model, public_view, related_view):
    include_all = False
    include_list = []
    exclude_list = []
    
    if public_view:
        if hasattr(model, 'public_fields'):
            fields_def = model.public_fields
        else:
            fields_def = ''
    elif related_view:
        if hasattr(model, 'related_fields'):
            fields_def = model.related_fields
        else:
            fields_def = ''
    else:
        if hasattr(model, 'fields'):
            fields_def = model.fields
        else:
            fields_def = '+all'
    
    fields = None
    if isinstance(fields_def, (str, unicode)):
        fields = fields_def
    elif isinstance(fields_def, dict) and fields_def.has_key('self'):
        fields = fields_def['self']
    
    if fields is None:
        fields = '' if public_view or related_view else '+all'
    
    for i in fields.split():
        if i.lower() == '+all':
            include_all = True
            continue
        if i.startswith('-'):
            exclude_list.append(i[1:])
        else:
            include_list.append(i)
            
    return include_all, include_list, exclude_list

def get(model_name):
    public_view = False
    related_view = False
    if model_name.endswith('_P'):
        model_name = model_name[:-2]
        public_view = True
    elif model_name.endswith('_R'):
        model_name = model_name[:-2]
        related_view = True
            
    model = models.get_model(settings.DATA_APP, model_name)
    if model is None:
        raise Http404
    
    if public_view and not hasattr(model, 'public_fields'):
        raise Http404
    
    if related_view and not hasattr(model, 'related_field'):
        raise Http404
    
    ret = {}
    ret['fields'] = []
    ret['associations'] = []
    ret['validations'] = []
    
    isolated = hasattr(model, 'isolated') and model.isolated
    
    # fields infos
    include_all, include_list, exclude_list = __get_field_lists(model, public_view, related_view)
    if hasattr(model, 'ro_fields'):
        ro_fields =  model.ro_fields.split()
    else: 
        ro_fields = ()
        
    # model fields
    for field in model._meta.local_fields:
        
        # skip internal fields
        if field.name in settings.INTERNAL_MODEL_FIELDS:
            continue
        
        # apply field selection
        if field.name != 'uuid':
            if include_all:
                if field.name in exclude_list:
                    continue
            else:
                if field.name not in include_list:
                    continue
        
        # field definition (in extjs format)
        fieldDef = {}
        fieldDef['name'] = field.name
        
        # default value if any
        if field.default == models.fields.NOT_PROVIDED:
            pass
        elif inspect.isfunction(field.default):
            try: fieldDef['defaultValue'] = field.default()
            except: pass
        else:
            fieldDef['defaultValue'] = field.default
        
        # add association for a foreign key
        if isinstance(field, models.ForeignKey) and not isolated and field.related_query_name() != '+':
            ret['associations'].append({
                'type': 'hasOne' if isinstance(field, models.OneToOneField) else 'belongsTo',
                'model': field.related.parent_model._meta.object_name,
                'fkey': field.name,
                'akey': field.name,
            })
            
        # fields with type infos
        
        # boolean
        elif isinstance(field, models.BooleanField) or isinstance(field, models.NullBooleanField):
            fieldDef['type'] = 'boolean'
        # string
        elif isinstance(field, models.CharField):
            fieldDef['type'] = 'string'
            # add length validation
            ret['validations'].append({'type': 'length', 'name': field.name, 'max': field.max_length})
        # text
        elif isinstance(field, models.TextField):
            fieldDef['type'] = 'string'
        # float
        elif isinstance(field, models.FloatField):
            fieldDef['type'] = 'float'
            fieldDef['useNull'] = True
        # int
        elif isinstance(field, models.IntegerField):
            fieldDef['type'] = 'int'
            fieldDef['useNull'] = True
        # datetime
        elif isinstance(field, models.DateTimeField):
            fieldDef['type'] = 'date'
            fieldDef['dateFormat'] = 'c'
        # date
        elif isinstance(field, models.DateField):
            fieldDef['type'] = 'date'
            fieldDef['dateFormat'] = 'Y-m-d'
        # time
        elif isinstance(field, models.TimeField):
            fieldDef['type'] = 'date'
            fieldDef['dateFormat'] = 'H:i:s'

        # persist flag        
        fieldDef['persist'] = fieldDef['name'] not in ro_fields
        
        # add field to fields list
        ret['fields'].append(fieldDef)
        
        # add presence validation
        if not field.blank:
            ret['validations'].append({'type': 'presence', 'field': fieldDef['name']})
    
    # datetime fields
    for f in ('created', 'modified'):
        if hasattr(model, 'show_'+f) and getattr(model, 'show_'+f):
            fieldDef = {}
            fieldDef['name'] = f
            fieldDef['type'] = 'date'
            fieldDef['dateFormat'] = 'c'
            fieldDef['persist'] = False
            ret['fields'].append(fieldDef)
    
    # related models
    if not isolated:
    
        # many to many fields
        for field in model._meta.many_to_many:
            ret['fields'].append({'name':field.name})
            ret['associations'].append({
                'type': 'hasMany',
                'model': field.related.parent_model._meta.object_name,
                #'fkey': model._meta.object_name.lower(),
                'akey': field.name,
            })
        
        # related fk
        for r in model._meta.get_all_related_objects():
            #ret['fields'].append({'name':r.model._meta.object_name.lower()})
            ret['associations'].append({
                'type': 'hasMany',
                'model': r.model._meta.object_name,
                'fkey': r.field.name,
                'akey': r.model._meta.object_name.lower() + '_set',
            })
        # related m2m
        for r in model._meta.get_all_related_many_to_many_objects():
            #ret['fields'].append({'name':r.model._meta.object_name.lower()})
            ret['associations'].append({
                'type': 'hasMany',
                'model': r.model._meta.object_name,
                'fkey': r.field.name,
            })
        
    return ret

def getAll():
    ret = {}
    for m in models.get_models(__import__(settings.DATA_APP).models):
        ret[m._meta.object_name] = get(m._meta.object_name)
        if hasattr(m, 'public_fields'):
            ret[m._meta.object_name+'_P'] = get(m._meta.object_name+'_P')
        if hasattr(m, 'related_field'):
            ret[m._meta.object_name+'_R'] = get(m._meta.object_name+'_R')
    return ret
