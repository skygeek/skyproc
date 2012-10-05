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


Ext.define('Sp.views.locations.Clearances', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
    	this.cancel_close = true;
    	
    	var rec = this.locationRec;
    	
        Ext.apply(this, {
        	width: 700,
        	height: 525,
        	modal: true,
        	resizable: false,
        	title: TR("Clearances list"),
        	icon: '/static/images/icons/clearance.png',
        	layout: 'fit',
            items: [
            	{
            		xtype: 'grid',
            		itemId: 'grid',
            		store: rec.Clearances(),
            		selModel: Ext.create('Ext.selection.CheckboxModel'),
        			viewConfig: {
			            deferEmptyText: false,
			        },
			        margin: Sp.core.Globals.WINDOW_MARGIN,
			        emptyText: TR("No Clearances"),
            		columns: [
            			{
            				header: TR("Members"),
            				flex: 1,
            				renderer: function(v,o,r){
            					var p = r.getPerson();
            					var label = "<table class='badge-table'><tr>";
            					label += Ext.String.format("<td>{0}</td>", Sp.ui.misc.getPicture(p, false, 60));
            					label += Ext.String.format("<td><span class='semi-bold'>{0}</span><br>{1}</td>", 
            								Sp.ui.misc.formatFullname(p, Data.me.data.name_order, true),
            								Sp.ui.misc.getCountryCity(p, true));
            					label += '</tr></table>';
            					return label;
            				},
            			},
            			{
            				header: TR("Period"),
            				flex: 1,
            				renderer: function(v,o,r){
            					var p = Sp.ui.misc.getClearancePeriod(r);
								var label = "<table class='badge-table'>";
								label += Ext.String.format("<tr><td><img src='/static/images/icons/start.png'/></td><td>{0}</td></tr>", 
											Ext.Date.format(p.start_date, Data.me.data.date_format));
								if (p.end_date){
									label += Ext.String.format("<tr><td><img src='/static/images/icons/end.png'/></td><td>{0}</td></tr>", 
												Ext.Date.format(p.end_date, Data.me.data.date_format));
								}
								label += Ext.String.format("<tr><td><img src='/static/images/icons/time.png'/></td><td>{0}</td></tr>", p.count_label);
								label += "</table>";
								return label;
            				},
            			},
            			{
            				header: TR("Status"),
            				renderer: function(v,o,r){
        						if (r.data.approved){
        							return "<table><tr><td><img src='/static/images/icons/active.png'/></td><td>&nbsp;" + 
        									TR("Active") + "</td></tr></table>";
        						} else {
        							return "<table><tr><td><img src='/static/images/icons/pending.png'/></td><td>&nbsp;" + 
        									TR("Pending") + "</td></tr></table>";
        						}
        					},
            			},
            		],
            		tbar: [
        				{
							xtype: 'textfield',
							itemId: 'searchField',
							width: 250, 
							emptyText: TR("Search for member's clearance"),
							enableKeyEvents: true,
							listeners: {
								keypress: Ext.bind(function(me, e){
									if (e.getKey() == 13){
										this.doSearch();
									}
								}, this),
							},
						},
						{
				            xtype: 'button',
				            icon: '/static/images/icons/search.png',
				            tooltip: TR("Search"),
				            handler: this.doSearch,
				            scope: this,
				        },
        				'->',
        				{
        					text: TR("New clearance"),
        					icon: '/static/images/icons/new_green.png',
        					handler: function(){
        						Ext.create('Sp.views.locations.AddClearance', {
									locationRec: this.locationRec,
								}).show();
							},
							scope: this,
        				},
        				{
        					itemId: 'actionBt',
        					text: TR("With selected"),
        					icon: '/static/images/icons/action.png',
        					disabled: true,
        					menu: [
        						{
        							itemId: 'accept',
        							text: TR("Accept"),
        							icon: '/static/images/icons/save.png',
        							handler: this.acceptSelectedClearances,
        							scope: this,
        						},
        						'-',
        						{
        							itemId: 'delete',
        							text: TR("Revoke"),
        							icon: '/static/images/icons/delete.png',
        							handler: this.deleteSelectedClearances,
        							scope: this,
        						},
        					],
        				}
        			],
        			listeners: {
            			itemcontextmenu: Ext.bind(this.onClearanceContextMenu, this),
            		},
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
 		
 		this.down('#grid').getSelectionModel().on('selectionchange', Ext.bind(this.clearanceSelectionChanged, this));
    },
    
    doSearch: function(){
    	var re = new RegExp(this.down('#searchField').getValue(), 'i')
    	this.down('#grid').getStore().filterBy(function(r){
    		var p = r.getPerson();
    		return re.test(p.data.first_name + ' ' + p.data.last_name);    		
    	});
    },
    
    clearRequestStore: function(clearance_uuid){
    	var idx = Data.newRequestsList.findExact('uuid', clearance_uuid);
    	if (idx != -1){
    		Data.newRequestsList.removeAt(idx);
    	}
    },
    
    clearanceSelectionChanged: function(sm, selected){
    	this.down('#actionBt').setDisabled((selected.length == 0));
    },
    
    deleteClearances: function(clearances){
    	var msg;
    	if (clearances.length == 0){
    		return;
    	} else if (clearances.length == 1){
    		msg = Ext.String.format(
				TR("Are you sure you want to revoke the clearance for '{0}' ?"), 
				Sp.ui.misc.formatFullname(clearances[0].getPerson(), Data.me.data.name_order, true));
    	} else {
    		msg = Ext.String.format(
				TR("Are you sure you want to revoke the {0} selected clearances ?"), 
				clearances.length);
    	}
    	Ext.MessageBox.confirm( TR("Confirmation"), msg,
			function(btn){
				if (btn == 'yes'){
					for (var i=0,c ; c = clearances[i] ; i++){
						c.destroy();
						this.clearRequestStore(c.data.uuid);
					}
					this.down('#grid').getStore().remove(clearances);
				}
			}, this
		);
    },
    
    deleteSelectedClearances: function(){
    	this.deleteClearances(this.down('#grid').getSelectionModel().getSelection());
    },
    
    acceptClearances: function(clearances){
    	for (var i=0,c ; c = clearances[i] ; i++){
			if (!c.data.approved){
				c.beginEdit();
				c.set('approved', true);
				c.endEdit();
				c.save();
				this.clearRequestStore(c.data.uuid);
			}
		}
    },
    
    acceptSelectedClearances: function(){
    	this.acceptClearances(this.down('#grid').getSelectionModel().getSelection());
    },
    
    onClearanceContextMenu: function(grid, record, el, idx, ev){
    	var items = [];
    	if (!record.data.approved){
    		items.push({
		        text: TR("Accept"),
		        icon: '/static/images/icons/save.png',
		        handler: function(){
		        	this.acceptClearances([record]);
		        },
		        scope: this,
		    });	
    	}
	    items.push({
	        text: TR("Revoke"),
	        icon: '/static/images/icons/delete.png',
	        handler: function(){
	        	this.deleteClearances([record]);
	        },
	        scope: this,
	    });
    	    	
    	var menu = Ext.create('Ext.menu.Menu', {
		    items: items,
		});
    	// show context menu
    	ev.preventDefault();
    	menu.showAt(ev.getXY());
    },
    
     
});
