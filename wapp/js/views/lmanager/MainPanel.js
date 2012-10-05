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

Ext.define('Sp.views.lmanager.MainPanel', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
    	
    	this.currentLocation = null;
    	this.undo_stack = {};
    	this.redo_stack = {};
    	this.res_stores = {};
    	this.autoM_active = false;
    	this.autoM_paused = false;
    	this.boards = {};
    	
        Ext.apply(this, {
        	layout: 'border',
        	margin: '10 5 5 0',
            items: [
            	{
            		xtype: 'toolbar',
            		region: 'north',
            		margin: '0 0 10 0',
            		items: [
            			{
            				xtype: 'image',
            				src: '/static/images/icons/location.png',
            				width: 16,
            				height: 16,
            			},
            			{
            				xtype: 'label',
            				text: TR("Location"),
            			},
            			{
            				xtype: 'combobox',
            				itemId: 'locationCbx',
            				store: Ext.create('Ext.data.Store', {
            					fields: ['uuid','name'],
            					sorters: [{
						            property: 'name',
						            direction: 'ASC'
						        }],
            				}),
            				queryMode: 'local',
            				editable: false,
							forceSelection: true,
						    displayField: 'name',
						    valueField: 'uuid',
						    listeners: {
						    	afterrender: function(me){
						    		var r = me.getStore().getAt(0);
						    		if (r){
						    			me.setValue(r);
						    		}
						    	},
						    	beforeselect: {
						    		fn: function(me, rec){
						    			this.setLocation(rec.data.uuid);
						    		},
						    		scope: this
						    	},
						    },
            			},
            			'-',
            			{
            				text: TR("New load"),
            				itemId: 'newLoadBt',
            				icon: '/static/images/icons/new_green.png',
            				handler: function(){
            					var p = this.getPlanner();
            					if (p){
            						p.newLoad();
            					}
            				},
            				scope: this,
            			},
            			'-',
            			{
            				text: TR("Filter loads"),
            				itemId: 'filterBt',
            				icon: '/static/images/icons/filter.png',
            				menu: [
            				],
            			},
            			'-',
            			{
            				text: TR("Boarding display"),
            				icon: '/static/images/icons/display.png',
            				handler: this.showBoard,
            				scope: this,
            			},
            			'-',
            			{
            				text: TR("Ressources"),
            				icon: '/static/images/icons/sheet.png',
            				handler: function(){
            					Ext.create('Sp.views.lmanager.Ressources', {
									locationRec: this.currentLocation,
									res_stores: this.res_stores[this.currentLocation.data.uuid],
								}).show();
            				},
            				scope: this,
            			},
            			'-',
        				{
        					itemId: 'undoBt',
        					tooltip: TR("Undo"),
            				icon: '/static/images/icons/undo.png',
            				handler: this.undo,
            				scope: this,
            				disabled: true,
            			},
            			{
            				itemId: 'redoBt',
            				tooltip: TR("Redo"),
            				icon: '/static/images/icons/redo.png',
            				handler: this.redo,
            				scope: this,
            				disabled: true,
            			},
            		],
            	},
            	{
            		region: 'east',
            		width: 190,
            		border: 0,
            		header: false,
                    split:true,
                    collapsible: true,
                    resizable: true,
                    titleCollapse: true,
            		layout: {
            			type: 'vbox',
            			align: 'stretch'
            		},
            		items: [
						{
							xtype: 'panel',
							layout: {
		            			type: 'vbox',
		            			align: 'center',
		            		},
		            		margin: '0 0 4 0',
							items: [
								{
									xtype: 'label',
									html: "<span class='auto-label'>" + TR("AUTO MANAGER") + "</span>",
									margin: '5 0 0 0',
								},
								{
									xtype: 'container',
									layout: {
				            			type: 'hbox',
				            			align: 'middle',
				            		},
				            		items: [
				            			{
				            				xtype: 'button',
				            				itemId: 'autoMBt',
				            				width: 70,
				            				height: 70,
				            				border: 0,
				            				cls: 'autoM-button-off',
				            				margin: '0 5 10 0',
				            				handler: this.toggleAutoM,
				            				scope: this,
				            			},
				            			{
				            				xtype: 'container',
				            				layout: {
						            			type: 'vbox',
						            			align: 'center',
						            		},
						            		width: 80,
						            		items: [
							            		{
		            								xtype: 'label',
		            								itemId: 'autoMText',
		            								cls: 'russo',
		            								text: TR("OFF"),
		            							},
		            							{
		            								xtype: 'button',
		            								itemId: 'autoMCtrl',
		            								text: TR("Pause"),
		            								icon: '/static/images/icons/pause.png',
	        										handler: this.ctrlAutoM,
		            								scope: this,
		            								hidden: true,
		            								margin: '2 0 0 0',
		            							},
						            		],
				            			},
				            		],
								},
							],
						},
						{
							xtype: 'panel',
							layout: {
		            			type: 'vbox',
		            			align: 'center',
		            		},
		            		height: 100,
		            		margin: '0 0 4 0',
							items: [
								{
						            xtype: 'chart',
						            itemId: 'usageGauge',
						            animate: true,
						            store: Ext.create('store.store', {
						            	fields: ['value'],
						            	data: [{value:50}],
						            }),
						            width: 180,
						            height: 75,
						            margin: '5 0 0 0',
						            insetPadding: 2,
						            axes: [{
						                type: 'gauge',
						                position: 'gauge',
						                minimum: 0,
						                maximum: 100,
						                steps: 2,
						                margin: -4,
						            }],
						            series: [{
						                type: 'gauge',
						                field: 'value',
						                colorSet: ['#3AA8CB', '#ddd'],
						            }],
						        },
						        {
									xtype: 'label',
									html: "<span class='auto-label'>" + TR("OVERALL USAGE") + "</span>",
									margin: '0 0 0 0',
								},
							],
						},
	        			{
							xtype: 'tabpanel',
							flex: 1,
							margin: '2 0 0 0',
							items: [
								{
	        						tabConfig: {
							            title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
							            tooltip: TR("Reservations"),
							            icon: '/static/images/icons/calendar_small.png',
							            iconAlign: 'top',
							        },
	        					},
								{
						    		tabConfig: {
							            title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
							            tooltip: TR("Club Members"),
							            icon: '/static/images/icons/members.png',
							            iconAlign: 'top',
							        },
						    		xtype: 'grid',
						    		itemId: 'membersGrid',
						    		store: Data.createStore('LocationMembership', {
				        				buffered: true,
				        				pageSize: 50,
				        				remoteSort: true,
										sorters: [
											{
									            property: 'person__last_name',
									            direction: 'ASC'
									        },
									        {
									            property: 'person__first_name',
									            direction: 'ASC'
									        }
								        ],
				        				remoteFilter: true,
				        			}),
				        			selModel: {
				        				pruneRemoved: false,
				        			},
				        			viewConfig: {
							            trackOver: false,
							            deferEmptyText: true,
									},
						    		hideHeaders: true,
						    		border: 0,
						    		emptyText: TR("No members !"),
						    		columns: [
						    			{
						    				flex: 1,
						    				renderer: function(v,o,r){
						    					var person = r.getPerson();
												return Sp.ui.misc.formatFullname(person, Data.me.data.name_order, true);
						    				},
						    			},
						    		],
						    		tbar: [
						    			{
						    				xtype: 'textfield',
						    				flex: 1,
						    			},
						    			{
								            xtype: 'button',
								            icon: '/static/images/icons/search.png',
								            tooltip: TR("Search"),
								        }
						    		],
						    		/*bbar: [
						    			'->',
						    			{
								            xtype: 'button',
								            text: TR("Add to this reservation"),
								            icon: '/static/images/icons/rewind.png',
								       },
								        '->',
						    		],*/
						    	},
						    	{
						    		tabConfig: {
							            title: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
							            tooltip: TR("Staff Members"),
							            icon: '/static/images/icons/staff.png',
							            iconAlign: 'top',
							        },
						    		xtype: 'grid',
						    		itemId: 'workersGrid',
						    		store: Ext.create('Ext.data.Store', {
						    			fields: ['uuid','name'],
						    		}),
						    		hideHeaders: true,
						    		border: 0,
						    		emptyText: TR("No staff !"),
						    		columns: [
						    			{dataIndex: 'name', flex:1},
						    		],
						    		tbar: [
						    			{
						    				xtype: 'textfield',
						    				flex: 1,
						    			},
						    			{
								            xtype: 'button',
								            icon: '/static/images/icons/search.png',
								            tooltip: TR("Search"),
								        }
						    		],
						    		/*bbar: [
						    			'->',
						    			{
								            xtype: 'button',
								            text: TR("Add to this reservation"),
								            icon: '/static/images/icons/rewind.png',
								       },
								        '->',
						    		],*/
						    	},
							],
						},
					],
            	},
			   	{
			   		xtype: 'container',
			   		itemId: 'plannersCtx',
			   		region: 'center',
			   		layout: 'card',
			   	},
			    {
			    	xtype: 'statusbar',
			    	itemId: 'statusBar',
			    	region: 'south',
			    	defaultText: '&nbsp;',
			        text: '&nbsp;',
			        busyIconCls: 'x-status-sync',
			        height: 28,
			        margin: '5 0 0 0',
			    },
            ],
			listeners: {
				activate: function(){
					var active_planner = this.down('#plannersCtx').getLayout().getActiveItem();
					if (active_planner){
						active_planner.doLayout();
						active_planner.updateSlotsGridsLayout();
					}
				},
				scope: this,
			},
        });
 		this.callParent(arguments);
 		this.buildLocationsStore();
    },
    
    buildLocationsStore: function(){
    	var data = [];
    	if (Sp.app.isOp()){
    		Data.locations.each(function(l){
    			var r = {};
    			r.uuid = l.data.uuid;
    			r.name = l.data.name;
    			data.push(r);
    		});
    	}
    	var store = this.down('#locationCbx').getStore();
    	store.loadRawData(data);
    	var r = store.getAt(0);
    	if (r){
    		this.setLocation(r.data.uuid);
    	}
    	
    },

    setMyLocation: function(locationRec){
    	this.currentLocation = locationRec;
    	this.res_stores[locationRec.data.uuid] = Sp.ui.data.getActiveRessources(locationRec);
    	this.showLocationPlanner(locationRec);
    	
    	var members_store = this.down('#membersGrid').getStore();
    	members_store.clearFilter(true);
    	members_store.filter('location', locationRec.data.uuid);
    	members_store.load();
    	
    	var data = [];
    	locationRec.Workers().each(function(w){
    		data.push({
    			uuid: w.data.uuid,
    			name: w.data.name,
    		});
    	});
    	this.down('#workersGrid').getStore().loadRawData(data);
    },
    
    setOtherLocation: function(locationRec){
    	this.currentLocation = locationRec;
    	this.showLocationPlanner(locationRec);
    },
    
    setLocation: function(location_uuid){
    	if (this.currentLocation && location_uuid == this.currentLocation.data.uuid){
    		return;
    	}
    	if (Sp.app.isOp()){
    		var l = Data.locations.getById(location_uuid);
    		if (l){
    			this.setMyLocation(l);
    			return;
    		}
    	}
    	if (Sp.app.isCm()){
    		Data.memberships.each(function(m){
    			var l = m.getLocation();
    			if (l.data.uuid == location_uuid){
    				this.setOtherLocation(l);
    				return false;
    			}
    		}, this);
    	}
    },
    
    toggleAutoM: function(){
    	var bt = this.down('#autoMBt');
    	var txt = this.down('#autoMText');
    	var ctrl = this.down('#autoMCtrl');
    	if (this.autoM_active){
    		bt.removeCls('autoM-button-on');
    		bt.removeCls('autoM-button-wait');
    		bt.addCls('autoM-button-off');
    		txt.setText(TR("OFF"));
    		ctrl.hide();
    	} else {
    		bt.removeCls('autoM-button-off');
    		bt.addCls('autoM-button-on');
    		txt.setText(TR("ON"));
    		ctrl.show();
    	}
    	this.autoM_active = !this.autoM_active;
    	if (this.autoM_active){
    		this.autoM_paused = false;
    		ctrl.setText(TR("Pause"))
    		ctrl.setIcon('/static/images/icons/pause.png');
    	}
    },
    
    ctrlAutoM: function(){
    	var bt = this.down('#autoMBt');
    	var txt = this.down('#autoMText');
    	var ctrl = this.down('#autoMCtrl');
    	if (this.autoM_paused){
    		bt.removeCls('autoM-button-wait');
    		bt.addCls('autoM-button-on');
    		txt.setText(TR("ON"));
    		ctrl.setText(TR("Pause"))
    		ctrl.setIcon('/static/images/icons/pause.png');
    	} else {
    		bt.removeCls('autoM-button-on');
    		bt.addCls('autoM-button-wait');
    		txt.setText(TR("PAUSED"));
    		ctrl.setText(TR("Resume"))
    		ctrl.setIcon('/static/images/icons/play.png');
    	}
    	this.autoM_paused = !this.autoM_paused;
    },
    
    showBoard: function(){
    	if (this.currentLocation){
    		var board = this.boards[this.currentLocation.data.uuid];
    		if (!board){
	    		board = Ext.create('Sp.views.lmanager.Board', {
	    			locationRec: this.currentLocation,
	    			boards: this.boards,
	    		});
	    		this.boards[this.currentLocation.data.uuid] = board;
    		}
    		board.show();
    	}
    },
    
    showLocationPlanner: function(locationRec){
    	var ctx = this.down('#plannersCtx');
    	var planner_id = locationRec.data.uuid + '-planner';
    	var planner = ctx.getComponent(planner_id);
    	if (!planner){
    		planner = Ext.create('Sp.views.lmanager.Planner', {
    			res_stores: this.res_stores[locationRec.data.uuid],
    			itemId: planner_id,
		        locationRec: locationRec,
		        storeAction: Ext.bind(this.storeAction, this),
		        statusBarOk: Ext.bind(this.statusBarOk, this),
		        statusBarBusy: Ext.bind(this.statusBarBusy, this),
		        statusBarText: Ext.bind(this.statusBarText, this),
		        statusBarClear: Ext.bind(this.statusBarClear, this),
		        actionOperation: Ext.bind(this.actionOperation, this),
		    });
		   	ctx.add(planner);
    	}
    	ctx.getLayout().setActiveItem(planner);
    	planner.doLayout();
		planner.updateSlotsGridsLayout();
    },
    
    getPlanner: function(locationRec){
    	locationRec = locationRec || this.currentLocation;
    	return this.down('#plannersCtx').getComponent(locationRec.data.uuid + '-planner');
    },
    
    storeAction: function(location_uuid, action){
    	if (!Ext.isDefined(this.undo_stack[location_uuid])){
    		this.undo_stack[location_uuid] = [];
    		this.redo_stack[location_uuid] = [];
    	}
    	this.undo_stack[location_uuid].push(action);
    	this.redo_stack[location_uuid] = [];
    	this.down('#undoBt').enable();
    	this.down('#redoBt').disable();
    },
    
    statusBarBusy: function(){
    	this.down('#statusBar').showBusy(TR("Syncing"));
    },
    
    statusBarOk: function(){
    	this.down('#statusBar').setStatus({
			iconCls: 'x-status-valid', 
			text: TR("Updated"),
			clear: true
		});
    },
    
    statusBarText: function(text){
    	this.down('#statusBar').setStatus(text);
    },
    
    statusBarClear: function(text){
    	this.down('#statusBar').clearStatus();
    },
    
    actionOperation: function(record, fn, have_related){
    	if (fn == 'save' && Ext.Object.getSize(record.getChanges()) == 0){
			return;
		}
    	this.statusBarBusy();
    	var store = record.store;
    	record[fn].apply(record, [{
    		callback: function(){
    			if (have_related && store){
    				store.sync({
    					callback: function(){
    						this.statusBarOk();
    					},
    					scope: this,
    				});
    			} else {
    				this.statusBarOk();
    			}
    		},
    		scope: this,
    	}]);
    },
    
    actionRpc: function(record, fn, args, have_related){
    	var store = record.store;
    	this.statusBarBusy();
		Sp.utils.rpc(fn, args, function(){
			if (have_related){
				store.sync({
					callback: function(){
						this.statusBarOk();
					},
					scope: this,
				});
			} else {
				this.statusBarOk();
			}
		}, this);
    },
    
    replayUpdateAction: function(action, stack){
    	var current_values = {}, have_related;
    	var model_name = Data.getSpModelName(action.record);
    	Ext.Object.each(action.values, function(k,v){
    		current_values[k] = action.record.get(k);
    	});
    	action.record.set(action.values);
    	// related slots
    	if (Ext.isFunction(action.handleRelatedSlots)){
    		have_related = action.handleRelatedSlots(action.record, 'update');
    	}
    	// update probelms display
    	if (model_name == 'Load'){
    		var planner = this.down('#plannersCtx').getComponent(action.record.data.location + '-planner');
    		var slots_grid = planner.slots_grids[action.record.data.uuid];
    		if (action.values.state){
	    		if (action.values.state == 'P'){
					planner.validateLoad(action.record);
				} else {
					planner.clearProblematic(action.record);
				}
				planner.loadStateChanged(action.record);
    		}
    		// load global fields
    		if (Ext.isDefined(action.values.note) && slots_grid){
    			slots_grid.down('#loadNote').setValue(action.values.note);
    		}
    		if (Ext.isDefined(action.values.jumpmaster_slot) && slots_grid){
    			var jumpmasterCbx = slots_grid.down('#jumpmasterCbx');
    			if (action.values.jumpmaster_slot){
    				jumpmasterCbx.setValue(jumpmasterCbx.getStore().findRecord('uuid', action.values.jumpmaster_slot));
    			} else {
    				jumpmasterCbx.clearValue();
    			}
    		}
    	}
    	this.actionOperation(action.record, 'save', have_related);
    	stack.push({
			action: 'update',
			record: action.record,
			values: current_values,
			handleRelatedSlots: action.handleRelatedSlots,
		});
    },
    
    undo: function(){
    	var action, have_related,
    		undo_stack = this.undo_stack[this.currentLocation.data.uuid],
    		redo_stack = this.redo_stack[this.currentLocation.data.uuid];
    	if (Ext.isDefined(undo_stack)){
    		action = undo_stack.pop();
    	}
    	if (!action){
    		this.down('#undoBt').disable();
    		return;
    	}
    	
    	if (action.action == 'create'){
	    	if (Ext.isFunction(action.handleRelatedSlots)){
	    		have_related = action.handleRelatedSlots(action.record, 'destroy');
	    	}
    		action.store.remove(action.record);
    		this.actionOperation(action.record, 'destroy', have_related);
    		redo_stack.push(action);
    	} else if (action.action == 'destroy'){
    		action.store.add(action.record);
    		if (Ext.isFunction(action.handleRelatedSlots)){
	    		have_related = action.handleRelatedSlots(action.record, 'create');
	    	}
    		this.actionRpc(action.record, 'misc.undelete', [Data.getSpModelName(action.record), action.record.data.uuid], have_related);
    		redo_stack.push(action);
    	} else if (action.action == 'update'){
    		this.replayUpdateAction(action, redo_stack);
    	}
    	this.down('#undoBt').setDisabled(undo_stack.length == 0);
    	this.down('#redoBt').enable();    	
    },
    
    redo: function(){
    	var action, have_related,
    		undo_stack = this.undo_stack[this.currentLocation.data.uuid],
    		redo_stack = this.redo_stack[this.currentLocation.data.uuid];
    	if (Ext.isDefined(redo_stack)){
    		action = redo_stack.pop();
    	}
    	if (!action){
    		this.down('#redoBt').disable();
    		return;
    	}
    	
    	if (action.action == 'create'){
    		action.store.add(action.record);
    		if (Ext.isFunction(action.handleRelatedSlots)){
	    		have_related = action.handleRelatedSlots(action.record, 'create');
	    	}
    		this.actionRpc(action.record, 'misc.undelete', [Data.getSpModelName(action.record), action.record.data.uuid], have_related);
    		undo_stack.push(action);
    	} else if (action.action == 'destroy'){
    		if (Ext.isFunction(action.handleRelatedSlots)){
	    		have_related = action.handleRelatedSlots(action.record, 'destroy');
	    	}
    		action.store.remove(action.record);
    		this.actionOperation(action.record, 'destroy', have_related);
    		undo_stack.push(action);
    	} else if (action.action == 'update'){
    		this.replayUpdateAction(action, undo_stack);
    	}
    	this.down('#redoBt').setDisabled(redo_stack.length == 0);
    	this.down('#undoBt').enable();
    },
                
});
