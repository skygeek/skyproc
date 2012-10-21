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

Ext.define('Sp.views.lmanager.Planner', {
    extend: 'Ext.grid.Panel',
    
    constructor: function(){
        this.slots_grids = {};
        this.save_tasks = {};
        this.validate_tasks = {};
        this.first_expand = true;
        this.taskRunner = new Ext.util.TaskRunner();
        this.tasks = {};
        this.plugins = [
            {
                ptype: 'rowexpander',
                pluginId: 'expand',
                rowBodyTpl : [],
                expandOnDblClick: false,
                expandOnEnter: false,
            },
            {
                ptype: 'cellediting',
                pluginId: 'edit',
                triggerEvent: 'cellclick',
            },
        ];
        this.callParent(arguments);
    },
    
    initComponent: function() {
        
        var loads_store = this.locationRec.Loads();
        var loads_count = loads_store.getCount();
        
        // sort loads
        loads_store.sort([
            {
                property : 'number',
                direction: 'ASC'
            },
        ]);
        
        // sort slots
        loads_store.each(function(l){
            l.Slots().sort({sorterFn: Sp.lmanager.slotsSorter});
        });
        
        // states store
        this.load_states_store = Ext.create('Ext.data.Store', {
            fields: ['code', 'label'],
            data : [
                {code:"P", label: TR("Planned")},
                {code:"B", label: TR("Boarding")},
                {code:"T", label: TR("Took Off")},
                {code:"D", label: TR("Dispatching")},
                {code:"S", label: TR("Descending")},
                {code:"L", label: TR("Landed")},
                //{code:"I", label: TR("Incident")},
            ]
        });
                        
        Ext.apply(this, {
            store: loads_store,
            enableColumnHide: false,
            enableColumnResize: false,
            enableColumnMove: false,
            disableSelection: true,
            selModel: {
                selType: 'cellmodel',
                ignoreRightMouseSelection: true,
            },
            viewConfig: {
                selectedItemCls: '',
                selectedCellCls: '',
                focusedItemCls: '',
                overItemCls: 'pointer-cursor',
                altRowCls: '',
                getRowClass: function(rec){
                    if (rec.data.problematic){
                        return 'load-error-row';
                    }
                    switch (rec.data.state){
                        case 'P': return 'load-planned-row';
                        case 'B': return 'load-boarding-row';
                        case 'I': return 'load-error-row';
                        default: return 'load-in-air-row';
                    }
                },
            },
            emptyText: TR("No load. Click on 'New load' to create one"),
            scroll: 'vertical',
            columns: [
                {
                    dataIndex: 'number',
                    itemId: 'loadsCol',
                    header: Ext.String.format("{0} {1}", loads_count, loads_count > 1 ? TR("Loads") : TR("Load")),
                    flex: 1,
                    renderer: function(v,o,r){
                        var infos = this.getSlotsInfos(r);
                        var free = infos.total - infos.used;
                        var label = '';
                        label += Ext.String.format("N° {0} &nbsp;-&nbsp; {1} {2} &nbsp;-&nbsp;&nbsp;",
                                r.data.number, infos.total, (infos.total > 1 ? TR("Slots") : TR("Slot")));
                        if (free > 0){
                            label += Ext.String.format("{0}: <span class='bold'>{1}</span>", TR("Available"), free);
                        } else {
                            label += Ext.String.format("<span class='bold'>{0}</span>", TR("FULL"));
                        }
                        return label;
                    },
                    scope: this,
                },
                {
                    dataIndex: 'pilot',
                    width: 100,
                    header: TR("Pilot"),
                    renderer: function(v,o,r){
                        var pilot = this.locationRec.Workers().getById(r.data.pilot);
                        if (pilot){
                            return pilot.data.name;
                        }
                    },
                    scope: this,
                    editor: {
                        xtype: 'combobox',
                        store: this.res_stores.pilot,
                        queryMode: 'local',
                        forceSelection: true,
                        editable: false,
                        displayField: 'name',
                        valueField: 'uuid',
                        lastQuery: '',
                        listeners: {
                            focus: function(me){
                                me.expand();
                            },
                            select: function(){
                                this.getPlugin('edit').completeEdit();
                            },
                            scope: this,
                        },
                    },
                    listeners: this.getLoadColListeners(),
                },
                {
                    dataIndex: 'aircraft',
                    itemId: 'aircraft',
                    width: 70,
                    header: TR("Aircraft"),
                    renderer: function(v,o,r){
                        var aircraft = this.locationRec.Aircrafts().getById(r.data.aircraft);
                        if (aircraft){
                            return aircraft.data.registration;
                        }
                    },
                    scope: this,
                    editor: {
                        xtype: 'combobox',
                        store: this.res_stores.aircrafts,
                        queryMode: 'local',
                        forceSelection: true,
                        editable: false,
                        displayField: 'registration',
                        valueField: 'uuid',
                        lastQuery: '',
                        listeners: {
                            focus: function(me){
                                me.expand();
                            },
                            select: function(){
                                this.getPlugin('edit').completeEdit();
                            },
                            scope: this,
                        },
                    },
                    listeners: this.getLoadColListeners(),
                },
                {
                    dataIndex: 'timer',
                    itemId: 'timer',
                    width: 90,
                    header: TR("Schedule"),
                    renderer: function(v,o,r){
                        if (r.data.state == 'P'){
                            return TR("Unscheduled");
                        } else if (r.data.state == 'B'){
                            if (v){
                                return Sp.lmanager.getTimerLabel(v);
                            } else {
                                return Ext.String.format("<span class='placeholder-color'>{0}</span>", TR("N/A"));
                            }
                        } else {
                            return TR("In the air");
                        }
                    },
                    scope: this,
                    editor: {
                        xtype: 'numberfield',
                        minValue: 1,
                        maxValue: 9999,
                    },
                    listeners: this.getLoadColListeners(),
                },
                {
                    header: TR("Time"),
                    xtype: 'actioncolumn',
                    width: 50,
                    align: 'center',
                    sortable: false,
                    items: [
                        {
                            icon: '/static/images/icons/minus.png',
                            tooltip: TR("- 1 Minute"),
                            handler: function(grid, rowIndex, colIndex) {
                                var rec = grid.getStore().getAt(rowIndex);
                                if (rec.data.problematic){
                                    return;
                                }
                                var timer = rec.data.timer;
                                if (!timer){
                                    return;
                                }
                                timer -= 1;
                                if (timer == 0){
                                    timer = null;
                                }
                                rec.set({
                                    state: 'B',
                                    timer: timer,
                                });
                                this.delaySave(rec);
                                this.setupBoardingTimerUpdater(rec);
                            },
                            getClass: function(v,o,r){
                                if (Sp.lmanager.isInTheAir(r)){
                                    return 'hidden-el';
                                }
                            },
                            scope: this,
                        },
                        {
                            icon: '/static/images/icons/plus.png',
                            tooltip: TR("+ 1 Minute"),
                            handler: function(grid, rowIndex, colIndex) {
                                var rec = grid.getStore().getAt(rowIndex);
                                if (rec.data.problematic){
                                    return;
                                }
                                var timer = rec.data.timer;
                                if (!timer){
                                    timer = 0;
                                }
                                timer += 1;
                                if (timer>9999){
                                    return;
                                }
                                rec.set({
                                    state: 'B',
                                    timer: timer,
                                });
                                this.delaySave(rec);
                                this.setupBoardingTimerUpdater(rec);
                            },
                            getClass: function(v,o,r){
                                if (Sp.lmanager.isInTheAir(r)){
                                    return 'hidden-el';
                                }
                            },
                            scope: this,
                        }
                    ],
                    listeners: this.getLoadColListeners(),
                },
                {
                    dataIndex: 'state',
                    itemId: 'state',
                    header: TR("State"),
                    width: 110,
                    renderer: function(v,o,r){
                        var state = this.load_states_store.findRecord('code', v);
                        return Ext.String.format("<span class='load-state-icon-{0}'>{1}</span>", state.data.code, state.data.label);
                    },
                    scope: this,
                    editor: {
                        xtype: 'combobox',
                        store: this.load_states_store,
                        queryMode: 'local',
                        forceSelection: true,
                        editable: false,
                        valueField: 'code',
                        displayField: 'label',
                        tpl: Ext.create('Ext.XTemplate',
                            '<tpl for=".">',
                                '<div class="x-boundlist-item">',
                                "<table class='combobox-table'>",
                                "<tr><td><img src='/static/images/icons/load_states/{code}.png'/></td><td>{label}</td></tr></table>",
                                '</div>',
                            '</tpl>'
                        ),
                        listeners: {
                            focus: function(me){
                                me.expand();
                            },
                            select: function(){
                                this.getPlugin('edit').completeEdit();
                            },
                            scope: this,
                        },
                    },
                },
                {
                    xtype: 'actioncolumn',
                    width: 20,
                    sortable: false,
                    items: [
                        {
                            icon: '/static/images/icons/ban.png',
                            tooltip: TR("Cancel load"),
                            handler: function(grid, rowIndex, colIndex) {
                                this.deleteLoad(grid.getStore().getAt(rowIndex));
                            },
                            getClass: function(v,o,r){
                                if (Sp.lmanager.isInTheAir(r)){
                                    return 'hidden-el';
                                }
                            },
                            scope: this,
                        }
                    ],
                },
            ],
            listeners: {
                afterrender: function(){
                    this.keyNav = Ext.create('Ext.KeyNav', this.getView().getEl(), {
                        space: this.onSpacePress,
                        scope: this,
                    });
                },
                cellclick: function(me, td, cell_idx, rec, tr, row_idx){
                    if (cell_idx == 1){
                        this.getPlugin('expand').toggleRow(row_idx);
                    }
                },
                sortchange: function(){
                    var expand_plugin = this.getPlugin('expand');
                    var loads_store = this.locationRec.Loads();
                    Ext.Object.each(this.slots_grids, function(k,v){
                        if (v.bodyExpanded){
                            expand_plugin.toggleRow(loads_store.indexOfId(k));
                        }
                    });
                },
                beforeedit: this.beforeLoadCellEdit,
                validateedit: this.validateLoadCellEdit,
                edit: this.onLoadCellEdit,
                beforedestroy: this.beforeDestroy,
                resize: this.onLoadsGridResize,
                itemmouseenter: this.onLoadMouseEnter,
                itemmouseleave: this.onLoadMouseLeave,
                itemcontextmenu: this.onLoadContextMenu,
                scope: this,
            },
        });
        
        this.callParent(arguments);
        
        // setup initial tasks
        loads_store.each(function(l){
            if (l.data.state == 'B' && Ext.isNumber(l.data.timer)){
                this.setupBoardingTimerUpdater(l);
            }
        }, this);
        
        this.getView().on('expandbody', this.onExpand, this);
        this.getView().on('collapsebody', this.onCollapse, this);
        this.getStore().on('datachanged', this.onLoadDataChange, this);
    },
    
    getLoadColListeners: function(){
        return {
            mouseover: function(view, el, row, col, e, rec){
                if (Sp.lmanager.isInTheAir(rec)){
                    return;
                }
                if (rec.data.problematic && (col == 4 || col == 5)){
                    return;
                }
                var domEl = new Ext.dom.Element(el);
                domEl.setStyle('cursor', 'pointer');
            },
            mouseout: function(view, el, row, col, e, rec){
                var domEl = new Ext.dom.Element(el);
                domEl.setStyle('cursor', 'default');
            },
            scope: this,
        };
    },
    
    getSlotColListeners: function(){
        return {
            mouseover: function(view, el, row, col, e, rec){
                // related slot, only jumper is editable
                if (rec.data.related_slot && col != 0){
                    return;
                }
                // col index 3 ==> jump type
                if (col == 3){
                    if (rec.data.item){
                        var item = this.locationRec.LocationCatalogItems().getById(rec.data.item);
                        if (item && item.data.jump_type_auto){
                            return;
                        }
                    }   
                }
                var domEl = new Ext.dom.Element(el);
                domEl.setStyle('cursor', 'pointer');
            },
            mouseout: function(view, el, row, col, e, rec){
                var domEl = new Ext.dom.Element(el);
                domEl.setStyle('cursor', 'default');
            },
            scope: this,
        };
    },
    
    onExpand: function(row, rec, exp_row){
        var body_div = new Ext.dom.Element(exp_row.getElementsByClassName('x-grid-rowbody')[0]);
        var recreate = false;
                
        if (this.slots_grids[rec.data.uuid]){
            if (body_div.dom.innerHTML.length == 0){
                Ext.destroy(this.slots_grids[rec.data.uuid]);
                recreate = true;
            } else {
                this.handleAutoAddSlot(rec);
                this.slots_grids[rec.data.uuid].doLayout();
                this.updateSlotsGridsLayout();
                this.slots_grids[rec.data.uuid].bodyExpanded = true;
                return;
            }
        }
        
        this.slots_grids[rec.data.uuid] = Ext.create('Ext.grid.Panel', {
            loadRec: rec,
            store: rec.Slots(),
            enableColumnHide: false,
            enableColumnResize: false,
            enableColumnMove: false,
            sortableColumns: false,
            minHeight: 150,
            selModel: {
                ignoreRightMouseSelection: true,
            },
            viewConfig: {
                loadRec: rec,
                plugins: {
                    ptype: 'gridviewdragdrop',
                    ddGroup: 'slots',
                    dragText: TR("Move slot"),
                },
                selectedItemCls: '',
                //selectedCellCls: '',
                //focusedItemCls: '',
                //overItemCls: '',
                //altRowCls: '',
                getRowClass: function(r, idx, o, st){
                    if (r.data.problematic){
                        return 'slot-error-row';
                    }
                    var order = st.slotsOrder || 'exit';
                    idx = st.indexOf(r);
                    if (order == 'exit'){
                        if (idx == 0){
                            r.slotRowClass = 'slot-normal-row';
                            return 'slot-normal-row';
                        } else {
                            var previous = st.getAt(idx-1);
                            if (r.data.related_slot && r.data.exit_order == previous.data.exit_order){
                                r.slotRowClass = previous.slotRowClass;
                                return previous.slotRowClass;
                            } else {
                                r.slotRowClass = previous.slotRowClass == 'slot-normal-row' ? 'slot-alt-row' : 'slot-normal-row';
                                return r.slotRowClass;
                            }
                        }
                    } else if (order == 'name'){
                        return idx % 2 == 0 ? 'slot-normal-row' : 'slot-alt-row';
                    }
                },
                listeners: {
                    beforedrop: Ext.bind(this.beforeSlotDrop, this, [rec], true),
                },
            },
            plugins: [
                {
                    ptype: 'cellediting',
                    pluginId: 'edit',
                    triggerEvent: 'cellclick',
                },
            ],
            scroll: false,
            columns: [
                {
                    itemId: 'jumper',
                    header: TR("Jumpers"),
                    flex: 1,
                    renderer: function(v, o, r, print){
                        if (r.data.person){
                            return Sp.ui.misc.formatFullname({data:r.data.person}, Data.me.data.name_order, true);
                        }
                        if (r.data.phantom){
                            return r.data.phantom.name;
                        }
                        if (r.data.worker){
                            var worker = this.locationRec.Workers().getById(r.data.worker);
                            if (worker){
                                if (print === true){
                                    return Ext.String.format(
                                            "<img src='/static/images/icons/line.png'/>{0}",
                                            worker.data.name);
                                } else {
                                    return Ext.String.format(
                                            "<table><tr><td><img src='/static/images/icons/line.png'/></td><td>{0}</td></tr></table>",
                                            worker.data.name);  
                                }
                            }
                        }
                        if (r.data.worker_type){
                            var ph_text = TR("Add a staff member");
                        } else {
                            var ph_text = TR("Add a jumper");
                        }
                        return Ext.String.format("<span class='placeholder-color'>{0}</span>", ph_text);
                    },
                    getEditor: Ext.bind(function(r){
                        if (r.data.worker_type){
                            var wt = Data.workerTypes.getById(r.data.worker_type);
                            this.res_stores[wt.data.type].clearFilter();
                            return {
                                xtype: 'combobox',
                                loadRec: rec,
                                store: this.res_stores[wt.data.type],
                                queryMode: 'local',
                                forceSelection: true,
                                editable: true,
                                displayField: 'name',
                                valueField: 'uuid',
                                lastQuery: '',
                                listeners: {
                                    focus: function(me){
                                        var r = this.slots_grids[me.loadRec.data.uuid].getView().clickedRec;
                                        me.expand();
                                        me.select(this.locationRec.Workers().getById(r.data.worker));
                                    },
                                    select: function(me){
                                        this.slots_grids[me.loadRec.data.uuid].getPlugin('edit').completeEdit();
                                    },
                                    scope: this,
                                },
                           };
                        } else {
                            return {
                                xtype: 'personcombo',
                                locationRec: this.locationRec,
                                allowPhantom: true,
                                matchFieldWidth: false,
                                loadRec: rec,
                                emptyText: TR("Enter jumper's name"),
                                listeners: {
                                    focus: function(me){
                                        var r = this.slots_grids[me.loadRec.data.uuid].getView().clickedRec;
                                        if (r.data.person){
                                            me.setValue(r.data.person);
                                        } else if (r.data.phantom){
                                            me.setValue(r.data.phantom);
                                        }
                                        me.selectText();
                                    },
                                    select: function(me){
                                        this.slots_grids[me.loadRec.data.uuid].getPlugin('edit').completeEdit();
                                    },
                                    scope: this,
                                },
                            };
                        }
                    }, this),
                    scope: this,
                    listeners: this.getSlotColListeners(), 
                },
                {
                    header: TR("Catalog"),
                    flex: 1,
                    renderer: function(v,o,r){
                        if (r.data.related_slot && r.data.worker_type){
                            var wt = Data.workerTypes.getById(r.data.worker_type);
                            return wt.data.label;
                        } else if (r.data.item){
                            var label = '';
                            var item = this.locationRec.LocationCatalogItems().getById(r.data.item);
                            label += item.data.name;
                            return label;
                        } else {
                            return Ext.String.format("<span class='placeholder-color'>{0}</span>", 
                                                        TR("Add catalog item"));                            
                        }
                    },
                    scope: this,
                    listeners: this.getSlotColListeners(),
                },
                {
                    itemId: 'altitude',
                    header: TR("Altitude"),
                    width: 65,
                    renderer: function(v,o,r){
                        if (r.data.item && r.data.element){
                            var label = '';
                            var item = this.locationRec.LocationCatalogItems().getById(r.data.item);
                            var element = item.LocationCatalogElements().getById(r.data.element);
                            return Ext.String.format('{0} {1}', element.data.altitude, element.data.altitude_unit);
                        } else {
                            return Ext.String.format("<span class='placeholder-color'>{0}</span>", TR("N/A"));                  
                        }
                    },
                    scope: this,
                },
                {
                    itemId: 'jumptype',
                    dataIndex: 'jump_type',
                    header: TR("Work"),
                    width: 90,
                    renderer: function(v){
                        if (v){
                            return Data.jumpTypes.getById(v).data.label;
                        } else {
                            return Ext.String.format("<span class='placeholder-color'>{0}</span>", TR("N/A"));
                        }
                    },
                    editor: {
                        xtype: 'combobox',
                        loadRec: rec,
                        store: Data.jumpTypes,
                        queryMode: 'local',
                        editable: false,
                        displayField: 'label',
                        valueField: 'uuid',
                        lastQuery: '',
                        listeners: {
                            focus: function(me){
                                me.expand();
                            },
                            select: function(me){
                                this.slots_grids[me.loadRec.data.uuid].getPlugin('edit').completeEdit();
                            },
                            scope: this,
                        },
                    },
                    listeners: this.getSlotColListeners(),
                },
                {
                    itemId: 'exit',
                    dataIndex: 'exit_order',
                    header: TR("Exit"),
                    width: 50,
                    align: 'center',
                    editor: {
                        xtype: 'numberfield',
                        minValue: 1,
                        maxValue: 999,
                    },
                    listeners: this.getSlotColListeners(),
                },
                {
                    dataIndex: 'is_paid',
                    header: TR("Paid"),
                    width: 45,
                    align: 'center',
                    renderer: function(v,o,r){
                        if (r.data.related_slot){
                            // add a blank icon to keep the rows height equal
                            return Ext.String.format("<img src='{0}'/>", Sp.core.Globals.BLANK_ICON);
                        } else {
                            return Ext.String.format("<img src='/static/images/icons/{0}.png'/>", v ? 'active' : 'cancel_round');
                        }
                    },
                    editor: {
                        xtype: 'checkbox',
                        loadRec: rec,
                        listeners: {
                            focus: function(me){
                                me.setValue(!me.getValue());
                                this.slots_grids[me.loadRec.data.uuid].getPlugin('edit').completeEdit();
                            },
                            scope: this,
                        },
                    },
                    listeners: this.getSlotColListeners(),
                },
                {
                    dataIndex: 'is_ready',
                    header: TR("Ready"),
                    width: 45,
                    align: 'center',
                    renderer: function(v,o,r){
                        if (!r.data.related_slot){
                            return Ext.String.format("<img src='/static/images/icons/{0}.png'/>", v ? 'active' : 'cancel_round');
                        }
                    },
                    editor: {
                        xtype: 'checkbox',
                        loadRec: rec,
                        listeners: {
                            focus: function(me){
                                me.setValue(!me.getValue());
                                this.slots_grids[me.loadRec.data.uuid].getPlugin('edit').completeEdit();
                            },
                            scope: this,
                        },
                    },
                    listeners: this.getSlotColListeners(),
                },
                {
                    xtype: 'actioncolumn',
                    itemId: 'removeActionCol',
                    width: 20,
                    items: [
                        {
                            icon: '/static/images/icons/trash.png',
                            tooltip: TR("Remove slot"),
                            getClass: function(v,o,r){
                                if (r.data.related_slot){
                                    return 'hidden-el';
                                }
                            },
                            handler: function(grid, rowIndex, colIndex) {
                                var r = grid.getStore().getAt(rowIndex);
                                if (!r.data.related_slot && !r.phantom){
                                    this.deleteSlot(grid.loadRec, r);
                                }
                            },
                            scope: this,
                        }
                    ],
                    listeners: this.getSlotColListeners(),
                },
            ],
            bbar: [
                {
                    xtype: 'label',
                    html: "<img src='/static/images/icons/jumpmaster.png'/>",
                },
                {
                    xtype: 'combobox',
                    itemId: 'jumpmasterCbx',
                    loadRec: rec,
                    emptyText: TR("Set Jumpmaster"),
                    width: 150,
                    store: Ext.create('store.store', {
                        fields: ['uuid','name'],
                        sorters: [
                            {
                                property: 'name',
                                direction: 'ASC',
                            },
                        ],
                    }),
                    queryMode: 'local',
                    editable: false,
                    displayField: 'name',
                    valueField: 'uuid',
                    lastQuery: '',
                    listeners: {
                        select: this.onJumpMasterCbxSelect,
                        scope: this,
                    },
                },
                '-',
                {
                    text: TR("Set Exits"),
                    icon: '/static/images/icons/order.png',
                    menu: [
                        {
                            loadRec: rec,
                            text: TR("Adjust Numbers"),
                            icon: '/static/images/icons/adjust_order.png',
                            handler: function(me){
                                this.adjustExitOrders(me.loadRec);
                            },
                            scope: this,
                        },
                        {
                            loadRec: rec,
                            text: TR("Propose Order"),
                            icon: '/static/images/icons/propose_order.png',
                            handler: function(me){
                                this.proposeExitOrders(me.loadRec);
                            },
                            scope: this,
                            disabled: true,
                        },
                    ],
                },
                {
                    icon: '/static/images/icons/sort.png',
                    tooltip: TR("Set Sorting"),
                    menu: [
                        {
                            loadRec: rec,
                            text: TR("Sort by exits"),
                            icon: '/static/images/icons/sort_num.png',
                            checked: true,
                            group: 'slotsSort',
                            checkedCls: 'menu-item-checked',
                            uncheckedCls: 'menu-item-unchecked',
                            handler: function(me){
                                var store = me.loadRec.Slots();
                                store.slotsOrder = 'exit';
                                store.sort({sorterFn: Sp.lmanager.slotsSorter});
                                this.slots_grids[me.loadRec.data.uuid].down('#jumper').removeCls('x-column-header-sort-ASC');
                                this.slots_grids[me.loadRec.data.uuid].down('#exit').addCls('x-column-header-sort-ASC');
                            },
                            scope: this,
                        },
                        {
                            loadRec: rec,
                            text: TR("Sort by names"),
                            icon: '/static/images/icons/sort_az.png',
                            checked: false,
                            group: 'slotsSort',
                            checkedCls: 'menu-item-checked',
                            uncheckedCls: 'menu-item-unchecked',
                            handler: function(me){
                                var store = me.loadRec.Slots();
                                store.slotsOrder = 'name';
                                store.sort({sorterFn: Sp.lmanager.slotsSorter});
                                this.slots_grids[me.loadRec.data.uuid].down('#jumper').addCls('x-column-header-sort-ASC');
                                this.slots_grids[me.loadRec.data.uuid].down('#exit').removeCls('x-column-header-sort-ASC');
                            },
                            scope: this,
                        },
                    ],
                },
                {
                    icon: '/static/images/icons/action.png',
                    tooltip: TR("Other actions"),
                    menu: [
                        {
                            loadRec: rec,
                            text: TR("Validate Load"),
                            icon: '/static/images/icons/good.png',
                            handler: function(me){
                                this.validateLoad(me.loadRec, true);
                            },
                            scope: this,
                        },
                        {
                            loadRec: rec,
                            text: TR("Autofill Staff"),
                            icon: '/static/images/icons/fill.png',
                            handler: function(me){
                            },
                            scope: this,
                            disabled: true,
                        },
                    ],
                },
                '-',
                {
                    xtype: 'textfield',
                    itemId: 'loadNote',
                    loadRec: rec,
                    emptyText: TR("Public note about this load."),
                    flex: 1,
                    enableKeyEvents: true,
                    listeners: {
                        change: function(me, val){
                            var current_note = me.loadRec.data.note;
                            if (current_note === null){
                                current_note = '';
                            }
                            me.ownerCt.down('#updateloadNoteBt').setDisabled(val == current_note);
                        },
                        afterrender: function(me){
                            me.setValue(me.loadRec.data.note);
                        },
                        specialkey: function(me, e){
                            if (e.getKey() == e.ENTER && !me.ownerCt.down('#updateloadNoteBt').isDisabled()){
                                this.updateLoadNote(me.loadRec);
                            }
                        },
                        scope: this,
                    },
                },
                {
                    itemId: 'updateloadNoteBt',
                    loadRec: rec,
                    text: TR("Set note"),
                    icon: '/static/images/icons/note_edit.png',
                    handler: function(me){
                        this.updateLoadNote(me.loadRec);
                    },
                    scope: this,
                    disabled: true,
                },
                {
                    loadRec: rec,
                    text: TR("Print"),
                    icon: '/static/images/icons/printer.png',
                    handler: function(me){
                        this.printLoad(me.loadRec);
                    },
                    scope: this,
                },
            ],
            listeners: {
                beforeedit: this.beforeSlotCellEdit,
                edit: this.onSlotCellEdit,
                cellclick: this.onSlotCellClick,
                beforedestroy: this.beforeLoadDestroy,
                itemmouseenter: this.onSlotMouseEnter,
                itemmouseleave: this.onSlotMouseLeave,
                itemcontextmenu: this.onSlotContextMenu,
                scope: this,
            },
            renderTo: body_div,
        });
        
        this.slots_grids[rec.data.uuid].down('#exit').addCls('x-column-header-sort-ASC');
                
        var infos = this.getSlotsInfos(rec);
        this.handleAutoAddSlot(rec, infos);
        this.updateJumpersHeader(rec, infos);
        
        this.doLayout();
        this.updateSlotsGridsLayout();
        this.slots_grids[rec.data.uuid].bodyExpanded = true;
        
        // disable some ui parts when load is in the air
        var in_air = Sp.lmanager.isInTheAir(rec);
        this.slots_grids[rec.data.uuid].getDockedItems('toolbar[dock="bottom"]')[0].setDisabled(in_air);
        this.slots_grids[rec.data.uuid].down('#removeActionCol').setVisible(!in_air);
        
        // add jumpers to jumpermaster combo
        var jumpmasterCbx = this.slots_grids[rec.data.uuid].down('#jumpmasterCbx');
        var jm_store = jumpmasterCbx.getStore();
        var jumpers = [];
        rec.Slots().each(function(s){
            var jumper = {uuid: s.data.uuid};
            if (s.data.person){
                jumper.name = Sp.ui.misc.formatFullname({data:s.data.person}, Data.me.data.name_order, true);
            } else if (s.data.worker){
                jumper.name = this.locationRec.Workers().getById(s.data.worker).data.name;
            } else {
                return;
            }
            jumpers.push(jumper);
        }, this);
        jm_store.loadRawData(jumpers);
        // select jump master
        if (rec.data.jumpmaster_slot){
            jumpmasterCbx.setValue(jm_store.findRecord('uuid', rec.data.jumpmaster_slot));
        }
        
        /*if (!recreate){
            rec.Slots().on('datachanged', this.onSlotDataChange, this);
        }*/
    },
    
    onCollapse: function(row, rec, exp_row){
        if (this.slots_grids[rec.data.uuid]){
            this.slots_grids[rec.data.uuid].bodyExpanded = false;
        }
        this.updateSlotsGridsLayout();
    },
    
    onLoadsGridResize: function(){
        this.updateSlotsGridsLayout();
    },
    
    onSpacePress: function(){
        return true;
        this.getPlugin('expand').onEnter();
    },
    
    beforeDestroy: function(){
        this.taskRunner.destroy();
        this.getStore().un('datachanged', this.onLoadDataChange, this);
        Ext.Object.each(this.slots_grids, function(k,v){
            Ext.destroy(v);
        });
    },
    
    beforeLoadDestroy: function(grid){
        //grid.getStore().un('datachanged', this.onSlotDataChange, this);
    },
    
    beforeLoadCellEdit: function(editor, event){
        if (event.field == 'timer' && event.record.data.problematic){
            return false;
        }
        if (event.field != 'state' && Sp.lmanager.isInTheAir(event.record)){
            return false;           
        }
    },
    
    validateLoadCellEdit: function(editor, event){
        // check if aircraft has enough slots
        if (event.field == 'aircraft'){
            // workaround for a bug in validateedit event
            // value is not set
            var value = editor.editors.getByKey('aircraft').field.getValue();
            var aircraft = this.locationRec.Aircrafts().getById(value);
            var infos = this.getSlotsInfos(event.record);
            if (infos.used > aircraft.data.max_slots){
                Sp.ui.misc.errMsg(Ext.String.format(TR("{0} has only {1} {2} and there is {3} {4} in this load"),
                                    aircraft.data.registration, aircraft.data.max_slots,
                                    aircraft.data.max_slots > 1 ? TR("slots") : TR("slot"),
                                    infos.used, infos.used > 1 ? TR("jumpers") : TR("jumper")
                ), TR("Insufficient slots"));
                event.cancel = true;
                return false;
            }
        } else if (event.field == 'state'){
            var value = editor.editors.getByKey('state').field.getValue();
            if (value == 'B'){
                if (!this.validateLoad(event.record, true)){
                    if (this.locationRec.data.lmanager_deny_invalid_loads){
                        Sp.ui.misc.errMsg(TR("This load still has problems, please correct them before boarding"), TR("Load problem"));
                        event.cancel = true;
                        return false;
                    } else {
                        Ext.MessageBox.confirm(TR("Boarding confirmation"), TR("This load still has problems, board anyway ?"), function(bt){
                            if (bt == 'yes'){
                                var undo_values = {};
                                undo_values['state'] = event.record.data.state;
                                this.clearProblematic(event.record);
                                event.record.set('state', 'B');
                                // save
                                this.actionOperation(event.record, 'save');
                                // undo action
                                this.storeAction(this.locationRec.data.uuid, {
                                    action: 'update',
                                    record: event.record,
                                    values: undo_values,
                                });
                            }
                        }, this);
                        event.cancel = true;
                        return false;
                    }
                    event.cancel = true;
                    return false;
                } else {
                    this.setupBoardingTimerUpdater(event.record);
                }
            } else if (value == 'T'){
                if (event.record.data.state != 'B'){
                    Sp.ui.misc.errMsg(TR("The load must be in 'Boarding' state before setting 'Took Off' state"), TR("State error"));
                    event.cancel = true;
                    return false;
                }
            } else if (value == 'D'){
                if (event.record.data.state != 'T'){
                    Sp.ui.misc.errMsg(TR("The load must be in 'Took Off' state before setting 'Dispatching' state"), TR("State error"));
                    event.cancel = true;
                    return false;
                }
            } else if (value == 'S'){
                if (event.record.data.state != 'D'){
                    Sp.ui.misc.errMsg(TR("The load must be in 'Dispatching' state before setting 'Descending' state"), TR("State error"));
                    event.cancel = true;
                    return false;
                }
            } else if (value == 'L'){
                if (event.record.data.state != 'S'){
                    Sp.ui.misc.errMsg(TR("The load must be in 'Descending' state before setting 'Landed' state"), TR("State error"));
                    event.cancel = true;
                    return false;
                }
            }
        }
    },
    
    onLoadCellEdit: function(editor, event){
        if (!event.field){
            return;
        }
        if (Ext.Object.getSize(event.record.getChanges()) == 0){
            return;
        }
        var undo_values = {};
        if (event.field == 'aircraft'){
            this.handleAutoAddSlot(event.record);
        }
        // set state to boarding if a timer is set
        if (event.field == 'timer' && event.value > 0){
            if (event.record.data.state != 'B'){
                undo_values.state = event.record.data.state;
                event.record.set('state', 'B'); 
            }
            this.setupBoardingTimerUpdater(event.record);
        }
        
        if (event.field == 'state'){
            if (event.value != 'B'){
                this.cancelBoardingTimerUpdater(event.record);
            }
            if (event.value != 'P'){
                this.clearProblematic(event.record);
            }
            this.loadStateChanged(event.record);
        }
        
        // validate
        this.validateLoad(event.record);
        // save
        this.actionOperation(event.record, 'save');
        // undo action
        undo_values[event.field] = event.originalValue;
        this.storeAction(this.locationRec.data.uuid, {
            action: 'update',
            record: event.record,
            values: undo_values,
        });
    },
    
    onLoadDataChange: function(store){
        var count = store.getCount();
        this.down('#loadsCol').setText(Ext.String.format("{0} {1}", count, (count > 1 ? TR("Loads") : TR("Load"))));
    },
    
    onLoadMouseEnter: function(view, rec){
        if (rec.data.problematic && rec.data.problem){
            this.statusBarText({
                text: rec.data.problem,
                iconCls: 'x-status-error',
            });
        }
    },
    
    onLoadMouseLeave: function(view, rec){
        if (rec.data.problematic && rec.data.problem){
            this.statusBarClear();
        }
    },
    
    onLoadContextMenu: function(grid, record, el, idx, ev){
        if (record.data.state == 'P'){
            ev.preventDefault();
            return;
        }
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Archive"),
                    icon: '/static/images/icons/archive.png',
                    handler: function(){
                        this.archiveLoad(record);
                    },
                    scope: this,
                },
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        this.remoteDeleteLoad(record);
                    },
                    scope: this,
                },
            ],
        });
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    updateSlotsGridsLayout: function(){
        Ext.Object.each(this.slots_grids, function(k,v){
            if (v.bodyExpanded){
                v.doLayout();
            }
        });
    },
    
    deleteLoad: function(loadRec){
        var store = this.getStore();
        store.remove(loadRec);
        this.actionOperation(loadRec, 'destroy');
        this.storeAction(this.locationRec.data.uuid, {
            action: 'destroy',
            record: loadRec,
            store: store,
        });
    },
    
    doDelayedSave: function(rec){
        if (Ext.Object.getSize(rec.getChanges()) == 0){
            return;
        }
        this.actionOperation(rec, 'save');
    },
    
    delaySave: function(rec, delay){
        delay = delay || 1500;
        if (!this.save_tasks[rec.data.uuid]){
            this.save_tasks[rec.data.uuid] = new Ext.util.DelayedTask(this.doDelayedSave, this, [rec]);
        }
        this.save_tasks[rec.data.uuid].delay(delay);
    },
    
    getNextAircraft: function(){
        var usage_counts = {},
            min_usage = Number.POSITIVE_INFINITY,
            aircraft;
        this.res_stores.aircrafts.each(function(a){
            usage_counts[a.data.uuid] = 0;
        });
        this.locationRec.Loads().each(function(l){
            usage_counts[l.data.aircraft] += 1;
        });
        Ext.Object.each(usage_counts, function(k,v){
            if (v < min_usage){
                min_usage = v;
                aircraft = k;
            }
        });
        return this.res_stores.aircrafts.getById(aircraft);
    },
    
    getNextPilot: function(){
        var usage_counts = {},
            min_usage = Number.POSITIVE_INFINITY,
            pilot;
        this.res_stores.pilot.each(function(p){
            usage_counts[p.data.uuid] = 0;
        });
        this.locationRec.Loads().each(function(l){
            usage_counts[l.data.pilot] += 1;
        });
        Ext.Object.each(usage_counts, function(k,v){
            if (v < min_usage){
                min_usage = v;
                pilot = k;
            }
        });
        return this.res_stores.pilot.getById(pilot);
    },
    
    getNextLoadNumber: function(){
        var number = 0;
        this.locationRec.Loads().each(function(l){
            number = Ext.Array.max([number, l.data.number]);
        });
        return number+1;
    },
    
    newLoad: function(){
        var load = Data.create('Load', {
            location: this.locationRec.data.uuid,
            aircraft: this.getNextAircraft().data.uuid,
            pilot: this.getNextPilot().data.uuid,
            number: this.getNextLoadNumber(),
        });
        load.Slots().sort({sorterFn: Sp.lmanager.slotsSorter});
        var store = this.getStore();
        store.add(load);
        this.actionOperation(load, 'save');
        this.storeAction(this.locationRec.data.uuid, {
            action: 'create',
            record: load,
            store: store,
        });
    },
    
    updateLoadNote: function(loadRec){
        var undo_values = {};
        undo_values.note = loadRec.data.note;
        this.slots_grids[loadRec.data.uuid].down('#updateloadNoteBt').disable();
        loadRec.set('note', this.slots_grids[loadRec.data.uuid].down('#loadNote').getValue());
        // save
        this.actionOperation(loadRec, 'save');
        // undo action
        this.storeAction(this.locationRec.data.uuid, {
            action: 'update',
            record: loadRec,
            values: undo_values,
        });
    },
    
    loadStateChanged: function(loadRec){
        var grid = this.slots_grids[loadRec.data.uuid];
        if (!grid){
            return;
        }
        var in_air = Sp.lmanager.isInTheAir(loadRec);
        grid.getDockedItems('toolbar[dock="bottom"]')[0].setDisabled(in_air);
        grid.down('#removeActionCol').setVisible(!in_air);
    },
    
    setProblematic: function(rec, problematic, problem){
        if (problematic != rec.data.problematic){
            rec.set('problematic', problematic);
        }
        problem = problem || null;
        if (problem != rec.data.problem){
            rec.set('problem', problem);
        }
        var changes = rec.getChanges();
        var changes_size = Ext.Object.getSize(changes);
        if ((changes_size == 2 && changes.hasOwnProperty('problematic') && changes.hasOwnProperty('problem')) ||
        (changes_size == 1 && (changes.hasOwnProperty('problematic') || changes.hasOwnProperty('problem')))){
            rec.save();
        }
    },
    
    clearProblematic: function(loadRec){
        loadRec.set('problematic', false);
        loadRec.Slots().each(function(s){
            s.set('problematic', false);
        });
    },
    
    validateLoad: function(loadRec, final_validation){
        
        Log('=== BEGIN ====')
        Log(loadRec)
        
        if (!final_validation && !this.locationRec.data.lmanager_loads_auto_validate){
            Log('=== SKIPPED ====')
            return true;
        }
        
        // validate only planned loads
        if (loadRec.data.state != 'P'){
            Log('NOT PLANNED')
            return true;
        }
        
        var slots_store = loadRec.Slots();
        var infos = this.getSlotsInfos(loadRec);
        var empty_slots = false;
        var duplicate_slots = false;
        var unpaid_slots = false;
        var unready_slots = false;
        var account_problem_slots = false;
        var seen_jumpers = [], 
            jumper_uuid;
        
        Log(infos)
        
        if (infos.used == 0){
            Log('EMPTY LOAD')
            if (final_validation){
                this.setProblematic(loadRec, true, TR("This load is empty"));
            } else if (loadRec.data.problematic){
                this.setProblematic(loadRec, false);
            }
            return;
        }
        
        slots_store.each(function(s){
            Log(s)
            // ignote auto added slot
            if (!s.data.item && !s.data.person && !s.data.phantom && !s.data.worker){
                Log('IGNORE')
                return;
            }
            // empty slot
            if (s.data.item && (!s.data.person && !s.data.phantom && !s.data.worker)){
                Log('EMPTY')
                empty_slots = true;
                this.setProblematic(s, true, TR("Empty slot"));
                return;
            }
            // duplicate slot
            if (s.data.person || s.data.worker){
                jumper_uuid = s.data.person ? s.data.person.uuid : s.data.worker;
                if (seen_jumpers.indexOf(jumper_uuid) == -1){
                    seen_jumpers.push(jumper_uuid);
                } else {
                    Log('DUP')
                    duplicate_slots = true;
                    this.setProblematic(s, true, TR("Duplicate slot"));
                    return;
                }
            }
            // paid
            if (!s.data.is_paid){
                Log('UNPAID')
                unpaid_slots = true;
                this.setProblematic(s, true, TR("Unpaid slot"));
                return;
            }
            // ready
            if (!s.data.is_ready){
                Log('UNREADY')
                unready_slots = true;
                this.setProblematic(s, true, TR("Jumper not ready"));
                return;
            }
            // check person account
            if (s.data.person){
                var err = Sp.lmanager.checkAccount(s, this.locationRec);
                if (err){
                    Log('ACCOUNT PB')
                    Log(err)
                    account_problem_slots = true;
                    this.setProblematic(s, true, err);
                    return;
                }
            }
            // slot is ok, remove problematic flag if set
            Log('OK')
            this.setProblematic(s, false);
        }, this);
        
        if (empty_slots){
            this.setProblematic(loadRec, true, TR("There are empty slots in this load"));
            return;
        }
        
        if (duplicate_slots){
            this.setProblematic(loadRec, true, TR("There are duplicate slots in this load"));
            return;
        }
        
        if (unpaid_slots){
            this.setProblematic(loadRec, true, TR("There are unpaid slots in this load"));
            return;
        }
        
        if (unready_slots){
            this.setProblematic(loadRec, true, TR("There are jumpers not ready in this load"));
            return;
        }
        
        if (account_problem_slots){
            this.setProblematic(loadRec, true, TR("There are jumpers with account problem in this load"));
            return;
        }
        
        // check minimum slots requierement
        if (Ext.isNumber(infos.min) && infos.used < infos.min){
            this.setProblematic(loadRec, true, 
                Ext.String.format(TR("The aircraft used in this load has a minimum requirement of {0} slots"), infos.min));
            return;
        }
        
        Log('=== END ====')
        
        // load is ok, remove problematic flag if set
        this.setProblematic(loadRec, false);
        this.statusBarClear();
        return true;
    },
        
    setupBoardingTimerUpdater: function(loadRec){
        var interval = Sp.core.Globals.DEBUG ? 1000 : 60000;
        if (!Ext.isDefined(this.tasks[loadRec.data.uuid])){
            this.tasks[loadRec.data.uuid] = {};
        }
        if (this.tasks[loadRec.data.uuid].boardingTimer){
            Log('stop ' + loadRec.data.number)
            this.tasks[loadRec.data.uuid].boardingTimer.stop();
        } else {
            Log('create ' + loadRec.data.number)
            this.tasks[loadRec.data.uuid].boardingTimer = this.taskRunner.newTask({
                run: this.updateBoardingTimer,
                args: [loadRec],
                scope: this,
                interval: interval,
            });
        }
        // delay the task
        if (this.tasks[loadRec.data.uuid].boardingTimerStarter){
            this.tasks[loadRec.data.uuid].boardingTimerStarter.cancel();
        } else {
            this.tasks[loadRec.data.uuid].boardingTimerStarter = new Ext.util.DelayedTask(function(){
                Log('start ' + loadRec.data.number)
                this.tasks[loadRec.data.uuid].boardingTimer.start();
            }, this);   
        }
        this.tasks[loadRec.data.uuid].boardingTimerStarter.delay(interval);
    },
    
    cancelBoardingTimerUpdater: function(loadRec){
        if (Ext.isDefined(this.tasks[loadRec.data.uuid]) && this.tasks[loadRec.data.uuid].boardingTimer){
            Log('cancel ' + loadRec.data.number)
            this.taskRunner.stop(this.tasks[loadRec.data.uuid].boardingTimer);
        }
    },
    
    updateBoardingTimer: function(loadRec){
        if (loadRec.data.state != 'B' || !Ext.isNumber(loadRec.data.timer)){
            return;
        }
        if (loadRec.data.timer == 1){
            this.cancelBoardingTimerUpdater(loadRec);
            loadRec.set({
                timer: null,
                state: 'T',
            });
        } else {
            var t = loadRec.data.timer-1;
            loadRec.set('timer', t);
        }
        this.actionOperation(loadRec, 'save');
    },
    
    archiveLoad: function(loadRec){
        Ext.create('Sp.views.lmanager.ArchiveLoad', {
            loadRec: loadRec,
        }).show();
    },
    
    remoteDeleteLoad: function(loadRec){
        Ext.create('Sp.views.lmanager.DeleteLoad', {
            loadRec: loadRec,
        }).show();
    },
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    
    getNextSlotExit: function(loadRec){
        var exit_order = 0;
        loadRec.Slots().each(function(s){
            if (Ext.isNumber(s.data.exit_order)){
                exit_order = Ext.Array.max([exit_order, s.data.exit_order]);
            }
        });
        return exit_order+1;
    },
    
    addSlot: function(loadRec, auto_add){
        var slot = Data.create('Slot', {
            load: loadRec.data.uuid,
            exit_order: this.getNextSlotExit(loadRec),
        });
        var store = loadRec.Slots();
        store.add(slot);
        var have_related = this.handleRelatedSlots(slot, 'create');
        this.actionOperation(slot, 'save', have_related);
        if (!auto_add){
            this.storeAction(this.locationRec.data.uuid, {
                action: 'create',
                record: slot,
                store: store,
                handleRelatedSlots: Ext.bind(this.handleRelatedSlots, this),
            }); 
        }
    },
    
    onSlotCellClick: function(view, td, cell_idx, rec, tr, row_idx, e){
        view.clickedRec = rec;
        var loadRec = this.locationRec.Loads().getById(rec.data.load);
        if (cell_idx == 1 && !rec.data.related_slot && !Sp.lmanager.isInTheAir(loadRec)){
            Ext.create('Sp.views.lmanager.CatalogSelect', {
                locationRec: this.locationRec,
                slotRec: rec,
                statusBarOk: this.statusBarOk,
                statusBarBusy: this.statusBarBusy,
                storeAction: this.storeAction,
                actionOperation: this.actionOperation,
                handleRelatedSlots: Ext.bind(this.handleRelatedSlots, this),
                getSlotsInfos: Ext.bind(this.getSlotsInfos, this),
                afterSlotEdit: Ext.bind(this.afterSlotEdit, this),
            }).showAt(e.getXY());
        }
    },
    
    beforeSlotDrop: function(node, data, overModel, position, dropHandlers, opt, loadRec){
        var slotRec = data.records[0];
        // just in case... should never happend
        if (!slotRec){
            return false;
        }
        var origin_store = slotRec.store;
        var origin_load_uuid = slotRec.data.load;
        var origin_loadRec = this.locationRec.Loads().getById(origin_load_uuid);
        var dest_store = loadRec.Slots();
        var related = this.getRelatedSlots(slotRec, origin_store);
        var infos = this.getSlotsInfos(loadRec);
        var moved_slots = [];
        // no dnd within the same load or for related slots
        if (slotRec.data.load == loadRec.data.uuid || slotRec.data.related_slot){
            return false;
        }
        // check slots availability
        if (related.length+1 > infos.free){
            Sp.ui.misc.errMsg(TR("There is no enough free slots in this load"), TR("Insufficient slots"));
            return false;
        }
        // change load uuid and save later
        // if related slots exists, this record will be saved when the store in synced
        slotRec.set('load', loadRec.data.uuid);
        moved_slots.push(slotRec);
        // process drop here to remove the record from 'removed' property of the store
        // otherwise the records (the slot) will get removed on the store sync
        dropHandlers.wait = true;
        dropHandlers.processDrop();
        // prevent slot being removed from origin store
        var idx = origin_store.removed.indexOf(slotRec);
        if (idx != -1){
            origin_store.removed.splice(idx, 1);
        }
        // handle related slots
        if (related.length > 0){
            // second arg (isMove) is an extjs private arg !
            // that prevent putting the removed recs into 'removed'
            origin_store.remove(related, true);
            Ext.each(related, function(r){
                r.set('load', loadRec.data.uuid);
                moved_slots.push(r);
            });
            dest_store.add(related);
            dest_store.sync();
        } else {
            this.actionOperation(slotRec, 'save');
        }
        // handle jumpmaster combo
        var origin_jm_cbx = this.slots_grids[origin_load_uuid].down('#jumpmasterCbx');
        var origin_jm_store = origin_jm_cbx.getStore();
        var origin_jm_value = origin_jm_cbx.getValue();
        var dest_jm_cbx = this.slots_grids[loadRec.data.uuid].down('#jumpmasterCbx');
        var dest_jm_store = dest_jm_cbx.getStore();
        var dest_jm_value = dest_jm_cbx.getValue();
        var to_delete = [];
        var to_add = [];
        Ext.each(moved_slots, function(s){
            if (origin_jm_value == s.data.uuid){
                origin_jm_cbx.clearValue();
                origin_loadRec.set('jumpmaster_slot', null);
                this.actionOperation(origin_loadRec, 'save');
            }
            to_delete.push(origin_jm_store.findRecord('uuid', s.data.uuid));
            if (s.data.person){
                to_add.push({
                    uuid: s.data.uuid,
                    name: Sp.ui.misc.formatFullname({data:s.data.person}, Data.me.data.name_order, true),
                });
            } else if (s.data.worker){
                var worker = this.locationRec.Workers().getById(s.data.worker);
                if (worker){
                    to_add.push({
                        uuid: s.data.uuid,
                        name: worker.data.name,
                    }); 
                }
            }
        }, this);
        if (to_delete.length > 0){
            origin_jm_store.remove(to_delete);
        }
        if (to_add.length > 0){
            dest_jm_store.add(to_add);
        }
        
        this.afterSlotEdit(null, origin_loadRec);
        this.afterSlotEdit(slotRec);
        
    },
    
    beforeSlotCellEdit: function(editor, event){
        var loadRec = this.locationRec.Loads().getById(event.record.data.load);
        if (Sp.lmanager.isInTheAir(loadRec)){
            return false;
        }
        if (event.record.data.related_slot && event.colIdx != 0){
            return false;
        }
        if (event.colIdx == 0){
            editor.editors.removeAtKey('jumper');
        }
        if (event.field == 'jump_type'){
            if (event.record.data.item){
                var item = this.locationRec.LocationCatalogItems().getById(event.record.data.item);
                if (item){
                    return !item.data.jump_type_auto;
                }
            }   
        }
    },
    
    onSlotCellEdit: function(editor, event){
        var field = event.field;
        var originalValue = event.originalValue;
        var undo_values = {};
        //var update_related = false;
        var loadRec = this.locationRec.Loads().getById(event.record.data.load);
        
        // update person/phantom/worker
        if (event.colIdx == 0){
            var edit_values = {};
            if (event.record.data.worker_type){
                field = 'worker';
                undo_values.person = event.record.get('person');
                undo_values.membership_uuid = event.record.get('membership_uuid');
                undo_values.phantom = event.record.get('phantom');
                edit_values.person = null;
                edit_values.membership_uuid = null;
                edit_values.phantom = null;
            } else if (Ext.isObject(event.value)){
                field = event.value.type;
                delete event.value.type;
                if (field == 'person'){
                    // store membershipRec for later use
                    var membershipRec = editor.editors.getByKey('jumper').field.getFullValue();
                    event.record.membershipRec = membershipRec;
                    undo_values.worker = event.record.get('worker');
                    undo_values.phantom = event.record.get('phantom');
                    edit_values.membership_uuid = membershipRec.data.uuid;
                    edit_values.worker = null;
                    edit_values.phantom = null;
                } else {
                    undo_values.worker = event.record.get('worker');
                    undo_values.person = event.record.get('person');
                    undo_values.membership_uuid = event.record.get('membership_uuid');
                    edit_values.worker = null;
                    edit_values.person = null;
                    edit_values.membership_uuid = null;
                }
            } else {
                return;
            }
            // set default catalog item
            var originalValue = event.record.get(field);
            if (!originalValue || 
            ((originalValue.uuid && originalValue.uuid != event.value.uuid) || 
            (originalValue != event.value))){
                edit_values[field] = event.value;
                if (field == 'person'){ // default member catalog
                    if (membershipRec){
                        var pp = Sp.ui.data.getPersonProfile(membershipRec, this.locationRec);
                        if (pp.catalog_item){
                            undo_values.item = null;
                            edit_values.item = pp.catalog_item;
                            var item = this.locationRec.LocationCatalogItems().getById(pp.catalog_item);
                            if (item && item.data.jump_type){
                                if (Ext.isObject(item.data.jump_type)){
                                    var jump_type = item.data.jump_type.uuid;
                                } else {
                                    var jump_type = item.data.jump_type;
                                }
                                undo_values.jump_type = event.record.data.jump_type;
                                edit_values.jump_type = jump_type;
                            }
                        }
                        if (pp.catalog_element){
                            undo_values.element = null;
                            edit_values.element = pp.catalog_element;
                        }
                        if (pp.catalog_price){
                            undo_values.price = null;
                            edit_values.price = pp.catalog_price;
                        }
                        if (pp.bill_person_data){
                            undo_values.payer = null;
                            edit_values.payer = pp.bill_person_data;
                        }
                    }
                } else if (field == 'phantom'){ // default phantom catalog
                    if (this.locationRec.data.lmanager_default_catalog_item){
                        undo_values.item = null;
                        edit_values.item = this.locationRec.data.lmanager_default_catalog_item;
                        var item = this.locationRec.LocationCatalogItems().getById(this.locationRec.data.lmanager_default_catalog_item);
                        if (item && item.data.jump_type){
                            if (Ext.isObject(item.data.jump_type)){
                                var jump_type = item.data.jump_type.uuid;
                            } else {
                                var jump_type = item.data.jump_type;
                            }
                            undo_values.jump_type = event.record.data.jump_type;
                            edit_values.jump_type = jump_type;
                            // set the element if the item has one and only one element
                            if (item.LocationCatalogElements().getCount() == 1){
                                undo_values.element = null;
                                edit_values.element = item.LocationCatalogElements().getAt(0).data.uuid;
                            }
                            // set paid and ready to false for phantoms
                            undo_values.is_paid = event.record.data.is_paid;
                            edit_values.is_paid = false;
                            undo_values.is_ready = event.record.data.is_ready;
                            edit_values.is_ready = false;
                        }
                    }
                    if (this.locationRec.data.lmanager_default_catalog_price){
                        undo_values.price = null;
                        edit_values.price = this.locationRec.data.lmanager_default_catalog_price;
                    }
                }
                // check if enought slots are available
                // if not, the default catalog item will not be set
                if (edit_values.item && edit_values.element){
                    var item = this.locationRec.LocationCatalogItems().getById(edit_values.item);
                    var element = item.LocationCatalogElements().getById(edit_values.element);
                    var slots_infos = Sp.ui.data.getCatalogElementSlots(this.locationRec, element, ['packer']);
                    var load_infos = this.getSlotsInfos(loadRec);
                    var needed = slots_infos.jumpers+slots_infos.workers_count;
                    if (event.record.data.person || event.record.data.phantom || event.record.data.worker){
                        needed -= 1;
                    }
                    
                    // FIXME: rewrite this code to check for slots availability before storing values
                    // no enough free slots 
                    if (needed > load_infos.free){
                        delete edit_values.item;
                        delete edit_values.element;
                        delete edit_values.jump_type;
                        delete edit_values.price;
                        delete edit_values.payer;
                        delete undo_values.item;
                        delete undo_values.element;
                        delete undo_values.jump_type;
                        delete undo_values.price;
                        delete undo_values.payer;
                    }
                }
            }
            event.record.set(edit_values);
            this.handleJumpmaster(loadRec, event.record, 'update');
        } else if (!event.field){
            return;
        }
        
        // no change
        if (Ext.Object.getSize(event.record.getChanges()) == 0){
            return;
        }
        
        // update related slots (if any)
        var have_related = this.handleRelatedSlots(event.record, 'update');
        
        // sort
        event.record.store.sort({sorterFn: Sp.lmanager.slotsSorter});
        
        // after edit
        this.afterSlotEdit(event.record);
        
        // save
        this.actionOperation(event.record, 'save', have_related);
        // undo action
        undo_values[field] = originalValue;
        this.storeAction(this.locationRec.data.uuid, {
            action: 'update',
            record: event.record,
            values: undo_values,
            handleRelatedSlots: Ext.bind(this.handleRelatedSlots, this),
        });
    },
    
    afterSlotEdit: function(slotRec, loadRec){
        // this function is called at the slot level
        // but it acts on the whole load
        loadRec = loadRec || this.locationRec.Loads().getById(slotRec.data.load);
        if (!loadRec){
            return;
        }
        
        // update load display
        loadRec.afterCommit();
        
        // validate
        this.validateLoad(loadRec);
        
        // update ui parts
        if (this.slots_grids[loadRec.data.uuid]){
            var infos = this.getSlotsInfos(loadRec);
            this.handleAutoAddSlot(loadRec, infos);
            this.updateJumpersHeader(loadRec, infos);
        }
    },
    
    onSlotDataChange: function(store){
        // get Load uuid
        /*var load_uuid;
        store.filters.each(function(f){
            if (f.property == 'load'){
                load_uuid = f.value;
                return false;
            }
        });
        var loadRec = this.locationRec.Loads().getById(load_uuid);
        if (!loadRec){
            return;
        }
        // update load display
        loadRec.afterCommit();
        
        // update ui parts
        var infos = this.getSlotsInfos(loadRec);
        this.handleAutoAddSlot(loadRec, infos);
        this.updateJumpersHeader(loadRec, infos);
        this.validateLoad(loadRec);*/
    },
    
    onJumpMasterCbxSelect: function(cbx, recs){
        var rec = recs[0];
        if (!rec){
            return;
        }       
        var undo_values = {};
        undo_values.jumpmaster_slot = cbx.loadRec.data.jumpmaster_slot;
        cbx.loadRec.set('jumpmaster_slot', rec.data.uuid);
        // save
        this.actionOperation(cbx.loadRec, 'save');
        // undo action
        this.storeAction(this.locationRec.data.uuid, {
            action: 'update',
            record: cbx.loadRec,
            values: undo_values,
        });
    },
    
    onSlotMouseEnter: function(view, rec){
        if (rec.data.problematic && rec.data.problem){
            this.statusBarText({
                text: rec.data.problem,
                iconCls: 'x-status-error',
            });
        }
    },
    
    onSlotMouseLeave: function(view, rec){
        var loadRec = this.locationRec.Loads().getById(rec.data.load);
        if (loadRec.data.problematic && loadRec.data.problem){
            this.statusBarText({
                text: loadRec.data.problem,
                iconCls: 'x-status-error',
            });
        } else if (rec.data.problematic && rec.data.problem){
            this.statusBarClear();
        }
    },
    
    onSlotContextMenu: function(grid, record, el, idx, ev){
        if (!record.data.person && !record.data.phantom){
            ev.preventDefault();
            return;
        }
        var menu_items = [];
        if (record.data.person){
            menu_items.push({
                slotRec: record,
                text: TR("Edit Member"),
                icon: '/static/images/icons/member.png',
                handler: function(me){
                    if (!me.slotRec.membershipRec){
                        if (me.slotRec.data.membership_uuid){
                            var grid = this.slots_grids[me.slotRec.data.load];
                            if (grid){
                                grid.body.mask(TR("Please wait"));
                            }
                            Data.load('LocationMembership', me.slotRec.data.membership_uuid, function(membershipRec){
                                if (grid){
                                    grid.body.unmask();
                                }
                                me.slotRec.membershipRec = membershipRec;
                                Ext.create('Sp.views.locations.EditMember', {
                                    locationRec: this.locationRec,
                                    membershipRec: membershipRec,
                                    instantSave: true,
                                    slotRec: me.slotRec,
                                    afterSlotEdit: Ext.bind(this.afterSlotEdit, this),
                                }).show();
                            }, this);
                        } else {
                            Sp.ui.misc.warnMsg(TR("Failed to retrieve membership data"), TR("Data error"));
                        }
                        return;
                    }
                    Ext.create('Sp.views.locations.EditMember', {
                        locationRec: this.locationRec,
                        membershipRec: me.slotRec.membershipRec,
                        instantSave: true,
                        slotRec: me.slotRec,
                        afterSlotEdit: Ext.bind(this.afterSlotEdit, this),
                    }).show();
                },
                scope: this,
            });
        } else if (record.data.phantom){
            menu_items.push({
                text: TR("Create Member"),
                icon: '/static/images/icons/nomember.png',
                handler: function(){
                    Ext.create('Sp.views.locations.AddMember', {
                        locationRec: this.locationRec,
                        phantomName: record.data.phantom.name,
                        slotRec: record,
                        afterSlotEdit: Ext.bind(this.afterSlotEdit, this),
                        updateRelatedSlotsData: Ext.bind(this.updateRelatedSlotsData, this),
                    }).show();
                },
                scope: this,
            });
        }
        var menu = Ext.create('Ext.menu.Menu', {
            items: menu_items,
        });
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    getSlotsInfos: function(loadRec){
        return Sp.lmanager.getSlotsInfos(loadRec, this.locationRec);
    },
    
    deleteSlot: function(loadRec, slotRec){
        var store = loadRec.Slots();
        var have_related = this.handleRelatedSlots(slotRec, 'destroy');
        // delete the jumper from jumpmaster combo
        this.handleJumpmaster(loadRec, slotRec, 'destroy');
        // if one slot left, reset it
        if (store.getCount() == 1){
            var previous_values = slotRec.getData();
            delete previous_values.uuid;
            var values = Data.create('Slot', {
                load: loadRec.data.uuid,
                exit_order: 1,
            }).getData();
            delete values.uuid;
            slotRec.set(values);
            // return if no change -> user clicked on delete again on the last empty slot
            if (Ext.Object.getSize(slotRec.getChanges()) == 0){
                return;
            }
            this.actionOperation(slotRec, 'save', have_related);
            this.storeAction(this.locationRec.data.uuid, {
                action: 'update',
                record: slotRec,
                values: previous_values,
                handleRelatedSlots: Ext.bind(this.handleRelatedSlots, this),
            });
        // delete slot
        } else {
            this.actionOperation(slotRec, 'destroy', have_related);
            store.remove(slotRec);
            this.storeAction(this.locationRec.data.uuid, {
                action: 'destroy',
                record: slotRec,
                store: store,
                handleRelatedSlots: Ext.bind(this.handleRelatedSlots, this),
            });
        }
        this.afterSlotEdit(null, loadRec);
    },
    
    getRelatedSlots: function(slotRec, store){
        store = store || slotRec.store;
        var related = [];
        store.each(function(s){
            if (s.data.related_slot == slotRec.data.uuid){
                related.push(s);
            }
        });
        return related;
    },
    
    deleteRelatedSlots: function(slotRec){
        var related = this.getRelatedSlots(slotRec);
        if (related.length > 0){
            var loadRec = this.locationRec.Loads().getById(slotRec.data.load);
            // jumpmaster
            Ext.each(related, function(r){
                this.handleJumpmaster(loadRec, r, 'destroy');
            }, this);
            // delete related
            slotRec.store.remove(related);
            return true;
        }
    },
    
    updateRelatedSlotData: function(slotRec, relatedSlot){
        var changes = {};
        var fields = ['exit_order', 'jump_type', 'is_paid', 'is_ready'];
        for (var i=0,f ; f=fields[i] ; i++){
            if (slotRec.data[f] != relatedSlot.data[f]){
                changes[f] = slotRec.data[f];
            }
        }
        if (Ext.Object.getSize(changes) == 0){
            return;
        }
        relatedSlot.set(changes);
        return true;
    },
    
    updateRelatedSlotsData: function(slotRec){
        var related = this.getRelatedSlots(slotRec);
        for (var i=0,r ; r=related[i] ; i++){
            this.updateRelatedSlotData(slotRec, r);
        }
    },
    
    updateRelatedSlots: function(slotRec){
        var item = this.locationRec.LocationCatalogItems().getById(slotRec.data.item);
        var element = item.LocationCatalogElements().getById(slotRec.data.element);
        var slots_infos = Sp.ui.data.getCatalogElementSlots(this.locationRec, element, ['packer']);

        // solo slot
        if (slots_infos.jumpers == 1 && slots_infos.workers.length == 0){
            return this.deleteRelatedSlots(slotRec);
        }
        
        var have_related = false;
        var related_data_changed = false;
        var related = this.getRelatedSlots(slotRec);
        
        // adjust slots
        var to_delete = [],
            to_create = [],
            ret;
        
        // one slot is already created
        slots_infos.jumpers -= 1;
        
        // existing slots
        for (var i=0,r ; r = related[i]; i++){
            // workers slots
            if (r.data.worker_type){
                var keep = false;
                Ext.each(slots_infos.workers, function(w){
                    if (w.wt.data.uuid == r.data.worker_type){
                        if (w.count > 0){
                            keep = true;
                            w.count -= 1;
                        }
                    }
                });
                if (keep){
                    ret = this.updateRelatedSlotData(slotRec, r);
                    if (ret && !related_data_changed){
                        related_data_changed = true;
                    }
                } else {
                    to_delete.push(r);
                }
            // jumers slots
            } else {
                if (slots_infos.jumpers > 0){
                    slots_infos.jumpers -= 1;
                    ret = this.updateRelatedSlotData(slotRec, r);
                    if (ret && !related_data_changed){
                        related_data_changed = true;
                    }
                } else {
                    to_delete.push(r);
                }
            }
        }
        
        // add jumpers slots
        for (var i=0 ; i < slots_infos.jumpers ; i++){
            var data = slotRec.getData();
            delete data.uuid;
            data.person = null;
            data.phantom = null;
            data.worker = null;
            data.related_slot = slotRec.data.uuid;
            data.worker_type = null;
            to_create.push(Data.create('Slot', data));
        }
        
        // add workers slots
        Ext.each(slots_infos.workers, function(w){
            // ignore packer role
            /*if (w.wt.data.type == 'packer'){
                return;
            }*/
            for (var i=0 ; i < w.count ; i++){
                var data = slotRec.getData();
                delete data.uuid;
                data.person = null;
                data.phantom = null;
                data.worker = null;
                data.related_slot = slotRec.data.uuid;
                data.worker_type = w.wt.data.uuid;
                to_create.push(Data.create('Slot', data));
            }
        });
        
        if (to_delete.length > 0){
            have_related = true;
            slotRec.store.remove(to_delete);
        }
        
        if (to_create.length > 0){
            have_related = true;
            slotRec.store.add(to_create);
        }
        
        if (related_data_changed){
            have_related = true;
        }
        
        return have_related;
    },
    
    handleRelatedSlots: function(slotRec, operation){
        // process only no related slots
        if (slotRec.data.related_slot){
            return;
        }
        if (operation == 'create'){
            if (!slotRec.data.item){
                return;
            }
            return this.updateRelatedSlots(slotRec);
        } else if (operation == 'update'){
            if (slotRec.data.item){
                return this.updateRelatedSlots(slotRec);
            } else {
                return this.deleteRelatedSlots(slotRec);
            }
        } else if (operation == 'destroy'){
            return this.deleteRelatedSlots(slotRec);
        }
    },
    
    handleAutoAddSlot: function(loadRec, infos){
        infos = infos || this.getSlotsInfos(loadRec);
        // add new slot
        if (infos.created == infos.used && infos.created < infos.total){
            this.addSlot(loadRec, true);
        // an undo operation can leave an extra emtpy
        } else if (infos.created > infos.total){
            var slots_store = loadRec.Slots();
            var to_delete = [];
            slots_store.each(function(s){
                var d = s.data;
                if (!d.related_slot && !d.person && !d.phantom && !d.worker && slots_store.find('related_slot', d.uuid) == -1){
                    to_delete.push(s);
                }
            });
            slots_store.remove(to_delete);
            slots_store.sync();
        }
    },
    
    updateJumpersHeader: function(loadRec, infos){
        if (!this.slots_grids[loadRec.data.uuid]){
            return;
        }
        var header = this.slots_grids[loadRec.data.uuid].down('#jumper');
        if (header){
            infos = infos || this.getSlotsInfos(loadRec);
            var header_text = Sp.lmanager.getLoadHeader(loadRec, this.locationRec, infos);
            header.setText(header_text);
        }
    },
    
    deleteJumpmasterItem: function(loadRec, slotRec){
        var jumpmasterCbx = this.slots_grids[loadRec.data.uuid].down('#jumpmasterCbx');
        var jm_store = jumpmasterCbx.getStore();
        if (jumpmasterCbx.getValue() == slotRec.data.uuid){
            jumpmasterCbx.clearValue();
            loadRec.set('jumpmaster_slot', null);
            this.actionOperation(loadRec, 'save');
        }
        jm_store.remove(jm_store.findRecord('uuid', slotRec.data.uuid));
    },
    
    addJumpmasterItem: function(loadRec, slotRec){
        var jumpmasterCbx = this.slots_grids[loadRec.data.uuid].down('#jumpmasterCbx');
        var jm_store = jumpmasterCbx.getStore();
        if (slotRec.data.person){
            jm_store.add({
                uuid: slotRec.data.uuid,
                name: Sp.ui.misc.formatFullname({data:slotRec.data.person}, Data.me.data.name_order, true),
            });
        } else if (slotRec.data.worker){
            var worker = this.locationRec.Workers().getById(slotRec.data.worker);
            if (worker){
                jm_store.add({
                    uuid: slotRec.data.uuid,
                    name: worker.data.name,
                }); 
            }
        }
    },
    
    handleJumpmaster: function(loadRec, slotRec, operation){
        if (!this.slots_grids[loadRec.data.uuid]){
            return;
        }
        if (operation == 'create'){
            this.addJumpmasterItem(loadRec, slotRec);
        } else if (operation == 'destroy'){
            this.deleteJumpmasterItem(loadRec, slotRec);
        } else if (operation == 'update'){
            // FIXME: edit name instead of destroy/create
            this.deleteJumpmasterItem(loadRec, slotRec);
            this.addJumpmasterItem(loadRec, slotRec);
        }
    },
    
    adjustExitOrders: function(loadRec){
        var store = loadRec.Slots(),
            orders = [];
        // adjust exits
        store.each(function(s){
            if (Ext.isNumber(s.data.exit_order) && orders.indexOf(s.data.exit_order) == -1){
                orders.push(s.data.exit_order);
            }
        });
        orders.sort();
        store.each(function(s){
            if (Ext.isNumber(s.data.exit_order)){
                new_order = orders.indexOf(s.data.exit_order)+1;
                if (new_order != s.data.exit_order){
                    s.set('exit_order', new_order);
                }
            }
        });
        // sort
        store.slotsOrder = 'exit';
        store.sort({sorterFn: Sp.lmanager.slotsSorter});
        // save
        store.sync();
    },
    
    proposeExitOrders: function(loadRec){
        
    },
    
    printLoad: function(loadRec){
        var slots_store = loadRec.Slots();
        var sort = slots_store.slotsOrder || 'exit';
        var print_columns = [];
        var print_data = [];
        var print_title = Ext.String.format("{0} #{1}", TR("Load"), loadRec.data.number);
        var print_header = '';
        var grid = this.slots_grids[loadRec.data.uuid];
        var print_store = Ext.create('store.store', {
            fields: ['name', 'altitude', 'work', 'exit'],
        });
        
        // print columns
        if (sort == 'exit'){
            print_columns.push({
                header: TR("Exit"),
                dataIndex: 'exit',
            });
            print_columns.push({
                header: TR("Name"),
                dataIndex: 'name',
            });
        } else {
            print_columns.push({
                header: TR("Name"),
                dataIndex: 'name',
            });
        }
        print_columns.push({
            header: TR("Altitude"),
            dataIndex: 'altitude',
        });
        print_columns.push({
            header: TR("Work"),
            dataIndex: 'work',
        });
        if (sort == 'name'){
            print_columns.push({
                header: TR("Exit"),
                dataIndex: 'exit',
                width: 50,
                align: 'center',
            });
        }
        
        // load data
        var name_renderer = Ext.bind(grid.down('#jumper').renderer, this);
        var altitude_renderer = Ext.bind(grid.down('#altitude').renderer, this);
        var work_renderer = Ext.bind(grid.down('#jumptype').renderer, this);
        slots_store.each(function(slot){
            print_data.push({
                name: name_renderer(null, null, slot, true),
                altitude: altitude_renderer(null, null, slot),
                work: work_renderer(slot.data.jump_type),
                exit: slot.data.exit_order,
            });
        }, this);
        print_store.loadRawData(print_data);
        
        // header
        var aircraft = this.locationRec.Aircrafts().getById(loadRec.data.aircraft);
        var pilot = this.locationRec.Workers().getById(loadRec.data.pilot);
        var jumpmasterCbx = grid.down('#jumpmasterCbx');
        print_header += Ext.String.format("<br>{0}: {1}<br>", TR("Load number"), loadRec.data.number);
        print_header += Ext.String.format("{0}: {1}<br>", TR("Aircraft"), aircraft.data.registration);
        print_header += Ext.String.format("{0}: {1}<br>", TR("Pilot"), pilot.data.name);
        var jm = jumpmasterCbx.getStore().findRecord('uuid', jumpmasterCbx.getValue());
        print_header += Ext.String.format("{0}: {1}<br>", TR("Jumpmaster"), jm ? jm.data.name : TR("None"));
        print_header += grid.down('#jumper').text + '<br><br>';
        
        // print
        var print_grid = Ext.create('widget.grid', {
            autoRender: true,
            store: print_store,
            columns: print_columns,
        });
        Ext.ux.grid.Printer.documentTitle = print_title;
        Ext.ux.grid.Printer.mainTitle = print_header;
        Ext.ux.grid.Printer.print(print_grid);
    },
    
    onCometMessage: function(record, operation){
        var model = Data.getSpModelName(record);
        if (model == 'Load'){
            if (operation == 'update'){
                var slots_grid = this.slots_grids[record.data.uuid];
                if (slots_grid){
                    if (record.data.state != 'P'){
                        this.clearProblematic(record);
                    }
                    this.loadStateChanged(record);
                    slots_grid.down('#loadNote').setValue(record.data.note);
                    var jumpmasterCbx = slots_grid.down('#jumpmasterCbx');
                    if (record.data.jumpmaster_slot){
                        jumpmasterCbx.setValue(jumpmasterCbx.getStore().findRecord('uuid', record.data.jumpmaster_slot));
                    } else {
                        jumpmasterCbx.clearValue();
                    }
                } 
            }
        } else if (model == 'Slot'){
            var loadRec = this.locationRec.Loads().getById(record.data.load);
            if (loadRec){
                loadRec.afterCommit();
                this.updateJumpersHeader(loadRec);
                //this.validateLoad(loadRec);
                this.handleJumpmaster(loadRec, record, operation);    
            }
        }
    },
    
});
