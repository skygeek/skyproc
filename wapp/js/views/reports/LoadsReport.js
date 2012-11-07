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

Ext.define('Sp.views.reports.LoadsReport', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        this.slots_grids = [];
        this.sort_field = 'date';
        this.sort_direction = 'ASC';
        
        var store = Data.createStore('LoadLog', {
            pageSize: 200,
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                extraParams: {
                    distinct_select: true,
                    distinct_fields: 'uuid',
                },
            },
            listeners: {
                beforeload: function(){
                    this.collapseAll();
                },
                datachanged: function(me){
                    this.down('#pagingTb').setDisabled(me.getCount() == 0);
                },
                scope: this,
            },
        });
        
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
                '->',
                {
                    text: TR("Filter Data"),
                    icon: '/static/images/icons/filter.png',
                    menu: [
                        {
                            text: TR("Filter by Pilot"),
                            icon: '/static/images/icons/pilot.png',
                            itemId: 'pilotFilter',
                            menu: [],
                        },
                        {
                            text: TR("Filter by Aircraft"),
                            icon: '/static/images/icons/plane_small.png',
                            itemId: 'aircraftFilter',
                            menu: [],
                        },
                        {
                            text: TR("Filter by Staff"),
                            icon: '/static/images/icons/staff.png',
                            itemId: 'staffFilter',
                            menu: [],
                        },
                        {
                            text: TR("Filter by Member"),
                            icon: '/static/images/icons/member.png',
                            menu: [
                                {
                                    xtype: 'personcombo',
                                    itemId: 'personCbx',
                                    locationRec: true,
                                    emptyText: TR("Select a club member"),
                                    width: 260,
                                },
                            ],
                        },
                        '-',
                        {
                            text: TR("Clear all filters"),
                            icon: '/static/images/icons/filter_clear.png',
                            handler: function(){
                                this.clearFilters();
                            },
                            scope: this,
                        },
                    ],
                },
            ],
            items: [
                {
                    xtype: 'grid',
                    itemId: 'grid',
                    emptyText: TR("No matching data found."),
                    margin: '5 0 0 0',
                    border: 0,
                    plugins: [
                        {
                            ptype: 'rowexpander',
                            rowBodyTpl : [],
                            pluginId: 'expand',
                        },
                    ],
                    store: store,
                    scroll: 'vertical',
                    viewConfig: {
                        deferEmptyText: true,
                        listeners: {
                            expandbody: this.onExpand,
                            collapsebody: this.onCollapse,
                            scope: this,
                        },
                    },
                    enableColumnHide: false,
                    enableColumnResize: false,
                    enableColumnMove: false,
                    disableSelection: true,
                    columns: [
                        {
                            dataIndex: 'date',
                            header: TR("Date"),
                            flex: 1,
                            renderer: function(v,o,r){
                                var label = Ext.Date.format(v, Data.me.data.date_format)
                                if (r.data.note.length > 0){
                                    label += ' <sup>(*)</sup>';
                                }
                                return label;
                            },
                        },
                        {
                            dataIndex: 'number',
                            header: TR("Load"),
                            width: 55,
                            align: 'center',
                        },
                        {
                            dataIndex: 'pilot_name',
                            header: TR("Pilot"),
                            width: 100,
                        },
                        {
                            dataIndex: 'aircraft_reg',
                            header: TR("Aircraft"),
                            width: 80,
                        },
                        {
                            dataIndex: 'total_slots',
                            header: TR("Slots"),
                            width: 50,
                            align: 'center',
                        },
                        {
                            dataIndex: 'staff_slots',
                            header: TR("Staff"),
                            width: 50,
                            align: 'center',
                        },
                        {
                            dataIndex: 'prepaid_slots',
                            header: TR("Prepaid"),
                            width: 60,
                            align: 'center',
                        },
                        {
                            dataIndex: 'postpaid_slots',
                            header: TR("Postpaid"),
                            width: 62,
                            align: 'center',
                        },
                        {
                            dataIndex: 'unpaid_slots',
                            header: TR("Unpaid"),
                            width: 50,
                            align: 'center',
                        },
                        {
                            dataIndex: 'prices',
                            header: TR("Total Billed"),
                            width: 200,
                            align: 'right',
                            renderer: function(v){
                                return Sp.ui.data.getPricesLabel(v);
                            },
                        },
                    ],
                    bbar: [
                        {
                            xtype: 'pagingtoolbar',
                            itemId: 'pagingTb',
                            store: store,
                            displayInfo: true,
                            disabled: true,
                            items: [
                                {
                                    text: TR("Print"),
                                    itemId: 'printBt',
                                    icon: '/static/images/icons/printer.png',
                                    handler: function(){
                                        this.print();
                                    },
                                    scope: this,
                                },
                            ],
                        },
                        '->',
                        {
                            xtype: 'image',
                            src: '/static/images/icons/sum.png',
                            width: 16,
                            height: 16,
                        },
                        {
                            xtype: 'label',
                            text: TR("Grand Total"),
                            cls: 'x-toolbar-text',
                        },
                        ' ',
                        {
                            xtype: 'textfield',
                            itemId: 'grandTotal',
                            readOnly: true,
                            disabled: true,
                            width: 350,
                        },
                    ],
                    listeners: {
                        sortchange: function(ct, col){
                            this.sort_field = col.dataIndex;
                            this.sort_direction = col.sortState;
                        },
                        resize: this.onGridResize,
                        scope: this,
                    },
                },
            ],
            
        });
        this.callParent(arguments);
        this.buildLocationsStore();
        
        this.down('#grid').getView().on('expandbody', this.onExpand, this);
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
        var personCbx = this.down('#personCbx');
        if (Ext.isObject(personCbx.locationRec) && personCbx.locationRec.data.uuid == location_uuid){
            return;
        }
        var locationRec;
        if (Sp.app.isOp()){
            var locationRec = Data.locations.getById(location_uuid);
        }
        if (!locationRec){
            return
        }
        // gather data
        var pilotFilter = this.down('#pilotFilter').menu;
        var aircraftFilter = this.down('#aircraftFilter').menu;
        var staffFilter = this.down('#staffFilter').menu;
        var pilots = [];
        var aircrafts = [];
        var staff = [];
        locationRec.Workers().each(function(w){
            var is_pilot = w.WorkerTypes().find('type', 'pilot') != -1;
            var roles_count = w.WorkerTypes().getCount();
            if (is_pilot){
                pilots.push({
                    pilot_uuid: w.data.uuid,
                    text: w.data.name,
                    checked: false,
                });
            }
            if (!is_pilot || roles_count > 1){
                staff.push({
                    worker_uuid: w.data.uuid,
                    text: w.data.name,
                    checked: false,
                });
            }
        });
        locationRec.Aircrafts().each(function(a){
            aircrafts.push({
                aircraft_uuid: a.data.uuid,
                text: a.data.registration,
                checked: false,
            });
        });
        // apply
        personCbx.setLocation(locationRec);
        pilotFilter.removeAll();
        if (pilots.length > 0){
            pilotFilter.add(pilots);
        }
        aircraftFilter.removeAll();
        if (aircrafts.length > 0){
            aircraftFilter.add(aircrafts);
        }
        staffFilter.removeAll();
        if (staff.length > 0){
            staffFilter.add(staff);
        }
    },
    
    onExpand: function(row, rec, exp_row){
        var body_div = new Ext.dom.Element(exp_row.getElementsByClassName('x-grid-rowbody')[0]);
        
        if (this.slots_grids[rec.data.uuid] && body_div.dom.innerHTML.length > 0){
            this.slots_grids[rec.data.uuid].bodyExpanded = true;
            this.updateGridsLayout();
            return;
        }
        
        var store = rec.SlotLogs();
        store.sort('exit_order');
        
        this.slots_grids[rec.data.uuid] = Ext.create('Ext.grid.Panel', {
            store: store,
            enableColumnHide: false,
            enableColumnMove: false,
            minHeight: 60,
            emptyText: TR("No Slots"),
            scroll: false,
            columns: [
                {
                    dataIndex: 'jumper_name',
                    header: TR("Jumper's name"),
                    flex: 1,
                },
                {
                    dataIndex: 'exit_order',
                    header: TR("Exit"),
                    width: 55,
                    align: 'center',
                },
                {
                    dataIndex: 'catalog_item',
                    header: TR("Catalog"),
                    flex: 1,
                },
                {
                    dataIndex: 'catalog_price',
                    header: TR("Price"),
                    width: 180,
                    renderer: function(v){
                        return Sp.ui.data.getPricesLabel(v);
                    },
                },
                {
                    dataIndex: 'payment',
                    header: TR("Payment"),
                    width: 80,
                },
                {
                    dataIndex: 'payer',
                    header: TR("Payer"),
                    width: 140,
                },
            ],
            bbar: [
                {
                    xtype: 'label',
                    flex: 1,
                    html: "<sup>(*)</sup> " + rec.data.note,
                    hidden: rec.data.note.length == 0,
                },
                {
                    xtype: 'tbfill',
                    hidden: rec.data.note.length > 0,
                },
                {
                    loadRec: rec,
                    text: TR("Print"),
                    icon: '/static/images/icons/printer.png',
                    handler: function(me){
                        var header = '';
                        var d = me.loadRec.data;
                        header += Ext.String.format("<br>{0}: {1}", TR("Load N°"), d.number);
                        header += Ext.String.format("<br>Date: {1}", TR("Load N°"), Ext.Date.format(d.date, Data.me.data.date_format));
                        header += Ext.String.format("<br>{0}: {1}", TR("Pilot"), d.pilot_name);
                        header += Ext.String.format("<br>{0}: {1}", TR("Aircraft"), d.aircraft_reg);
                        header += Ext.String.format("<br>{0}: {1}", TR("Total billed"), Sp.ui.data.getPricesLabel(d.prices));
                        header += Ext.String.format("<br>{0}: {1}<br><br>", TR("Slots summary"), 
                                            Ext.String.format("{0} ({1} {5}, {2} {6}, {3} {7}, {4} {8})",
                                            d.total_slots, d.staff_slots, d.prepaid_slots, d.postpaid_slots, d.unpaid_slots,
                                            TR("Staff"), TR("Prepaid"), TR("Postpaid"), TR("Unpaid")));
                        Ext.ux.grid.Printer.documentTitle = TR("Load details");
                        Ext.ux.grid.Printer.mainTitle = header;
                        Ext.ux.grid.Printer.print(this.slots_grids[me.loadRec.data.uuid]);
                    },
                    scope: this,
                    disabled: store.getCount() == 0,
                },
            ],
            renderTo: body_div,
        });
        
        this.down('#grid').doLayout();
        this.slots_grids[rec.data.uuid].bodyExpanded = true;
        this.updateGridsLayout();
    },
    
    onCollapse: function(row, rec, exp_row){
        if (this.slots_grids[rec.data.uuid]){
            this.slots_grids[rec.data.uuid].bodyExpanded = false;
        }
        this.updateGridsLayout();
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
        var store = this.down('#grid').getStore();
        var grandTotal = this.down('#grandTotal');
        var filters = [];
        var sorters = [];
        // location filter
        filters.push({
            property: 'location',
            value: location_uuid,
        });
        
        // date filer
        if (startDate && !endDate){
            filters.push({
                property: 'date',
                value: Ext.Date.format(startDate, Sp.core.Globals.DATE_FORMAT),
            });
        } else if (startDate || endDate){
            if (startDate){
                filters.push({
                    property: 'date__gte',
                    value: Ext.Date.format(startDate, Sp.core.Globals.DATE_FORMAT),
                });
            }
            if (endDate){
                filters.push({
                    property: 'date__lte',
                    value: Ext.Date.format(endDate, Sp.core.Globals.DATE_FORMAT),
                });
            }
        }
        
        // pilot filter
        var pilots = [];
        this.down('#pilotFilter').menu.items.each(function(i){
            if (i.checked){
                pilots.push(i.pilot_uuid);
            }
        });
        if (pilots.length > 0){
            filters.push({
                property: 'pilot__in',
                value: pilots,
            });
        }
        
        // aircraft filter
        var aircrafts = [];
        this.down('#aircraftFilter').menu.items.each(function(i){
            if (i.checked){
                aircrafts.push(i.aircraft_uuid);
            }
        });
        if (aircrafts.length > 0){
            filters.push({
                property: 'aircraft__in',
                value: aircrafts,
            });
        }
        
        // jumpers & staff filter
        var jumpers = [];
        this.down('#staffFilter').menu.items.each(function(i){
            if (i.checked){
                jumpers.push(i.worker_uuid);
            }
        });
        var person = this.down('#personCbx').getValue();
        if (person){
            jumpers.push(person.uuid);
        }
        if (jumpers.length > 0){
            filters.push({
                property: 'slotlog__jumper__in',
                value: jumpers,
            });
        }
        
        // sort
        sorters.push({
            property : this.sort_field,
            direction: this.sort_direction,
        });
        // grand total
        Sp.utils.rpc('reports.loads.get_grand_total', [location_uuid, filters], function(total){
            var label;
            if (total.loads > 0){
                var prices = [];
                Ext.Object.each(total.prices, function(c,a){
                    prices.push(Ext.util.Format.currency(a, ' '+c, 0, true));
                });
                label = prices.join(' | ');
                label += Ext.String.format(" ({0} {1}, {2} {3})", total.loads,
                                            total.loads > 1 ? TR("Loads") : TR("Load"), total.slots,
                                            total.slots > 1 ? TR("Slots") : TR("Slot"));
            } else {
                label = '';
            }
            grandTotal.setValue(label);
            grandTotal.setDisabled(label.length == 0);
        });
        // alter store
        if (sorters.length > 0){
            // doSort is false, sorting is done remotely
            store.sort(sorters, null, false); 
        }
        store.clearFilter(true);
        store.filter(filters);
    },
    
    clearFilters: function(){
        this.down('#pilotFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#aircraftFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#staffFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#personCbx').clearValue();
    },
    
    print: function(){
        var locationRec = Data.locations.getById(this.down('#locationCbx').getValue());
        var header = '';
        header += Ext.String.format("<br>{0}: {1}", TR("Location"), locationRec.data.name);
        header += Ext.String.format("<br>{0}: {1}<br><br>", TR("Edited on"), 
                                    Ext.Date.format(new Date(), Data.me.data.date_format + ' - ' + Data.me.data.time_format));
        Ext.create('Sp.ui.PageGridPrint', {
            grid: this.down('#grid'),
            gridScope: this,
            documentTitle: TR("Loads Listing"),
            mainTitle: header,
        }).show();
    },
    
    updateGridsLayout: function(){
        Ext.Object.each(this.slots_grids, function(k,v){
            if (v.bodyExpanded){
                v.doLayout();
            }
        });
    },
    
    onGridResize: function(){
        this.updateGridsLayout();
    },
    
    collapseAll: function(){
        var grid = this.down('#grid');
        var store = grid.getStore();
        var expand_plugin = grid.getPlugin('expand');
        Ext.Object.each(this.slots_grids, function(k,v){
            if (v.bodyExpanded){
                expand_plugin.toggleRow(store.indexOfId(k));
            }
        });
    },
    
});
