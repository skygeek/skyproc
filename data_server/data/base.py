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
from django import contrib
import fields

class Manager(models.Manager):
    def get_by_natural_key(self, uuid):
        return self.get(uuid=uuid)

class Model(models.Model):
    objects = Manager()
    uuid = fields.UUIDField(auto=True)
    owner = models.ForeignKey(contrib.auth.models.User)
    deleted = models.BooleanField(default=False)
    created =  models.DateTimeField(auto_now_add=True)
    modified =  models.DateTimeField(auto_now=True)
    
    def natural_key(self):
        return self.uuid
    
    class Meta:
        abstract = True
        
class AnonymousModel(models.Model):
    objects = Manager()
    uuid = fields.UUIDField(auto=True)
    
    def natural_key(self):
        return self.uuid
    
    class Meta:
        abstract = True

class ArchiveModel(models.Model):
    objects = Manager()
    uuid = fields.UUIDField(auto=True)
    owner = fields.UUIDField()
    created =  models.DateTimeField(auto_now_add=True)
    
    def natural_key(self):
        return self.uuid
    
    class Meta:
        abstract = True
