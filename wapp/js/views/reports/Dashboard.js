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

Ext.define('Sp.views.reports.Dashboard', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        Ext.apply(this, {
            margin: '5 5 5 0',
            layout: 'fit',
            tbar: [
                {
                    xtype: 'image',
                    src: '/static/images/icons/location.png',
                    width: 16,
                    height: 16,
                },
                {
                    xtype: 'label',
                    text: TR("Location"),
                },
                {
                    xtype: 'combobox',
                    itemId: 'locationCbx',
                    width: 140,
                    store: Ext.create('Ext.data.Store', {
                        fields: ['uuid','name'],
                        sorters: [{
                            property: 'name',
                            direction: 'ASC'
                        }],
                    }),
                    queryMode: 'local',
                    editable: false,
                    forceSelection: true,
                    displayField: 'name',
                    valueField: 'uuid',
                    listeners: {
                        afterrender: function(me){
                            var r = me.getStore().getAt(0);
                            if (r){
                                me.setValue(r);
                            }
                        },
                        beforeselect: function(me, rec){
                            this.setLocation(rec.data.uuid);
                        },
                        scope: this,
                    },
                },
                ' ',
                {
                    xtype: 'label',
                    text: TR("From"),
                },
                {
                    xtype: 'datefield',
                    itemId: 'startDate',
                    width: 140,
                },
                ' ',
                {
                    xtype: 'label',
                    text: TR("To"),
                },
                {
                    xtype: 'datefield',
                    itemId: 'endDate',
                    width: 140,
                },
                '-',
                {
                    text: TR("Generate Report"),
                    icon: '/static/images/icons/generate.png',
                    handler: function(){
                        this.generate();
                    },
                    scope: this,
                },
                
            ],
            items: [
                {
                    xtype: 'panel',
                    itemId: 'mainPanel',
                    layout: 'fit',
                    border: 0,
                },
            ],
            
        });
        this.callParent(arguments);
        this.buildLocationsStore();
    },
    
    buildLocationsStore: function(){
        var data = [];
        if (Sp.app.isOp()){
            Data.locations.each(function(l){
                var r = {};
                r.uuid = l.data.uuid;
                r.name = l.data.name;
                data.push(r);
            });
        }
        if (data.length > 0){
            var store = this.down('#locationCbx').getStore();
            store.loadRawData(data);
            var r = store.getAt(0);
            this.setLocation(r.data.uuid);
        } else {
            this.getDockedItems('toolbar[dock="top"]')[0].disable();
            Sp.ui.misc.warnMsg(TR("You have no dropzone, please create one."), TR("No dropzone"));
        }
    },
    
    setLocation: function(location_uuid){
        var locationRec;
        if (Sp.app.isOp()){
            var locationRec = Data.locations.getById(location_uuid);
        }
        if (!locationRec){
            return
        }
    },
        
    generate: function(){
        var startDate_field = this.down('#startDate');
        var endDate_field = this.down('#endDate');
        var startDate = startDate_field.getValue();
        var endDate = endDate_field.getValue();
        if ((startDate && !startDate_field.validate()) || (endDate && !endDate_field.validate())){
            return;
        }
        var location_uuid = this.down('#locationCbx').getValue();
        var startDate = Ext.Date.format(startDate, Sp.core.Globals.DATE_FORMAT);
        var endDate = Ext.Date.format(endDate, Sp.core.Globals.DATE_FORMAT);
        var mainPanel = this.down('#mainPanel');
        mainPanel.body.mask(TR("Loading"));
        Sp.utils.rpc('reports.dashboard.get_data', [location_uuid, startDate, endDate], function(data){
            this.buildDashboard(data);
            mainPanel.body.unmask();
        }, this);
    },
    
    buildDashboard: function(data){
        var mainPanel = this.down('#mainPanel');
        
        if (data.totals.loads == 0){
            mainPanel.body.unmask();
            Sp.ui.misc.warnMsg(TR("No data have been found"), TR("No Data"));
            return;
        }
        
        var payment_store = Ext.create('store.store', {
            fields: ['label','count','prices', 'ratio'],
            data: [
                {
                    label: TR("Prepaid"),
                    count: data.totals.prepaid.count,
                    prices: data.totals.prepaid.prices,
                    ratio: Math.round((100*data.totals.prepaid.count)/data.totals.slots),
                },
                {
                    label: TR("Postpaid"),
                    count: data.totals.postpaid.count,
                    prices: data.totals.postpaid.prices,
                    ratio: Math.round((100*data.totals.postpaid.count)/data.totals.slots),
                },
                {
                    label: TR("Unpaid"),
                    count: data.totals.unpaid.count,
                    prices: data.totals.unpaid.prices,
                    ratio: Math.round((100*data.totals.unpaid.count)/data.totals.slots),
                },
                {
                    label: TR("Staff slots"),
                    count: data.totals.staff,
                    prices: null,
                    ratio: Math.round((100*data.totals.staff)/data.totals.slots),
                },
            ],
        });
        
        var pilot_store = Ext.create('store.store', {
            fields: ['pilot','count'],
            data: (function(){
                var rows = [];
                Ext.Object.each(data.pilot, function(p,c){
                    rows.push({
                        pilot: p,
                        count: c,
                    });
                });
                return rows;
            })(),
            sorters: [
                {property: 'pilot'},
            ],
        });
        
        var aircraft_store = Ext.create('store.store', {
            fields: ['aircraft','loads', 'slots', 'usage'],
            data: (function(){
                var rows = [];
                Ext.Object.each(data.aircraft, function(a,d){
                    rows.push({
                        aircraft: a,
                        loads: d.loads,
                        slots: d.slots,
                        usage: d.usage,
                    });
                });
                return rows;
            })(),
            sorters: [
                {property: 'aircraft'},
            ],
        });
        
        var catalog_store = Ext.create('store.store', {
            fields: ['item','count','ratio','prices'],
            data: (function(){
                var rows = [];
                var total_slots = data.totals.slots-data.totals.staff;
                Ext.Object.each(data.catalog, function(i,d){
                    rows.push({
                        item: i,
                        count: d.count,
                        ratio: Math.round((100*d.count)/total_slots),
                        prices: d.prices,
                    });
                });
                return rows;
            })(),
            sorters: [
                {property: 'item'},
            ],
        });
        
        mainPanel.removeAll();
        mainPanel.add({
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch',
            },
            cls: 'dashboard-bg',
            items: [
                {
                    xtype: 'container',
                    layout: {
                        type: 'vbox',
                        align: 'center',
                    },
                    margin: '10 0 10 0',
                    items: [
                        {
                            xtype: 'label',
                            text: TR("SUMMARY DASHBOARD"),
                            cls: 'dashboard-title',
                            style: {
                                'font-size': '16px',
                            },
                        },
                    ],
                },
                {
                    xtype: 'container',
                    layout: {
                        type: 'hbox',
                        align: 'stretch',
                    },
                    flex: 1,
                    items: [
                        {
                            xtype: 'container',
                            flex: 2,
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                            },
                            margin: '15 5 0 5',
                            items: [
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    margin: '0 0 10 0',
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Payment Categories Summary"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                                {
                                    xtype: 'grid',
                                    cls: 'dashboard-grid',  
                                    store: payment_store,
                                    disableSelection: true,
                                    enableColumnHide: false,
                                    enableColumnMove: false,
                                    enableColumnResize: false,
                                    sortableColumns: false,
                                    features: [{
                                        ftype: 'summary'
                                    }],
                                    columns: [
                                        {
                                            dataIndex: 'label',
                                            header: TR("Payment Category"),
                                            flex: 1,
                                            summaryRenderer: function(){
                                                return TR("TOTALS");
                                            }
                                        },
                                        {
                                            dataIndex: 'count',
                                            header: TR("Total Slots"),
                                            align: 'center',
                                            width: 70,
                                            summaryType: 'sum',
                                        },
                                        {
                                            dataIndex: 'prices',
                                            header: TR("Total Billed"),
                                            align: 'right',
                                            flex: 1,
                                            sortable: false,
                                            renderer: function(v){
                                                var label = Sp.ui.data.getPricesLabel(v);
                                                return label ? label : '-';
                                            },
                                            summaryRenderer: function(){
                                                return Sp.ui.data.getPricesLabel(data.totals.prices);
                                            }
                                        },
                                        {
                                            dataIndex: 'ratio',
                                            header: TR("Slots Ratio"),
                                            renderer: function(v){
                                                return Ext.String.format('{0} %', v);
                                            },
                                            align: 'center',
                                            width: 100,
                                            summaryRenderer: function(){
                                                var v = data.totals.loads;
                                                return Ext.String.format("{0} {1}", v, v > 1 ? TR("Loads") : TR("Load"));
                                            }
                                        },
                                    ],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    margin: '20 0 4 0',
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Pilots & Aircrafts Summary"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'hbox'
                                    },
                                    items: [
                                        {
                                            xtype: 'grid',
                                            cls: 'dashboard-grid',
                                            flex: 1,
                                            margin: '0 10 0 0',
                                            disableSelection: true,
                                            enableColumnHide: false,
                                            enableColumnMove: false,
                                            enableColumnResize: false,
                                            sortableColumns: false,
                                            store: pilot_store,
                                            columns: [
                                                {
                                                    dataIndex: 'pilot',
                                                    itemId: 'pilotCol',
                                                    header: TR("Pilot"),
                                                    flex: 1,
                                                },
                                                {
                                                    dataIndex: 'count',
                                                    header: TR("Loads"),
                                                    align: 'center',
                                                    width: 60,
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'grid',
                                            cls: 'dashboard-grid',
                                            flex: 2,
                                            disableSelection: true,
                                            enableColumnHide: false,
                                            enableColumnMove: false,
                                            enableColumnResize: false,
                                            sortableColumns: false,
                                            store: aircraft_store,
                                            columns: [
                                                {
                                                    dataIndex: 'aircraft',
                                                    itemId: 'aircraftCol',
                                                    header: TR("Aircraft"),
                                                    flex: 1,
                                                },
                                                {
                                                    dataIndex: 'loads',
                                                    header: TR("Loads"),
                                                    align: 'center',
                                                    width: 60,
                                                },
                                                {
                                                    dataIndex: 'slots',
                                                    header: TR("Slots"),
                                                    align: 'center',
                                                    width: 60,
                                                },
                                                {
                                                    dataIndex: 'usage',
                                                    header: TR("Usage Ratio"),
                                                    align: 'center',
                                                    width: 80,
                                                    renderer: function(v){
                                                        return Ext.String.format('{0} %', v);
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    margin: '20 0 4 0',
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Catalog Items Summary"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                                {
                                    xtype: 'grid',
                                    cls: 'dashboard-grid',
                                    flex: 1,
                                    disableSelection: true,
                                    enableColumnHide: false,
                                    enableColumnMove: false,
                                    enableColumnResize: false,
                                    sortableColumns: false,
                                    store: catalog_store,
                                    features: [{
                                        ftype: 'summary'
                                    }],
                                    columns: [
                                        {
                                            dataIndex: 'item',
                                            itemId: 'itemCol',
                                            header: TR("Catalog Item"),
                                            flex: 1,
                                            summaryRenderer: function(){
                                                return TR("TOTALS");
                                            }
                                        },
                                        {
                                            dataIndex: 'count',
                                            header: TR("Slots"),
                                            align: 'center',
                                            width: 60,
                                            summaryType: 'sum',
                                        },
                                        {
                                            dataIndex: 'ratio',
                                            header: TR("Slots Ratio"),
                                            align: 'center',
                                            width: 70,
                                            renderer: function(v){
                                                return Ext.String.format('{0} %', v);
                                            },
                                        },
                                        {
                                            dataIndex: 'prices',
                                            header: TR("Total Billed"),
                                            align: 'right',
                                            flex: 1,
                                            sortable: false,
                                            renderer: function(v){
                                                return Sp.ui.data.getPricesLabel(v);
                                            },
                                            summaryRenderer: function(){
                                                return Sp.ui.data.getPricesLabel(data.totals.prices);
                                            }
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            xtype: 'container',
                            flex: 1,
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                            },
                            items: [
                                {
                                    xtype: 'chart',
                                    flex: 1,
                                    animate: true,
                                    shadow: true,
                                    store: payment_store,
                                    theme: 'Base:gradients',
                                    insetPadding: 20,
                                    series: [{
                                        type: 'pie',
                                        field: 'ratio',
                                        highlight: {
                                            segment: {
                                                margin: 20
                                          },
                                        },
                                        tips: {
                                            trackMouse: true,
                                            width: 38,
                                            height: 28,
                                            renderer: function(r) {
                                                this.setTitle(Ext.String.format('{0} %', r.data.ratio));
                                            },
                                        },
                                        label: {
                                            field: 'label',
                                            display: 'rotate',
                                            contrast: true,
                                        },
                                    }],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Payment Categories"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                                {
                                    xtype: 'chart',
                                    flex: 1,
                                    animate: true,
                                    shadow: true,
                                    store: pilot_store,
                                    theme: 'Base:gradients',
                                    insetPadding: 20,
                                    series: [{
                                        type: 'pie',
                                        field: 'count',
                                        highlight: {
                                            segment: {
                                                margin: 20
                                          },
                                        },
                                        tips: {
                                            trackMouse: true,
                                            width: 60,
                                            height: 28,
                                            renderer: function(r) {
                                                var v = r.data.count;
                                                this.setTitle(Ext.String.format('{0} {1}', v, v > 1 ? TR("Loads") : TR("Load")));
                                            },
                                        },
                                        label: {
                                            field: 'pilot',
                                            display: 'rotate',
                                            contrast: true,
                                        },
                                    }],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    margin: '0 0 20 0',
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Pilots Distribution"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            xtype: 'container',
                            flex: 1,
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                            },
                            items: [
                                {
                                    xtype: 'chart',
                                    flex: 1,
                                    animate: true,
                                    shadow: true,
                                    store: catalog_store,
                                    theme: 'Base:gradients',
                                    insetPadding: 20,
                                    series: [{
                                        type: 'pie',
                                        field: 'ratio',
                                        highlight: {
                                            segment: {
                                                margin: 20
                                          },
                                        },
                                        tips: {
                                            trackMouse: true,
                                            width: 38,
                                            height: 28,
                                            renderer: function(r) {
                                                this.setTitle(Ext.String.format('{0} %', r.data.ratio));
                                            },
                                        },
                                        label: {
                                            field: 'item',
                                            display: 'rotate',
                                            contrast: true,
                                        },
                                    }],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Catalog Items"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                                {
                                    xtype: 'chart',
                                    flex: 1,
                                    animate: true,
                                    shadow: true,
                                    store: aircraft_store,
                                    theme: 'Base:gradients',
                                    insetPadding: 20,
                                    series: [{
                                        type: 'pie',
                                        field: 'loads',
                                        highlight: {
                                            segment: {
                                                margin: 20
                                          },
                                        },
                                        tips: {
                                            trackMouse: true,
                                            width: 60,
                                            height: 28,
                                            renderer: function(r) {
                                                var v = r.data.loads;
                                                this.setTitle(Ext.String.format('{0} {1}', v, v > 1 ? TR("Loads") : TR("Load")));
                                            },
                                        },
                                        label: {
                                            field: 'aircraft',
                                            display: 'rotate',
                                            contrast: true,
                                        },
                                    }],
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    margin: '0 0 20 0',
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Aircrafts Distribution"),
                                            cls: 'dashboard-title',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            ],
        });
        this.down('#pilotCol').removeCls('x-column-header-sort-ASC');
        this.down('#aircraftCol').removeCls('x-column-header-sort-ASC');
        this.down('#itemCol').removeCls('x-column-header-sort-ASC');
    },
    
});
