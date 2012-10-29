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


Ext.define('Sp.views.locations.EditAircraft', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        if (this.aircraftRec){
            var rec = this.aircraftRec;
            var title = rec.data.registration + ' - ' + TR("Edit aircraft");
            var ok_text = TR("Apply");
        } else {
            this.aircraftRec = Data.create('Aircraft', {
                location: this.locationRec.data.uuid,
                altitude_unit: Data.me.data.altitude_unit,
                weight_unit: Data.me.data.weight_unit,
            });
            var rec = this.aircraftRec;
            var title = TR("New aircraft");
            var ok_text = TR("Add");
            this.new_aircraft = true;
        }
        
        this.exitRulesEditing = Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        });
        
        Ext.apply(this, {
            width: 630,
            height: 550,
            modal: true,
            resizable: false,
            title: title,
            layout: 'fit',
            
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'tabpanel',
                            itemId: 'tabs',
                            layout: 'anchor',
                            items: [
                                {
                                    itemId: 'id',
                                    title: TR("Aircraft"),
                                    icon: '/static/images/icons/plane_small.png',
                                    padding: '5 5 0 5',
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Identification informations"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'type',
                                                    xtype: 'textfield',
                                                    fieldLabel: TR("Model"),
                                                    allowBlank: false,
                                                },
                                                {
                                                    name: 'registration',
                                                    xtype: 'textfield',
                                                    fieldLabel: TR("Registration"),
                                                    allowBlank: false,
                                                },
                                                {
                                                    name: 'name',
                                                    xtype: 'textfield',
                                                    fieldLabel: TR("Name"),
                                                    emptyText: TR("Optionnal name"),
                                                },
                                                {
                                                    name: 'description',
                                                    xtype: 'textarea',
                                                    fieldLabel: TR("Description"),
                                                    emptyText: TR("Optionnal details"),
                                                    rows: 2,
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Capabilities"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            items: [
                                                {
                                                    name: 'max_slots',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Max Slots"),
                                                    minValue: 1,
                                                    maxValue: 999,
                                                    allowBlank: false,
                                                },
                                                /*{
                                                    name: 'max_altitude',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Max Altitude"),
                                                    minValue: 0,
                                                    maxValue: 99999,
                                                    step: 100,
                                                },
                                                {
                                                    name: 'altitude_unit',
                                                    xtype: 'combobox',
                                                    fieldLabel: TR("Altitude unit"),
                                                    store: Ext.create('Ext.data.Store', {
                                                        fields: ['unit', 'label'],
                                                        data : [
                                                            {unit:'m', label: TR("Meters (m)")},
                                                            {unit:'ft', label: TR("Feet (ft)")},
                                                        ]
                                                    }),
                                                    queryMode: 'local',
                                                    forceSelection: true,
                                                    editable: false,
                                                    displayField: 'label',
                                                    valueField: 'unit',
                                                },*/
                                                {
                                                    name: 'gross_weight',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Gross Weight"),
                                                    minValue: 0,
                                                    maxValue: 99999,
                                                    step: 10,
                                                },
                                                {
                                                    name: 'weight_unit',
                                                    xtype: 'combobox',
                                                    fieldLabel: TR("Weight unit"),
                                                    store: Ext.create('Ext.data.Store', {
                                                        fields: ['unit', 'label'],
                                                        data : [
                                                            {unit:'kg', label: TR("Kilograms (kg)")},
                                                            {unit:'lb', label: TR("Pounds (lb)")},
                                                        ]
                                                    }),
                                                    queryMode: 'local',
                                                    forceSelection: true,
                                                    editable: false,
                                                    displayField: 'label',
                                                    valueField: 'unit',
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Efficiency thresholds"),
                                            defaults: {
                                                anchor: '100%',
                                                labelWidth: 110,
                                            },
                                            items: [
                                                {
                                                    name: 'min_slots',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Minimum Slots"),
                                                    minValue: 1,
                                                    maxValue: 999,
                                                },
                                                {
                                                    xtype: 'fieldcontainer',
                                                    fieldLabel: "<span class='disabled-text'>" + TR("Minimum Income") + "</span>",
                                                    layout: {
                                                        type: 'hbox',
                                                    },
                                                    items: [
                                                        {
                                                            name: 'min_income',
                                                            xtype: 'numberfield',
                                                            flex: 1,
                                                        },
                                                        {
                                                            name: 'min_income_currency',
                                                            xtype: 'combobox',
                                                            width: 100,
                                                            store: this.locationRec.Currencies(),
                                                            queryMode: 'local',
                                                            displayField: 'code',
                                                            valueField: 'uuid',
                                                            forceSelection: true,
                                                            lastQuery: '',
                                                        },
                                                    ],
                                                },
                                                
                                            ],
                                        },
                                    ],
                                },
                                {
                                    title: "<span class='disabled-text'>" + TR("Timings") + "</span>",
                                    icon: '/static/images/icons/chrono.png',
                                    padding: '5 5 0 5',
                                    layout: {
                                        type: 'vbox',
                                        align: 'stretch',
                                    },
                                    items: [
                                        {
                                            xtype: 'container',
                                            layout: {
                                                type: 'vbox',
                                                align: 'center',
                                            },
                                            items: [
                                                {
                                                    xtype: 'button',
                                                    text: TR("Calculate average values from archived data"),
                                                    icon: '/static/images/icons/calculator.png',
                                                    padding: 5,
                                                    margin: '10 0 10 0',
                                                    disabled: true,
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Flight timings"),
                                            defaults: {
                                                anchor: '100%',
                                                labelWidth: 230,
                                            },
                                            items: [
                                                {
                                                    name: 'climb_time',
                                                    xtype: 'numberfield',
                                                    fieldLabel: Ext.String.format(
                                                        TR("Time to climb 1000 {0} (in seconds)"), rec.data.altitude_unit),
                                                    minValue: 0,
                                                    maxValue: 9999,
                                                },
                                                {
                                                    name: 'descent_time',
                                                    xtype: 'numberfield',
                                                    fieldLabel: Ext.String.format(
                                                        TR("Time to descend 1000 {0} (in seconds)"), rec.data.altitude_unit),
                                                    minValue: 0,
                                                    maxValue: 9999,
                                                },
                                                {
                                                    name: 'takeoff_time',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Taxiing time (in minutes)"),
                                                    minValue: 0,
                                                    maxValue: 9999,
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Refuel timings"),
                                            defaults: {
                                                anchor: '100%',
                                                labelWidth: 230,
                                            },
                                            items: [
                                                {
                                                    name: 'refuel_time',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Refueling time (in minutes)"),
                                                    minValue: 0,
                                                    maxValue: 999,
                                                },
                                                {
                                                    name: 'lifts_per_refuel',
                                                    xtype: 'numberfield',
                                                    fieldLabel: TR("Number of lifts between each refuel"),
                                                    minValue: 0,
                                                    maxValue: 999,
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Exit timings"),
                                            layout: 'fit',
                                            flex: 1,
                                            items: [
                                                {
                                                    xtype: 'grid',
                                                    store: rec.ExitRules(),
                                                    sortableColumns: false,
                                                    enableColumnHide: false,
                                                    enableColumnResize: false,
                                                    selModel: {
                                                        selType: 'cellmodel'
                                                    },
                                                    plugins: [this.exitRulesEditing],
                                                    tbar: [{
                                                        text: TR("Add"),
                                                        icon: '/static/images/icons/new_blue.png', 
                                                        handler : function(){
                                                            var idx = 0;
                                                            var r = Data.create('ExitRule');
                                                            this.aircraftRec.ExitRules().insert(idx, r);
                                                            this.exitRulesEditing.startEditByPosition({row: idx, column: 0});
                                                        },
                                                        scope: this,
                                                    }],
                                                    columns: [
                                                        {
                                                            dataIndex: 'altitude',
                                                            header: Ext.String.format(TR("Altitude ({0})"), rec.data.altitude_unit),
                                                            flex: 1,
                                                            align: 'center',
                                                            editor: {
                                                                xtype: 'numberfield',
                                                                allowBlank: false,
                                                                minValue: 0,
                                                                maxValue: 99999,
                                                                listeners: {
                                                                    focus: function(me){
                                                                        me.selectText();
                                                                    },
                                                                    scope: this,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            dataIndex: 'max_exits',
                                                            header: TR("Maximum Exits"),
                                                            flex: 1,
                                                            align: 'center',
                                                            editor: {
                                                                xtype: 'numberfield',
                                                                allowBlank: false,
                                                                minValue: 0,
                                                                maxValue: 999,
                                                                listeners: {
                                                                    focus: function(me){
                                                                        me.selectText();
                                                                    },
                                                                    scope: this,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            dataIndex: 'wait_time',
                                                            header: TR("Wait Interval (sec)"),
                                                            flex: 1,
                                                            align: 'center',
                                                            editor: {
                                                                xtype: 'numberfield',
                                                                allowBlank: false,
                                                                minValue: 0,
                                                                maxValue: 999,
                                                                listeners: {
                                                                    focus: function(me){
                                                                        me.selectText();
                                                                    },
                                                                    scope: this,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            dataIndex: 'alignment_time',
                                                            header: TR("Realignment Time (sec)"),
                                                            flex: 1,
                                                            align: 'center',
                                                            editor: {
                                                                xtype: 'numberfield',
                                                                minValue: 0,
                                                                maxValue: 9999,
                                                                listeners: {
                                                                    focus: function(me){
                                                                        me.selectText();
                                                                    },
                                                                    scope: this,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            xtype: 'actioncolumn',
                                                            width: 20,
                                                            items: [
                                                                {
                                                                    icon: '/static/images/icons/delete.png',
                                                                    tooltip: 'Delete',
                                                                    handler: function(grid, rowIndex, colIndex) {
                                                                        this.aircraftRec.ExitRules().removeAt(rowIndex);
                                                                    },
                                                                    scope: this,
                                                                }
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    title: TR("Availability"),
                                    icon: '/static/images/icons/calendar_small.png',
                                    padding: '15 0 0 10',
                                    items: [
                                        {
                                            name: 'available_fulltime',
                                            xtype: 'checkbox',
                                            boxLabel: TR("This aircraft is available full time"),
                                            checked: true,
                                       },
                                    ],
                                },
                                {
                                    title: "<span class='disabled-text'>" + TR("Pilots") + "</span>",
                                    icon: '/static/images/icons/pilot.png',
                                    padding: '15 0 0 10',
                                    items: [
                                        {
                                            name: 'unrestricted_pilots',
                                            xtype: 'checkbox',
                                            boxLabel: TR("All available pilots can fly this aircraft"),
                                            checked: true,
                                       },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: ok_text,
                    itemId: 'okBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.save,
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
        this.down('#form').form.loadRecord(this.aircraftRec);
    },
    
    save: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        var store = this.locationRec.Aircrafts();
        var reg = form.findField('registration').getValue();
        var r = store.findRecord('registration', reg);
        if (r && r.data.uuid != this.aircraftRec.data.uuid){
            Sp.ui.misc.errMsg(Ext.String.format(TR("Registration number '{0}' is already in use"), reg));
            return;
        }
        form.updateRecord();
        if (this.new_aircraft){
            store.add(this.aircraftRec);
        } else {
            this.aircraftRec.afterCommit();
        }
        this.close();
    },
    
});
