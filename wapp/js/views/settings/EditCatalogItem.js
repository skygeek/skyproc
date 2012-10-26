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

Ext.define('Sp.views.settings.EditCatalogItem', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        if (!this.catalogStore){
            this.catalogStore = Data.catalogItems;
            this.location_catalog = false;  
        } else {
            this.location_catalog = true;
        }
        
        this.cancel_close = true;
        var rec;
        
        if (this.itemRec){
            rec = this.itemRec;
            var title = rec.data.name + ' - ' + TR("Edit Catalog Item");
            if (this.location_catalog){
                var ok_text = TR("Apply");
            } else {
                var ok_text = TR("Save");
            }
            var ok_handler = this.editItem;
        } else {
            if (this.location_catalog){
                rec = this.itemRec = Data.create('LocationCatalogItem');
                var ok_text = TR("Add");
            } else {
                rec = this.itemRec = Data.create('CatalogItem');
                var ok_text = TR("Create");
            }
            var title = TR("New Catalog Item");
            var ok_handler = this.createItem;
        }
        
        if (this.location_catalog){
            this.prices_store = rec.LocationCatalogPrices();
            this.elements_store = rec.LocationCatalogElements();
            this.filterWorkersStore();
            this.workersGridRendered = false;
            this.aircraftsGridRendered = false;
            var workers_grid = {
                xtype: 'grid',
                itemId: 'workersGrid',
                store: this.locationRec.Workers(),
                header: false,
                hideHeaders: true,
                selModel: Ext.create('Ext.selection.CheckboxModel'),
                maxHeight: 200,
                emptyText: TR("No staff members needed or matching selected roles."),
                columns: [
                    {
                        dataIndex: 'name',
                        width: 250,
                    },
                    {
                        flex: 1,
                        renderer: function(v,o,r){
                            var label = "";
                            r.WorkerTypes().each(function(w){
                                label += "<img src='/static/images/icons/roles/" + w.data.type + ".png'/> ";
                            });
                            return label;
                        },
                    },
                ],
                listeners: {
                    afterlayout: Ext.bind(this.onWorkersGridLayout, this),
                },
            };
            var aircrafts_grid = {
                xtype: 'grid',
                itemId: 'aircraftsGrid',
                store: this.locationRec.Aircrafts(),
                header: false,
                hideHeaders: true,
                selModel: Ext.create('Ext.selection.CheckboxModel'),
                maxHeight: 200,
                columns: [
                    {
                        flex: 1,
                        renderer: function(v,o,r){
                            var label = r.data.registration;
                            if (r.data.name){
                                label += ' (' + r.data.name + ')';
                            }
                            return label;
                        },
                    },
                    {
                        flex: 1,
                        renderer: function(v,o,r){
                            var label = '';
                            if (r.data.type){
                                label += r.data.type + ' ';
                            }
                            if (r.data.max_slots){
                                label += r.data.max_slots + ' slots';
                            }
                            return label;
                        },
                    },
                ],
                listeners: {
                    afterlayout: Ext.bind(this.onAircraftsGridLayout, this),
                },
            };
        } else {
            this.prices_store = rec.CatalogItemPrices();
            this.elements_store = rec.CatalogItemElements();
        }
        
        this.pricesEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        Ext.apply(this, {
            width: 650,
            height: 580,
            modal: true,
            resizable: false,
            title: title,
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'tabpanel',
                            itemId: 'tabs',
                            header: false,
                            items: [
                                {
                                    title: TR("Item"),
                                    icon: '/static/images/icons/item.png',
                                    padding: '5 5 0 5',
                                    layout: {
                                        type: 'vbox',
                                        align: 'stretch',
                                    },
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("General informations"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'name',
                                                    xtype: 'textfield',
                                                    fieldLabel: TR("Name"),
                                                },
                                                {
                                                    name: 'description',
                                                    xtype: 'textarea',
                                                    fieldLabel: TR("Description"),
                                                    emptyText: TR("Optionnal details"),
                                                    rows: 3,
                                                },
                                                {
                                                    name: 'jump_type',
                                                    xtype: 'combobox',
                                                    fieldLabel: TR("Default Work"),
                                                    store: Data.jumpTypes,
                                                    queryMode: 'local',
                                                    editable: false,
                                                    displayField: 'label',
                                                    valueField: 'uuid',
                                                    lastQuery: '',
                                                },
                                                {
                                                    name: 'jump_type_auto',
                                                    xtype: 'checkbox',
                                                    boxLabel: TR("Always use the default Work"),
                                                    hideEmptyLabel: false,
                                                },
                                            ],
                                        },
                                        {
                                            checkboxName: 'reuseable',
                                            xtype: 'fieldset',
                                            title: TR("Reusable Item (Jump Program, Tickets)"),
                                            checkboxToggle: true,
                                            defaults: {
                                                labelWidth: 140,
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'min_use',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Minimum Usage Block"),
                                                    minValue: 1,
                                                    maxValue: 9999,
                                                },
                                                {
                                                    name: 'validity_period',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Validity (in days)"),
                                                    minValue: 0,
                                                    maxValue: 9999,
                                                    emptyText: TR("No expiration"),
                                                },
                                                {
                                                    name: 'shareable',
                                                    xtype: 'checkbox',
                                                    fieldLabel: TR("Shareable Item"),
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Pricing details"),
                                            flex: 1,
                                            layout: 'fit',
                                            autoScroll: true,
                                            items: [
                                                {
                                                    xtype: 'grid',
                                                    store: this.prices_store,
                                                    sortableColumns: false,
                                                    enableColumnHide: false,
                                                    enableColumnResize: false,
                                                    selModel: {
                                                        selType: 'cellmodel'
                                                    },
                                                    plugins: [this.pricesEditing],
                                                    tbar: [{
                                                        text: TR("Add Price"),
                                                        icon: '/static/images/icons/new_blue.png', 
                                                        handler : function(){
                                                            var idx = this.prices_store.getCount();
                                                            if (this.location_catalog){
                                                                var r = Data.create('LocationCatalogPrice', {
                                                                    currency: this.locationRec.data.default_currency,
                                                                });
                                                            } else {
                                                                var r = Data.create('CatalogItemPrice');
                                                            }
                                                            this.prices_store.insert(idx, r);
                                                            this.pricesEditing.startEditByPosition({row: idx, column: 0});
                                                        },
                                                        scope: this,
                                                    }],
                                                    columns: [
                                                        {
                                                            dataIndex: 'price',
                                                            header: TR("Price"),
                                                            align: 'center',
                                                            flex: 1,
                                                            renderer: function(v){
                                                                return Ext.util.Format.currency(v, ' ', 0);
                                                            },
                                                            editor: {
                                                                xtype: 'numberfield',
                                                                allowBlank: false,
                                                                minValue: 0,
                                                                maxValue: 999999999,
                                                            },
                                                        },
                                                        {
                                                            dataIndex: 'currency',
                                                            header: TR("Currency"),
                                                            renderer: function(v,o,r){
                                                                if (Ext.isObject(v)){
                                                                    return r.getCurrency().data.code;
                                                                } else if (Ext.isString(v)){
                                                                    r = Data.currencies.getById(v);
                                                                    if (r){
                                                                        return r.data.code;
                                                                    }
                                                                }
                                                            },
                                                            align: 'center',
                                                            flex: 1,
                                                            editor: {
                                                                xtype: 'combobox',
                                                                store: this.locationRec ? this.locationRec.Currencies() : Data.currencies,
                                                                queryMode: 'local',
                                                                forceSelection: true,
                                                                editable: true,
                                                                typeAhead: true,
                                                                displayField: 'code',
                                                                valueField: 'uuid',
                                                                lastQuery: '',
                                                                tpl: Ext.create('Ext.XTemplate',
                                                                    '<tpl for=".">',
                                                                        '<div class="x-boundlist-item">{code} - {name}</div>',
                                                                    '</tpl>'
                                                                ),
                                                            },
                                                        },
                                                        {
                                                            dataIndex: 'default',
                                                            header: TR("Default"),
                                                            align: 'center',
                                                            renderer: function(v){
                                                                if (v){
                                                                    return "<img src='/static/images/icons/default.png'/>";
                                                                }
                                                            },
                                                            editor: {
                                                                xtype: 'checkbox',
                                                            },
                                                        },
                                                        {
                                                            xtype: 'actioncolumn',
                                                            width: 30,
                                                            items: [
                                                                {
                                                                    icon: '/static/images/icons/delete.png',
                                                                    tooltip: 'Delete',
                                                                    handler: function(grid, rowIndex, colIndex) {
                                                                        this.prices_store.removeAt(rowIndex);
                                                                    },
                                                                    scope: this,
                                                                }
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        
                                    ],
                                },
                                {
                                    title: TR("Elements"),
                                    icon: '/static/images/icons/elements.png',
                                    padding: 5,
                                    layout: 'fit',
                                    items: [
                                        {
                                            xtype: 'grid',
                                            itemId: 'elementsGrid',
                                            store: this.elements_store,
                                            sortableColumns: false,
                                            enableColumnHide: false,
                                            enableColumnResize: false,
                                            columnLines: true,
                                            selModel: Ext.create('Ext.selection.CheckboxModel'),
                                            columns: [
                                                {
                                                    dataIndex: 'recurrence',
                                                    header: TR("Recurrence"),
                                                    align: 'center',
                                                },
                                                {
                                                    dataIndex: 'slots',
                                                    header: TR("Slot(s)"),
                                                    align: 'center',
                                                },
                                                {
                                                    header: TR("Altitude"),
                                                    align: 'center',
                                                    renderer: function(v,o,r){
                                                        return Ext.util.Format.number(r.data.altitude, '0,/i') + ' ' + r.data.altitude_unit;
                                                    },
                                                },
                                                {
                                                    header: TR("Staff Requirements"),
                                                    flex: 1,
                                                    renderer: Ext.bind(function(v,o,r){
                                                        if (this.location_catalog){
                                                            this.filterWorkersStore();
                                                        }
                                                        var label = "";
                                                        this.getHiresStore(r).each(function(h){
                                                            if (h.data.count !== null){
                                                                if (Ext.isString(h.data.worker_type)){
                                                                    var wt = Data.workerTypes.getById(h.data.worker_type);
                                                                } else {
                                                                    var wt = h.getWorkerType();
                                                                }
                                                                label += h.data.count + " &nbsp;x&nbsp; <img src='/static/images/icons/roles/" 
                                                                            + wt.data.type + ".png'/> " + wt.data.label + "<br/>";
                                                            }
                                                        });
                                                        return label;
                                                    }, this),
                                                },
                                                
                                            ],
                                            tbar: [
                                                '->',
                                                {
                                                    text: TR("New Element"),
                                                    icon: '/static/images/icons/new_green.png',
                                                    handler: this.addElement,
                                                    scope: this,
                                                },
                                                {
                                                    itemId: 'actionBt',
                                                    text: TR("With selected"),
                                                    icon: '/static/images/icons/action.png',
                                                    disabled: true,
                                                    menu: [
                                                        {
                                                            itemId: 'edit',
                                                            text: TR("Edit"),
                                                            icon: '/static/images/icons/edit.png',
                                                            handler: this.editSelectedElement,
                                                            scope: this,
                                                        },
                                                        '-',
                                                        {
                                                            itemId: 'delete',
                                                            text: TR("Delete"),
                                                            icon: '/static/images/icons/trash.png',
                                                            handler: this.deleteSelectedElements,
                                                            scope: this,
                                                        },
                                                    ],
                                                },
                                            ],
                                            listeners: {
                                                itemdblclick: Ext.bind(this.onElementDblClick, this),
                                                itemcontextmenu: Ext.bind(this.onElementContextMenu, this),
                                                selectionchange: Ext.bind(this.onElementSelectionChanged, this),
                                            },
                                        },
                                    ],
                                },
                                {
                                    title: TR("<span class='disabled-text'>Ressources</span>"),
                                    icon: '/static/images/icons/ressources.png',
                                    padding: 10,
                                    layout: {
                                        type: 'vbox',
                                        align: 'stretch',
                                    },
                                    hidden: !this.location_catalog,
                                    items: [
                                        {
                                            checkboxName: 'specific_workers',
                                            xtype: 'fieldset',
                                            title: TR("Set specific staff members for this item"),
                                            checkboxToggle: true,
                                            items: [workers_grid],
                                        },
                                        {
                                            checkboxName: 'specific_aircrafts',
                                            xtype: 'fieldset',
                                            title: TR("Set specific aircrafts for this item"),
                                            checkboxToggle: true,
                                            items: [aircrafts_grid],
                                        },
                                        {
                                            checkboxName: 'specific_periods',
                                            xtype: 'fieldset',
                                            title: TR("Set specific time periods for this item"),
                                            checkboxToggle: true,
                                            items: [],
                                        },
                                    ],
                                },
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
        
        // events
        if (this.location_catalog){
            this.elements_store.on('datachanged', this.onElementsStoreChange, this);
        }
            
    },
    
    getHiresStore: function(r){
        if (this.location_catalog){
            return r.LocationCatalogHires();
        } else {
            return r.CatalogItemElementHires();
        }
    },
    
    filterWorkersStore: function(){
        // get needed roles
        var roles = [];
        this.elements_store.each(function(e){
            e.LocationCatalogHires().each(function(h){
                if (h.data.count !== null){
                    if (Ext.isString(h.data.worker_type)){
                        var wt = Data.workerTypes.getById(h.data.worker_type);
                    } else {
                        var wt = h.getWorkerType();
                    }
                    if (wt && roles.indexOf(wt.data.type) == -1){
                        roles.push(wt.data.type);
                    }
                }
            });
        });
        // filter workers store
        var store = this.locationRec.Workers();
        store.clearFilter(true);
        store.filterBy(function(w){
            var candidat = false;
            w.WorkerTypes().each(function(wt){
                if (roles.indexOf(wt.data.type) != -1){
                    candidat = true;
                    return false;
                }
            });
            return candidat;
        });
    },
    
    editElement: function(elementRec){
        Ext.create('Sp.views.settings.EditCatalogElement', {
            location_catalog: this.location_catalog,
            itemRec: this.itemRec,
            elementRec: elementRec,
        }).show();
    },
    
    updateItem: function(create){
        var form = this.getComponent('form');
        var record = form.form.getRecord();
        
        // validation
        if (!Sp.ui.data.validateForm(form)){
            return;
        }
        
        // update record
        form.form.updateRecord();
        
        // update specific workers
        if (this.workersGridRendered){
            var sm = this.down('#workersGrid').getSelectionModel();
            Sp.ui.data.updateFromSelection(sm, record, 'workers', record.Workers());
        }
        
        // update specific aircrafts
        if (this.workersGridRendered){
            var sm = this.down('#aircraftsGrid').getSelectionModel();
            Sp.ui.data.updateFromSelection(sm, record, 'aircrafts', record.Aircrafts());
        }
        
        if (create){
            // add record to the store
            this.catalogStore.add(record);
        } else {
            // update view
            record.afterCommit();
        }
        
        // sync stores
        if (!this.location_catalog){
            this.catalogStore.sync({
                success: Ext.bind(function(){
                    this.prices_store.sync();
                    this.elements_store.sync({
                        success: Ext.bind(function(){
                            this.elements_store.each(Ext.bind(function(e){
                                this.getHiresStore(e).sync();
                            }, this));
                        }, this),
                    });
                }, this),
            }); 
        }
        
        // close window
        this.cancel_close = false;
        this.close();
    },
    
    deleteElements: function(elements){
        var msg;
        if (elements.length == 0){
            return;
        } else if (elements.length == 1){
            msg = TR("Are you sure you want to remove the selected element ?");
        } else {
            msg = Ext.String.format(
                TR("Are you sure you want to remove the {0} selected elements ?"), 
                elements.length);
        }
        Ext.MessageBox.confirm( TR("Confirmation"), msg,
            function(btn){
                if (btn == 'yes'){
                    this.elements_store.remove(elements);
                }
            }, this
        );
    },
    
    addElement: function(){
        this.editElement();
    },
    
    onElementDblClick: function(me, r, el){
        this.editElement(r);
    },
    
    editSelectedElement: function(){
        this.editElement(this.down('#elementsGrid').getSelectionModel().getSelection()[0]);
    },
    
    onElementSelectionChanged: function(sm, selected){
        var action_bt = this.down('#elementsGrid').getDockedItems('toolbar[dock="top"]')[0].getComponent('actionBt');
        action_bt.setDisabled((selected.length == 0));
        action_bt.menu.getComponent('edit').setDisabled((selected.length != 1));
    },
    
    createItem: function(){
        this.updateItem(true);
    },
    
    editItem: function(){
        this.updateItem();
    },
    
    deleteSelectedElements: function(){
        this.deleteElements(this.down('#elementsGrid').getSelectionModel().getSelection());
    },
    
    onElementContextMenu: function(grid, record, el, idx, ev){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editElement(record);                                               
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        this.deleteElements([record]);
                    },
                    scope: this,
                },
            ]
        });
        
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    onWorkersGridLayout: function(grid){
        if (this.workersGridRendered === true){
            return;
        }
        this.workersGridRendered = true;
        this.filterWorkersStore();
        Sp.ui.data.selectFromStore(
            grid.getSelectionModel(),
            this.itemRec.Workers()
        );
    },
    
    onAircraftsGridLayout: function(grid){
        if (this.aircraftsGridRendered === true){
            return;
        }
        this.aircraftsGridRendered = true;
        Sp.ui.data.selectFromStore(
            grid.getSelectionModel(),
            this.itemRec.Aircrafts()
        );      
    },
    
    onElementsStoreChange: function(){
        this.filterWorkersStore();
    },
    
    onClose: function(){
        if (this.location_catalog){
            this.locationRec.Workers().clearFilter();
        }
        if (this.cancel_close){
            this.prices_store.rejectChanges();
            this.elements_store.rejectChanges();
            this.elements_store.each(Ext.bind(function(e){
                this.getHiresStore(e).rejectChanges();
            }, this));
        }
    },

});

