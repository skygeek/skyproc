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

Ext.define('Sp.views.reservations.EditReservation', {
    extend: 'Ext.form.Panel',
    
    initComponent: function() {
        
        this.interval = this.locationRec.data.reservation_interval;
        this.currentCatalogItem = null;
        this.currentReservationItem = null;
        this.cancel_close = true;
        
        var today = new Date();
        var start_date = undefined;
        var start_time = undefined;
        var min_date = undefined;
        var min_time = undefined;
        var flexible_min = undefined;
        var deposit_visible = false;
        if (this.resaRec){
            start_date = this.resaRec.data.StartDate;
            start_time = this.resaRec.data.StartDate;
            deposit_visible = (this.resaRec.data.payment == 'P');
        } else {
            this.resaRec = Data.create('Reservation');
            this.create = true;
            if (this.startDate){
                start_date = start_time = this.startDate;
            } else {
                start_date = min_date = today;
                min_time = Ext.Date.add(today, Ext.Date.MINUTE, this.interval);
            }
            if (this.endDate){
                var diff = Ext.Date.getElapsed(this.startDate, this.endDate)/1000/60;
                if (diff > this.interval){
                    this.resaRec.set({
                        flexible: true,
                        until_time: this.endDate,
                    }); 
                }
                
            }
        }
        if (min_time){
            flexible_min = Ext.Date.add(min_time, Ext.Date.MINUTE, this.interval*2);
        } else {
            flexible_min = Ext.Date.add(start_date, Ext.Date.MINUTE, this.interval*2);
        }
        
        Ext.apply(this, {
            border: 0,
            margin: 5,
            layout: {
                type: 'hbox',
                align: 'stretch',
            },
            items: [
                {
                    xtype: 'panel',
                    border: 0,
                    autoScroll: true,
                    margin: '0 5 0 0',
                    width: 292,
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    items: [
                        {
                            xtype: 'fieldset',
                            title: TR("Reservation Details"),
                            defaults: {
                                labelWidth: 70,
                                anchor: '100%',
                            },
                            items: [
                                {
                                    name: 'start_date',
                                    xtype: 'datefield',
                                    fieldLabel: TR("Date"),
                                    minValue: min_date,
                                    value: start_date,
                                },
                                {
                                    name: 'start_time',
                                    xtype: 'timefield',
                                    fieldLabel: TR("Time"),
                                    minValue: min_time,
                                    value: start_time,
                                    increment: this.interval,
                                    editable: false,
                                    listeners: {
                                        select: {
                                            fn: function(me, dt){
                                                this.down('#flexTime').setMinValue(Ext.Date.add(dt, Ext.Date.MINUTE, this.interval*2));
                                            },
                                            scope: this,
                                        },
                                    },
                                },
                                {
                                    name: 'flexible',
                                    xtype: 'checkbox',
                                    fieldLabel: TR("Flexible"),
                                    handler: function(me, checked){
                                        var flexTime = this.down('#flexTime');
                                        flexTime.setVisible(checked);
                                        if (!checked){
                                            flexTime.clearValue();                                          
                                        }
                                    },
                                    scope: this,
                                },
                                {
                                    name: 'until_time',
                                    xtype: 'timefield',
                                    itemId: 'flexTime',
                                    fieldLabel: TR("Until"),
                                    minValue: flexible_min,
                                    increment: this.interval,
                                    editable: false,
                                    hidden: true,
                                },
                                {
                                    name: 'confirmed',
                                    xtype: 'checkbox',
                                    fieldLabel: TR("Confirmed"),
                                },
                                {
                                    name: 'note',
                                    xtype: 'textarea',
                                    fieldLabel: TR("Note"),
                                    emptyText: TR("Optional note"),
                                    rows: 2,
                                },
                            ],
                        },
                        {
                            checkboxName: 'manual_billing',
                            xtype: 'fieldset',
                            title: TR("Manual Billing"),
                            checkboxToggle: true,
                            collapsed: true,
                            defaults: {
                                labelWidth: 70,
                                anchor: '100%',
                            },
                            items: [
                                {
                                    name: 'payment',
                                    xtype: 'combobox',
                                    fieldLabel: TR("Payment"),
                                    store: Ext.create('Ext.data.Store', {
                                        fields: ['code', 'label'],
                                        data : [
                                            {code:'N', label: TR("Not yet paid")},
                                            {code:'P', label: TR("Partially paid")},
                                            {code:'T', label: TR("Totally paid")},
                                        ]
                                    }),
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    displayField: 'label',
                                    valueField: 'code',
                                    value: 'N',
                                    listeners: {
                                        select: {
                                            fn: function(me, recs){
                                                this.down('#depositCtx').setVisible((recs && recs[0].data.code == 'P'));
                                            },
                                            scope: this,
                                        },
                                    },
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    itemId: 'depositCtx',
                                    hidden: !deposit_visible,
                                    fieldLabel: TR("Deposit"),
                                    layout: {
                                        type: 'hbox',
                                    },
                                    items: [
                                        {
                                            name: 'deposit_amount',
                                            xtype: 'numberfield',
                                            flex: 1,
                                        },
                                        {
                                            name: 'deposit_currency',
                                            xtype: 'combobox',
                                            store: this.locationRec.Currencies(),
                                            queryMode: 'local',
                                            forceSelection: true,
                                            editable: false,
                                            lastQuery: '',
                                            displayField: 'code',
                                            valueField: 'uuid',
                                            width: 70,
                                        },
                                    ],
                                },
                                {
                                    name: 'payer',
                                    xtype: 'personcombo',
                                    itemId: 'payerCbx',
                                    fieldLabel: TR("Payer"),
                                    emptyText: TR("search by member's last name"),
                                    locationRec: this.locationRec,
                                },
                                /*{
                                    name: 'payer',
                                    xtype: 'combobox',
                                    itemId: 'payerCbx',
                                    fieldLabel: TR("Payer"),
                                    emptyText: TR("search by member's last name"),
                                    store: Data.createStore('LocationMembership', {
                                        buffered: true,
                                        pageSize: 20,
                                        remoteSort: true,
                                        sorters: [
                                            {
                                                property: 'person__last_name',
                                                direction: 'ASC'
                                            },
                                            {
                                                property: 'person__first_name',
                                                direction: 'ASC'
                                            }
                                        ],
                                        remoteFilter: true,
                                        filters: [
                                            {
                                                property: 'location',
                                                value   : this.locationRec.data.uuid,
                                            },
                                        ],
                                        proxy: {
                                            extraParams: {
                                                query_field: 'person__last_name',
                                            },
                                        },
                                    }),
                                    valueField: 'uuid',
                                    hideTrigger: true,
                                    queryDelay: 250,
                                    typeAhead: true,
                                    forceSelection: true,
                                    minChars: 1,
                                    tpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '<div class="x-boundlist-item">',
                                            "{person.last_name} {person.first_name}",
                                            '</div>',
                                        '</tpl>'
                                    ),
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{person.last_name} {person.first_name}',
                                        '</tpl>'
                                    ),
                                    listConfig: {
                                        loadingText: TR("Searching..."),
                                        emptyText: TR("No matching members found"),
                                    },
                                    pageSize: 20,
                                }*/
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Set specific aircrafts"),
                            flex: 1,
                            items: [
                                {
                                    name: 'aircrafts',
                                    xtype: 'combobox',
                                    itemId: 'aircraftsCbx',
                                    store: this.locationRec.Aircrafts(),
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    lastQuery: '',
                                    displayField: 'registration',
                                    valueField: 'uuid',
                                    multiSelect: true,
                                    anchor: '100%',
                                },
                            ],
                        },
                    ],
                },
                {
                    xtype: 'fieldset',
                    itemId: 'contentFs',
                    title: TR("Reservation Content"),
                    flex: 1,
                    layout: 'card',
                    items: [
                        {
                            xtype: 'panel',
                            itemId: 'contentEditor',
                            border: 0,
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                            },
                            items: [
                                {
                                    xtype: 'fieldset',
                                    title: TR("Catalog Item"),
                                    defaults: {
                                        labelWidth: 70,
                                        anchor: '100%',
                                    },
                                    items: [
                                        {
                                            name: 'item',
                                            xtype: 'combobox',
                                            itemId: 'itemCbx',
                                            fieldLabel: TR("Item"),
                                            store: this.locationRec.LocationCatalogItems(),
                                            queryMode: 'local',
                                            forceSelection: true,
                                            editable: false,
                                            lastQuery: '',
                                            displayField: 'name',
                                            valueField: 'uuid',
                                            listeners: {
                                                select: {
                                                    fn: this.onCatalogItemSelect,
                                                    scope: this,
                                                },
                                            },
                                        },
                                        {
                                            name: 'element',
                                            xtype: 'combobox',
                                            itemId: 'elementCbx',
                                            hidden: true,
                                            fieldLabel: TR("Element"),
                                            store: Ext.create('Ext.data.Store', {
                                                fields: ['uuid','short_label','full_label'],
                                            }),
                                            queryMode: 'local',
                                            editable: false,
                                            lastQuery: '',
                                            valueField: 'uuid',
                                            tpl: Ext.create('Ext.XTemplate',
                                                '<tpl for=".">',
                                                    '<div class="x-boundlist-item">',
                                                    "{full_label}",
                                                    '</div>',
                                                '</tpl>'
                                            ),
                                            displayTpl: Ext.create('Ext.XTemplate',
                                                '<tpl for=".">',
                                                    '{short_label}',
                                                '</tpl>'
                                            ),
                                            listeners: {
                                                select: {
                                                    fn: function(me, recs){
                                                        if (recs[0]){
                                                            this.buildSlotsUI(recs[0]);                                                         
                                                        }
                                                    },
                                                    scope: this,
                                                },
                                            },
                                        },
                                        {
                                            name: 'jump_type',
                                            xtype: 'combobox',
                                            itemId: 'jumpTypeCbx',
                                            fieldLabel: TR("Work"),
                                            hidden: true,
                                            store: Data.jumpTypes,
                                            queryMode: 'local',
                                            editable: false,
                                            displayField: 'label',
                                            valueField: 'uuid',
                                            lastQuery: '',
                                        },
                                        {
                                            name: 'price',
                                            xtype: 'combobox',
                                            itemId: 'priceCbx',
                                            fieldLabel: TR("Price"),
                                            hidden: true,
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
                                    itemId: 'jumpers',
                                    title: TR("Jumpers"),
                                    hidden: true,
                                    flex: 1,
                                    overflowY: 'auto',
                                    defaults: {
                                        labelWidth: 75,
                                        anchor: '100%',
                                    },
                                },
                                {
                                    xtype: 'fieldset',
                                    itemId: 'workers',
                                    title: TR("Staff &nbsp;(leave empty for automatic selection)"),
                                    hidden: true,
                                    flex: 1,
                                    autoScroll: true,
                                    defaults: {
                                        labelWidth: 130,
                                        anchor: '100%',
                                    },
                                },
                            ],
                            bbar: [
                                '->',
                                {
                                    xtype: 'button',
                                    itemId: 'multiItemBt',
                                    text: TR("Add another item"),
                                    icon: '/static/images/icons/add.png',
                                    handler: function(me){
                                        var item = this.getReservationItemRecord();
                                        if (!item){
                                            return;
                                        }
                                        var store = this.resaRec.ReservationItems();
                                        store.removeAt(0);
                                        store.add(item);
                                        this.resetItemEditor();
                                        me.hide();
                                        this.down('#addItemBt').show();
                                        this.down('#cancelItemBt').show();
                                    },
                                    scope: this,
                                },
                                {
                                    xtype: 'button',
                                    itemId: 'addItemBt',
                                    text: TR("Add"),
                                    icon: '/static/images/icons/add_plus.png',
                                    hidden: true,
                                    handler: this.addReservationItem,
                                    scope: this,
                                },
                                {
                                    xtype: 'button',
                                    itemId: 'editItemBt',
                                    text: TR("Modify"),
                                    icon: '/static/images/icons/modify.png',
                                    hidden: true,
                                    handler: this.editReservationItem,
                                    scope: this,
                                },
                                {
                                    xtype: 'button',
                                    itemId: 'cancelItemBt',
                                    text: TR("Cancel"),
                                    icon: '/static/images/icons/cancel_round.png',
                                    hidden: true,
                                    handler: function(){
                                        var store = this.resaRec.ReservationItems();
                                        if (store.getCount() == 1){
                                            this.down('#addItemBt').hide();
                                            this.down('#editItemBt').hide();
                                            this.down('#cancelItemBt').hide();
                                            this.down('#multiItemBt').show();
                                            this.loadItem(store.getAt(0));
                                        } else {
                                            this.down('#contentFs').getLayout().setActiveItem('contentGrid');
                                            this.resetItemEditor(); 
                                        }
                                    },
                                    scope: this,
                                },
                                '->',
                            ],
                        },
                        {
                            xtype: 'grid',
                            itemId: 'contentGrid',
                            store: this.resaRec.ReservationItems(),
                            features: [
                                {
                                    ftype: 'summary',
                                },
                            ],
                            hideHeaders: true,
                            emptyText: TR("Empty reservation !"),
                            columns: [
                                {
                                    xtype: 'rownumberer'
                                },
                                {
                                    flex: 1,
                                    renderer: function(v,o,r){
                                        var infos = this.getReservationItemInfos(r);
                                        var label = '';
                                        var infos_label = [];
                                        var slots_count = infos.jumpers_count + infos.workers_count;
                                        
                                        if (slots_count > 0){
                                            infos_label.push(Ext.String.format('{0} {1}', slots_count, 
                                                            (slots_count > 1 ? TR("Slots") : TR("Slot"))));
                                        }                                       
                                        if (infos.element.data.altitude > 0){
                                            infos_label.push(infos.element.data.altitude + ' ' + infos.element.data.altitude_unit);
                                        }
                                        if (infos.jump_type){
                                            infos_label.push(infos.jump_type.data.label);
                                        }
                                        
                                        label += infos.item.data.name;
                                        label += "<table class='resa-item-table'>";
                                        label += "<tr>";
                                        label += "<td><img src='/static/images/icons/info.png'>&nbsp;</td>";
                                        label += "<td>";
                                        label += infos_label.join('&nbsp;&nbsp;-&nbsp;&nbsp;');
                                        label += "</td>";
                                        label += "</tr>";
                                        
                                        for (var i=0,j ; j = infos.jumpers[i] ; i++){
                                            label += "<tr>";
                                            if (j.type == 'person'){
                                                label += "<td><img src='/static/images/icons/member.png'>&nbsp;</td>";
                                            } else {
                                                label += "<td><img src='/static/images/icons/nomember.png'>&nbsp;</td>";
                                            }
                                            label += "<td>" + j.name + "</td>";
                                            label += "</tr>";
                                        }
                                        
                                        for (var i=0,w ; w = infos.workers[i] ; i++){
                                            label += "<tr>";
                                            label += Ext.String.format("<td><img src='/static/images/icons/roles/{0}.png'>&nbsp;</td>",
                                                                        w.role.data.type);
                                            label += "<td>" + w.worker.data.name + "</td>";
                                            label += "</tr>";
                                        }
                                        
                                        label += "</table>";
                                        return label;
                                    },
                                    scope: this,
                                    summaryRenderer: function(value, summaryData, dataIndex) {
                                        var total_jumpers = 0;
                                        var total_workers = 0;
                                        var label = '';
                                        this.resaRec.ReservationItems().each(function(i){
                                            var infos = this.getReservationItemInfos(i);
                                            total_jumpers += infos.jumpers_count;
                                            total_workers += infos.workers_count;
                                        }, this);
                                        
                                        label += TR("Total slots") + '&nbsp;:&nbsp;&nbsp;';
                                        label += "<span class='semi-bold'>" + (total_jumpers+total_workers) + "</span>";
                                        label += '&nbsp;&nbsp;&nbsp;';
                                        if (total_jumpers > 0 && total_workers > 0){
                                            label += Ext.String.format(TR("({0} Jumpers + {1} Staff)"), total_jumpers, total_workers);
                                        } else if (total_jumpers > 0){
                                            label += Ext.String.format(TR("({0} Jumpers)"), total_jumpers);
                                        } else if (total_workers > 0){
                                            label += Ext.String.format(TR("({0} Staff)"), total_workers);
                                        }
                                        return label;
                                    },
                                },
                                {
                                    align: 'right',
                                    width: 100,
                                    renderer: function(v,o,r){
                                        if (Ext.isObject(r.data.price)){
                                            var p = r.getLocationCatalogPrice();
                                        } else if (r.data.price){
                                            var item = this.locationRec.LocationCatalogItems().getById(r.data.item);
                                            var p = item.LocationCatalogPrices().getById(r.data.price);
                                        } else {
                                            return;
                                        }
                                        return Ext.util.Format.currency(p.data.price, ' '+p.getCurrency().data.code, 0, true);
                                    },
                                    scope: this,
                                    summaryRenderer: function(value, summaryData, dataIndex) {
                                        var totals = {};
                                        var label = '';
                                        this.resaRec.ReservationItems().each(function(i){
                                            var infos = this.getReservationItemInfos(i);
                                            if (infos.price){
                                                var currency = infos.price.getCurrency().data.code;
                                                if (!Ext.isDefined(totals[currency])){
                                                    totals[currency] = 0;
                                                }
                                                totals[currency] += infos.price.data.price;
                                            }
                                        }, this);
                                        label += "<table width='100%'>";
                                        Ext.Object.each(totals, function(k,v){
                                            label += "<tr>";
                                            label += "<td align='left'>";
                                            label += k;
                                            label += "</td>";
                                            label += "<td><span class='semi-bold'>";
                                            label += Ext.util.Format.currency(v, ' ', 0, true).trim();
                                            label += "</span></td>";
                                            label += "</tr>";
                                        }); 
                                        label += "</table>";
                                        return label;
                                    },
                                },
                                {
                                    xtype: 'actioncolumn',
                                    width: 40,
                                    items: [
                                        {
                                            icon: '/static/images/icons/edit.png',
                                            tooltip: TR("Edit"),
                                            handler: function(grid, rowIndex, colIndex) {
                                                this.loadItem(grid.getStore().getAt(rowIndex));
                                            },
                                            scope: this,
                                        },
                                        {
                                            icon: '/static/images/icons/trash.png',
                                            tooltip: TR("Remove"),
                                            handler: function(grid, rowIndex, colIndex) {
                                                var store = grid.getStore();
                                                store.removeAt(rowIndex);                                               
                                                grid.refresh();
                                                if (store.getCount() == 1){
                                                    this.down('#addItemBt').hide();
                                                    this.down('#editItemBt').hide();
                                                    this.down('#cancelItemBt').hide();
                                                    this.down('#multiItemBt').show();
                                                    this.loadItem(store.getAt(0));
                                                }
                                            },
                                            scope: this,
                                        }
                                    ],
                                },
                            ],
                            bbar: [
                                '->',
                                {
                                    xtype: 'button',
                                    text: TR("Add reservation item"),
                                    icon: '/static/images/icons/new_green.png',
                                    handler: function(){
                                        this.resetItemEditor();
                                        this.down('#addItemBt').show();
                                        this.down('#editItemBt').hide();
                                        this.down('#contentFs').getLayout().setActiveItem('contentEditor');
                                    },
                                    scope: this,
                                },
                                '->',
                            ],
                            listeners: {
                                itemdblclick: this.onResaItemDblClick,
                                itemcontextmenu: this.onResaItemContextMenu,
                                scope: this,
                            },
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Delete Reservation"),
                    icon: '/static/images/icons/delete.png',
                    handler: this.deleteReservation,
                    scope: this,
                    hidden: this.create,
                },
                '->',
                {
                    text: TR("Save"),
                    icon: '/static/images/icons/save.png',
                    handler: this.save,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
            listeners: {
                close: {
                    fn: this.onClose,
                    scope: this,
                },
            },
            
        });
 
        this.callParent(arguments);
        
        this.form.loadRecord(this.resaRec);
        
        if (!this.create){
            // set aircrafts
            var aircrafts = [];
            this.resaRec.Aircrafts().each(function(a){
                aircrafts.push(a.data.uuid);
            });
            this.down('#aircraftsCbx').setValue(aircrafts);
            
            // set payer
            /*if (this.resaRec.data.payer){
                var payerCbx = this.down('#payerCbx');
                // create fake membership to hold the payer Person
                var r = Data.create('LocationMembership', {
                    person: this.resaRec.data.payer,
                });
                payerCbx.getStore().add(r);
                payerCbx.setValue(r);
            }*/
            
            // set content
            var active_item;
            var store = this.resaRec.ReservationItems();
            if (store.getCount() == 1){
                this.loadItem(store.getAt(0));
            } else if (store.getCount() > 1){
                this.down('#multiItemBt').hide();
                this.down('#cancelItemBt').show();
                this.down('#contentFs').getLayout().setActiveItem('contentGrid');
            }
        }
        
        if (this.statusBar){
            this.statusBar.clearStatus();
        }
        
    },
    
    getReservationItemInfos: function(resa_item){
        var infos = {};
        var hires_store = resa_item.ReservationHires();
        infos.jumpers_count = resa_item.data.persons.length + resa_item.data.phantoms.length;
        infos.workers_count = hires_store.getCount();
        infos.jumpers = [];
        infos.workers = [];
        if (Ext.isObject(resa_item.data.item)){
            var item = resa_item.getLocationCatalogItem();
            var element = resa_item.getLocationCatalogElement();
            if (resa_item.data.jump_type){
                infos.jump_type = resa_item.getJumpType(); 
            }
            if (resa_item.data.price){
                infos.price = resa_item.getLocationCatalogPrice();
            }
        } else {
            var item = this.locationRec.LocationCatalogItems().getById(resa_item.data.item);
            var element = item.LocationCatalogElements().getById(resa_item.data.element);
            if (resa_item.data.jump_type){
                infos.jump_type = Data.jumpTypes.getById(resa_item.data.jump_type);
            }
            if (resa_item.data.price){
                infos.price = item.LocationCatalogPrices().getById(resa_item.data.price);
            }
        }
        infos.item = item;
        infos.element = element;
        if (infos.jumpers_count > 0){
            for (var i=0,p ; p = resa_item.data.persons[i] ; i++){
                infos.jumpers.push({
                    type: 'person',
                    uuid: p.uuid,
                    name: Sp.ui.misc.formatFullname({data:p}, Data.me.data.name_order, true),
                });
            }
            for (var i=0,p ; p = resa_item.data.phantoms[i] ; i++){
                infos.jumpers.push({
                    type: 'phantom',
                    uuid: p.uuid,
                    name: p.name,
                });
            }
        }
        if (infos.workers_count > 0){
            hires_store.each(function(i){
                var w = {};
                if (Ext.isObject(i.data.role)){
                    w.role = i.getWorkerType();
                } else {
                    w.role = Data.workerTypes.getById(i.data.role);
                }
                if (Ext.isObject(i.data.worker)){
                    w.worker = i.getWorker();
                } else {
                    w.worker = this.locationRec.Workers().getById(i.data.worker);
                }
                infos.workers.push(w);
            }, this);
        }
        return infos;
    },
    
    loadItem: function(i){
        this.currentReservationItem = i;
        
        // load data
        var item, element, jump_type, price;
        if (Ext.isObject(i.data.item)){
            item = i.getLocationCatalogItem();
            element = i.getLocationCatalogElement();
            if (i.data.jump_type){
                jump_type = i.getJumpType();
            }
            if (i.data.price){
                price = i.getLocationCatalogPrice();
            }
        } else if (i.data.item){
            item = this.locationRec.LocationCatalogItems().getById(i.data.item);
            if (!item){
                return;
            }
            element = item.LocationCatalogElements().getById(i.data.element);
            if (i.data.jump_type){
                jump_type = Data.jumpTypes.getById(i.data.jump_type);
            }
            if (i.data.price){
                price = item.LocationCatalogPrices().getById(i.data.price);
            }
        } else {
            return;
        }
        
        this.down('#contentFs').getLayout().setActiveItem('contentEditor');
        
        // form fields values
        var itemCbx = this.down('#itemCbx');
        itemCbx.setValue(item);
        this.onCatalogItemSelect(itemCbx, [item]);
        var elementCbx = this.down('#elementCbx');
        elementCbx.setValue(elementCbx.getStore().findRecord('uuid', element.data.uuid));
        this.down('#jumpTypeCbx').setValue(jump_type);
        if (price){
            var priceCbx = this.down('#priceCbx');
            priceCbx.setValue(priceCbx.getStore().findRecord('uuid', price.data.uuid));
        }
        
        this.buildSlotsUI(element, i);
        
        // buttons
        if (this.resaRec.ReservationItems().getCount() > 1){
            this.down('#addItemBt').hide();
            this.down('#editItemBt').show();
        }
    },
    
    onCatalogItemSelect: function(cbx, recs){
        var rec = recs[0];
        if (!rec){
            return;
        }
        
        this.currentCatalogItem = rec;
        
        var elementCbx = this.down('#elementCbx');
        var jumpTypeCbx = this.down('#jumpTypeCbx');
        var priceCbx = this.down('#priceCbx');
        
        elementCbx.clearInvalid();
        
        // jump type
        if (rec.data.jump_type_auto){
            jumpTypeCbx.hide();
        } else {
            jumpTypeCbx.show();
            jumpTypeCbx.clearValue();
            if (rec.data.jump_type){
                jumpTypeCbx.setValue(rec.data.jump_type);
            }
        }
        
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
        priceCbx.show();
        priceCbx.clearValue();
        var def = priceCbx_store.findRecord('default', true);
        if (def){
            priceCbx.setValue(def);
        }
        
        // element
        var elements = [];
        var elementCbx_store = elementCbx.getStore();
        rec.LocationCatalogElements().each(function(e){
            var l = Sp.ui.misc.getCatalogElementLabel(e);
            elements.push({
                uuid: e.data.uuid,
                short_label: l['short'],
                full_label: l.full,             
            });
        });
        elementCbx_store.loadRawData(elements);
        elementCbx.clearValue();
        
        if (elements.length == 1){
            elementCbx.hide();
            var e = elementCbx_store.getAt(0);
            elementCbx.setValue(e);
            this.buildSlotsUI(e);
        } else {
            elementCbx.show();
            this.destroySlotsUI();
        }
         
    },
    
    destroySlotsUI: function(){
        var jumpers = this.down('#jumpers');
        var workers = this.down('#workers');
        jumpers.hide();
        workers.hide();
        jumpers.removeAll();
        workers.removeAll();
    },
    
    buildSlotsUI: function(e, item){
        
        var element = this.currentCatalogItem.LocationCatalogElements().getById(e.data.uuid);
        if (!element){
            return;
        }
        var jumpers = this.down('#jumpers');
        var workers = this.down('#workers');
        var jumpers_data = [];
        var workers_data = {};
        
        this.destroySlotsUI();
        
        if (item){
            // jumpers
            for (var i=0 ; ii=item.data.persons[i] ; i++){
                jumpers_data.push({
                    type: 'person',
                    uuid: ii.uuid,
                    first_name: ii.first_name,
                    last_name: ii.last_name,
                });
            }
            for (var i=0 ; ii=item.data.phantoms[i] ; i++){
                jumpers_data.push({
                    type: 'phantom',
                    uuid: ii.uuid,
                    name: ii.name,
                });
            }
            // workers
            item.ReservationHires().each(function(h){
                if (Ext.isObject(h.data.role)){
                    var wt = h.getWorkerType();
                } else {
                    var wt = Data.workerTypes.getById(h.data.role);
                }
                if (Ext.isObject(h.data.worker)){
                    var worker = h.getWorker();
                } else {
                    var worker = this.locationRec.Workers().getById(h.data.worker);
                }
                if (!Ext.isDefined(workers_data[wt.data.type])){
                    workers_data[wt.data.type] = [];
                }
                workers_data[wt.data.type].push(worker.data.uuid);
            }, this);
        }
        
        // jumpers
        var jumpers_items = [];
        for (var i=0 ; i < element.data.slots ; i++){
            jumpers_items.push({
                xtype: 'combobox',
                fieldLabel: Ext.String.format("Jumper {0}", element.data.slots > 1 ? i+1 : ''),
                emptyText: TR("search by member's last name"),
                jumperData: jumpers_data[i],
                store: Data.createStore('LocationMembership', {
                    buffered: true,
                    pageSize: 20,
                    remoteSort: true,
                    sorters: [
                        {
                            property: 'person__last_name',
                            direction: 'ASC'
                        },
                        {
                            property: 'person__first_name',
                            direction: 'ASC'
                        }
                    ],
                    remoteFilter: true,
                    filters: [
                        {
                            property: 'location',
                            value: this.locationRec.data.uuid,
                        },
                    ],
                    proxy: {
                        extraParams: {
                            query_field: 'person__last_name',
                        },
                    },
                }),
                valueField: 'uuid',
                hideTrigger: true,
                queryDelay: 250,
                typeAhead: true,
                minChars: 1,
                tpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                        '<div class="x-boundlist-item">',
                        "{person.last_name} {person.first_name}",
                        '</div>',
                    '</tpl>'
                ),
                displayTpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                        '{person.last_name} {person.first_name}',
                    '</tpl>'
               ),
               listConfig: {
                    loadingText: TR("Searching..."),
                    emptyText: TR("No matching members found"),
                },
                pageSize: 20,
                listeners: {
                    afterrender: function(me){
                        if (!me.jumperData){
                            return;
                        }
                        if (me.jumperData.type == 'person'){
                            var r = Data.create('LocationMembership', {
                                person: me.jumperData,
                            });
                            me.getStore().add(r);
                            me.setValue(r);
                        } else {
                            me.setRawValue(me.jumperData.name);
                        }
                    },
                },
           });
           
        }
        if (jumpers_items.length > 0){
            jumpers.add(jumpers_items);
            jumpers.show();         
        }
        
        // workers
        var workers_items = [];
        element.LocationCatalogHires().each(function(h){
            var wt = h.getWorkerType();
            var store = Data.createStore('Worker', {
                sorters: [
                    {
                        property: 'name',
                        direction: 'ASC',
                    },
                ],
            });
            this.locationRec.Workers().each(function(w){
                if (w.WorkerTypes().getById(wt.data.uuid)){
                    store.add(w);                                               
                }
            });
            for (var i = 0; i < h.data.count ; i++){
                workers_items.push({
                    xtype: 'combobox',
                    fieldLabel: Ext.String.format("{0} {1}", wt.data.label, h.data.count > 1 ? i+1 : ''),
                    store: store,
                    queryMode: 'local',
                    editable: true,
                    forceSelection: true,
                    displayField: 'name',
                    valueField: 'uuid',
                    lastQuery: '',
                    workerType: wt,
                    workerData: workers_data[wt.data.type] ? workers_data[wt.data.type][i] : undefined,
                    listeners: {
                        afterrender: function(me){
                            if (me.workerData){
                                me.setValue(me.getStore().getById(me.workerData));
                            }
                        },
                    },
                });
            }
        }, this);
        if (workers_items.length > 0){
            workers.add(workers_items);
            workers.show();
        }
            
        
    },
    
    resetItemEditor: function(){
        var elementCbx = this.down('#elementCbx');
        var jumpTypeCbx = this.down('#jumpTypeCbx');
        var priceCbx = this.down('#priceCbx');
        this.down('#itemCbx').reset();
        elementCbx.hide();
        elementCbx.clearInvalid();
        jumpTypeCbx.hide();
        jumpTypeCbx.clearInvalid();
        priceCbx.hide();
        priceCbx.clearInvalid();
        this.destroySlotsUI();
    },
        
    getReservationItemRecord: function(){
        var valid = true;
        var itemCbx = this.down('#itemCbx');
        var elementCbx = this.down('#elementCbx');
        var jumpTypeCbx = this.down('#jumpTypeCbx');
        var priceCbx = this.down('#priceCbx');
        var jumpers = this.down('#jumpers');
        var workers = this.down('#workers');
        var rec_data = {
            reservation: this.resaRec.data.uuid,
            item: itemCbx.getValue(),
            element: elementCbx.getValue(),
            jump_type: jumpTypeCbx.getValue(),
            price: priceCbx.getValue(),
            persons: [],
            phantoms: [],
            workers: [],
        };
        
        if (!rec_data.item){
            valid = false;
            itemCbx.markInvalid(TR(Sp.core.Globals.REQ_MSG));
        }
        if (!rec_data.element){
            valid = false;
            elementCbx.markInvalid(TR(Sp.core.Globals.REQ_MSG));
        }

        if (!valid){
            return;
        }
        
        jumpers.cascade(function(j){
            if (j === jumpers){
                return;
            }
            var v = j.getValue();
            if (Sp.utils.isUuid(v)){
                var p = j.getStore().getById(v).data.person;
                rec_data.persons.push({
                    uuid: p.uuid,
                    first_name: p.first_name,
                    last_name: p.last_name,
                });
            } else if (v){
                rec_data.phantoms.push({
                    uuid: Ext.data.IdGenerator.get('uuid').generate(),
                    name: v,
                });
            }
        });
        
        var rec = Data.create('ReservationItem', rec_data);
        
        var hires_store = rec.ReservationHires();
        workers.cascade(function(w){
            if (w === workers){
                return;
            }
            var v = w.getValue();
            if (v){
                hires_store.add(Data.create('ReservationHire', {
                    item: rec.data.uuid,
                    worker: v,
                    role: w.workerType.data.uuid,
                }));
            }
        });
        return rec;
        
    },
    
    addReservationItem: function(){
        var item = this.getReservationItemRecord();
        if (!item){
            return;
        }
        this.resaRec.ReservationItems().add(item);
        this.down('#contentGrid').getView().refresh();
        this.down('#contentFs').getLayout().setActiveItem('contentGrid');
    },
    
    editReservationItem: function(){
        var item = this.getReservationItemRecord();
        if (!item){
            return;
        }
        // edit hires
        var store = this.currentReservationItem.ReservationHires();
        store.remove(store.getRange());
        item.ReservationHires().each(function(i){
            //i.beginEdit();
            i.set('item', this.currentReservationItem.data.uuid);
            //i.endEdit();
            i.setDirty();
            store.add(i);
        }, this);
        // edit resa
        delete item.data.uuid;
        //this.currentReservationItem.beginEdit();
        this.currentReservationItem.set(item.data);
        //this.currentReservationItem.endEdit();
        this.down('#contentGrid').getView().refresh();
        this.down('#contentFs').getLayout().setActiveItem('contentGrid');
    },
    
    onResaItemDblClick: function(grid, rec){
        this.loadItem(rec);
    },
    
    onResaItemContextMenu: function(grid, rec, el, idx, ev){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.loadItem(rec);
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Remove"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                                                
                    },
                    scope: this,
                },
            ],
        });
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    statusBarBusy: function(){
        if (this.statusBar){
            this.statusBar.showBusy(TR("Syncing"));
        }
    },
    
    statusBarOk: function(){
        if (this.statusBar){
            this.statusBar.setStatus({
                iconCls: 'x-status-valid', 
                text: TR("Updated"),
                clear: true,
            });
        }
    },
    
    save: function(){
        var record = this.form.getRecord();
        
        var start_date = this.form.findField('start_date').getValue();
        var start_time = this.form.findField('start_time').getValue();
        var flexible = this.form.findField('flexible').getValue();
        var flex_time = this.form.findField('until_time').getValue();
        if (!start_date){
            this.form.findField('start_date').markInvalid(TR(Sp.core.Globals.REQ_MSG));
            return;
        }
        if (!start_time){
            this.form.findField('start_time').markInvalid(TR(Sp.core.Globals.REQ_MSG));
            return;
        }
        if (flexible && !flex_time){
            this.form.findField('until_time').markInvalid(TR(Sp.core.Globals.REQ_MSG));
            return;
        }
        
        // undo copy
        var rec_copy = record.copy();
        
        // set start and end datetime
        start_date.setHours(start_time.getHours());
        start_date.setMinutes(start_time.getMinutes());
        if (flexible){
            var end_date = Ext.Date.clone(start_date);
            var end_time = flex_time;
            end_date.setHours(end_time.getHours());
            end_date.setMinutes(end_time.getMinutes());
        } else {
            var end_date = Ext.Date.add(start_date, Ext.Date.MINUTE, this.interval);
        }
        //record.beginEdit();
        record.set({
            location: this.locationRec.data.uuid,
            StartDate: start_date,
            EndDate: end_date,
        });
        //record.endEdit();
        
        // validation
        if (!Sp.ui.data.validateForm(this)){
            return;
        }
        
        // reservation items
        var items_store =  record.ReservationItems();
        if (items_store.getCount() <= 1){
            var itemRec = this.getReservationItemRecord();
            if (!itemRec){
                return;
            }
            if (items_store.getCount() == 1){
                items_store.removeAt(0);
            }
            items_store.add(itemRec);
        }

        // update fields
        this.form.updateRecord();
        
        // reset until_time
        if (!record.data.flexible){
            //record.beginEdit();
            record.set('until_time', null);
            //record.endEdit();
        }
        
        // update payer person
        /*if (record.data.payer){
            var p = this.down('#payerCbx').getStore().getById(record.data.payer).data.person;
            var p_data = {
                uuid: p.uuid,
                first_name: p.first_name,
                last_name: p.last_name,
            };
            //record.beginEdit();
            record.set('payer', p_data);
            //record.endEdit();
        }*/
        
        // update aircrafts
        var selected_aircrafts = this.down('#aircraftsCbx').getValue();
        var all_aircrafts = this.locationRec.Aircrafts();
        var aircrafts_store = record.Aircrafts();
        aircrafts_store.removeAll(true);
        for (var i=0,a ; a=selected_aircrafts[i] ; i++){
            aircrafts_store.add(all_aircrafts.getById(a));
        }
        
        if (this.create){
            // add calendar event
            var r = Ext.create('Extensible.calendar.data.EventModel', record.data);
            r.phantom = false;
            this.calendar.store.add(r);
            Data.reservations.add(record);
        } else {
            // edit calendar event
            var r = this.calendar.store.findRecord('uuid', record.data.uuid);
            r.set(record.data);
            r.commit();
            // undo action
            this.mainPanel.storeAction({
                action: 'update',
                record: rec_copy,
            });
        }
        // Title & color
        if (this.mainPanel){
            this.mainPanel.decorateEvent(r);
        }
        this.statusBarBusy();
        record.save({
            callback: function(r, op){
                if (!op.success){
                    return;
                }
                var store = record.ReservationItems();
                if (store.getNewRecords().length == 0 && store.getUpdatedRecords().length == 0 && store.getRemovedRecords.length == 0){
                    this.updateItemsHires(store);
                    return;
                }
                store.sync({
                    success: function(){
                        this.updateItemsHires(store);
                    },
                    scope: this,
                });
            },
            scope: this,
        });
        
        this.cancel_close = false;
        this.close();
    },
    
    updateItemsHires: function(items_store){
        items_store.each(function(i){
            i.ReservationHires().sync();
        });
        this.statusBarOk();
    },
    
    deleteReservation: function(){
        var record = this.form.getRecord();
        var r;
        r = this.calendar.store.findRecord('uuid', record.data.uuid);
        if (r){
            this.calendar.store.remove(r);
        }
        Data.reservations.remove(record);
        this.mainPanel.storeAction({
            action: 'destroy',
            record: record,
        });
        if (this.statusBar){
            this.statusBar.showBusy(TR("Syncing"));
        }
        record.destroy({
            callback: function(){               
                if (this.statusBar){
                    this.statusBar.setStatus({
                        iconCls: 'x-status-valid',
                        text: TR("Updated"),
                        clear: true,
                    });
                }
            },
            scope: this,
        });
        this.cancel_close = false;
        this.close();
    },
    
    onClose: function(){
        if (this.cancel_close){
            var store = this.resaRec.ReservationItems();
            store.rejectChanges();
            store.each(function(i){
                i.ReservationHires().rejectChanges();
            });
        }
    },

});
