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

Ext.define('Sp.views.lmanager.Ressources', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        this.res_stores = Sp.ui.data.getActiveRessources(this.locationRec);
        
        Ext.apply(this, {
            width: 580,
            height: 420,
            modal: true,
            resizable: false,
            title: TR("Resources") + ' - ' + this.locationRec.data.name,
            icon: '/static/images/icons/sheet.png',
            layout: {
                type: 'hbox',
                align: 'stretch',
            },
            defaults: {
                flex: 1,
                layout: 'fit',
            },
            bodyPadding: Sp.core.Globals.WINDOW_MARGIN,
            items: [
                {
                    xtype: 'fieldset',
                    title: TR("Select active aircrafts"),
                    margin: '0 8 0 0',
                    items: [
                        {
                            xtype: 'grid',
                            itemId: 'aircraftsGrid',
                            store: this.locationRec.Aircrafts(),
                            selModel: Ext.create('Ext.selection.CheckboxModel', {
                                checkOnly: true,
                                injectCheckbox: 'last',
                            }),
                            columns: [
                                {
                                    dataIndex: 'registration',
                                    header: TR("Aircrafts"),
                                    flex: 1,
                                },
                            ],
                            listeners: {
                                afterlayout: function(me){
                                    me.getSelectionModel().select(this.res_stores.aircrafts.getRange());
                                },
                                scope: this,
                            },
                        },
                    ],
                },
                {
                    xtype: 'fieldset',
                    title: TR("Select active staff members"),
                    margin: 0,
                    items: [
                        {
                            xtype: 'grid',
                            itemId: 'workersGrid',
                            store: this.locationRec.Workers(),
                            selModel: Ext.create('Ext.selection.CheckboxModel', {
                                checkOnly: true,
                                injectCheckbox: 'last',
                            }),
                            columns: [
                                {
                                    dataIndex: 'name',
                                    header: TR("Staff Members"),
                                    flex: 1,
                                },
                            ],
                            listeners: {
                                afterlayout: function(me){
                                    me.getSelectionModel().select(this.res_stores.workers.getRange());
                                },
                                scope: this,
                            },
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Ok"),
                    icon: '/static/images/icons/save.png',
                    handler: this.apply,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    itemId: 'cancelBt',
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
    },
    
    apply: function(){
        var grids = ['#aircraftsGrid', '#workersGrid'],
            grid, store, sel_model;
        for (var i=0,g ; g=grids[i] ; i++){
            grid = this.down(g);
            store = grid.getStore();
            sel_model = grid.getSelectionModel();
            store.each(function(r){
                var selected = sel_model.isSelected(r);
                if (selected != r.data.available_fulltime){
                    r.set('available_fulltime', selected);
                    r.save();
                }
            });    
        }
        this.planner.res_stores = Sp.ui.data.getActiveRessources(this.locationRec);
        this.workersGrid.getView().bindStore(this.planner.res_stores.workers);
        this.updateCurrentLocation();
        this.close();
    },
                
});

