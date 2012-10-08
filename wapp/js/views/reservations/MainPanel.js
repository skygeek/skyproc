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

Ext.define('Sp.views.reservations.CalendarListPanel', {
    extend: 'Extensible.calendar.gadget.CalendarListPanel',
    alias: 'widget.spcalendarlist',
    mixins: {
        observable: 'Ext.util.Observable',
    },
    
    constructor: function (config) {
        this.callParent(arguments);
        this.mixins.observable.constructor.call(this, config);
        this.addEvents('toggle');
   },
    
    getListTemplate : function(){
        if(!this.tpl){
            this.tpl = !(Ext.isIE || Ext.isOpera) ? 
                Ext.create('Ext.XTemplate', 
                    '<ul class="x-unselectable"><tpl for=".">',
                        '<li id="{cmpId}" class="ext-cal-evr {colorCls} {hiddenCls}">{title}</li>',
                    '</tpl></ul>'
                )
                : Ext.create('Ext.XTemplate',
                    '<ul class="x-unselectable"><tpl for=".">',
                        '<li id="{cmpId}" class="ext-cal-evo {colorCls} {hiddenCls}">',
                            '<div class="ext-cal-evm">',
                                '<div class="ext-cal-evi">{title}</div>',
                            '</div>',
                        '</li>',
                    '</tpl></ul>'
                );
            this.tpl.compile();
        }
        return this.tpl;
    },
    
    toggleCalendar: function(id, commit){
        this.callParent(arguments);
        var rec = this.store.findRecord(Extensible.calendar.data.CalendarMappings.CalendarId.name, id);
        CM = Extensible.calendar.data.CalendarMappings,
        isHidden = rec.data[CM.IsHidden.name];
        this.fireEvent('toggle', id, isHidden);
    },
    
});

Ext.define('Sp.views.reservations.MainPanel', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
        
        this.currentLocation = null;
        this.currentCalViewIndex = 1;
        this.undo_stack = [];
        this.redo_stack = [];
        
        Ext.apply(this, {
            layout: 'border',
            margin: '10 5 5 0',
            items: [
                {
                    xtype: 'toolbar',
                    region: 'north',
                    margin: '0 0 10 0',
                    items: [
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
                            valueField: 'unit',
                            listeners: {
                                afterrender: function(me){
                                    var r = me.getStore().getAt(0);
                                    if (r){
                                        me.setValue(r);
                                    }
                                },
                                beforeselect: {
                                    fn: function(me, rec){
                                        this.setLocation(rec.data.uuid);
                                    },
                                    scope: this
                                },
                            },
                        },
                        '-',
                        {
                            text: TR("New reservation"),
                            itemId: 'newResaBt',
                            icon: '/static/images/icons/new_green.png',
                            handler: function(){
                                this.newReservation();
                            },
                            scope: this,
                        },
                        '-',
                        {
                            text: TR("Filter reservations"),
                            itemId: 'filterBt',
                            icon: '/static/images/icons/filter.png',
                            menu: [
                                {
                                    xtype: 'spcalendarlist',
                                    width: 200,
                                    header: false,
                                    border: 0,
                                    store: Ext.create('Extensible.calendar.data.MemoryCalendarStore', {
                                        data: this.getCalendarsColors(),
                                    }),
                                    listeners: {
                                        toggle: {
                                            fn: this.onCalendarToggle,
                                            scope: this,
                                        },
                                    },
                                },
                            ],
                        },
                        '-',
                        {
                            itemId: 'undoBt',
                            tooltip: TR("Undo"),
                            icon: '/static/images/icons/undo.png',
                            handler: this.undo,
                            scope: this,
                            disabled: true,
                        },
                        {
                            itemId: 'redoBt',
                            tooltip: TR("Redo"),
                            icon: '/static/images/icons/redo.png',
                            handler: this.redo,
                            scope: this,
                            disabled: true,
                        },
                        '->',
                        {
                            text: TR("Calendar View"),
                            itemId: 'calViewBt',
                            icon: '/static/images/icons/eye.png',
                            menu: [
                                {
                                    text: TR("Day"),
                                    icon: '/static/images/icons/calendar_day.png',
                                    checked: false,
                                    group: 'calendarView',
                                    checkedCls: 'menu-item-checked',
                                    uncheckedCls: 'menu-item-unchecked',
                                    handler: function(){
                                        this.setCalendarsView(0);
                                    },
                                    scope: this,
                                },
                                {
                                    text: TR("3 Days"),
                                    icon: '/static/images/icons/calendar_3days.png',
                                    checked: true,
                                    group: 'calendarView',
                                    checkedCls: 'menu-item-checked',
                                    uncheckedCls: 'menu-item-unchecked',
                                    handler: function(){
                                        this.setCalendarsView(1);
                                    },
                                    scope: this,
                                },
                                {
                                    text: TR("Week"),
                                    icon: '/static/images/icons/calendar_week.png',
                                    checked: false,
                                    group: 'calendarView',
                                    checkedCls: 'menu-item-checked',
                                    uncheckedCls: 'menu-item-unchecked',
                                    handler: function(){
                                        this.setCalendarsView(2);
                                    },
                                    scope: this,
                                },
                                {
                                    text: TR("2 Weeks"),
                                    icon: '/static/images/icons/calendar_2weeks.png',
                                    checked: false,
                                    group: 'calendarView',
                                    checkedCls: 'menu-item-checked',
                                    uncheckedCls: 'menu-item-unchecked',
                                    handler: function(){
                                        this.setCalendarsView(3);
                                    },
                                    scope: this,
                                },
                                {
                                    text: TR("Month"),
                                    icon: '/static/images/icons/calendar_month.png',
                                    checked: false,
                                    group: 'calendarView',
                                    checkedCls: 'menu-item-checked',
                                    uncheckedCls: 'menu-item-unchecked',
                                    handler: function(){
                                        this.setCalendarsView(4);
                                    },
                                    scope: this,
                                },
                                {
                                    text: TR("List"),
                                    icon: '/static/images/icons/calendar_list.png',
                                    checked: false,
                                    group: 'calendarView',
                                    checkedCls: 'menu-item-checked',
                                    uncheckedCls: 'menu-item-unchecked',
                                    handler: function(){
                                    },
                                    scope: this,
                                },
                            ],
                        },
                        '-',
                        {
                            icon: '/static/images/icons/previous.png',
                            itemId: 'calPrevBt',
                            handler: function(){                                
                                var start_date;
                                this.down('#calendarsCtx').items.each(function(i){
                                    i.onPrevClick();
                                    start_date = i.startDate;
                                }, this);
                                this.down('#dtPicker').setValue(start_date);
                            },
                            scope: this,
                        },
                        {
                            text: TR("Today"),
                            itemId: 'calTodayBt',
                            handler: function(){
                                var start_date;
                                this.down('#calendarsCtx').items.each(function(i){
                                    i.onTodayClick();
                                    start_date = i.startDate;
                                }, this);
                                this.down('#dtPicker').setValue(start_date);
                            },
                            scope: this,
                        },
                        {
                            icon: '/static/images/icons/next.png',
                            itemId: 'calNextBt',
                            handler: function(){
                                var start_date;
                                this.down('#calendarsCtx').items.each(function(i){
                                    i.onNextClick();
                                    start_date = i.startDate;
                                }, this);
                                this.down('#dtPicker').setValue(start_date);
                            },
                            scope: this,
                        },
                    ],
                },
                {
                    region: 'east',
                    width: 190,
                    border: 0,
                    header: false,
                    split:true,
                    collapsible: true,
                    resizable: true,
                    titleCollapse: true,
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'container',
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            items: [
                                {
                                    xtype: 'datepicker',
                                    itemId: 'dtPicker',
                                    border: 0,
                                    showToday: false,
                                    listeners: {
                                        select: {
                                            fn: function(p, dt){
                                                var cal = this.getCurrentCal();
                                                if (Ext.isFunction(cal.layout.activeItem.moveTo)){
                                                    cal.startDate = cal.layout.activeItem.moveTo(dt, true);
                                                    cal.updateNavState();
                                                    cal.fireViewChange();   
                                                }
                                            },
                                            scope: this,
                                        },
                                    },
                                },
                                {
                                    xtype: 'tabpanel',
                                    flex: 1,
                                    margin: '2 0 0 0',
                                    items: [
                                        {
                                            tabConfig: {
                                                title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                                tooltip: TR("Club Members"),
                                                icon: '/static/images/icons/members.png',
                                                iconAlign: 'top',
                                            },
                                            xtype: 'grid',
                                            itemId: 'membersGrid',
                                            store: Data.createStore('LocationMembership', {
                                                buffered: true,
                                                pageSize: 50,
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
                                            }),
                                            selModel: {
                                                pruneRemoved: false,
                                            },
                                            viewConfig: {
                                                trackOver: false,
                                                deferEmptyText: true,
                                            },
                                            hideHeaders: true,
                                            border: 0,
                                            emptyText: TR("No members !"),
                                            columns: [
                                                {
                                                    flex: 1,
                                                    renderer: function(v,o,r){
                                                        return Sp.ui.misc.formatFullname(r.getPerson(), Data.me.data.name_order, true);
                                                    },
                                                },
                                            ],
                                            tbar: [
                                                {
                                                    xtype: 'textfield',
                                                    flex: 1,
                                                },
                                                {
                                                    xtype: 'button',
                                                    icon: '/static/images/icons/search.png',
                                                    tooltip: TR("Search"),
                                                }
                                            ],
                                            bbar: [
                                                '->',
                                                {
                                                    xtype: 'button',
                                                    text: TR("Add to this reservation"),
                                                    icon: '/static/images/icons/rewind.png',
                                                },
                                                '->',
                                            ],
                                        },
                                        {
                                            tabConfig: {
                                                title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                                tooltip: TR("Staff Members"),
                                                icon: '/static/images/icons/staff.png',
                                                iconAlign: 'top',
                                            },
                                            xtype: 'grid',
                                            itemId: 'workersGrid',
                                            store: Ext.create('Ext.data.Store', {
                                                fields: ['uuid','name'],
                                            }),
                                            hideHeaders: true,
                                            border: 0,
                                            emptyText: TR("No staff !"),
                                            columns: [
                                                {dataIndex: 'name', flex:1},
                                            ],
                                            tbar: [
                                                {
                                                    xtype: 'textfield',
                                                    flex: 1,
                                                },
                                                {
                                                    xtype: 'button',
                                                    icon: '/static/images/icons/search.png',
                                                    tooltip: TR("Search"),
                                                }
                                            ],
                                            bbar: [
                                                '->',
                                                {
                                                    xtype: 'button',
                                                    text: TR("Add to this reservation"),
                                                    icon: '/static/images/icons/rewind.png',
                                               },
                                                '->',
                                            ],
                                        },
                                        {
                                            tabConfig: {
                                                title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                                tooltip: TR("Weather Forecast"),
                                                icon: '/static/images/icons/weather.png',
                                                iconAlign: 'top',
                                            },
                                            items: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    xtype: 'container',
                    itemId: 'calendarsCtx',
                    region: 'center',
                    layout: 'card',
                },
                {
                    xtype: 'statusbar',
                    itemId: 'statusBar',
                    region: 'south',
                    defaultText: '&nbsp;',
                    text: '&nbsp;',
                    busyIconCls: 'x-status-sync',
                    height: 28,
                    margin: '5 0 0 0',
                },
            ],
            
        });
        this.callParent(arguments);
        this.buildLocationsStore();
    },
    
    getCalendarsColors: function(){
        return {
            "calendars" : [
                {
                    'id': 2,
                    'title': TR("Confirmed reservations"),
                    'color': 26,
                },
                {
                    'id': 1,
                    'title': TR("Unconfirmed reservations"),
                    'color': 7,
                },
                {
                    'id': 3,
                    'title': TR("Reservations made by others"),
                    'color': 22,
                },
                {
                    'id': 4,
                    'title': TR("Problematic reservations"),
                    'color': 2,
                },
            ]
       };
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
        Data.memberships.each(function(m){
            var l = m.getLocation();
            var r = {};
            r.uuid = l.data.uuid;
            r.name = l.data.name;
            data.push(r);
        });
        var store = this.down('#locationCbx').getStore();
        store.loadRawData(data);
        var r = store.getAt(0);
        if (r){
            this.setLocation(r.data.uuid);
        }
        
    },
    
    getEventInfos: function(rec){
        var resaRec = Data.reservations.getById(rec.data.uuid);
        if (!resaRec){
            return;
        }
        var locationRec = Data.locations.getById(resaRec.data.location);
        if (!locationRec){
            return;
        }
        
        var infos = {};
        infos.resaRec = resaRec;
        infos.total_slots = 0;
        infos.used_slots = 0;
        infos.title = '';
        infos.slots_label = '';
        infos.calendarId = 1;
        infos.aircrafts = [];
        infos.prices = {};
        infos.items = [];
        
        resaRec.ReservationItems().each(function(resa_item){
            var price;
            if (Ext.isObject(resa_item.data.item)){
                var item = resa_item.getLocationCatalogItem();
                var element = resa_item.getLocationCatalogElement();
                if (resa_item.data.price){
                    price = resa_item.getLocationCatalogPrice();
                }
            } else {
                var item = locationRec.LocationCatalogItems().getById(resa_item.data.item);
                var element = item.LocationCatalogElements().getById(resa_item.data.element);
                if (resa_item.data.price){
                    price = item.LocationCatalogPrices().getById(resa_item.data.price);
                }
            }
            
            var item_infos = {};
            item_infos.name = item.data.name;
            item_infos.persons = resa_item.data.persons;
            item_infos.phantoms = resa_item.data.phantoms;
            item_infos.workers = [];
            resa_item.ReservationHires().each(function(h){
                if (Ext.isObject(h.data.worker)){
                    var w = h.getWorker();
                } else {
                    var w = locationRec.Workers().getById(h.data.worker);
                }
                item_infos.workers.push(w.data);
            });
            infos.items.push(item_infos);
            
            infos.total_slots += element.data.slots;
            element.LocationCatalogHires().each(function(h){
                infos.total_slots += h.data.count;
            }, this);
            infos.used_slots += resa_item.data.persons.length;
            infos.used_slots += resa_item.data.phantoms.length;
            infos.used_slots += resa_item.ReservationHires().getCount();
            if (price){
                if (Ext.isObject(price.data.currency)){
                    var currency = price.getCurrency();
                } else {
                    var currency = Data.currencies.getById(price.data.currency);
                }
                if (!Ext.isDefined(infos.prices[currency.data.code])){
                    infos.prices[currency.data.code] = 0;
                }
                infos.prices[currency.data.code] += price.data.price;
            }
        }, this);
        
        // slots label
        if (infos.total_slots != infos.used_slots){
            infos.slots_label += Ext.String.format('{0} (-{1})&nbsp;', infos.total_slots, infos.total_slots-infos.used_slots);
        } else {
            infos.slots_label += infos.total_slots + '&nbsp;';
        }
        infos.slots_label += infos.total_slots > 1 ? TR("Slots") : TR("Slot");
        
        // calendar id (color)
        if (infos.total_slots > 0 && infos.used_slots != infos.total_slots){
            infos.calendarId = 4;
        } else {
            infos.calendarId = resaRec.data.confirmed ? 2 : 1;
        }
        
        // aircrafts
        resaRec.Aircrafts().each(function(a){
            infos.aircrafts.push(a.data.registration);
        }, this);
        
        // title
        infos.title = infos.slots_label;
        if (infos.aircrafts.length > 0){
            infos.title += Ext.String.format("&nbsp;[{0}]", infos.aircrafts.join(','));
        }
        
        return infos;
    },
    
    decorateEvent: function(rec){
        var infos = this.getEventInfos(rec);
        if (!infos){
            return;
        }
        var resaRec = Data.reservations.getById(rec.data.uuid);
        var title = '';
        if (resaRec.data.note && resaRec.data.note.length > 0){
            title += resaRec.data.note + '&nbsp;-&nbsp;';
        }
        title += infos.title;
        resaRec.set('Title', title);
        rec.set('Title', title);
        resaRec.set('CalendarId', infos.calendarId);
        rec.set('CalendarId', infos.calendarId);
    },
    
    getEventStatusText: function(rec){
        var infos = this.getEventInfos(rec);
        var infos_sep = '&nbsp;&nbsp;|&nbsp;&nbsp;';
        if (!infos){
            return;
        }
        var label = '';
        var prices = [];
        var items = [];
        label += infos.title;
        label += infos_sep;
        Ext.Object.each(infos.prices, function(k,v){
            prices.push(Ext.String.format('{0} {1}', v, k));
        });
        label += prices.join('&nbsp;+&nbsp;')
        if (!infos.resaRec.data.manual_billing){
            label += Ext.String.format(' ({0})', TR("Auto"));
        } else if (infos.resaRec.data.payment == 'N'){
            label += Ext.String.format(' ({0})', TR("Not paid"));
        } else if (infos.resaRec.data.payment == 'P'){
            if (Ext.isObject(infos.resaRec.data.deposit_currency)){
                var currency = infos.resaRec.getCurrency();
            } else {
                var currency = Data.currencies.getById(infos.resaRec.data.deposit_currency);
            }
            label += Ext.String.format(' ({0}: {1} {2})', TR("Deposit"), infos.resaRec.data.deposit_amount, currency.data.code);
        } else if (infos.resaRec.data.payment == 'T'){
            label += Ext.String.format(' ({0})', TR("Paid"));
        }
        label += infos_sep;
        for (var i=0,ii ; ii = infos.items[i] ; i++){
            var item_label = '';
            var names = [];
            item_label += ii.name;
            Ext.each(ii.persons, function(p){
                names.push(Sp.ui.misc.formatFullname({data:p}, Data.me.data.name_order, true));
            });
            Ext.each(ii.phantoms, function(p){
                names.push(p.name);
            });
            Ext.each(ii.workers, function(w){
                names.push(w.name);
            });
            if (names.length > 0){
                item_label += Ext.String.format(': {0}', names.join(', '));
            }
            items.push(item_label);
        }
        label += items.join('&nbsp;--&nbsp;')
        return label;
    },
    
    setMyLocation: function(locationRec){
        this.currentLocation = locationRec;
        this.showLocationCalendar(locationRec);
        var members_store = this.down('#membersGrid').getStore();
        members_store.clearFilter(true);
        members_store.filter('location', locationRec.data.uuid);
        members_store.load();
        
        var data = [];
        locationRec.Workers().each(function(w){
            data.push({
                uuid: w.data.uuid,
                name: w.data.name,
            });
        });
        this.down('#workersGrid').getStore().loadRawData(data);
    },
    
    setOtherLocation: function(locationRec){
        this.currentLocation = locationRec;
        this.showLocationCalendar(locationRec);
    },
    
    showLocationCalendar: function(locationRec){
        var ctx = this.down('#calendarsCtx');
        var cal_id = locationRec.data.uuid + '-cal';
        var cal = ctx.getComponent(cal_id);
        if (!cal){
            cal = Ext.create('Extensible.calendar.CalendarPanel', {
                itemId: cal_id,
                calendarStore: Ext.create('Extensible.calendar.data.MemoryCalendarStore', {
                    data: this.getCalendarsColors(),
                }),
                eventStore: Sp.ui.data.buildCalendarStore(locationRec.data.uuid, this.onWrite, this),
                activeItem: this.currentCalViewIndex,
                showMultiDayView: true,
                showTime: false,
                showNavBar: false,
                viewConfig: {
                    ddIncrement: locationRec.data.reservation_interval,
                    viewStartHour: locationRec.data.reservation_start.getHours(),
                    viewEndHour: locationRec.data.reservation_end.getHours(),
                    enableEventResize: false,
                },
                listeners: {
                    eventclick: this.onEventClick,
                    dayclick: this.onDayClick,
                    editdetails: this.onEventEdit,
                    beforeeventresize: this.beforeEventResize,
                    rangeselect: this.onRangeRelect,
                    eventover: this.onEventOver,
                    eventout: this.onEventOut,
                    scope: this,
                },
            });
            ctx.add(cal);
        }
        ctx.getLayout().setActiveItem(cal);
        try {
            cal.layout.getActiveItem().refresh();
        } catch(e){}
    },
    
    setLocation: function(location_uuid){
        if (this.currentLocation && location_uuid == this.currentLocation.data.uuid){
            return;
        }
        if (Sp.app.isOp()){
            var l = Data.locations.getById(location_uuid);
            if (l){
                this.setMyLocation(l);
                return;
            }
        }
        if (Sp.app.isCm()){
            Data.memberships.each(function(m){
                var l = m.getLocation();
                if (l.data.uuid == location_uuid){
                    this.setOtherLocation(l);
                    return false;
                }
            }, this);
        }
    },
    
    setEditMode: function(edit){
        this.down('#locationCbx').setDisabled(edit);
        this.down('#newResaBt').setDisabled(edit);
        this.down('#filterBt').setDisabled(edit);
        this.down('#calViewBt').setDisabled(edit);
        this.down('#calPrevBt').setDisabled(edit);
        this.down('#calTodayBt').setDisabled(edit);
        this.down('#calNextBt').setDisabled(edit);
        this.down('#dtPicker').setDisabled(edit);
    },
    
    getCurrentCal: function(){
        var ctx = this.down('#calendarsCtx');
        var cal_id = this.currentLocation.data.uuid + '-cal';
        return ctx.getComponent(cal_id);
    },
    
    refreshCurrentCal: function(location_uuid){
        if (location_uuid && location_uuid != this.currentLocation.data.uuid){
            return;
        }
        var cal = this.getCurrentCal();
        if (cal){
            try {
                cal.layout.getActiveItem().refresh();
            } catch(e){}
        }
    },
    
    setCalendarsView: function(view_index){
        this.currentCalViewIndex = view_index;
        var fn = {
            0: 'onDayNavClick',
            1: 'onMultiDayNavClick',
            2: 'onWeekNavClick',
            3: 'onMultiWeekNavClick',
            4: 'onMonthNavClick',
        };
        var ctx = this.down('#calendarsCtx');
        ctx.items.each(function(i){
            i[fn[view_index]]();
        }, this);
    },
    
    newReservation: function(startDate, endDate){
        this.setEditMode(true);
        var cal = this.getCurrentCal();
        var p = Ext.create('Sp.views.reservations.EditReservation', {
            mainPanel: this,
            calendar: cal,
            statusBar: this.down('#statusBar'),
            lastCalendarView: cal.layout.getActiveItem(),
            locationRec: this.currentLocation,
            startDate: startDate,
            endDate: endDate,
        });
        p.on('close', this.onEditPanelClose, this, {single: true});
        cal.layout.owner.add(p);
        cal.layout.setActiveItem(p);
    },
    
    editReservation: function(rec){
        var resaRec = Data.reservations.getById(rec.data.uuid);
        if (!resaRec){
            return;         
        }
        this.setEditMode(true);
        var cal = this.getCurrentCal();
        var p = Ext.create('Sp.views.reservations.EditReservation', {
            mainPanel: this,
            calendar: cal,
            statusBar: this.down('#statusBar'),
            lastCalendarView: cal.layout.getActiveItem(),
            locationRec: this.currentLocation,
            resaRec: resaRec,
        });
        p.on('close', this.onEditPanelClose, this, {single: true});
        cal.layout.owner.add(p);
        cal.layout.setActiveItem(p);
    },
    
    onEditPanelClose: function(me){
        var cal = this.getCurrentCal();
        if (me.lastCalendarView){
            cal.layout.setActiveItem(me.lastCalendarView);
            me.lastCalendarView.refresh();
            delete me.lastCalendarView;
            cal.layout.owner.remove(me);
        }
        this.setEditMode(false);
    },
    
    onDayClick: function(cal, dt){
        this.newReservation(dt);
        return false;
    },
    
    onEventClick: function(cal, rec){
        this.editReservation(rec);
        return false;
    },
    
    onEventEdit: function(cal, view, rec){
        this.editReservation(rec);
        return false;
    },
    
    beforeEventResize: function(cal, rec, period){
        return Ext.Date.isEqual(
            Ext.Date.clearTime(period.StartDate, true), 
            Ext.Date.clearTime(period.EndDate, true)
        );
    },
    
    onRangeRelect: function(cal, range){
        this.newReservation(range.StartDate, range.EndDate);
        return false;
    },
    
    statusBarBusy: function(){
        this.down('#statusBar').showBusy(TR("Syncing"));
    },
    
    statusBarOk: function(){
        this.down('#statusBar').setStatus({
            iconCls: 'x-status-valid', 
            text: TR("Updated"),
            clear: true
        });
    },
    
    onCalendarToggle: function(calendarId, hidden){
        var ctx = this.down('#calendarsCtx');
        ctx.items.each(function(i){
            var r = i.calendarStore.findRecord('CalendarId', calendarId);
            if (r){
                r.set('IsHidden', hidden);
            }
        }, this);
    },
    
    onEventOver: function(cal, rec){
        if (rec){
            this.down('#statusBar').setStatus(this.getEventStatusText(rec));
        }
    },
    
    onEventOut: function(cal, rec){
        this.down('#statusBar').clearStatus();
    },
    
    onWrite: function(store, operation){
        var rec = operation.records[0];
        var statusBar = this.down('#statusBar');
                
        if (operation.action == 'create'){
        }
                
        if (operation.action == 'destroy'){
            var r = Data.reservations.getById(rec.data.uuid);
            if (r){
                this.statusBarBusy();
                r.destroy({
                    callback: function(){
                        Data.reservations.remove(r);
                        this.storeAction({
                            action: 'destroy',
                            record: r,
                        });
                        this.statusBarOk();
                    },
                    scope: this,
                });
            }
        }
        
        if (operation.action == 'update'){
            var r = Data.reservations.getById(rec.data.uuid);
            if (r){
                var r_copy = r.copy();
                //r.beginEdit();
                r.set(rec.data);
                r.set('until_time', r.data.flexible ? rec.data.EndDate : null);
                //r.endEdit();
                if (Ext.Object.getSize(r.getChanges()) > 0){
                    this.storeAction({
                        action: 'update',
                        record: r_copy,
                    });                 
                    this.statusBarBusy();
                    r.save({
                        callback: function(){
                            this.statusBarOk();
                        },
                        scope: this,
                    });
                }
            }
        }
    },
    
    storeAction: function(action){
        this.undo_stack.push(action);
        this.redo_stack = [];
        this.down('#undoBt').enable();
        this.down('#redoBt').disable();
    },
    
    replayUpdateAction: function(action, stack){
        var calStore = Data.calendarStores[action.record.data.location];
        var r;
        r = Data.reservations.getById(action.record.data.uuid);
        if (r){
            var r_copy = r.copy();
            //r.beginEdit();
            r.set(action.record.data);
            //r.endEdit();
            this.statusBarBusy();
            r.save({
                callback: function(){
                    this.statusBarOk();
                },
                scope: this,
            });
            stack.push({
                action: 'update',
                record: r_copy,
            });
        }
        if (calStore){
            r = calStore.findRecord('uuid', action.record.data.uuid);
            if (r){
                //r.beginEdit();
                r.set(action.record.data);
                //r.endEdit();
                r.commit();
                this.refreshCurrentCal(action.record.data.location);
            }
        }
    },
    
    undo: function(){
        var action = this.undo_stack.pop();
        if (!action){
            this.down('#undoBt').disable();
            return;
        }
        var calStore = Data.calendarStores[action.record.data.location];
        if (action.action == 'destroy'){
            this.statusBarBusy();
            Sp.utils.rpc('misc.undelete', ['Reservation', action.record.data.uuid], function(){
                this.statusBarOk();
            }, this);
            Data.reservations.add(action.record);
            if (calStore){
                var r = Ext.create('Extensible.calendar.data.EventModel', action.record.data);
                r.phantom = false;
                calStore.add(r);
                this.refreshCurrentCal(action.record.data.location);
            }
            this.redo_stack.push(action);
        } else if (action.action == 'update'){
            this.replayUpdateAction(action, this.redo_stack);
        }
        this.down('#undoBt').setDisabled(this.undo_stack.length == 0);
        this.down('#redoBt').enable();
    },
    
    redo: function(){
        var action = this.redo_stack.pop();
        if (!action){
            this.down('#redoBt').disable();
            return;
        }
        var calStore = Data.calendarStores[action.record.data.location];
        if (action.action == 'destroy'){
            var r;
            if (calStore){
                r = calStore.findRecord('uuid', action.record.data.uuid);
                if (r){
                    calStore.remove(r);
                    this.refreshCurrentCal(action.record.data.location);
                }   
            }
            r = Data.reservations.getById(action.record.data.uuid);
            if (r){
                this.statusBarBusy();
                Data.reservations.remove(r);
                r.destroy({
                    callback: function(){
                        this.statusBarOk();
                    },
                    scope: this,
                });
            }
            this.undo_stack.push(action);
            
        } else if (action.action == 'update'){
            this.replayUpdateAction(action, this.undo_stack);
        }
        this.down('#redoBt').setDisabled(this.redo_stack.length == 0);
        this.down('#undoBt').enable();
    },
    
        
});
