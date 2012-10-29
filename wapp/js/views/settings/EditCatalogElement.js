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

Ext.define('Sp.views.settings.EditCatalogElement', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        this.cancel_close = true;
        var rec;
        
        if (this.elementRec){
            rec = this.elementRec;
            var title = TR("Edit Item's Element");
            var ok_text = TR("Apply");
            var ok_handler = this.editElement;
        } else {
            
            if (this.location_catalog){
                rec = this.elementRec = Data.create('LocationCatalogElement');
            } else {
                rec = this.elementRec = Data.create('CatalogItemElement');
            }
            rec.beginEdit();
            rec.set('altitude_unit', Data.me.data.altitude_unit);
            rec.endEdit();
            var title = TR("New Item Element");
            var ok_text = TR("Add");
            var ok_handler = this.createElement;
        }
        
        if (this.location_catalog){
            this.elements_store = this.itemRec.LocationCatalogElements();
            this.hires_store = rec.LocationCatalogHires();
        } else {
            this.elements_store = this.itemRec.CatalogItemElements();
            this.hires_store = rec.CatalogItemElementHires();
        }
        
        this.workersEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        Ext.apply(this, {
            width: 480,
            height: 500,
            modal: true,
            resizable: false,
            title: title,
            icon: '/static/images/icons/elements.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    padding: '8 8 0 8',
                    border: 0,
                    items: [
                        {
                            xtype: 'fieldset',
                            title: TR("Element details"),
                            defaults: {
                                anchor: '100%',
                            },
                            items: [
                                {
                                    name: 'recurrence',
                                    xtype: 'numberfield',
                                    fieldLabel: TR("Recurrence"),
                                    minValue: 0,
                                    maxValue: 999999,
                                },
                                {
                                    name: 'slots',
                                    xtype: 'numberfield',
                                    fieldLabel: TR("Aircraft Slots"),
                                    minValue: 0,
                                    maxValue: 9999,
                                },
                                {
                                    name: 'altitude',
                                    xtype: 'numberfield',
                                    fieldLabel: TR("Altitude"),
                                    minValue: 0,
                                    maxValue: 999999,
                                },
                                {
                                    name: 'altitude_unit',
                                    xtype: 'combobox',
                                    fieldLabel: TR("Altitude unit"),
                                    store: Ext.create('Ext.data.Store', {
                                        fields: ['unit', 'label'],
                                        data : [
                                            {unit:'m', label: TR("Meters (m)")},
                                            {unit:'ft', label: TR("Feet (ft)")},
                                        ]
                                    }),
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    displayField: 'label',
                                    valueField: 'unit',
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Staff Requirements"),
                            flex: 1,
                            layout: 'fit',
                            items: [
                                {
                                    xtype: 'grid',
                                    store: this.hires_store,
                                    sortableColumns: false,
                                    enableColumnHide: false,
                                    enableColumnResize: false,
                                    selModel: {
                                        selType: 'cellmodel'
                                    },
                                    plugins: [this.workersEditing],
                                    tbar: [{
                                        text: TR("Add Staff"),
                                        icon: '/static/images/icons/new_blue.png', 
                                        handler : function(){
                                            var idx = this.hires_store.getCount();
                                            if (this.location_catalog){
                                                var r = Data.create('LocationCatalogHire');
                                            } else {
                                                var r = Data.create('CatalogItemElementHire');
                                            }
                                            r.set('count', 1);
                                            this.hires_store.insert(idx, r);
                                            this.workersEditing.startEditByPosition({row: idx, column: 0});
                                        },
                                        scope: this,
                                    }],
                                    columns: [
                                        {
                                            dataIndex: 'worker_type',
                                            header: TR("Role"),
                                            flex: 1,
                                            renderer: function(v,o,r){
                                                var wt = null;
                                                if (Ext.isObject(v)){
                                                    wt = r.getWorkerType();
                                                } else if (Ext.isString(v)){
                                                    wt = Data.workerTypes.getById(v);
                                                }
                                                if (wt){
                                                    return wt.data.label;
                                                }
                                            },
                                            flex: 1,
                                            editor: {
                                                xtype: 'combobox',
                                                store: Data.workerTypes,
                                                queryMode: 'local',
                                                forceSelection: true,
                                                editable: false,
                                                displayField: 'label',
                                                valueField: 'uuid',
                                                lastQuery: '',
                                                tpl: Ext.create('Ext.XTemplate',
                                                    '<tpl for=".">',
                                                        '<div class="x-boundlist-item">',
                                                        "<img src='/static/images/icons/roles/{type}.png'/> {label}",
                                                        '</div>',
                                                    '</tpl>'
                                                ),
                                                listeners: {
                                                    focus: function(me){
                                                        me.getStore().clearFilter();
                                                        me.expand();
                                                    },
                                                    select: function(){
                                                        this.workersEditing.completeEdit();
                                                    },
                                                    scope: this,
                                                },
                                            },
                                        },
                                        {
                                            dataIndex: 'count',
                                            header: TR("Count"),
                                            align: 'center',
                                            width: 100,
                                            editor: {
                                                xtype: 'numberfield',
                                                allowBlank: false,
                                                minValue: 1,
                                                maxValue: 9999,
                                                listeners: {
                                                    focus: function(me){
                                                        me.selectText();
                                                    },
                                                    scope: this,
                                                },
                                            },
                                        },
                                        {
                                            xtype: 'actioncolumn',
                                            width: 30,
                                            items: [
                                                {
                                                    icon: '/static/images/icons/delete.png',
                                                    tooltip: TR("Delete"),
                                                    handler: function(grid, rowIndex, colIndex) {
                                                        this.hires_store.removeAt(rowIndex);
                                                    },
                                                    scope: this,
                                                }
                                            ],
                                        },
                                    ],
                                }
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: ok_text,
                    itemId: 'okBt',
                    icon: '/static/images/icons/save.png',
                    handler: ok_handler,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    itemId: 'cancelBt',
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
            listeners: {
                close: Ext.bind(this.onClose, this),
            },
        });
 
        this.callParent(arguments);
        
        this.getComponent('form').form.loadRecord(rec);
        
    },
    
    updateElement: function(create){
        var form = this.getComponent('form');
        
        // validation
        if (!Sp.ui.data.validateForm(form)){
            return;
        }
        
        // update record
        form.form.updateRecord();
        
        if (create){
            // add record to the store
            this.elements_store.add(form.form.getRecord());
        } else {
            // update view
            form.form.getRecord().afterCommit();
        }
        
        // close window
        this.cancel_close = false;
        this.close();
    },
    
    createElement: function(){
        this.updateElement(true);
    },
    
    editElement: function(){
        this.updateElement();
    },
    
    onClose: function(){
        if (this.cancel_close){
            this.hires_store.rejectChanges();
        }
    },

});
