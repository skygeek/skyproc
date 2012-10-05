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

from django.conf import settings

class Router:
    
    def __get_db(self, model):
        if hasattr(model, 'archive') and model.archive:
            return 'archive'
            
    def db_for_read(self, model, **hints):
        if model._meta.app_label == settings.DATA_APP:
            return self.__get_db(model)
        
    def db_for_write(self, model, **hints):
        if model._meta.app_label == settings.DATA_APP:
            return self.__get_db(model)

    def allow_syncdb(self, db, model):
        if model._meta.app_label == settings.DATA_APP:            
            archive_model = self.__get_db(model) == 'archive'
            if db == 'archive': return archive_model
            else: return not archive_model
