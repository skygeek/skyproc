/*
Copyright 2012, Nabil SEFRIOUI

This file is part of Skyproc.

Skyproc is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as 
published by the Free Software Foundation, either version 3 of 
the License, or any later version.

Skyproc is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public 
License along with Skyproc. If not, see <http://www.gnu.org/licenses/>.
*/

// NS
Ext.ns('Sp.utils');

Sp.utils.log = function(msg){
    try {
        console.log(msg);        
    } catch(e){}
}
Ext.ns('Log');
if (Sp.core.Globals.DEBUG === true){
	Log = Sp.utils.log;	
} else {
	Log = Ext.emptyFn;
}

Sp.utils.logError = function(msg){
    try {
        console.error(msg);        
    } catch(e){}
}
Ext.ns('logError');
logError = Sp.utils.logError;

Sp.utils.isUuid = function(uuid){
	if (!Ext.isString(uuid)){
		return false;
	}
	r1 = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
	r2 = /^[a-f0-9]{32}$/i
	return (r1.test(uuid) || r2.test(uuid));
}

Sp.utils.findLoad = function(load_uuid){
	var load;
	Data.locations.each(function(location){
		load = location.Loads().getById(load_uuid);
		if (load){
			return false;
		}
	});
	return load;
}
