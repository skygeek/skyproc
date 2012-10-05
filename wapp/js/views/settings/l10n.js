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

Ext.define('Sp.views.settings.l10n', {
    extend: 'Sp.ui.SettingsForm',
        
        
    initComponent: function() {
    	    	
    	var date_formats = [
    		['F j, Y', ""],
    		['j F Y', ""],
    		['j. F Y', ""],
    		['D, M j, Y', ""],
    		['D, j M Y', ""],
    		['l, F j, Y', ""],
    		['l, j F Y', ""],
    		['m/d/Y', TR("(M/D/Y)")],
    		['d/m/Y', TR("(D/M/Y)")],
    		['Y/m/d', TR("(Y/M/D)")],
    		['m-d-Y', TR("(M-D-Y)")],
    		['d-m-Y', TR("(D-M-Y)")],
    		['Y-m-d', TR("(Y-M-D)")],
    		['m.d.Y', TR("(M.D.Y)")],
    		['d.m.Y', TR("(D.M.Y)")],
    		['Y.m.d', TR("(Y.M.D)")],
    		['n/j/Y', TR("(M/D/Y with no leading zeroes)")],
    		['j/n/Y', TR("(D/M/Y with no leading zeroes)")],
    		['Y/n/j', TR("(Y/M/D with no leading zeroes)")],
    		['n-j-Y', TR("(M-D-Y with no leading zeroes)")],
    		['j-n-Y', TR("(D-M-Y with no leading zeroes)")],
    		['Y-n-j', TR("(Y-M-D with no leading zeroes)")],
    		['n.j.Y', TR("(M.D.Y with no leading zeroes)")],
    		['j.n.Y', TR("(D.M.Y with no leading zeroes)")],
    		['Y.n.j', TR("(Y.M.D with no leading zeroes)")],
    	], date_formats_data = [],
    	time_formats = [
    		['H:i', TR("(24-hour clock)")],
    		['h:i A', TR("(12-hour clock)")],
    		['G:i', TR("(24-hour clock without leading zeros)")],
    		['g:i A', TR("(12-hour clock without leading zeros)")],
    	], time_formats_data = [],
    	now = new Date();
    	var data_items = [
    		[date_formats, date_formats_data],
    		[time_formats, time_formats_data],
    	];
    	for (var i = 0; i < data_items.length; i++){
    		for (var j = 0; j < data_items[i][0].length; j++){
    			data_items[i][1].push({
    				format: data_items[i][0][j][0],
    				example: Ext.Date.format(now, data_items[i][0][j][0]) + ' ' + data_items[i][0][j][1] 
    			});
    		}
    	}
    	    	
        Ext.apply(this, {
        	
        	items: [
        		{
        			xtype: 'label',
        			text: this.title,
        			cls: 'page-top-title',
        			
        		},
        		{
        			xtype:'fieldset',
        			defaults: {
				        anchor: '100%'
				    },
        			items:[
						{
					    	name: 'lang',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Language"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['code', 'lang'],
							    data : [
							        {code:"EN", lang: TR("English")},
							        {code:"FR", lang: TR("French")},
							    ]
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'lang',
						    valueField: 'code',
					    },
		            ],
        		},
        		{
        			xtype:'fieldset',
        			title: TR("Measurement Units"),
        			defaults: {
				        anchor: '100%'
				    },
        			items:[
						{
					    	name: 'altitude_unit',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Altitude"),
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
					    },
					    {
					    	name: 'speed_unit',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Speed"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['unit', 'label'],
							    data : [
							        {unit:'kts', label: TR("Knots (kts)")},
							        {unit:'mph', label: TR("Miles per hour (mph)")},
							        {unit:'ms', label: TR("Meters per second (m/s)")},
							        {unit:'kmh', label: TR("Kilometers per hour (km/h)")},
							    ]
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'label',
						    valueField: 'unit',
					    },
					    {
					    	name: 'distance_unit',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Distance"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['unit', 'label'],
							    data : [
							        {unit:'m', label: TR("Metric (cm, m, km)")},
							        {unit:'us', label: TR("U.S. (in, ft, mi)")},
							    ]
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'label',
						    valueField: 'unit',
					    },
					    {
					    	name: 'weight_unit',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Weight"),
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
					    {
					    	name: 'temperature_unit',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Temperature"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['unit', 'label'],
							    data : [
							        {unit:'c', label: TR("Degrees Celsius (C°)")},
							        {unit:'f', label: TR("Degrees Fahrenheit (F°)")},
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
        			xtype:'fieldset',
        			title: TR("Dates & Time"),
        			defaults: {
				        anchor: '100%'
				    },
        			items:[
        				{
					    	name: 'date_format',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Date format"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['format', 'example'],
							    data : date_formats_data,
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'example',
						    valueField: 'format',
					    },
					    {
					    	name: 'time_format',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Time format"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['format', 'example'],
							    data : time_formats_data,
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'example',
						    valueField: 'format',
					    },
					    {
					    	name: 'week_start',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Week start"),
					    	store: Ext.create('Ext.data.Store', {
							    fields: [{name:'day',type:'int'}, 'label'],
							    data : [
							        {day:0, label: TR("Sunday")},
							        {day:1, label: TR("Monday")},
							        {day:2, label: TR("Tuesday")},
							        {day:3, label: TR("Wednesday")},
							        {day:4, label: TR("Thursday")},
							        {day:5, label: TR("Friday")},
							        {day:6, label: TR("Saturday")},
							    ]
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'label',
						    valueField: 'day',
					    },
						
		            ],
        		},
        		
        	],
        	
        });
        
        this.callParent(arguments);
        
        this.form.loadRecord(Data.me);
        
    },
    
    save: function(){
    	if (this.form.findField('lang').getValue() != Data.me.data.lang){
    		this.callParent([false, true, Ext.bind(this.onSave, this)]);
    	} else {
    		this.callParent();
    		Sp.app.userOverrides();
    	}
    },
    
    onSave: function(){
    	Ext.MessageBox.confirm(TR("Language change"), 
			Ext.String.format(
				TR("To apply the language change, {0} must be reloaded.<br/>Do you want to reload now ?"), 
				Sp.core.Globals.BRAND
			),
			function(btn){
				if (btn == 'yes'){
					window.location.reload();
				} else {
					Sp.app.userOverrides();
				}
			}
		);	
    },
    

});
