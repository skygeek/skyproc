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

Ext.define('Sp.ui.PriceCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.pricecombo',
    
    initComponent: function() {
        
        
        Ext.applyIf(this, {
            
        });
        
        Ext.apply(this, {
            store: this.createStore(),
            valueField: 'uuid',
            hideTrigger: true,
            typeAhead: true,
            forceSelection: !this.allowPhantom,
            listConfig: {
                loadingText: TR("Searching"),
                emptyText: TR("No matching members found"),
            },
        }); 
        Ext.applyIf(this.listeners, {
            focus: {
                fn: function(me){
                    if (me.getRawValue().trim().length == 0){
                        me.clearValue();
                    }
                },
                scope: this,
            },
        });
        this.callParent(arguments);
    },
    
    createStore: function(){
        var cfg = {};
        var model;
        if (this.locationRec){
            model = 'LocationMembership';
            Ext.apply(cfg, {
                sorters: [
                    {
                        property: 'person__last_name',
                        direction: 'ASC'
                    },
                    {
                        property: 'person__first_name',
                        direction: 'ASC'
                    }
                ],
                proxy: {
                    extraParams: {
                        query_field: 'person__last_name',
                    },
                },
            });
        } else {
            model = 'Person_P';
            Ext.apply(cfg, {
                sorters: [
                    {
                        property: 'last_name',
                        direction: 'ASC'
                    },
                    {
                        property: 'first_name',
                        direction: 'ASC'
                    }
                ],
                proxy: {
                    extraParams: {
                        query_field: 'last_name',
                    },
                },
            });
        }
        Ext.apply(cfg, {
            pageSize: this.pageSize,
            remoteSort: true,
            remoteFilter: true,
        });
        return Data.createStore(model, cfg);
    },
    
    setValue: function(value){
        if (Ext.isObject(value)){
            if (value.hasOwnProperty('first_name') && value.hasOwnProperty('last_name')){
                if (this.locationRec){
                    var r = Data.create('LocationMembership', {
                        person: value,
                    });
                } else {
                    var r = Data.create('Person_P', value);
                }
                this.getStore().add(r);
                this.select(r);
                return this;
            } else if (value.hasOwnProperty('name')){
                this.setRawValue(value.name);
                return this;                
            }
        } else if (Ext.isString(value)){
            return this;
        } else {
            return this.callParent(arguments);
        }
    },
    
    getValue: function(){
        var value = this.callParent(),
            new_value;
        if (Sp.utils.isUuid(value)){
            var r = this.getStore().getById(value);
            var model = Data.getSpModelName(r);
            var new_value = {};
            if (model == 'LocationMembership'){
                new_value = {
                    uuid: r.data.person.uuid,
                    type: 'person',
                    first_name: r.data.person.first_name,
                    last_name: r.data.person.last_name,
                };
            } else {
                new_value = {
                    uuid: r.data.uuid,
                    type: 'person',
                    first_name: r.data.first_name,
                    last_name: r.data.last_name,
                };
            }
        } else if (Ext.isString(value) && value.length > 0){
            new_value = {
                uuid: Ext.data.IdGenerator.get('uuid').generate(),
                type: 'phantom',
                name: value,
            };
        }
        return (new_value ? new_value : value);
    },
    
    
    
});
