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


Ext.define('Sp.views.locations.Locator', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
    	    	    		
        Ext.apply(this, {
        	layout: {
		    	type: 'border',
		    },
            items: [
            	{
            		region: 'north',
            		xtype: 'form',
            		itemId: 'form',
            		title: TR("Find a dropzone"),
            		collapsible: true,
            		collapseMode: 'header',
            		titleCollapse: true,
            		collapsed: true,
            		layout: {
            			type: 'hbox',
            		},
            		items: [
            			{
            				xtype: 'container',
            				width: 280,
            				margin: 5,
            				layout: 'form',
            				defaults: {
            					labelWidth: 65,
            					anchor: '100%',
            				},
            				items: [
            					{
		            				xtype: 'textfield',
		            				name: 'name',
		            				fieldLabel: TR("Name"),
		            				enableKeyEvents: true,
									listeners: {
										keypress: Ext.bind(function(me, e){
											if (e.getKey() == 13){
												this.doSearch();
											}
										}, this),
									},
		            			},
		            			Sp.ui.getCountryCombo('country', 'country', TR("Country"), 
							    	{select: Ext.bind(this.onCountrySelect, this)}),
							    Sp.ui.getCityCombo('city', 'city', TR("City"), 
							    	{}, 
							    	Data.me),
            				],
            			},
            			{
            				xtype: 'container',
            				width: 360,
            				margin: 5,
            				layout: 'form',
            				defaults: {
            					labelWidth: 170,
            					anchor: '100%',
            				},
            				margin: '5 5 5 15',
            				items: [
            					{
            						name: 'aircraft_name',
		            				xtype: 'textfield',
		            				fieldLabel: TR("Aircraft name or type"),
		            			},
            					{
            						name: 'active_aircrafts',
		            				xtype: 'numberfield',
		            				fieldLabel: TR("Simultaneous active aircrafts"),
		            				minValue: 1,
		            				maxValue: 999,
		            			},
		            			{
		            				name: 'total_slots',
		            				xtype: 'numberfield',
		            				fieldLabel: TR("Total aircraft slots capacity"),
		            				minValue: 1,
		            				maxValue: 9999,
		            			},
		            			
            				],
            			},
            		],
            		buttons: [
            			{
            				text: TR("Search"),
            				icon: '/static/images/icons/search.png',
            				handler: this.doSearch,
            				scope: this, 
            			},
            		],
            	},
            	{
            		region: 'center',
            		xtype: 'grid',
            		itemId: 'grid',
            		margin: '10 0 0 0',
            		selModel: {
			            pruneRemoved: false
			        },
			        viewConfig: {
			            trackOver: false,
			            deferEmptyText: true,
			        },
			        loadMask: true,
			        enableColumnHide: false,
			        enableColumnMove: false,
			        enableColumnResize: false,
			        sortableColumns: true,	
			        emptyText: TR("No dropzones matching your search criteria were found !"),
            		store: Data.createStore('Location_P', {
            			storeId: 'mainLocationsStore',
						sorters: [{
				            property: 'name',
				            direction: 'ASC'
				        }],
				        remoteFilter: true,
				        buffered: true,
				        pageSize: 100,
            		}),
            		columns: [
            			{
            				dataIndex: 'name',
            				header: TR("Dropzone, Location"),
            				flex: 1,
            				renderer: function(v,o,r){
            					var label = '';
            					var img = r.data.picture ? r.data.picture : '/static/images/nothing.png';
            					label += "<table class='location-table'><tr>";
            					label += Ext.String.format("<td><img width='60' height='60' src='{0}'/></td>", img);
            					label += "<td>";
            					label += "<span class='bold'>" + r.data.name + '</span>';
            					label += Sp.ui.misc.getCountryCity2(r);
            					label += "</td>";
            					label += "</tr></table>";
            					return label;
            				},
            			},
            			{
            				header: TR("Active Aircrafts"),
            				renderer: function(v,o,r){
            					var count = 0;
            					r.Aircrafts().each(function(a){
            						if (a.data.available_fulltime){
            							count++;
            						}
            					});
            					return count;
            				},
            			},
            			{
            				header: TR("Total Slots"),
            				renderer: function(v,o,r){
            					var slots = 0;
            					r.Aircrafts().each(function(a){
            						if (a.data.available_fulltime){
            							slots += a.data.max_slots;
            						}
            					});
            					return slots;
            				},
            			},
            		],
            		listeners: {
            			itemmouseenter: Ext.bind(this.onLocationMouseEnter, this),
            			itemmouseleave: Ext.bind(this.onLocationMouseLeave, this),
            			itemclick: Ext.bind(this.onLocationClick, this),
            		},
            	},
            ],
			
        });
 
 		this.callParent(arguments);
 		
 		var store = Ext.data.StoreManager.lookup('mainLocationsStore');
 		if (Sp.app.isOp()){
 			store.add(Data.locations.getRange());
 		}
 		Data.memberships.each(function(m){
 			store.add(m.getLocation());
 		});
    },
    
    onCountrySelect: function(cb, records){
    	Sp.ui.countryChanged(records, this.down('#city'));
    },
    
    onLocationMouseEnter: function(me, r, el){
    	var domEl = new Ext.dom.Element(el);
    	domEl.setStyle('cursor', 'pointer');
    },
    
    onLocationMouseLeave: function(me, r, el){
    	var domEl = new Ext.dom.Element(el);
    	domEl.setStyle('cursor', 'default');
    },
    
    onLocationClick: function(me, r){
    	this.showModuleFunction({
			id: r.data.uuid,
			moduleClass: 'Viewer',
			title: r.data.name,
			data: r,
		});
    },
    
    doSearch: function(){
    	var store = Ext.data.StoreManager.lookup('mainLocationsStore');
    	var values = this.getComponent('form').getValues();
    	var filters = [];
    	Ext.Object.each(values, function(k,v){
    		if (!v){
    			return
    		}
    		if (k == 'name'){
    			filters.push({property: 'name__icontains', value: v});
    		} else if (k == 'country'){
    			filters.push({property: k, value: v});
    		} else if (k == 'city'){
    			if (Sp.utils.isUuid(v)){
    				filters.push({property: k, value: v});
    			} else {
    				filters.push({property: 'custom_city__icontains', value: v});
    			}
    		}
    	});
    	if (filters.length == 0){
    		Sp.ui.misc.errMsg(TR("Please specify at least one search term"), TR("Search error"));
    		return;
    	}
    	store.clearFilter(true);
    	store.filter(filters);
    	store.load();
    },

});
