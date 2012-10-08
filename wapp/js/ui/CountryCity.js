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

Ext.ns('Sp.ui');

Sp.ui.getCountryCombo = function(name, itemId, fieldLabel, listeners){
    return {
        name: name,
        xtype: 'combobox',
        itemId: itemId,
        fieldLabel: fieldLabel,
        store: Data.countries,
        queryMode: 'local',
        editable: true,
        forceSelection: true,
        displayField: Sp.utils.i18n.getCountryNameField(),
        valueField: 'uuid',
        lastQuery: '',
        listeners: listeners,
   };
}

Sp.ui.getCityCombo = function(name, itemId, fieldLabel, listeners, record, required){
    
    if (record && record.data.country){
        var country = record.getCountry();
        var filters = [{
            property: 'country',
            value: country.data.uuid,
        }];
    } else {
        var filters = [];
    }

    var cb = {
        name: name,
        xtype: 'combobox',
        itemId: itemId,
        fieldLabel: fieldLabel,
        displayField: 'name',
        valueField: 'uuid',
        hideTrigger: true,
        queryDelay: 250,
        typeAhead: true,
        minChars: 2,
        lastQuery: '',
        allowBlank: !required,
        store: Data.createStore('City', {
            remoteSort: true,
            sorters: [{
                property: 'name',
                direction: 'ASC'
            }],
            filters: filters,
            remoteFilter: true,
            proxy: {
                extraParams: {
                    query_field: 'name',
                },
            },
            pageSize: 20,
        }),
        listeners: listeners,
    };
    return cb;
    
}

Sp.ui.getCustomCityField = function(name, itemId){
    return {
        name: name,
        xtype: 'textfield',
        itemId: itemId,
        hidden: true,
   };
}

Sp.ui.displayCity = function(city_cb, record){
    if (record.data.city){
        var city = record.getCity();
    } else if (record.data.custom_city){
        var city = Data.create('City', {name:record.data.custom_city});
    } else {
        return;
    }
    var city_store = city_cb.getStore();
    if (city_store.indexOf(city) == -1){
        city_store.add(city);
    }
    city_cb.setValue(city.data.uuid);
}

Sp.ui.countryChanged = function(records, city_cb, custom_city_field){
    
    if (records.length == 0){
        return;
    }
    
    var r = records[0];
    var city_store = city_cb.getStore();
    
    city_cb.clearValue();
    if (custom_city_field){
        custom_city_field.setValue('');
    }
    
    city_store.clearFilter(true);
    city_store.filter('country', r.data.uuid);
    
}

Sp.ui.saveCustomCity = function(record, city_store){
    if (Ext.isString(record.data.city) && !Sp.utils.isUuid(record.data.city)){
        record.beginEdit();
        record.set('custom_city', record.data.city);
        record.set('city', null);
        record.endEdit();
        return true;
    } else if (Sp.utils.isUuid(record.data.city)){
        var r = city_store.getById(record.data.city);
        if (r.dirty){
            record.beginEdit();
            record.set('custom_city', r.data.name);
            record.set('city', null);
            record.endEdit();
            return true;
        }
    }   
}
