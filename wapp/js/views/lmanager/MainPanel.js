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

Ext.define('Sp.views.lmanager.MainPanel', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
        
        this.currentLocation = null;
        this.undo_stack = {};
        this.redo_stack = {};
        this.res_stores = {};
        this.autoM_active = false;
        this.autoM_paused = false;
        this.boards = {};
        
        Ext.apply(this, {
            layout: 'border',
            margin: '10 5 5 0',
            items: [
                {
                    xtype: 'toolbar',
                    itemId: 'topToolbar',
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
                            valueField: 'uuid',
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
                            text: TR("New load"),
                            itemId: 'newLoadBt',
                            icon: '/static/images/icons/new_green.png',
                            handler: function(){
                                var p = this.getPlanner();
                                if (p){
                                    p.newLoad();
                                }
                            },
                            scope: this,
                        },
                        '-',
                        {
                            text: TR("Filter loads"),
                            itemId: 'filterBt',
                            icon: '/static/images/icons/filter.png',
                            menu: [
                                {
                                    text: TR("Filter by State"),
                                    icon: '/static/images/icons/check.png',
                                    itemId: 'stateFilter',
                                    menu: [
                                        {
                                            text: TR("Planned"),
                                            checked: false,
                                            state: 'P',
                                            listeners: {
                                                click: this.doFilterLoads,
                                                scope: this,
                                            },
                                        },
                                        {
                                            text: TR("Boarding"),
                                            checked: false,
                                            state: 'B',
                                            listeners: {
                                                click: this.doFilterLoads,
                                                scope: this,
                                            },
                                        },
                                        {
                                            text: TR("In the air"),
                                            checked: false,
                                            state: 'X',
                                            listeners: {
                                                click: this.doFilterLoads,
                                                scope: this,
                                            },
                                        },
                                    ],
                                },
                                {
                                    text: TR("Filter by Pilot"),
                                    icon: '/static/images/icons/roles/pilot.png',
                                    itemId: 'pilotFilter',
                                    menu: [],
                                },
                                {
                                    text: TR("Filter by Aircraft"),
                                    icon: '/static/images/icons/plane_small.png',
                                    itemId: 'aircraftFilter',
                                    menu: [],
                                },
                                '-',
                                {
                                    text: TR("Apply filters"),
                                    icon: '/static/images/icons/apply_filter.png',
                                    handler: function(){
                                        this.doFilterLoads();
                                    },
                                    scope: this,
                                },
                                '-',
                                {
                                    text: TR("Clear all filters"),
                                    icon: '/static/images/icons/filter_clear.png',
                                    handler: function(){
                                        this.clearFilterLoads();
                                    },
                                    scope: this,
                                },
                            ],
                        },
                        '-',
                        {
                            text: TR("Boarding display"),
                            icon: '/static/images/icons/display.png',
                            handler: this.showBoard,
                            scope: this,
                        },
                        '-',
                        {
                            text: TR("Resources"),
                            icon: '/static/images/icons/sheet.png',
                            handler: function(){
                                Ext.create('Sp.views.lmanager.Ressources', {
                                    locationRec: this.currentLocation,
                                    planner: this.getPlanner(this.currentLocation),
                                    workersGrid: this.down('#workersGrid'),
                                    updateCurrentLocation: Ext.bind(this.updateCurrentLocation, this),
                                }).show();
                            },
                            scope: this,
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
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    items: [
                        {
                            xtype: 'panel',
                            layout: {
                                type: 'vbox',
                                align: 'center',
                            },
                            margin: '0 0 4 0',
                            disabled: true,
                            items: [
                                {
                                    xtype: 'label',
                                    html: "<span class='auto-label'>" + TR("AUTO MANAGER") + "</span>",
                                    margin: '5 0 0 0',
                                },
                                {
                                    xtype: 'container',
                                    layout: {
                                        type: 'hbox',
                                        align: 'middle',
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            itemId: 'autoMBt',
                                            width: 70,
                                            height: 70,
                                            border: 0,
                                            cls: 'autoM-button-off',
                                            margin: '0 5 10 0',
                                            handler: this.toggleAutoM,
                                            scope: this,
                                        },
                                        {
                                            xtype: 'container',
                                            layout: {
                                                type: 'vbox',
                                                align: 'center',
                                            },
                                            width: 80,
                                            items: [
                                                {
                                                    xtype: 'label',
                                                    itemId: 'autoMText',
                                                    cls: 'russo',
                                                    text: TR("OFF"),
                                                },
                                                {
                                                    xtype: 'button',
                                                    itemId: 'autoMCtrl',
                                                    text: TR("Pause"),
                                                    icon: '/static/images/icons/pause.png',
                                                    handler: this.ctrlAutoM,
                                                    scope: this,
                                                    hidden: true,
                                                    margin: '2 0 0 0',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            xtype: 'panel',
                            layout: {
                                //type: 'vbox',
                                //align: 'center',
                                type: 'hbox',
                                align: 'middle',
                                pack: 'center',
                            },
                            height: 120,
                            margin: '0 0 4 0',
                            items: [
                                 {
                                    xtype: 'label',
                                    text: TR("This feature is not yet available"),
                                    cls: 'placeholder-color',
                                },
                                /*{
                                    xtype: 'chart',
                                    itemId: 'usageGauge',
                                    animate: true,
                                    store: Ext.create('store.store', {
                                        fields: ['value'],
                                        data: [{value:50}],
                                    }),
                                    width: 180,
                                    height: 75,
                                    margin: '5 0 0 0',
                                    insetPadding: 2,
                                    axes: [{
                                        type: 'gauge',
                                        position: 'gauge',
                                        minimum: 0,
                                        maximum: 100,
                                        steps: 2,
                                        margin: -4,
                                    }],
                                    series: [{
                                        type: 'gauge',
                                        field: 'value',
                                        colorSet: ['#3AA8CB', '#ddd'],
                                    }],
                                },
                                {
                                    xtype: 'label',
                                    html: "<span class='auto-label'>" + TR("OVERALL USAGE") + "</span>",
                                    margin: '0 0 0 0',
                                },*/
                            ],
                        },
                        {
                            xtype: 'tabpanel',
                            flex: 1,
                            margin: '2 0 0 0',
                            items: [
                                /*{
                                    tabConfig: {
                                        title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
                                        tooltip: TR("Reservations"),
                                        icon: '/static/images/icons/calendar_small.png',
                                        iconAlign: 'top',
                                    },
                                },*/
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
                                        allowDeselect: true,
                                        ignoreRightMouseSelection: true,
                                        mode: 'MULTI',
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
                                                var person = r.getPerson();
                                                return Sp.ui.misc.formatFullname(person, Data.me.data.name_order, true);
                                            },
                                        },
                                    ],
                                    tbar: [
                                        {
                                            xtype: 'textfield',
                                            itemId: 'memberSearchText',
                                            flex: 1,
                                            listeners: {
                                                specialkey: function(me, e){
                                                    if (e.getKey() == e.ENTER){
                                                        this.doMemberSearch();
                                                    }
                                                },
                                                scope: this,
                                            },
                                        },
                                        {
                                            xtype: 'button',
                                            icon: '/static/images/icons/search.png',
                                            tooltip: TR("Search"),
                                            handler: function(){
                                                this.doMemberSearch();
                                            },
                                            scope: this,
                                        },
                                        {
                                            xtype: 'button',
                                            icon: '/static/images/icons/clear_sel.png',
                                            tooltip: TR("Clear selection"),
                                            handler: function(){
                                                this.down('#membersGrid').getSelectionModel().deselectAll();
                                            },
                                            scope: this,
                                        },
                                    ],
                                    listeners: {
                                        itemcontextmenu: this.onMemberContextMenu,
                                        itemdblclick: function(me, r, el){
                                            Ext.create('Sp.views.locations.EditMember', {
                                                locationRec: this.currentLocation,
                                                membershipRec: r,
                                                instantSave: true,
                                            }).show();
                                        },
                                        scope: this,
                                    },
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
                                    hideHeaders: true,
                                    border: 0,
                                    emptyText: TR("No staff available !"),
                                    selModel: {
                                        allowDeselect: true,
                                        ignoreRightMouseSelection: true,
                                        mode: 'MULTI',
                                    },
                                    columns: [
                                        {dataIndex: 'name', flex:1},
                                    ],
                                    tbar: [
                                        {
                                            xtype: 'textfield',
                                            itemId: 'workerSearchText',
                                            flex: 1,
                                            listeners: {
                                                specialkey: function(me, e){
                                                    if (e.getKey() == e.ENTER){
                                                        this.doWorkerSearch();
                                                    }
                                                },
                                                scope: this,
                                            },
                                        },
                                        {
                                            xtype: 'button',
                                            icon: '/static/images/icons/search.png',
                                            tooltip: TR("Search"),
                                            handler: function(){
                                                this.doWorkerSearch();
                                            },
                                            scope: this,
                                        },
                                        {
                                            xtype: 'button',
                                            icon: '/static/images/icons/clear_sel.png',
                                            tooltip: TR("Clear selection"),
                                            handler: function(){
                                                this.down('#workersGrid').getSelectionModel().deselectAll();
                                            },
                                            scope: this,
                                        },
                                    ],
                                    listeners: {
                                        itemcontextmenu: this.onWorkerContextMenu,
                                        scope: this,
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    xtype: 'container',
                    itemId: 'plannersCtx',
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
            listeners: {
                activate: function(){
                    var active_planner = this.down('#plannersCtx').getLayout().getActiveItem();
                    if (active_planner){
                        active_planner.doLayout();
                        active_planner.updateSlotsGridsLayout();
                    }
                },
                scope: this,
            },
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
        var store = this.down('#locationCbx').getStore();
        store.loadRawData(data);
        var r = store.getAt(0);
        if (r){
            this.setLocation(r.data.uuid);
        } else {
            this.down('#topToolbar').disable();
            Sp.ui.misc.warnMsg(TR("You have no dropzone, please create one."), TR("No dropzone"));
        }
        
    },

    setMyLocation: function(locationRec){
        this.currentLocation = locationRec;
        this.res_stores[locationRec.data.uuid] = Sp.ui.data.getActiveRessources(locationRec);
        this.showLocationPlanner(locationRec);
        
        var members_store = this.down('#membersGrid').getStore();
        members_store.clearFilter(true);
        members_store.filter('location', locationRec.data.uuid);
        members_store.load();
        
        this.down('#workersGrid').getView().bindStore(this.res_stores[locationRec.data.uuid].workers);
       
        this.setLocationFilters(locationRec);
    },
    
    setLocationFilters: function(locationRec){
        var pilots = [];
        this.res_stores[locationRec.data.uuid].pilot.each(function(p){
            pilots.push({
                 pilot_uuid: p.data.uuid,
                 text: p.data.name,
                 checked: false,
                 listeners: {
                     click: this.doFilterLoads,
                     scope: this,
                 },
             });
        }, this);
        var menu = this.down('#pilotFilter').menu;
        menu.removeAll();
        menu.add(pilots);
       
        var aircrafts = [];
        this.res_stores[locationRec.data.uuid].aircrafts.each(function(a){
            aircrafts.push({
                 aircraft_uuid: a.data.uuid,
                 text: a.data.registration,
                 checked: false,
                 listeners: {
                     click: this.doFilterLoads,
                     scope: this,
                 },
             });
        }, this);
        var menu = this.down('#aircraftFilter').menu;
        menu.removeAll();
        menu.add(aircrafts);
    },
    
    updateCurrentLocation: function(){
        if (!this.currentLocation){
            return;
        }
        var locationRec = this.currentLocation;
        this.res_stores[locationRec.data.uuid] = Sp.ui.data.getActiveRessources(locationRec);
        this.setLocationFilters(locationRec);
    },
    
    setOtherLocation: function(locationRec){
        this.currentLocation = locationRec;
        this.showLocationPlanner(locationRec);
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
    
    toggleAutoM: function(){
        var bt = this.down('#autoMBt');
        var txt = this.down('#autoMText');
        var ctrl = this.down('#autoMCtrl');
        if (this.autoM_active){
            bt.removeCls('autoM-button-on');
            bt.removeCls('autoM-button-wait');
            bt.addCls('autoM-button-off');
            txt.setText(TR("OFF"));
            ctrl.hide();
        } else {
            bt.removeCls('autoM-button-off');
            bt.addCls('autoM-button-on');
            txt.setText(TR("ON"));
            ctrl.show();
        }
        this.autoM_active = !this.autoM_active;
        if (this.autoM_active){
            this.autoM_paused = false;
            ctrl.setText(TR("Pause"))
            ctrl.setIcon('/static/images/icons/pause.png');
        }
    },
    
    ctrlAutoM: function(){
        var bt = this.down('#autoMBt');
        var txt = this.down('#autoMText');
        var ctrl = this.down('#autoMCtrl');
        if (this.autoM_paused){
            bt.removeCls('autoM-button-wait');
            bt.addCls('autoM-button-on');
            txt.setText(TR("ON"));
            ctrl.setText(TR("Pause"))
            ctrl.setIcon('/static/images/icons/pause.png');
        } else {
            bt.removeCls('autoM-button-on');
            bt.addCls('autoM-button-wait');
            txt.setText(TR("PAUSED"));
            ctrl.setText(TR("Resume"))
            ctrl.setIcon('/static/images/icons/play.png');
        }
        this.autoM_paused = !this.autoM_paused;
    },
    
    showBoard: function(){
        if (this.currentLocation){
            var board = this.boards[this.currentLocation.data.uuid];
            if (!board){
                board = Ext.create('Sp.views.lmanager.Board', {
                    locationRec: this.currentLocation,
                    boards: this.boards,
                });
                this.boards[this.currentLocation.data.uuid] = board;
            }
            board.show();
        }
    },
    
    showLocationPlanner: function(locationRec){
        var ctx = this.down('#plannersCtx');
        var planner_id = locationRec.data.uuid + '-planner';
        var planner = ctx.getComponent(planner_id);
        if (!planner){
            planner = Ext.create('Sp.views.lmanager.Planner', {
                res_stores: this.res_stores[locationRec.data.uuid],
                itemId: planner_id,
                locationRec: locationRec,
                storeAction: Ext.bind(this.storeAction, this),
                resetActions: Ext.bind(this.resetActions, this),
                statusBarOk: Ext.bind(this.statusBarOk, this),
                statusBarBusy: Ext.bind(this.statusBarBusy, this),
                statusBarText: Ext.bind(this.statusBarText, this),
                statusBarClear: Ext.bind(this.statusBarClear, this),
                actionOperation: Ext.bind(this.actionOperation, this),
            });
            ctx.add(planner);
        }
        ctx.getLayout().setActiveItem(planner);
        planner.doLayout();
        planner.updateSlotsGridsLayout();
    },
    
    getPlanner: function(locationRec){
        locationRec = locationRec || this.currentLocation;
        return this.down('#plannersCtx').getComponent(locationRec.data.uuid + '-planner');
    },
    
    storeAction: function(location_uuid, action){
        if (!Ext.isDefined(this.undo_stack[location_uuid])){
            this.undo_stack[location_uuid] = [];
            this.redo_stack[location_uuid] = [];
        }
        this.undo_stack[location_uuid].push(action);
        this.redo_stack[location_uuid] = [];
        this.down('#undoBt').enable();
        this.down('#redoBt').disable();
    },
    
    resetActions: function(location_uuid){
        this.undo_stack[location_uuid] = [];
        this.redo_stack[location_uuid] = [];
        this.down('#undoBt').disable();
        this.down('#redoBt').disable();
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
    
    statusBarText: function(text){
        this.down('#statusBar').setStatus(text);
    },
    
    statusBarClear: function(text){
        this.down('#statusBar').clearStatus();
    },
    
    actionOperation: function(record, fn, have_related){
        if (fn == 'save' && Ext.Object.getSize(record.getChanges()) == 0){
            return;
        }
        this.statusBarBusy();
        var store = record.store;
        record[fn].apply(record, [{
            callback: function(){
                if (have_related && store){
                    store.sync({
                        callback: function(){
                            this.statusBarOk();
                        },
                        scope: this,
                    });
                } else {
                    this.statusBarOk();
                }
            },
            scope: this,
        }]);
    },
    
    actionRpc: function(record, fn, args, have_related){
        var store = record.store;
        this.statusBarBusy();
        Sp.utils.rpc(fn, args, function(){
            if (have_related){
                store.sync({
                    callback: function(){
                        this.statusBarOk();
                    },
                    scope: this,
                });
            } else {
                this.statusBarOk();
            }
        }, this);
    },
    
    doCreateAction: function(action, stack){
        var have_related;
        var model_name = Data.getSpModelName(action.record);
        action.store.add(action.record);
        if (Ext.isFunction(action.handleRelatedSlots)){
            have_related = action.handleRelatedSlots(action.record, 'create');
        }
        this.actionRpc(action.record, 'misc.undelete', [Data.getSpModelName(action.record), action.record.data.uuid], have_related);
        stack.push(action);
        
        if (model_name == 'Slot'){
            var loadRec = Sp.utils.findLoad(action.record.data.load);
            if (loadRec){
                var planner = this.down('#plannersCtx').getComponent(loadRec.data.location + '-planner');
                if (planner){
                    planner.handleJumpmaster(loadRec, action.record, 'create');
                }
            }
        }
    },
    
    doDestroyAction: function(action, stack){
        var have_related;
        var model_name = Data.getSpModelName(action.record);
        if (Ext.isFunction(action.handleRelatedSlots)){
            have_related = action.handleRelatedSlots(action.record, 'destroy');
        }
        action.store.remove(action.record);
        this.actionOperation(action.record, 'destroy', have_related);
        stack.push(action);
        
        if (model_name == 'Slot'){
            var loadRec = Sp.utils.findLoad(action.record.data.load);
            if (loadRec){
                var planner = this.down('#plannersCtx').getComponent(loadRec.data.location + '-planner');
                if (planner){
                    planner.handleJumpmaster(loadRec, action.record, 'destroy');
                }
            }
        }
    },
    
    doUpdateAction: function(action, stack){
        var current_values = {}, have_related;
        var model_name = Data.getSpModelName(action.record);
        Ext.Object.each(action.values, function(k,v){
            current_values[k] = action.record.get(k);
        });
        action.record.set(action.values);
        // related slots
        if (Ext.isFunction(action.handleRelatedSlots)){
            have_related = action.handleRelatedSlots(action.record, 'update');
        }
        
        if (model_name == 'Load'){
            var planner = this.down('#plannersCtx').getComponent(action.record.data.location + '-planner');
            var slots_grid = planner.slots_grids[action.record.data.uuid];
            if (action.values.state){
                if (action.values.state == 'P'){
                    planner.validateLoad(action.record);
                } else {
                    planner.clearProblematic(action.record);
                }
                planner.loadStateChanged(action.record);
            }
            // load global fields
            if (Ext.isDefined(action.values.note) && slots_grid){
                slots_grid.down('#loadNote').setValue(action.values.note);
            }
            if (Ext.isDefined(action.values.jumpmaster_slot) && slots_grid){
                var jumpmasterCbx = slots_grid.down('#jumpmasterCbx');
                if (action.values.jumpmaster_slot){
                    jumpmasterCbx.setValue(jumpmasterCbx.getStore().findRecord('uuid', action.values.jumpmaster_slot));
                } else {
                    jumpmasterCbx.clearValue();
                }
            }
            planner.afterSlotEdit(null, action.record);
        } else if (model_name == 'Slot'){
            var loadRec = Sp.utils.findLoad(action.record.data.load);
            if (loadRec){
                var planner = this.down('#plannersCtx').getComponent(loadRec.data.location + '-planner');
                if (planner){
                    planner.afterSlotEdit(null, loadRec);
                    planner.handleJumpmaster(loadRec, action.record, 'update');
                }
            }
        }
        
        this.actionOperation(action.record, 'save', have_related);
        stack.push({
            action: 'update',
            record: action.record,
            values: current_values,
            handleRelatedSlots: action.handleRelatedSlots,
        });
    },
    
    undo: function(){
        var action,
            undo_stack = this.undo_stack[this.currentLocation.data.uuid],
            redo_stack = this.redo_stack[this.currentLocation.data.uuid];
        if (Ext.isDefined(undo_stack)){
            action = undo_stack.pop();
        }
        if (!action){
            this.down('#undoBt').disable();
            return;
        }
        
        if (action.action == 'create'){
            this.doDestroyAction(action, redo_stack);
        } else if (action.action == 'destroy'){
            this.doCreateAction(action, redo_stack);
        } else if (action.action == 'update'){
            this.doUpdateAction(action, redo_stack);
        }
        this.down('#undoBt').setDisabled(undo_stack.length == 0);
        this.down('#redoBt').enable();      
    },
    
    redo: function(){
        var action,
            undo_stack = this.undo_stack[this.currentLocation.data.uuid],
            redo_stack = this.redo_stack[this.currentLocation.data.uuid];
        if (Ext.isDefined(redo_stack)){
            action = redo_stack.pop();
        }
        if (!action){
            this.down('#redoBt').disable();
            return;
        }

        if (action.action == 'create'){
            this.doCreateAction(action, undo_stack);
        } else if (action.action == 'destroy'){
            this.doDestroyAction(action, undo_stack);
        } else if (action.action == 'update'){
            this.doUpdateAction(action, undo_stack);
        }
        this.down('#redoBt').setDisabled(redo_stack.length == 0);
        this.down('#undoBt').enable();
    },
    
    doMemberSearch: function(){
        if (!this.currentLocation){
            return;
        }
        var search_text = this.down('#memberSearchText').getValue();
        var store = this.down('#membersGrid').getStore();
        var filters = [{
            property: 'location',
            value: this.currentLocation.data.uuid,
        }];
        if (search_text){
            filters.push({
                property: 'person__last_name__icontains',
                value: search_text,
            });
            store.buffered = false;
        } else {
            store.buffered = true;
        }
        store.clearFilter(true);
        store.filter(filters);
    },
    
    doWorkerSearch: function(){
        if (!this.currentLocation){
            return;
        }
        var store = this.down('#workersGrid').getView().getStore();
        if (!store){
            return;
        }
        var search_text = this.down('#workerSearchText').getValue();
        store.clearFilter(true);
        store.filter('name', new RegExp(search_text, 'i'));
    },
    
    onMemberContextMenu: function(grid, record, el, idx, ev){
        // context menu
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Filter by"),
                    icon: '/static/images/icons/filter.png',
                    handler: function(){
                        this.doFilterLoads();
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        Ext.create('Sp.views.locations.EditMember', {
                            locationRec: this.currentLocation,
                            membershipRec: record,
                            instantSave: true,
                        }).show();                                                
                    },
                    scope: this,
                    disabled: this.down('#membersGrid').getSelectionModel().getCount() > 1,
                },
            ]
        });
        
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    onWorkerContextMenu: function(grid, record, el, idx, ev){
        // context menu
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Filter by"),
                    icon: '/static/images/icons/filter.png',
                    handler: function(){
                        this.doFilterLoads();
                    },
                    scope: this,
                },
            ]
        });
        
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    filterLoad: function(loadRec){
        // state
        var states = [];
        this.down('#stateFilter').menu.items.each(function(i){
            if (i.checked){
                if (i.state == 'X'){
                    states.push('T');
                    states.push('D');
                    states.push('S');
                    states.push('L');
                } else {
                    states.push(i.state);
                }
            }
        });
        if (states.length > 0){
            if (states.indexOf(loadRec.data.state) == -1){
                return false;
            }
        }
        
        // pilots
        var pilots = [];
        this.down('#pilotFilter').menu.items.each(function(i){
            if (i.checked){
                pilots.push(i.pilot_uuid);
            }
        });
        if (pilots.length > 0){
            if (pilots.indexOf(loadRec.data.pilot) == -1){
                return false;
            }
        }
        
        // aircrafts
        var aircrafts = [];
        this.down('#aircraftFilter').menu.items.each(function(i){
            if (i.checked){
                aircrafts.push(i.aircraft_uuid);
            }
        });
        if (aircrafts.length > 0){
            if (aircrafts.indexOf(loadRec.data.aircraft) == -1){
                return false;
            }
        }
        
        // members
        var members = [];
        var selected = this.down('#membersGrid').getSelectionModel().getSelection();
        for (var i=0,m ; m=selected[i] ; i++){
            members.push(m.data.person.uuid);
        }
        if (members.length > 0){
            var member_found = false;
            loadRec.Slots().each(function(s){
                if (s.data.person && members.indexOf(s.data.person.uuid) != -1){
                    member_found = true;
                    return false;
                }
            });
            if (!member_found){
                return false;
            }
        }
        
        // workers
        var workers = [];
        var selected = this.down('#workersGrid').getSelectionModel().getSelection();
        for (var i=0,w ; w=selected[i] ; i++){
            workers.push(w.data.uuid);
        }
        if (workers.length > 0){
            var worker_found = false;
            loadRec.Slots().each(function(s){
                if (s.data.worker && workers.indexOf(s.data.worker) != -1){
                    worker_found = true;
                    return false;
                }
            });
            if (!worker_found){
                return false;
            }
        }
        
        return true;
    },
    
    doFilterLoads: function(){
        if (!this.currentLocation){
            return;
        }
        this.currentLocation.Loads().filterBy(this.filterLoad, this);
        this.getPlanner(this.currentLocation).collapseAll();
        
    },
    
    clearFilterLoads: function(){
        this.down('#stateFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        if (!this.currentLocation){
            return;
        }
        this.down('#pilotFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#aircraftFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#membersGrid').getSelectionModel().deselectAll();
        this.down('#workersGrid').getSelectionModel().deselectAll();
        this.currentLocation.Loads().clearFilter();
    },
                
});
