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


Ext.define('Sp.views.locations.FormAircrafts', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;
        
        var aircrafts_store = this.locationRec.Aircrafts();
        aircrafts_store.clearFilter(true);
        
        aircrafts_store.sort([
            { property: 'registration',  direction: 'ASC' },
        ]);
                
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'fit',
            },
            items: [
                {
                    xtype: 'container',
                    itemId: 'ctx',
                    padding: '10 10 5 10',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'grid',
                            itemId: 'grid',
                            flex: 1,
                            store: aircrafts_store,
                            selModel: Ext.create('Ext.selection.CheckboxModel'),
                            sortableColumns: false,
                            enableColumnHide: false,
                            columns: [
                                {
                                    dataIndex: 'registration',
                                    header: TR("Registration"),
                                    width: 150,
                                    sortable: true,
                                },
                                {
                                    dataIndex: 'type',
                                    header: TR("Type"),
                                    sortable: true,
                                    flex: 1,
                                },
                                {
                                    dataIndex: 'min_slots',
                                    header: TR("Minimum Slots"),
                                    width: 110,
                                    align: 'center',
                                    sortable: true,
                                },
                                {
                                    dataIndex: 'max_slots',
                                    header: TR("Maximum Slots"),
                                    width: 110,
                                    align: 'center',
                                    sortable: true,
                                },
                                {
                                    header: TR("Available"),
                                    width: 80,
                                    renderer: function(value, metaData, record){
                                        if (record.data.available_fulltime){
                                            return "<img src='/static/images/icons/available.png'/> " + TR("Yes");  
                                        } else {
                                            return "<img src='/static/images/icons/unavailable.png'/> " + TR("No");
                                        }
                                    },
                                },
                            ],
                            tbar: [
                                '->',
                                {
                                    text: TR("New Aircraft"),
                                    icon: '/static/images/icons/new_green.png',
                                    handler: this.addAircraft,
                                    scope: this,
                                },
                                {
                                    itemId: 'actionBt',
                                    text: TR("With selected"),
                                    icon: '/static/images/icons/action.png',
                                    disabled: true,
                                    menu: [
                                        {
                                            itemId: 'edit',
                                            text: TR("Edit"),
                                            icon: '/static/images/icons/edit.png',
                                            handler: this.editSelectedAircraft,
                                            scope: this,
                                        },
                                        '-',
                                        {
                                            itemId: 'delBt',
                                            text: TR("Delete"),
                                            icon: '/static/images/icons/trash.png',
                                            handler: this.deleteSelectedAircrafts,
                                            scope: this,
                                        },
                                    ],
                                },
                            ],
                            listeners: {
                                itemdblclick: Ext.bind(this.onAircraftDblClick, this),
                                itemcontextmenu: Ext.bind(this.onAircraftContextMenu, this),
                            },
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
        // events
        this.query("#ctx #grid")[0].getSelectionModel().on('selectionchange', Ext.bind(this.aircraftSelectionChanged, this));
    },
    
    
    addAircraft: function(){
        this.editAircraft();
    },
    
    onAircraftDblClick: function(me, r, el){
        this.editAircraft(r);
    },
    
    aircraftSelectionChanged: function(sm, selected){
        var action_bt = this.down('#actionBt');
        action_bt.setDisabled((selected.length == 0));
        action_bt.menu.getComponent('edit').setDisabled((selected.length != 1));
    },
    
    editSelectedAircraft: function(){
        this.editAircraft(this.down('#grid').getSelectionModel().getSelection()[0]);
    },
        
    deleteSelectedAircrafts: function(){
        var selected = this.down("#grid").getSelectionModel().getSelection();
        var msg;
        if (selected.length == 0){
            return;
        } else if (selected.length == 1){
            msg = Ext.String.format(
                TR("Are you sure you want to remove the aircraft registred as {0} ?"), 
                selected[0].data.registration);
        } else {
            msg = Ext.String.format(
                TR("Are you sure you want to remove the {0} selected aircrafts ?"), 
                selected.length);
        }
        Ext.MessageBox.confirm( TR("Confirmation"), msg,
            function(btn){
                if (btn == 'yes'){
                    this.locationRec.Aircrafts().remove(selected);
                }
            }, this
        );
    },
    
    editAircraft: function(record){
        var w = Ext.create('Sp.views.locations.EditAircraft', {
            locationRec: this.locationRec,
            aircraftRec: record
        });
        w.show();
    },
    
    onAircraftContextMenu: function(grid, record, el, idx, ev){
        
        /*var availability_menu = [];
        if (record.data.available_fulltime){
            availability_menu.push({
                text: TR("Set unavailable"),
                icon: '/static/images/icons/unavailable.png',
            });
            availability_menu.push('-');
            availability_menu.push({
                text: TR("Set unavailable for today only"),
                icon: '/static/images/icons/calendar_one_off.png',
            });
        } else {
            availability_menu.push({
                text: TR("Set available"),
                icon: '/static/images/icons/available.png',
            });
            availability_menu.push('-');
            availability_menu.push({
                text: TR("Set available for today only"),
                icon: '/static/images/icons/calendar_one.png',
            });
        }*/
        
        // context menu
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editAircraft(record);                                              
                    },
                    scope: this,
                },
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        Ext.MessageBox.confirm(
                            TR("Confirmation"),
                            Ext.String.format(
                                TR("Are you sure you want to remove the aircraft registred as {0} ?"), 
                                record.data.registration),
                            function(btn){
                                if (btn == 'yes'){
                                    this.locationRec.Aircrafts().remove(record);
                                }
                            }, this
                        );
                    },
                    scope: this,
                },
                /*'-',
                {
                    text: TR("Change availability"),
                    icon: '/static/images/icons/datetime.png',
                    menu: availability_menu,
                },*/
            ]
        });
        
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    post_save: function(){
        var store = this.locationRec.Aircrafts();
        store.sync({
            success: function(){
                store.each(function(a){
                    a.ExitRules().sync();
                });
            },
        });
    },
    
    reject: function(){
        var store = this.locationRec.Aircrafts();
        store.rejectChanges();
        store.each(function(a){
            a.ExitRules().rejectChanges();
        });
    },
    
});
