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


Ext.define('Sp.views.locations.MemberBoard', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 600,
            height: 600,
            modal: true,
            maximizable: true,
            title: TR("Boarding Panel"),
            icon: '/static/images/icons/display.png',
            layout: {
                type: 'vbox',
                align: 'stretch',
            },
            items: [
                {
                    xtype: 'toolbar',
                    items: [
                        {
                            itemId: 'previousLoadBt',
                            icon: '/static/images/icons/previous_blue.png',
                            tooltip: TR("Show previous load"),
                            handler: function(me){
                                var loadsCbx = this.down('#loadsCbx');
                                var store = loadsCbx.getStore();
                                var position = store.find('uuid', loadsCbx.getValue());
                                position--;
                                loadsCbx.setValue(store.getAt(position));
                                if (position == 0){
                                    me.disable();
                                }
                                this.down('#nextLoadBt').enable();
                            },
                            scope: this, 
                        },
                        {
                            itemId: 'nextLoadBt',
                            icon: '/static/images/icons/next_blue.png',
                            tooltip: TR("Show next load"),
                            handler: function(me){
                                var loadsCbx = this.down('#loadsCbx');
                                var store = loadsCbx.getStore();
                                var position = store.find('uuid', loadsCbx.getValue());
                                position++;
                                loadsCbx.setValue(store.getAt(position));
                                if (position == store.getCount()-1){
                                    me.disable();
                                }
                                this.down('#previousLoadBt').enable();
                            },
                            scope: this, 
                        },
                        {
                            xtype: 'combobox',
                            itemId: 'loadsCbx',
                            valueField: 'uuid',
                            queryMode: 'local',
                            forceSelection: true,
                            editable: false,
                            width: 110,
                            tpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                    '<div class="x-boundlist-item">',
                                    TR("Load n°") + " {number}",
                                    '</div>',
                                '</tpl>'
                            ),
                            displayTpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                    TR("Load n°") + " {number}",
                                '</tpl>'
                            ),
                            listeners: {
                                afterrender: function(me){
                                    var store = me.getStore();
                                    var count = store.getCount();
                                    if (count > 0){
                                        me.setValue(store.getAt(0));
                                        this.down('#previousLoadBt').disable();
                                        if (count == 1){
                                            this.down('#nextLoadBt').disable();
                                        }
                                    } else {
                                        this.down('#previousLoadBt').disable();
                                        this.down('#nextLoadBt').disable();
                                    }
                                },
                                select: function(me, recs){
                                    var store = me.getStore();
                                    var position = store.indexOf(recs[0]);
                                    var count = store.getCount();
                                    if (position == 0){
                                        this.down('#previousLoadBt').disable();
                                        this.down('#nextLoadBt').setDisabled(count == 1);
                                    } else if (position == count-1){
                                        this.down('#nextLoadBt').disable();
                                        this.down('#previousLoadBt').setDisabled(count == 1);
                                    } else if (position != -1){
                                        this.down('#previousLoadBt').enable();
                                        this.down('#nextLoadBt').enable();
                                    }
                                },
                                change: function(me, val){
                                    this.showLoad(val);
                                },
                                scope: this,
                            },
                        },
                        '-',
                        {
                            xtype: 'checkbox',
                            itemId: 'iaminOnly',
                            boxLabel: TR("Only loads I'm in"),
                            cls: 'x-toolbar-text',
                            checked: true,
                            listeners: {
                                change: function(me, val){
                                    this.down('#searchText').setDisabled(val);
                                    this.down('#searchBt').setDisabled(val);
                                    if (val){
                                        this.down('#searchText').setValue('');
                                    }
                                    this.loadData();
                                },
                                scope: this,
                            }, 
                        },
                        '-',
                        {
                            xtype: 'textfield',
                            itemId: 'searchText',
                            emptyText: TR("Search for a jumper"),
                            width: 140,
                            listeners: {
                                specialkey: function(me, e){
                                    if (e.getKey() == e.ENTER){
                                        this.loadData();
                                    }
                                },
                                scope: this,
                            }, 
                        },
                        {
                            xtype: 'button',
                            itemId: 'searchBt',
                            icon: '/static/images/icons/search.png',
                            tooltip: TR("Search"),
                            handler: function(){
                                this.loadData();
                            },
                            scope: this,
                        },
                    ],
                },
                {
                    xtype: 'grid',
                    itemId: 'slotsGrid',
                    flex: 1,
                    sortableColumns: false,
                    enableColumnMove: false,
                    enableColumnHide: false,
                    enableColumnResize: false,
                    dockedItems: [{
                        xtype: 'toolbar',
                        itemId: 'slotsTb',
                        dock: 'top',
                        items: [
                            {
                                xtype: 'label',
                                itemId: 'loadNote',
                            },
                        ],
                    }],
                    columns: [
                        {
                            header: TR("Exit"),
                            dataIndex: 'exit_order',
                            width: 60,
                            align: 'center',
                        },
                        {
                            header: TR("Name"),
                            flex: 1,
                            renderer: function(v,o,r){
                                return Sp.lmanager.getSlotJumperName(r, this.locationRec);
                            },
                            scope: this,
                        },
                        {
                            header: TR("Jump Program"),
                            flex: 1,
                            renderer: function(v,o,r){
                                return Sp.lmanager.getSlotJumpProgram(this.currentLoad, r, this.locationRec);
                            },
                            scope: this,
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Close"),
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
        
        this.callParent(arguments);
        this.loadData();
    },
    
    loadData: function(){
        var loadsCbx = this.down('#loadsCbx');
        var source_loads_store = this.locationRec.Loads();
        var source_loads_data = source_loads_store.snapshot || source_loads_store.data;
        var loads_store = Data.createStore('Load');
        var iaminOnly = this.down('#iaminOnly').getValue();
        var searchText = this.down('#searchText').getValue();
        // pick loads
        source_loads_data.each(function(l){
            if (l.data.state != 'B'){
                return;
            }
            if (iaminOnly || searchText.length > 0){
                var match = false, re;
                if (!iaminOnly){
                    var re = new RegExp(searchText, 'i');
                }
                l.Slots().each(function(s){
                    if (iaminOnly){
                        if (s.data.person && s.data.person.uuid == Data.me.data.uuid){
                            match = true;
                            return false;
                        }
                    } else {
                        var name = null;
                        if (s.data.person){
                            name = s.data.person.first_name + ' ' + s.data.person.last_name;
                        } else if (s.data.phantom){
                            name = s.data.phantom.name;
                        } else if (s.data.worker){
                            var worker = this.locationRec.Workers().getById(s.data.worker);
                            if (worker){
                                name = worker.data.name;
                            }
                        }
                        if (name !== null && re.test(name)){
                            match = true;
                            return false;
                        }
                    }
                }, this);
                if (!match){
                    return;
                }
            }
            l.Slots().sort({sorterFn: Sp.lmanager.slotsSorter});
            loads_store.add(l);
        }, this);
        
        var count = loads_store.getCount();
        
        if (count == 0){
            Sp.ui.misc.warnMsg(TR("No matching load(s) found"), TR("No loads"));
            return;
        }
        
        loadsCbx.bindStore(loads_store);
        
        var current;
        // current visible load is still in the list, keep it visible and update buttons via loadsCbx select handler
        if (this.currentLoad && (current = loads_store.getById(this.currentLoad.data.uuid))){
            loadsCbx.fireEvent('select', loadsCbx, [current]);
        } else { // select the first load in the list
            current = loads_store.getAt(0);
            loadsCbx.setValue(current);
            loadsCbx.fireEvent('select', loadsCbx, [current]);
        }
        
    },
    
    showLoad: function(load_uuid){
        var loadRec = this.locationRec.Loads().getById(load_uuid);
        if (!loadRec){
            return;
        }
        this.currentLoad = loadRec;
        var slotsGrid = this.down('#slotsGrid');
        var slotsTb = this.down('#slotsTb');
        var loadNote = this.down('#loadNote');
        slotsGrid.getView().bindStore(loadRec.Slots());
        if (loadRec.data.note && loadRec.data.note.length > 0){
            slotsTb.show();
            loadNote.setText(loadRec.data.note);
        } else {
            slotsTb.hide();
        }
        var header_text = [];
        var aircraft = this.locationRec.Aircrafts().getById(loadRec.data.aircraft);
        var pilot = this.locationRec.Workers().getById(loadRec.data.pilot);
        header_text.push(Ext.String.format("{0} ({1})", aircraft.data.registration, pilot.data.name));
        if (loadRec.data.timer>0){
            header_text.push(Ext.String.format("{0} {1}", TR("Boarding in"), 
                            Sp.lmanager.getTimerLabel(loadRec.data.timer)));
        }
        header_text.push(Sp.lmanager.getLoadHeader(loadRec, this.locationRec));
        slotsGrid.setTitle(header_text.join(' - '));
    },
            
});
