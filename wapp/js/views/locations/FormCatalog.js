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


Ext.define('Sp.views.locations.FormCatalog', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;
        
        var catalog_store = this.locationRec.LocationCatalogItems();
        catalog_store.clearFilter(true);
        
        catalog_store.sort([
            { property: 'name',  direction: 'ASC' },
        ]);
                
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'fit',
            },
            items: [
                {
                    xtype: 'container',
                    padding: '10 10 5 10',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'grid',
                            itemId: 'grid',
                            flex: 1,
                            store: catalog_store,
                            selModel: Ext.create('Ext.selection.CheckboxModel'),
                            sortableColumns: false,
                            enableColumnHide: false,
                            enableColumnResize: false,
                            columns: [
                                {
                                    dataIndex: 'name',
                                    header: TR("Catalog Items"),
                                    sortable: true,
                                    flex: 1,
                                    renderer: function(v){
                                        return Ext.String.format("<div style='padding:6px'>{0}</div>", v);
                                    },
                                },
                            ],
                            tbar: [
                                '->',
                                {
                                    text: TR("New item"),
                                    icon: '/static/images/icons/new_green.png',
                                    menu: [
                                        {
                                            text: TR("Create new item"),
                                            icon: '/static/images/icons/new_yellow.png',
                                            handler: this.addItem,
                                            scope: this,
                                        },
                                        {
                                            text: TR("Copy from main"),
                                            icon: '/static/images/icons/copy.png',
                                            handler: function(){
                                                Ext.create('Sp.views.locations.CatalogCopy', {
                                                    locationRec: this.locationRec,
                                                }).show();
                                            },
                                            scope: this,
                                        },
                                    ],
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
                                            handler: this.editSelectedItem,
                                            scope: this,
                                        },
                                        '-',
                                        {
                                            itemId: 'delete',
                                            text: TR("Delete"),
                                            icon: '/static/images/icons/trash.png',
                                            handler: this.deleteSelectedItems,
                                            scope: this,
                                        },
                                    ],
                                }
                            ],
                            listeners: {
                                itemdblclick: Ext.bind(this.onItemDblClick, this),
                                itemcontextmenu: Ext.bind(this.onItemContextMenu, this),
                            },
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
        // events
        this.down("#grid").getSelectionModel().on('selectionchange', Ext.bind(this.itemSelectionChanged, this));
    },
    
    editItem: function(itemRec){
        Ext.create('Sp.views.settings.EditCatalogItem', {
            catalogStore: this.locationRec.LocationCatalogItems(),
            itemRec: itemRec,
            locationRec: this.locationRec,
        }).show();
    },
    
    deleteItems: function(items){
        var msg;
        if (items.length == 0){
            return;
        } else if (items.length == 1){
            msg = Ext.String.format(
                TR("Are you sure you want to remove '{0}' from the catalog ?"), 
                items[0].data.name);
        } else {
            msg = Ext.String.format(
                TR("Are you sure you want to remove the {0} selected items ?"), 
                items.length);
        }
        Ext.MessageBox.confirm( TR("Confirmation"), msg,
            function(btn){
                if (btn == 'yes'){
                    this.locationRec.LocationCatalogItems().remove(items);
                }
            }, this
        );
    },
    
    addItem: function(){
        this.editItem();
    },
    
    onItemDblClick: function(me, r, el){
        this.editItem(r);
    },
    
    itemSelectionChanged: function(sm, selected){
        var action_bt = this.down('#grid').getDockedItems('toolbar[dock="top"]')[0].getComponent('actionBt');
        action_bt.setDisabled((selected.length == 0));
        action_bt.menu.getComponent('edit').setDisabled((selected.length != 1));
    },
    
    deleteSelectedItems: function(){
        this.deleteItems(this.down('#grid').getSelectionModel().getSelection());
    },
    
    editSelectedItem: function(){
        this.editItem(this.down('#grid').getSelectionModel().getSelection()[0]);
    },
    
    onItemContextMenu: function(grid, record, el, idx, ev){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editItem(record);                                              
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        this.deleteItems([record]);
                    },
                    scope: this,
                },
            ]
        });
        
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    post_save: function(){
        var store = this.locationRec.LocationCatalogItems();
        store.sync({
            success: function(){
                store.each(function(item){
                    item.LocationCatalogPrices().sync();
                    item.LocationCatalogElements().sync({
                        success: function(){
                            item.LocationCatalogElements().each(function(e){
                                e.LocationCatalogHires().sync();
                            });
                        },
                    });
                });
            },
        });     
    },
    
    reject: function(){
        var store = this.locationRec.LocationCatalogItems();
        store.rejectChanges();
        store.each(function(item){
            item.LocationCatalogPrices().rejectChanges();
            item.LocationCatalogElements().rejectChanges();
            item.LocationCatalogElements().each(function(e){
                e.LocationCatalogHires().rejectChanges();
            });
        });
    },
    
});
