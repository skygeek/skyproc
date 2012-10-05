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


Ext.define('Sp.views.locations.FormWorkers', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
    	
    	var rec = this.locationRec;
    	
    	var workers_store = this.locationRec.Workers();
    	workers_store.clearFilter(true);
    	
    	workers_store.sort([
		    { property: 'name',  direction: 'ASC' },
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
		        			store: workers_store,
		        			selModel: Ext.create('Ext.selection.CheckboxModel'),
		        			sortableColumns: false,
		        			enableColumnHide: false,
		        			columns: [
		        				{
		        					dataIndex: 'name',
		        					header: TR("Name"),
		        					flex: 1,
		        					sortable: true,
		        				},
		        				{
		        					header: TR("Roles"),
		        					width: 200,
		        					renderer: function(value, metaData, record){
		        						var content = '';
		        						record.WorkerTypes().each(function(r){
		        							content += "<img src='/static/images/icons/" + r.data.type + ".png'/> " + TR(r.data.label) + '<br/>';
		        						});
		        						return content;
		        					},
		        					
		        				},
		        				{
		        					header: TR("Spoken langs"),
		        					renderer: function(value, metaData, record){
		        						var content = '';
		        						record.SpokenLangs().each(function(r){
		        							content += "<img src='/static/images/flags/" + r.data.lang.toLowerCase() + ".png'/> ";
		        						});
		        						return content;
		        					},
		        				},
		        				{
		        					header: TR("Available"),
		        					width: 80,
		        					renderer: function(value, metaData, record){
		        						if (record.data.available_fulltime){
		        							return "<img src='/static/images/icons/available.png'/> " + TR("YES");	
		        						} else {
		        							return "<img src='/static/images/icons/unavailable.png'/> " + TR("NO");
		        						}
		        					},
		        				},
		        			],
		        			tbar: [
		        				{
									xtype: 'textfield',
									itemId: 'searchText',
									width: 250, 
									emptyText: TR("Search for staff member"),
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
		        					text: TR("New staff member"),
		        					icon: '/static/images/icons/new_green.png',
		        					handler: this.addWorker,
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
		        							handler: this.editSelectedWorker,
		        							scope: this,
		        						},
		        						'-',
		        						{
		        							itemId: 'delBt',
		        							text: TR("Delete"),
		        							icon: '/static/images/icons/trash.png',
		        							handler: this.deleteSelectedWorkers,
		        							scope: this,
		        						},
		        					],
		        				},
		        			],
		        			listeners: {
		            			itemdblclick: Ext.bind(this.onWorkerDblClick, this),
		            			itemcontextmenu: Ext.bind(this.onWorkerContextMenu, this),
		            		},
		        		},
		            ],
            	},
            ], 
			
        });
 
 		this.callParent(arguments);
 		
 		// events
 		this.query("#ctx #grid")[0].getSelectionModel().on('selectionchange', Ext.bind(this.workerSelectionChanged, this));
    },
    
    doSearch: function(){
    	var search_text = this.query("#ctx #grid")[0].getDockedItems('toolbar[dock="top"]')[0].getComponent('searchText').getValue();
    	var store = this.locationRec.Workers();
    	store.clearFilter(true);
    	store.filter('name', new RegExp(search_text, 'i'));
    },
    
    addWorker: function(){
    	this.editWorker();
    },
    
    onWorkerDblClick: function(me, r, el){    	
    	this.editWorker(r);
    },
    
    workerSelectionChanged: function(sm, selected){
    	var action_bt = this.down('#actionBt');
    	action_bt.setDisabled((selected.length == 0));
    	action_bt.menu.getComponent('edit').setDisabled((selected.length != 1));
    },
    
    editSelectedWorker: function(){
    	this.editWorker(this.down('#grid').getSelectionModel().getSelection()[0]);
    },
        
    deleteSelectedWorkers: function(){
    	var selected = this.query("#ctx #grid")[0].getSelectionModel().getSelection();
    	var msg;
    	if (selected.length == 0){
    		return;
    	} else if (selected.length == 1){
    		msg = Ext.String.format(
				TR("Are you sure you want to remove '{0}' from staff members ?"), 
				selected[0].data.name);
    	} else {
    		msg = Ext.String.format(
				TR("Are you sure you want to remove the {0} selected staff members ?"), 
				selected.length);
    	}
    	Ext.MessageBox.confirm( TR("Confirmation"), msg,
			function(btn){
				if (btn == 'yes'){
					this.locationRec.Workers().remove(selected);
				}
			}, this
		);
    },
    
    editWorker: function(record){
    	var w = Ext.create('Sp.views.locations.EditWorker', {
    		locationRec: this.locationRec,
    		workerRec: record,
    	});
    	w.show();
    },
    
    onWorkerContextMenu: function(grid, record, el, idx, ev){
    	
    	var availability_menu = [];
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
    	}
    	
    	// context menu
		var menu = Ext.create('Ext.menu.Menu', {
		    items: [
			    {
			        text: TR("Edit"),
			        icon: '/static/images/icons/edit.png',
			        handler: function(){
			        	this.editWorker(record);			        				        	
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
    							TR("Are you sure you want to remove '{0}' from staff members ?"), 
    							record.data.name),
    						function(btn){
    							if (btn == 'yes'){
    								this.locationRec.Workers().remove(record);
    							}
    						}, this
    					);
			        },
			        scope: this,
			    },
			    '-',
			    {
			        text: TR("Change availability"),
			        icon: '/static/images/icons/calendar_small.png',
			        menu: availability_menu,
			    },
		    ]
		});
    	
    	// show context menu
    	ev.preventDefault();
    	menu.showAt(ev.getXY());
    },
    
    post_save: function(){
    	this.locationRec.Workers().sync();
    	this.locationRec.Workers().each(function(w){
    		w.SpokenLangs().sync();
    		w.WorkerTypes().sync();
    	});
    },
    
    reject: function(){
    	this.locationRec.Workers().rejectChanges();
    	this.locationRec.Workers().each(function(w){
    		w.SpokenLangs().rejectChanges();
    		w.WorkerTypes().rejectChanges();
    	});
    },
    
});
