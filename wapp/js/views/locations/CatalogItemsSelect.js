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


Ext.define('Sp.views.locations.CatalogItemsSelect', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 460,
            height: 360,
            modal: true,
            icon: '/static/images/icons/cart.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'fieldset',
                    layout: 'fit',
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    items: [
                        {
                            xtype: 'grid',
                            store: this.store,
                            enableColumnMove: false,
                            enableColumnResize: false,
                            enableColumnHide: false,
                            sortableColumns: false,
                            tbar: [
                                {
                                    text: TR("Add catalog item"),
                                    icon: '/static/images/icons/new_green.png',
                                    handler: function(){
                                        this.addItem();
                                    },
                                    scope: this,
                                },
                            ],
                            columns: [
                                {
                                    dataIndex: 'item',
                                    header: TR("Item"),
                                    flex: 1,
                                    renderer: function(v,o,r){
                                        var item = this.locationRec.LocationCatalogItems().getById(v);
                                        if (item){
                                            return item.data.name;
                                        }
                                    },
                                    scope: this,
                                },
                                {
                                    dataIndex: 'price',
                                    header: TR("Price"),
                                    renderer: function(v,o,r){
                                        if (!v){
                                            return TR("Automatic");
                                        }
                                        var item = this.locationRec.LocationCatalogItems().getById(r.data.item);
                                        if (item){
                                            var price = item.LocationCatalogPrices().getById(v);
                                            if (price){
                                                var currency_code;
                                                if (Ext.isObject(price.data.currency)){
                                                    var currency_code = price.data.currency.code;
                                                } else {
                                                    var currency = Data.currencies.getById(price.data.currency);
                                                    var currency_code = currency.data.code;
                                                }
                                                return Ext.util.Format.currency(price.data.price, ' '+currency_code, 2, true);
                                            }
                                        }
                                    },
                                    scope: this,
                                },
                                {
                                    xtype: 'actioncolumn',
                                    width: 30,
                                    items: [
                                        {
                                            icon: '/static/images/icons/delete.png',
                                            tooltip: 'Delete',
                                            handler: function(grid, rowIndex, colIndex) {
                                                this.store.removeAt(rowIndex);
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
            buttons: [
                {
                    text: TR("Return"),
                    icon: '/static/images/icons/return.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
    },
    
    addItem: function(){
        this.select_window = Ext.create('Ext.window.Window', {
            width: 340,
            height: 140,
            modal: true,
            title: TR("Item select"),
            layout: 'fit',
            locationRec: this.locationRec,
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    border: 0,
                    defaults: {
                        anchor: '100%',
                    },
                    items: [
                        {
                            name: 'item',
                            xtype: 'combobox',
                            fieldLabel: TR("Catalog Item"),
                            store: this.defaultCatalogStore,
                            queryMode: 'local',
                            displayField: 'name',
                            valueField: 'uuid',
                            forceSelection: true,
                            lastQuery: '',
                            allowBlank: false,
                            listeners: {
                                select: this.buildDefaultPricesStore,
                                scope: this,
                            },
                        },
                        {
                            name: 'price',
                            xtype: 'combobox',
                            itemId: 'defaultPrice',
                            fieldLabel: TR("Item Price"),
                            store: Ext.create('Ext.data.Store', {
                                fields: ['uuid', 'price'],
                            }),
                            queryMode: 'local',
                            forceSelection: true,
                            editable: false,
                            displayField: 'price',
                            valueField: 'uuid',
                            emptyText: TR("Automatic"),
                        },
                    ],
                    buttons: [
                        {
                            text: TR("Add"),
                            icon: '/static/images/icons/save.png',
                            handler: function(){
                                var form = this.select_window.down('#form').form;
                                if (!form.isValid()){
                                    return;
                                }
                                var values = form.getValues();
                                values[this.parent_field] = this.parent_uuid;
                                var r = Data.create(this.create_model, values);
                                this.store.add(r);
                                this.select_window.close();
                            },
                            scope: this,
                        },
                        {
                            text: TR("Close"),
                            icon: '/static/images/icons/cancel.png',
                            handler: function(){
                                this.select_window.close();
                            },
                            scope: this,
                        },
                    ],
                },
            ],
        }).show();

    },
    
    buildDefaultPricesStore: function(){
        var form = this.select_window.down('#form').form;
        var item_uuid = form.findField('item').getValue();
        var price_field = this.select_window.down('#defaultPrice');
        if (item_uuid){
            var item_rec = this.locationRec.LocationCatalogItems().getById(item_uuid);
            if (item_rec){
                var prices = [];
                item_rec.LocationCatalogPrices().each(function(p){
                    if (Ext.isObject(p.data.currency)){
                        var currency = p.getCurrency();
                    } else {
                        var currency = Data.currencies.getById(p.data.currency);
                    }
                    prices.push({
                        uuid: p.data.uuid,
                        price: p.data.price + ' ' + currency.data.code,
                    }); 
                }, this);
                var store = price_field.getStore();
                store.loadRawData(prices);
            }
        }
    },
                
});
