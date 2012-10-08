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


Ext.define('Sp.views.locations.CatalogCopy', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 500,
            height: 480,
            modal: true,
            resizable: false,
            title: TR("Copy from main catalog"),
            icon: '/static/images/icons/copy.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'grid',
                    itemId: 'grid',
                    store: Data.catalogItems,
                    selModel: Ext.create('Ext.selection.CheckboxModel'),
                    columns: [
                        {
                            dataIndex: 'name',
                            header: TR("Main catalog items"),
                            flex: 1
                        },
                    ],
                    listeners: {
                        selectionchange: Ext.bind(this.onSelectionChanged, this),
                    },
                },
            ],
            buttons: [
                {
                    text: TR("Copy"),
                    itemId: 'copyBt',
                    icon: '/static/images/icons/save.png',
                    disabled: true,
                    handler: this.copy,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
        
    },
    
    onSelectionChanged: function(sm, selected){
        this.down('#copyBt').setDisabled((selected.length == 0));
    },
    
    copy: function(){
        var store = this.locationRec.LocationCatalogItems();
        var selected = this.getComponent('grid').getSelectionModel().getSelection();
        var copies = [];
        for (var i=0,item ; item = selected[i] ; i++){
            if (Ext.isObject(item.data.jump_type)){
                var jump_type = item.data.jump_type.uuid;
            } else {
                var jump_type = item.data.jump_type;
            }
            // item record
            var copy = Data.copy(item, {
                location: this.locationRec.data.uuid,
                jump_type: jump_type,
            }, 'LocationCatalogItem');
            // copy prices
            var prices_store = copy.LocationCatalogPrices();
            item.CatalogItemPrices().each(function(p){
                if (Ext.isObject(p.data.currency)){
                    var currency = p.data.currency.uuid;
                } else {
                    var currency = p.data.currency;
                }
                var price = Data.copy(p, {
                    item: copy.data.uuid,
                    currency: currency,
                }, 'LocationCatalogPrice');
                prices_store.add(price);
            });
            // copy elements
            var elements_store = copy.LocationCatalogElements();
            item.CatalogItemElements().each(function(e){
                var element = Data.copy(e, {
                    item: copy.data.uuid,
                }, 'LocationCatalogElement');
                // copy element's hires
                var hires_store = element.LocationCatalogHires();
                e.CatalogItemElementHires().each(function(h){
                    if (Ext.isObject(h.data.worker_type)){
                        var worker_type = h.data.worker_type.uuid;
                    } else {
                        var worker_type = h.data.worker_type;
                    }
                    var hire = Data.copy(h, {
                        element: element.data.uuid,
                        worker_type: worker_type,
                    }, 'LocationCatalogHire');
                    hires_store.add(hire);
                });
                elements_store.add(element);
            });
            // add record to a collection
            copies.push(copy);
        }
        store.add(copies);
        this.close();
    },

});
