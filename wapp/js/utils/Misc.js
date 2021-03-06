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

Sp.utils.getUserUnit = function(value, type){
    var d = Data.me.data;
    switch (type){
        case 'temperature':
            switch (d.temperature_unit){
                case 'c': return Ext.String.format("{0} °C", parseInt(value)); break;
                case 'f': return Ext.String.format("{0} °F", parseInt(value)*9/5+32);
            }
            break;
        case 'wind_speed':
            switch (d.speed_unit){
                case 'kts': return Ext.String.format("{0} Knots", parseInt(value)); break;
                case 'mph': return Ext.String.format("{0} mph", parseInt(parseInt(value)*1.150779)); break;
                case 'ms':  return Ext.String.format("{0} m/s", parseInt(parseInt(value)*0.514444)); break;
                case 'kmh': return Ext.String.format("{0} km/h", parseInt(parseInt(value)*1.852));
            }
            break;
        case 'altitude':
            switch (d.altitude_unit){
                case 'm': return Ext.String.format("{0} m", Ext.util.Format.number(parseInt(value), '0,/i')); break;
                case 'ft': return Ext.String.format("{0} ft", Ext.util.Format.number(parseInt(parseInt(value)*3.28084), '0,/i'));
                
            }
            break;
        case 'area':
            switch (d.distance_unit){
                case 'm': return Ext.String.format("{0} m<sup>2</sup>", Ext.util.Format.number(parseInt(value), '0,/i')); break;
                case 'us': return Ext.String.format("{0} ft<sup>2</sup>", Ext.util.Format.number(parseInt(parseInt(value)*10.76391), '0,/i'));
                
            }
            break;
        case 'weight':
            switch (d.weight_unit){
                case 'kg': return Ext.String.format("{0} kg", Ext.util.Format.number(parseInt(value), '0,/i')); break;
                case 'lb': return Ext.String.format("{0} lb", Ext.util.Format.number(parseInt(parseInt(value)*2.20462), '0,/i'));
                
            }
    }
}

Sp.utils.getPositionLabel = function(position, positive, negative){
    var d = Math.abs(parseInt(position));
    var mm = (Math.abs(position)-d)*60;
    var m = parseInt(mm);
    var s = parseInt((mm-m)*60);
    var dir = position < 0 ? negative : positive;
    return Ext.String.format("{0}°{1}′{2}″{3}", d, m, s, dir);
}

Sp.utils.getLatLngLabel = function(lat, lng){
    var label = {};
    label.lat = Sp.utils.getPositionLabel(lat, 'N', 'S');
    label.lng = Sp.utils.getPositionLabel(lng, 'E', 'W');
    return label;
}

Sp.utils.getWebsiteLink = function(url){
    var href = url;
    if (href.search('http') != 0){
        href = 'http://' + url;
    }
    return Ext.String.format("<a href='{0}' target='_blank'>{1}</a>", 
            Ext.String.htmlEncode(href), Ext.String.htmlEncode(url));
}

Sp.utils.getEmailLink = function(email){
    return Ext.String.format("<a href='mailto:{0}' target='_blank'>{0}</a>", Ext.String.htmlEncode(email));
}

Sp.utils.preloadImage = function(image_url){
    new Image().src = image_url;
}
