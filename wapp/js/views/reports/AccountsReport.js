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

Ext.define('Sp.views.reports.AccountsReport', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        this.operations_grids = [];
        this.sort_field = 'names';
        this.sort_direction = 'ASC';
        
        var store = Data.createStore('LocationMembership', {
            pageSize: 50,
            remoteSort: true,
            remoteFilter: true,
            proxy: {
                extraParams: {
                    distinct_select: true,
                    distinct_fields: 'person__uuid',
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
                    xtype: 'personcombo',
                    itemId: 'personCbx',
                    width: 260,
                    locationRec: true,
                    returnMembership: true,
                    emptyText: TR("Select a club member"),
                    forceSelection: false,
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
                            text: TR("Positive balances only"),
                            itemId: 'positiveOnly',
                            checked: false,
                            listeners: {
                                checkchange: function(me, checked){
                                    if (checked){
                                        this.down('#negativeOnly').setChecked(false);
                                    }
                                },
                                scope: this,
                            },
                        },
                        {
                            text: TR("Negative balances only"),
                            itemId: 'negativeOnly',
                            checked: false,
                            listeners: {
                                checkchange: function(me, checked){
                                    if (checked){
                                        this.down('#positiveOnly').setChecked(false);
                                    }
                                },
                                scope: this,
                            },
                        },
                        {
                            text: TR("Filter by currencies"),
                            itemId: 'currenciesMenu',
                            icon: '/static/images/icons/currency.png',
                            menu: [],
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
                    sortableColumns: false,
                    columns: [
                        {
                            header: TR("Member"),
                            itemId: 'member',
                            flex: 1,
                            renderer: function(v,o,r){
                                return Sp.ui.misc.formatFullname(r.getPerson(), Data.me.data.name_order, true);
                            },
                            listeners: {
                                headerclick: function(){
                                    this.namesSort();
                                },
                                scope: this,
                            },
                            cls: 'x-column-header-sort-ASC',
                        },
                        {
                            header: TR("From"),
                            flex: 1,
                            renderer: function(v,o,r){
                                return Sp.ui.misc.getCountryCity(r.getPerson());
                            },
                        },
                        {
                            header: TR("Balance"),
                            itemId: 'balance',
                            flex: 1,
                            renderer: function(v,o,r){
                                var label = [];
                                var currencies = this.getSelectedCurrencies();
                                r.Accounts().each(function(a){
                                    if (currencies.length > 0 && currencies.indexOf(a.data.currency) == -1){
                                        return;
                                    }
                                    if (a.data.balance != 0){
                                        var currency = Data.currencies.getById(a.data.currency);
                                        label.push(Ext.util.Format.currency(a.data.balance, ' '+currency.data.code, 2, true));  
                                    }
                                    
                                });
                                if (label.length > 0){
                                    return label.join(' | ');
                                } else {
                                    return TR("None");
                                }
                            },
                            scope: this,
                            listeners: {
                                headerclick: function(){
                                    this.balancesSort();
                                },
                                scope: this,
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
                            src: '/static/images/icons/coins.png',
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
                        resize: this.onGridResize,
                        scope: this,
                    },
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
            Sp.ui.misc.warnMsg(TR("You have no dropzone, please create one in the 'Dropzones' menu."), TR("No dropzone"));
        }
    },
    
    setLocation: function(location_uuid){
        var personCbx = this.down('#personCbx');
        var currenciesMenu = this.down('#currenciesMenu').menu;
        if (Ext.isObject(personCbx.locationRec) && personCbx.locationRec.data.uuid == location_uuid){
            return;
        }
        personCbx.clearValue();
        var locationRec;
        if (Sp.app.isOp()){
            var locationRec = Data.locations.getById(location_uuid);
        }
        if (locationRec){
            personCbx.setLocation(locationRec);
        } else {
            return;
        }
        var currencies = [];
        currenciesMenu.removeAll();
        locationRec.Currencies().each(function(c){
            currencies.push({
                currency_uuid: c.data.uuid,
                text: c.data.code,
                checked: false,
            });
        });
        if (currencies.length > 0){
            currenciesMenu.add(currencies);
        }
    },
    
    onExpand: function(row, rec, exp_row){
        var body_div = new Ext.dom.Element(exp_row.getElementsByClassName('x-grid-rowbody')[0]);
        
        if (this.operations_grids[rec.data.uuid] && body_div.dom.innerHTML.length > 0){
            this.operations_grids[rec.data.uuid].bodyExpanded = true;
            this.updateGridsLayout();
            return;
        }
        
        var operations = [];
        var currencies = this.getSelectedCurrencies();
        rec.Accounts().each(function(a){
            var currency = Data.currencies.getById(a.data.currency);
            if (currencies.length > 0 && currencies.indexOf(currency.data.uuid) == -1){
                return;
            }
            a.AccountOperations().each(function(o){
                var amount = Ext.util.Format.currency(o.data.amount, ' '+currency.data.code, 2, true);
                if (o.data.type == 'B'){
                    amount = Ext.String.format('-{0}', amount);
                } else if (o.data.type == 'C'){
                    amount = Ext.String.format('(-{0})', amount);
                } else if (o.data.type == 'D' && o.data.amount < 0){
                    amount = Ext.String.format('({0})', amount);
                }
                operations.push({
                    date: o.data.created,
                    note: o.data.note,
                    amount: amount,
                    amount_int: o.data.amount,
                });
            });
        });
        
        this.operations_grids[rec.data.uuid] = Ext.create('Ext.grid.Panel', {
            store: Ext.create('store.store', {
                fields: [
                    {
                        name: 'date',
                        type: 'date',
                        dateFormat: 'c',
                    },
                    'note', 'amount', 'amount_int',
                ],
                data: operations,
                sorters: [
                    {
                        property: 'date',
                        direction: 'DESC',
                    },
                ],
            }),
            enableColumnHide: false,
            enableColumnMove: false,
            minHeight: 60,
            emptyText: TR("No Operations"),
            scroll: false,
            columns: [
                {
                    dataIndex: 'date',
                    header: TR("Date"),
                    width: 200,
                    renderer: function(v){
                        return Ext.Date.format(v, Data.me.data.date_format);
                    },
                },
                {
                    dataIndex: 'note',
                    header: TR("Operation"),
                    flex: 1,
                    renderer: function(v){
                        return Sp.ui.misc.trOperationNote(v);
                    },
                    
                },
                {
                    dataIndex: 'amount_int',
                    header: TR("Amount"),
                    width: 100,
                    align: 'right',
                    renderer: function(v,o,r){
                        return r.data.amount;
                    },
                },
            ],
            bbar: [
                '->',
                {
                    membershipRec: rec,
                    text: TR("Print"),
                    icon: '/static/images/icons/printer.png',
                    handler: function(me){
                        var header = '';
                        header += Ext.String.format("<br>{0}: {1}", TR("Member's name"), 
                                    Sp.ui.misc.formatFullname(me.membershipRec.getPerson(), Data.me.data.name_order, true));
                        header += Ext.String.format("<br>{0}: {1}", TR("Grand total"), 
                                    this.down('#balance').renderer.apply(this, [null, null ,me.membershipRec]));
                        header += Ext.String.format("<br>{0}: {1}<br><br>", TR("Edited on"), 
                                    Ext.Date.format(new Date(), Data.me.data.date_format + ' - ' + Data.me.data.time_format));
                        Ext.ux.grid.Printer.documentTitle = TR("Account operations details");
                        Ext.ux.grid.Printer.mainTitle = header;
                        Ext.ux.grid.Printer.print(this.operations_grids[me.membershipRec.data.uuid]);
                    },
                    scope: this,
                    disabled: operations.length == 0,
                },
            ],
            renderTo: body_div,
        });
        
        this.down('#grid').doLayout();
        this.operations_grids[rec.data.uuid].bodyExpanded = true;
        this.updateGridsLayout();
    },
    
    onCollapse: function(row, rec, exp_row){
        if (this.operations_grids[rec.data.uuid]){
            this.operations_grids[rec.data.uuid].bodyExpanded = false;
        }
        this.updateGridsLayout();
    },
    
    getSelectedCurrencies: function(){
        var currencies = [];
        this.down('#currenciesMenu').menu.items.each(function(i){
            if (i.checked){
                currencies.push(i.currency_uuid);
            }
        });
        return currencies;
    },
    
    generate: function(){
        var location_uuid = this.down('#locationCbx').getValue();
        var personCbx = this.down('#personCbx');
        var negativeOnly = this.down('#negativeOnly').checked;
        var positiveOnly = this.down('#positiveOnly').checked;
        var currenciesMenu = this.down('#currenciesMenu').menu;
        var grandTotal = this.down('#grandTotal');
        var store = this.down('#grid').getStore();
        var filters = [];
        var sorters = [];
        var currencies = this.getSelectedCurrencies();
        var membership = personCbx.getValue();
        // show only one account
        if (membership){
            filters.push({
                property: 'uuid',
                value: membership.data.uuid,
            });
            grandTotal.setValue('');
            grandTotal.disable();
        // show multiple
        } else {
            filters.push({
                property: 'location',
                value: location_uuid,
            });
            // sorters
            if (this.sort_field == 'names'){
                sorters.push({
                    property : 'person__last_name',
                    direction: this.sort_direction,
                });
                sorters.push({
                    property : 'person__first_name',
                    direction: this.sort_direction,
                });
            } else if (this.sort_field == 'balances'){
                sorters.push({
                    property : 'account__balance',
                    direction: this.sort_direction,
                });
            }
            // grand total
            Sp.utils.rpc('reports.accounts.get_grand_total', [location_uuid, negativeOnly, positiveOnly, currencies], function(total){
                var label = [];
                Ext.Object.each(total, function(k,v){
                    label.push(Ext.util.Format.currency(v, ' '+k, 2, true));
                });
                if (label.length > 0){
                    grandTotal.setValue(label.join(' | '));
                } else {
                    grandTotal.setValue(TR("None"));
                }
                grandTotal.enable();
            });
        }
        // negative only filter
        if (negativeOnly){
            filters.push({
                property: 'account__balance__lt',
                value: 0,
            });
        }
        if (positiveOnly){
            filters.push({
                property: 'account__balance__gt',
                value: 0,
            });
        }
        // currencies filter
        if (currencies.length > 0){
            filters.push({
                property: 'account__currency__uuid__in',
                value: currencies,
            });
        }
        // alter store
        if (sorters.length > 0){
            // doSort is false, sorting is done remotely
            store.sort(sorters, null, false); 
        }
        store.clearFilter(true);
        store.filter(filters);
    },
    
    namesSort: function(){
        var store = this.down('#grid').getStore();
        var sorters = [];
        if (this.sort_field == 'names'){
            this.sort_direction = this.sort_direction == 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.sort_field = 'names';
        }
        this.down('#balance').removeCls('x-column-header-sort-ASC');
        this.down('#balance').removeCls('x-column-header-sort-DESC');
        this.down('#member').removeCls('x-column-header-sort-ASC');
        this.down('#member').removeCls('x-column-header-sort-DESC');
        this.down('#member').addCls('x-column-header-sort-' + this.sort_direction);
        sorters.push({
            property : 'person__last_name',
            direction: this.sort_direction,
        });
        sorters.push({
            property : 'person__first_name',
            direction: this.sort_direction,
        });
        store.sort(sorters);
    },
    
    balancesSort: function(){
        var store = this.down('#grid').getStore();
        var sorters = [];
        if (this.sort_field == 'balances'){
            this.sort_direction = this.sort_direction == 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.sort_field = 'balances';
        }
        this.down('#balance').removeCls('x-column-header-sort-ASC');
        this.down('#balance').removeCls('x-column-header-sort-DESC');
        this.down('#member').removeCls('x-column-header-sort-ASC');
        this.down('#member').removeCls('x-column-header-sort-DESC');
        this.down('#balance').addCls('x-column-header-sort-' + this.sort_direction);
        sorters.push({
            property : 'account__balance',
            direction: this.sort_direction,
        });
        store.sort(sorters);
    },
    
    clearFilters: function(){
        this.down('#negativeOnly').setChecked(false);
        this.down('#positiveOnly').setChecked(false);
        this.down('#currenciesMenu').menu.items.each(function(i){
            i.setChecked(false);
        });
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
            documentTitle: TR("Accounts Listing"),
            mainTitle: header,
        }).show();
    },
    
    updateGridsLayout: function(){
        Ext.Object.each(this.operations_grids, function(k,v){
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
        Ext.Object.each(this.operations_grids, function(k,v){
            if (v.bodyExpanded){
                expand_plugin.toggleRow(store.indexOfId(k));
            }
        });
    },

});
