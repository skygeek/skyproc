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

Ext.define('Sp.views.logbook.MainPanel', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        this.sort_field = 'number';
        this.sort_direction = 'DESC';
        
        var locations_filter_menu = [];
        var jump_type_menu = [];
        Data.memberships.each(function(m){
            var l = m.getLocation();
            locations_filter_menu.push({
                location_uuid: l.data.uuid,
                text: l.data.name,
                checked: false,
            });
        });
        Data.jumpTypes.each(function(t){
            jump_type_menu.push({
                jump_type: t.data.label,
                text: TR(t.data.label),
                checked: false,
            });
        });
        
        Ext.apply(this, {
            border: 0,
            layout: 'fit',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                margin: '5 0 0 0',
                defaults: {
                    iconAlign: 'top',
                    scale: 'large',
                },
                items: [
                
                    {
                        text: TR("Add jump"),
                        icon: '/static/images/icons/add_big.png',
                        width: 80,
                        handler: function(){
                            Ext.create('Sp.views.logbook.EditJumpLog', {
                                store: this.down('#jumpsGrid').getStore(),
                            }).show();
                        },
                        scope: this,
                    },
                    '->',
                    {
                        text: TR("Import"),
                        icon: '/static/images/icons/import.png',
                        width: 60,
                        disabled: true,
                    },
                    {
                        text: TR("Export"),
                        icon: '/static/images/icons/export.png',
                        width: 60,
                        disabled: true,
                    },
                ]
            }],
            items: [
                {
                    xtype: 'grid',
                    itemId: 'jumpsGrid',
                    margin: '5 0 0 0',
                    store: Data.createStore('JumpLog', {
                        buffered: true,
                        pageSize: 70,
                        remoteSort: true,
                        sorters: [
                            {
                                property: 'number',
                                direction: 'DESC'
                            },
                        ],
                        remoteFilter: true,
                        listeners: {
                            datachanged: function(me){
                                var total = me.getTotalCount();
                                var count = me.getCount();
                                if (total < count){
                                    total = count;
                                } 
                                if (me.filters.getCount() == 0){
                                    this.down('#totalJumpsLabel').setText(TR("Total Jumps"));
                                    total += Data.me.data.past_jumps;
                                } else {
                                    this.down('#totalJumpsLabel').setText(Ext.String.format('{0} ({1})', TR("Total Jumps"), TR("filtred")));                                    
                                }
                                this.down('#totalJumpsValue').setText(total);
                            },
                            scope: this,
                        },
                    }),
                    tbar: [
                        {
                            xtype: 'image',
                            src: '/static/images/icons/calendar_month.png',
                            width: 16,
                            height: 16,
                            margin: '0 5 0 0',
                        },
                        {
                            xtype: 'label',
                            text: TR("From"),
                            cls: 'x-toolbar-text',
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
                            cls: 'x-toolbar-text',
                        },
                        {
                            xtype: 'datefield',
                            itemId: 'endDate',
                            width: 140,
                        },
                        '-',
                        {
                            text: TR("Show Log"),
                            icon: '/static/images/icons/generate.png',
                            handler: function(){
                                this.generate();
                            },
                            scope: this,
                        },
                        '->',
                        {
                            text: TR("Filter Log"),
                            icon: '/static/images/icons/filter.png',
                            menu: [
                                {
                                    text: TR("Filter by Dropzone"),
                                    icon: '/static/images/icons/location.png',
                                    itemId: 'locationFilter',
                                    menu: locations_filter_menu,
                                },
                                {
                                    text: TR("Filter by Program"),
                                    icon: '/static/images/icons/aff_inst.png',
                                    itemId: 'jumpTypeFilter',
                                    menu: jump_type_menu,
                                },
                                {
                                    text: TR("Filter by Aircraft"),
                                    icon: '/static/images/icons/plane_small.png',
                                    menu: [
                                        {
                                            xtype: 'textfield',
                                            itemId: 'aircraftType',
                                            emptyText: TR("Enter aircraft type"),
                                            width: 260,
                                        },
                                    ],
                                },
                                {
                                    text: TR("Filter by note"),
                                    icon: '/static/images/icons/note_edit.png',
                                    menu: [
                                        {
                                            xtype: 'textfield',
                                            itemId: 'noteText',
                                            emptyText: TR("Enter note text"),
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
                    columns: [
                        {
                            dataIndex: 'number',
                            header: TR("N°"),
                            align: 'center',
                            width: 45,
                            
                        },
                        {
                            dataIndex: 'date',
                            xtype: 'datecolumn',
                            format: Data.me.data.date_format,
                            header: TR("Date"),
                            width: 150,
                        },
                        {
                            dataIndex: 'location_name',
                            header: TR("Dropzone"),
                            width: 150,
                        },
                        {
                            dataIndex: 'aircraft_type',
                            header: TR("Aircraft"),
                            width: 90,
                        },
                        {
                            dataIndex: 'altitude',
                            header: TR("Altitude"),
                            align: 'center',
                            width: 70,
                        },
                        {
                            dataIndex: 'jump_type',
                            header: TR("Jump Program"),
                            align: 'center',
                            width: 120,
                        },
                        {
                            dataIndex: 'note',
                            header: TR("Note"),
                            flex: 1,
                        },
                    ],
                    bbar: [
                        '->',
                        {
                            xtype: 'label',
                            itemId: 'totalJumpsLabel',
                            cls: 'x-toolbar-text',
                            style: {
                                'font-size': '14px',
                            },
                        },
                        {
                            xtype: 'label',
                            itemId: 'totalJumpsValue',
                            cls: 'bold',
                            style: {
                                'font-size': '16px',
                            },
                            margin: '0 20 0 0',
                        },
                    ],
                    listeners: {
                        sortchange: function(ct, col){
                            this.sort_field = col.dataIndex;
                            this.sort_direction = col.sortState;
                        },
                        itemcontextmenu: this.onJumpContextMenu,
                        itemdblclick: function(me, r, el){
                            Ext.create('Sp.views.logbook.EditJumpLog', {
                                jumpLog: r,
                            }).show();
                        },
                        scope: this,
                    },
                },
            ],
        });
        this.callParent(arguments);
    },
    
    generate: function(){
        var startDate_field = this.down('#startDate');
        var endDate_field = this.down('#endDate');
        var startDate = startDate_field.getValue();
        var endDate = endDate_field.getValue();
        if ((startDate && !startDate_field.validate()) || (endDate && !endDate_field.validate())){
            return;
        }
        var store = this.down('#jumpsGrid').getStore();
        var filters = [];
        var sorters = [];
        
        // date filter
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
        
        // location filter
        var locations = [];
        this.down('#locationFilter').menu.items.each(function(i){
            if (i.checked){
                locations.push(i.location_uuid);
            }
        });
        if (locations.length > 0){
            filters.push({
                property: 'location__in',
                value: locations,
            });
        }
        
        // jump type filter
        var jumptypes = [];
        this.down('#jumpTypeFilter').menu.items.each(function(i){
            if (i.checked){
                jumptypes.push(i.jump_type);
            }
        });
        if (jumptypes.length > 0){
            filters.push({
                property: 'jump_type__in',
                value: jumptypes,
            });
        }
        
        // aircraft
        var aircraft = this.down('#aircraftType').getValue();
        if (aircraft){
            filters.push({
                property: 'aircraft_type__icontains',
                value: aircraft,
            });
        }
        
        // note
        var note = this.down('#noteText').getValue();
        if (note){
            filters.push({
                property: 'note__icontains',
                value: note,
            });
        }
        
        // sort
        sorters.push({
            property : this.sort_field,
            direction: this.sort_direction,
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
        this.down('#locationFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#jumpTypeFilter').menu.items.each(function(i){
            i.setChecked(false);
        });
        this.down('#aircraftType').setValue('');
        this.down('#noteText').setValue('');
    },
    
    onJumpContextMenu: function(grid, record, el, idx, ev){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        Ext.create('Sp.views.logbook.EditJumpLog', {
                            jumpLog: record,
                        }).show();
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Remove"),
                    icon: '/static/images/icons/ban.png',
                    handler: function(){
                        Ext.MessageBox.confirm(
                            TR("Confirmation"),
                            Ext.String.format(TR("Remove log entry for jump n° {0} ?"), record.data.number),
                            function(btn){
                                if (btn == 'yes'){
                                    Sp.utils.rpc('archive.delete_jump', record.data.uuid);
                                    grid.getStore().remove(record);
                                }
                            },
                            this
                        );                      
                    },
                    scope: this,
                },
            ],
        });
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
});
