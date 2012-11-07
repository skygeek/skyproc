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


Ext.define('Sp.views.locations.FormOptions', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;
        
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
                    autoScroll: true,
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'tabpanel',
                            flex: 1,
                            margin: '10 0 0 0',
                            items: [
                                {
                                    title: TR("Reservations"),
                                    icon: '/static/images/icons/calendar_small.png',
                                    padding: '5 8 5 8',
                                    overflowY: 'auto',
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Calendar settings"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'reservation_start',
                                                    xtype: 'timefield',
                                                    fieldLabel: TR("Start time"),
                                                    increment: 60,
                                                    editable: false,
                                                },
                                                {
                                                    name: 'reservation_end',
                                                    xtype: 'timefield',
                                                    fieldLabel: TR("End time"),
                                                    increment: 60,
                                                    editable: false,
                                                },
                                                {
                                                    name: 'reservation_interval',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Interval"),
                                                    minValue: 5,
                                                    maxValue: 1440,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    title: TR("Lift Manager"),
                                    icon: '/static/images/icons/plane_small.png',
                                    padding: '5 8 5 8',
                                    overflowY: 'auto',
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Loads options"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'lmanager_loads_auto_validate',
                                                    xtype: 'checkbox',
                                                    boxLabel: TR("Enable automatic loads validator"),
                                                },
                                                {
                                                    name: 'lmanager_deny_invalid_loads',
                                                    xtype: 'checkbox',
                                                    boxLabel: TR("Deny boarding for loads that not fulfill all requirements (slots minimums and payments)"),
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Default catalog options for no members"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'lmanager_default_catalog_item',
                                                    xtype: 'combobox',
                                                    fieldLabel: TR("Default Item"),
                                                    store: rec.LocationCatalogItems(),
                                                    queryMode: 'local',
                                                    displayField: 'name',
                                                    valueField: 'uuid',
                                                    forceSelection: true,
                                                    lastQuery: '',
                                                    listeners: {
                                                        select: this.onCatalogItemSelect,
                                                        scope: this,
                                                    },
                                                },
                                                {
                                                    name: 'lmanager_default_catalog_price',
                                                    xtype: 'combobox',
                                                    itemId: 'priceCbx',
                                                    fieldLabel: TR("Default Price"),
                                                    store: Ext.create('Ext.data.Store', {
                                                        fields: ['uuid','price','currency','default'],
                                                        sorters: [
                                                            {
                                                                property: 'currency',
                                                                direction: 'ASC',
                                                            },
                                                            {
                                                                property: 'price',
                                                                direction: 'ASC',
                                                            },
                                                        ],
                                                    }),
                                                    queryMode: 'local',
                                                    editable: false,
                                                    lastQuery: '',
                                                    valueField: 'uuid',
                                                    tpl: Ext.create('Ext.XTemplate',
                                                        '<tpl for=".">',
                                                            '<div class="x-boundlist-item">',
                                                            "{price} {currency}",
                                                            '</div>',
                                                        '</tpl>'
                                                    ),
                                                    displayTpl: Ext.create('Ext.XTemplate',
                                                        '<tpl for=".">',
                                                            '{price} {currency}',
                                                        '</tpl>'
                                                    ),
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Boarding panel options"),
                                            defaults: {
                                                anchor: '100%',
                                                labelWidth: 280,
                                            },
                                            items: [
                                                {
                                                    name: 'lboard_full_grids_count',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Number of loads to show in full-display"),
                                                    minValue: 0,
                                                    maxValue: 20,
                                                },
                                                {
                                                    name: 'lboard_compact_grids_count',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Number of loads to show in reduced-display"),
                                                    minValue: 0,
                                                    maxValue: 20,
                                                },
                                                {
                                                    name: 'lboard_hide_title',
                                                    xtype: 'checkbox',
                                                    fieldLabel: TR("Hide panel title (reduce screen burn-in)"),
                                                },
                                                {
                                                    name: 'lboard_hide_headers',
                                                    xtype: 'checkbox',
                                                    fieldLabel: TR("Hide table headers (reduce screen burn-in)"),
                                                },
                                                {
                                                    name: 'lboard_auto_scroll_interval',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Long lists auto-scroll interval (in seconds)"),
                                                    minValue: 1,
                                                    maxValue: 60,
                                                },
                                                {
                                                    name: 'lboard_auto_scroll_offset',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Long lists auto-scroll offset (in screen pixels)"),
                                                    minValue: 100,
                                                    maxValue: 1000,
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    title: TR("Archives"),
                                    icon: '/static/images/icons/archive.png',
                                    padding: '5 8 5 8',
                                    overflowY: 'auto',
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Archiving periods"),
                                            defaults: {
                                                anchor: '100%',
                                                labelWidth: 240,
                                            },
                                            items: [
                                                {
                                                    name: 'archive_loads_period',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Loads archive duration (in days)"),
                                                    minValue: 1,
                                                    maxValue: 3650,
                                                },
                                                {
                                                    name: 'archive_accounts_period',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Accounts archive duration (in days)"),
                                                    minValue: 1,
                                                    maxValue: 3650,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
        if (rec.data.lmanager_default_catalog_price){
            var item = rec.LocationCatalogItems().getById(rec.data.lmanager_default_catalog_item);
            if (item){
                this.onCatalogItemSelect(null, [item]);
            }
        }
    },
    
    onCatalogItemSelect: function(cbx, recs){
        var rec = recs[0];
        if (!rec){
            return;
        }
        
        var priceCbx = this.down('#priceCbx');
        
        // price
        var prices = [];
        var priceCbx_store = priceCbx.getStore();
        rec.LocationCatalogPrices().each(function(p){
            var currency = Ext.isObject(p.data.currency) ? p.getCurrency() : Data.currencies.getById(p.data.currency);
            prices.push({
                uuid: p.data.uuid,
                price: p.data.price,
                currency: currency.data.code,
                'default': p.data['default'],
            });
        });
        priceCbx_store.loadRawData(prices);
        if (cbx){
            priceCbx.clearValue();
            var default_currency;
            if (this.locationRec.data.default_currency){
                default_currency = Data.currencies.getById(this.locationRec.data.default_currency);
            }
            var def = priceCbx_store.findBy(function(r){
                return (r.data['default'] && default_currency && default_currency.data.code == r.data.currency);
            });
            if (def != -1){
                priceCbx.setValue(priceCbx_store.getAt(def));
            }    
        }
    },
    
});
