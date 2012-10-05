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

Ext.define('Sp.views.locations.EditMapMarker', {
	extend: 'Ext.panel.Panel',
	
	initComponent: function() {
		
		// buttons
		var buttons = [];
		if (this.markerRec){
			buttons.push({
				text: TR("Delete"),
				icon: '/static/images/icons/trash.png',
				handler: this.deleteMarker,
				scope: this,
			});
			buttons.push('->');
			buttons.push({
				text: TR("Save"),
				icon: '/static/images/icons/save.png',
				handler: this.editMarker,
				scope: this,
			});
		} else {
			buttons.push({
				text: TR("Add"),
				icon: '/static/images/icons/save.png',
				handler: this.addMarker,
				scope: this,
			});
		}
		buttons.push({
			text: TR("Cancel"),
			icon: '/static/images/icons/cancel.png',
			handler: this.cancel,
			scope: this,
		});
		
		
		Ext.apply(this, {
			width: 400,
			height: 200,
			floating: true,
			frame: true,
			items: [
				{
	        		xtype: 'form',
	        		itemId: 'form',
	        		items: [
	        			{
		    				xtype: 'fieldset',
		    				defaults: {
				        		anchor: '100%',
				        	},
		    				items: [
				            	{
							    	name: 'type',
							    	xtype: 'combobox',
							    	fieldLabel: TR("Type"),
							    	emptyText: TR("Choose a category"),
							    	store: Data.areaTypes,
								    displayField: 'label',
								    valueField: 'uuid',
								    queryMode: 'local',
									editable: false,
									forceSelection: true,
								    lastQuery: '',					    	
							    },
							    {
		    						name: 'name',
				            		xtype: 'textfield',
				            		fieldLabel: TR("Name"),
				            		emptyText: TR("Add an optional name"),
				            	},
				            	{
				            		name: 'description',
				            		xtype: 'textarea',
				            		fieldLabel: TR("Description"),
				            		rows: 5,
				            		emptyText: TR("Add an optional description"),
				            	},
		    				],
		    			},
	        		],
	        	},
			],
			buttons: buttons,
		});
		
		this.callParent(arguments);
		
		if (this.markerRec){
			this.getComponent('form').getForm().loadRecord(this.markerRec);
		}
	},
	
	cancel: function(){
		if (!this.markerRec){
			this.marker.setMap(null);			
		}
		this.close();
	},
	
	addMarker: function(){
		// save the marker
		var values = this.getComponent('form').getForm().getValues();
		var markers = this.locationRec.MapMarkers()
		var pos = this.marker.getPosition();
		values.latitude = pos.lat();
		values.longitude = pos.lng();
		var r = markers.add(values);
		r[0].setDirty();
		r[0].save();
		// update the marker
		this.marker.uuid = r[0].data.uuid;
		this.marker.setTitle(values.name);
		// close
		this.close();
	},
	
	editMarker: function(){
		// save the marker
		this.getComponent('form').getForm().updateRecord();
		this.markerRec.save();
		this.markerRec.commit();
		// update the marker
		this.marker.setTitle(this.markerRec.data.name);
		// close
		this.close();
	},
	
	deleteMarker: function(){
		this.locationRec.MapMarkers().remove(this.markerRec);
		this.markerRec.destroy();
		this.marker.setMap(null);
		this.close();
	},
	
});
