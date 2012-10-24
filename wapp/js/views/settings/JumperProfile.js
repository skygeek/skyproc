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

Ext.define('Sp.views.settings.JumperProfile', {
    extend: 'Sp.ui.SettingsForm',
        
    initComponent: function() {
        
        Ext.apply(this, {
            
            items: [
                {
                    xtype: 'label',
                    text: this.title,
                    cls: 'page-top-title',
                    
                },
                {
                    xtype:'fieldset',
                    title: TR("Body informations"),
                    defaults: {
                        anchor: '100%'
                    },
                    items:[
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: (function(){
                                var unit = Data.me.data.distance_unit == 'm' ? 'cm' : "ft' in\"";
                                return Ext.String.format("{0} ({1})", TR("Height"), unit);
                            })(),
                            layout: {
                                type: 'hbox',
                            },
                            items: [
                                {
                                    name: 'height_cm',
                                    xtype: 'numberfield',
                                    hidden: Data.me.data.distance_unit != 'm',
                                    flex: 1,
                                    minValue: 0,
                                    maxValue: 999,
                                },
                                {
                                    name: 'height_ft',
                                    xtype: 'combobox',
                                    hidden: Data.me.data.distance_unit != 'us',
                                    width: 110,
                                    store: Ext.create('store.store', {
                                        fields: ['ft'],
                                        data: (function(){
                                            ret = [];
                                            for (var i=1 ; i<10 ; i++){
                                               ret.push({ft: i}); 
                                            }
                                            return ret;
                                        })(),
                                    }),
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    valueField: 'ft',
                                    tpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '<div class="x-boundlist-item">',
                                            "{ft}'",
                                            '</div>',
                                        '</tpl>'
                                    ),
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            "{ft}'",
                                        '</tpl>'
                                    ),
                                },
                                {
                                    name: 'height_in',
                                    xtype: 'combobox',
                                    hidden: Data.me.data.distance_unit != 'us',
                                    width: 110,
                                    store: Ext.create('store.store', {
                                        fields: ['inch'],
                                        data: (function(){
                                            ret = [];
                                            for (var i=1 ; i<12 ; i++){
                                               ret.push({inch: i}); 
                                            }
                                            return ret;
                                        })(),
                                    }),
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    valueField: 'inch',
                                    tpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '<div class="x-boundlist-item">',
                                            '{inch}"',
                                            '</div>',
                                        '</tpl>'
                                    ),
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{inch}"',
                                        '</tpl>'
                                    ),
                                },
                                {
                                    name: Data.me.data.weight_unit == 'kg' ? 'weight_kg' : 'weight_lb',
                                    xtype: 'numberfield',
                                    fieldLabel: Ext.String.format("{0} ({1})", TR("Weight"), Data.me.data.weight_unit),
                                    margin: '0 0 0 20',
                                    labelWidth: 80,
                                    flex: 1,
                                    minValue: 0,
                                    maxValue: 999,
                                },
                            ],
                        },
                    ],
                },
                {
                    xtype:'fieldset',
                    title: TR("Experience"),
                    defaults: {
                        anchor: '100%'
                    },
                    items:[
                        {
                            name: 'past_jumps',
                            xtype: 'numberfield',
                            fieldLabel: TR("Past Jumps"),
                            minValue: 0,
                            maxValue: 99999,
                        },
                        {
                            name: 'jumper_level',
                            xtype: 'combobox',
                            fieldLabel: TR("Jumper Level"),
                            store: Ext.create('store.store', {
                                fields: ['level', 'label'],
                                data: [
                                    {level: 'S', label: TR("Student")},
                                    {level: 'B', label: TR("Beginner")},
                                    {level: 'I', label: TR("Intermediate")},
                                    {level: 'C', label: TR("Confirmed")},
                                    {level: 'E', label: TR("Expert")},
                                ],
                            }),
                            queryMode: 'local',
                            forceSelection: true,
                            editable: false,
                            valueField: 'level',
                            displayField: 'label',
                        },
                    ],
                },
                {
                    xtype:'fieldset',
                    title: TR("Default settings"),
                    defaults: {
                        anchor: '100%',
                        labelWidth: 130,
                    },
                    items:[
                        {
                            name: 'default_jump_type',
                            xtype: 'combobox',
                            fieldLabel: TR("Default Work"),
                            store: Data.jumpTypes,
                            queryMode: 'local',
                            forceSelection: true,
                            editable: false,
                            valueField: 'uuid',
                            displayField: 'label',
                        },
                        {
                            name: 'default_currency',
                            xtype: 'combobox',
                            fieldLabel: TR("Preferred Currency"),
                            store: Data.currencies,
                            queryMode: 'local',
                            forceSelection: true,
                            editable: true,
                            typeAhead: true,
                            valueField: 'uuid',
                            displayField: 'code',
                            lastQuery: '',
                            tpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                    '<div class="x-boundlist-item">{code} - {name}</div>',
                                '</tpl>'
                            ),
                            displayTpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                    '{code} - {name}',
                                '</tpl>'
                            ),
                        },
                    ],
                },
            ],
            
        });
        
        this.callParent(arguments);
        
        // load form
        this.form.loadRecord(Data.me);
        
    },
    
});
