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

Ext.define('Sp.views.locations.EditMapObject', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        // buttons
        var buttons = [];
        if (this.objectRec){
            buttons.push({
                text: TR("Delete"),
                icon: '/static/images/icons/trash.png',
                handler: this.deleteObject,
                scope: this,
            });
            buttons.push('->');
            buttons.push({
                text: TR("Apply"),
                icon: '/static/images/icons/save.png',
                handler: this.editObject,
                scope: this,
            });
        } else {
            buttons.push({
                text: TR("Add"),
                icon: '/static/images/icons/add_plus.png',
                handler: this.addObject,
                scope: this,
            });
        }
        buttons.push({
            text: TR("Cancel"),
            icon: '/static/images/icons/cancel.png',
            handler: this.cancel,
            scope: this,
        });
        
        
        Ext.apply(this, {
            width: 400,
            height: 200,
            floating: true,
            frame: true,
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    items: [
                        {
                            xtype: 'fieldset',
                            defaults: {
                                anchor: '100%',
                            },
                            items: [
                                {
                                    name: 'type',
                                    xtype: 'combobox',
                                    fieldLabel: TR("Area Type"),
                                    emptyText: TR("Choose a category"),
                                    store: Data.areaTypes,
                                    displayField: 'label',
                                    valueField: 'uuid',
                                    queryMode: 'local',
                                    editable: false,
                                    forceSelection: true,
                                    lastQuery: '',
                                    allowBlank: false,                          
                                },
                                {
                                    name: 'name',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Area Name"),
                                    emptyText: TR("Add an optional name"),
                                },
                                {
                                    name: 'description',
                                    xtype: 'textarea',
                                    fieldLabel: TR("Description"),
                                    rows: 5,
                                    emptyText: TR("Add an optional description"),
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: buttons,
        });
        
        this.callParent(arguments);
        
        if (this.objectRec){
            this.down('#form').form.loadRecord(this.objectRec);
        }
    },
    
    cancel: function(){
        if (!this.objectRec){
            this.object.setMap(null);
        }
        this.close();
    },
    
    addObject: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        var values = form.getValues();
        values.mapdata = {};
        if (this.marker){
            var pos = this.marker.getPosition();
            values.mapdata.type = 'marker';
            values.mapdata.lat = pos.lat();
            values.mapdata.lng = pos.lng();
            this.marker.setTitle(values.name);
        } else if (this.circle){
            var center = this.circle.getCenter();
            values.mapdata.type = 'circle';
            values.mapdata.lat = center.lat();
            values.mapdata.lng = center.lng();
            values.mapdata.rad = this.circle.getRadius();
        } else if (this.rectangle){
            var bounds = this.rectangle.getBounds();
            values.mapdata.type = 'rectangle';
            values.mapdata.swLat = bounds.getSouthWest().lat();
            values.mapdata.swLng = bounds.getSouthWest().lng();
            values.mapdata.neLat = bounds.getNorthEast().lat();
            values.mapdata.neLng = bounds.getNorthEast().lng();
        } else if (this.polygon){
            values.mapdata.type = 'polygon';
            values.mapdata.path = this.polygon.getPath().getArray();
        }
        values.mapdata = Ext.encode(values.mapdata);
        var r = Data.create('MapObject', values);
        this.locationRec.MapObjects().add(r);
        this.object.uuid = r.data.uuid;
        this.close();
    },
    
    editObject: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        form.updateRecord();
        var values = form.getValues();
        if (this.marker){
            this.marker.setTitle(values.name);
        }
        this.close();
    },
        
    deleteObject: function(){
        this.locationRec.MapObjects().remove(this.objectRec);
        this.object.setMap(null);
        this.close();
    },
    
});
