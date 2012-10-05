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


Ext.define('Sp.views.locations.Viewer', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
    	    	
    	this.locationRec = this.moduleData;
    	
    	this.getRelationship();
    	
        Ext.apply(this, {
        	layout: {
		    	type: 'card',
		    },
		    header: false,
		    tbar: [
		    	' ',
				{
					xtype: 'image',
					itemId: 'flag',
					width: 16,
					height: 11,
				},
				' ',
				{
					xtype: 'label',
					itemId: 'title',
				},
				'->',
				{
					xtype: 'button',
					itemId: 'joinBt',
					text: TR("Join"),
					icon: '/static/images/icons/join.png',
					handler: this.joinLocation,
					scope: this,
				},
				{
					xtype: 'button',
					itemId: 'cancelJoinBt',
					text: TR("Cancel join request"),
					icon: '/static/images/icons/req_cancel.png',
					handler: this.cancelRequest,
					scope: this,
				},
				{
		            xtype: 'splitbutton',
		            itemId: 'inviteReplyBt',
		            text : TR("Accept invitation"),
		            icon: '/static/images/icons/reply.png',
		            menu: new Ext.menu.Menu({
				        items: [
							{
								text: TR("Accept"),
								icon: '/static/images/icons/save.png',
								handler: this.acceptInvitation,
								scope: this,
				            },
				            {
				            	text: TR("Decline"), 
				            	icon: '/static/images/icons/ban.png',
				            	handler: this.rejectInvitation,
								scope: this,
				            },
				        ],
				    }),
				    handler: this.acceptInvitation,
					scope: this,
		        },
				{xtype: 'tbseparator', itemId: 'joinSep'},
				{
					xtype: 'button',
					itemId: 'reqClrBt',
					text: TR("Request Clearance"),
					icon: '/static/images/icons/clearance.png',
					handler: this.requestClearance,
					scope: this,
				},
				{
					xtype: 'button',
					itemId: 'cancelClrBt',
					text: TR("Cancel clearance request"),
					icon: '/static/images/icons/time_cancel.png',
					handler: this.cancelClearanceRequest,
					scope: this,
				},
				{
					xtype: 'button',
					itemId: 'makeReservationBt',
					text: TR("Make Reservation"),
					icon: '/static/images/icons/datetime.png',
				},
				{xtype: 'tbseparator', itemId: 'actionSep'},
				{
		            xtype: 'splitbutton',
		            itemId: 'clearancesBt',
		            text : TR("Clearances"),
		            icon: '/static/images/icons/clearance.png',
		            menu: new Ext.menu.Menu({
				        items: [
							{
								text: TR("Issue new"),
								icon: '/static/images/icons/new_green.png',  
								handler: function(){
					            	Ext.create('Sp.views.locations.AddClearance', {
										locationRec: this.locationRec,
										standalone: true,
									}).show();	
				            	},
				            	scope: this,
				            },
				            {
				            	text: TR("View current"), 
				            	icon: '/static/images/icons/list.png',
				            	handler: function(){
				            		Ext.create('Sp.views.locations.Clearances', {
    									locationRec: this.locationRec,
    								}).show();
				            	},
				            	scope: this,
				            },
				        ],
				    }),
				    handler: function(bt){
				    	bt.showMenu();
			        },
		        },
		        {xtype: 'tbseparator', itemId: 'adminSep'},
		        {
					xtype: 'button',
					itemId: 'viewBt',
					text: TR("View"),
					icon: '/static/images/icons/view.png',
					handler: this.viewLocation,
					scope: this,
				},
				{
					xtype: 'button',
					itemId: 'editBt',
					text: TR("Manage"),
					icon: '/static/images/icons/settings.png',
					handler: this.editLocation,
					scope: this,
				},
				{xtype: 'tbseparator', itemId: 'manageSep'},
				{
					xtype: 'button',
					itemId: 'leaveBt',
					text: TR("Leave"),
					icon: '/static/images/icons/leave.png',
					handler: function(){
						if (this.locationRec.data.member_auto_accept){
							this.leaveLocation();
						} else {
							Ext.MessageBox.confirm( TR("Confirmation"),
			    				Ext.String.format(TR("Are you sure you want to leave {0}"), this.locationRec.data.name),
								function(btn){
									if (btn == 'yes'){
										this.leaveLocation();
									}
							}, this);	
						}
					},
					scope: this,
				},
				{xtype: 'tbseparator', itemId: 'leaveSep'},
				{
					xtype: 'button',
					text: TR("Close"),
					icon: '/static/images/icons/close.png',
					handler: this.close,
					scope: this,
				},
		    ],
		    items: [
		    	{
		    		xtype: 'container',
		    		itemId: 'view',
		        	layout: {
				    	type: 'border',
				    },
				    padding: '10 10 10 10',
		            items: [
		            	{
		            		region: 'west',
		            		xtype: 'container',
		            		itemId: 'west',
		            		width: 200,
		            		layout: {
		            			type: 'vbox',
		            			align: 'stretch',
		            			
		            		},
		            		items: [
		            			{
		            				xtype: 'panel',
		            				itemId: 'badge',
		            				height: 160,
		            				layout: {
		            					type: 'vbox',
		            					align: 'center',
		            				},
		            				padding: '0 0 5 0',
		            				items: {
										xtype: 'image',
										itemId: 'image',
										width: 140,
										height: 140,
										padding: '10 0 0 0',
										margin: '0 0 10 0',
									},
		            			},
		            			{
		            				xtype: 'panel',
		            				itemId: 'ressources',
		            				title: TR("Ressources"),
		            				padding: '0 0 5 0',
		            				flex: 1,
		            				layout: 'fit',
		            				items: [
		            					{
		            						xtype: 'grid',
		            						itemId: 'grid',
		            						header: false,
		            						hideHeaders: true,
		            						border: 0,
		            						rowLines: false,
		            						disableSelection: true,
		            						scroll: 'vertical',
		            						store: Ext.create('Ext.data.Store', {
		            							fields: [
		            								{name:'order_index', type:'int'},
		            								{name:'label', type:'string'},
		            								{name:'count', type:'int'},
		            							],
		            							sorters: [
			            							{
												    	property: 'order_index',
												        direction: 'ASC'
												    },
											    ],
		            						}),
		            						columns: [
		            							{
		            								dataIndex: 'label',
		            								flex: 1,
		            							},
		            							{
		            								dataIndex: 'count',
		            								width: 30,
		            								align: 'right',
		            							},
		            						],
		            					},
		            				],
		            			},
		            			/*{
		            				xtype: 'panel',
		            				title: TR("Services"),
		            				flex: 1,
		            			},*/
		            		],
		            	},
		            	{
		            		region: 'center',
		            		xtype: 'container',
		            		layout: {
		            			type: 'vbox',
		            			align: 'stretch',
		            			
		            		},
		            		padding: '0 5 0 5',
		            		items: [
		            			{
		            				xtype: 'panel',
		            				height: 280,
		            				padding: '0 0 5 0',
		            			},
		            			{
		            				xtype: 'panel',
		            				title: TR("Availability"),
		            				padding: '0 0 5 0',
		            				flex: 1,
		            			},
		            			{
		            				xtype: 'panel',
		            				title: TR("Current Activity"),
		            				flex: 1,
		            			},
		            		],
		            	},
		            	{
		            		region: 'east',
		            		xtype: 'container',
		            		width: 200,
		            		layout: {
		            			type: 'vbox',
		            			align: 'stretch',
		            			
		            		},
		            		items: [
		            			{
		            				xtype: 'panel',
		            				height: 200,
		            				padding: '0 0 5 0',
		            				items: [
			            				{
						    				xtype: 'image',
						    				src: "/static/images/tmp/weather.jpeg",
						    				width: 200,
						    				height: 200,
						    			}
		            				],
		            			},
		            			{
		            				xtype: 'panel',
		            				title: TR("My Reservations"),
		            				flex: 1,
		            				padding: '0 0 5 0',
		            				hidden: this.is_member === false,
		            			},
		            			{
		            				xtype: 'panel',
		            				title: TR("Events"),
		            				flex: 1,
		            			},
		            		],
		            	},
		            ],		            
		        }
		    ],
		    listeners: {
            	close: this.onClose,
            },
        });
 
 		this.callParent(arguments);
 		
 		this.updateView(true);
    },
    
    getRelationship: function(){
    	var rec = this.locationRec;
    	this.is_mine = false;
    	this.is_member = false;
    	this.has_pending_invite = false;
    	this.has_pending_request = false;
    	this.has_clearance = false;
    	this.has_pending_clearance = false;

    	// check ownership
    	if (Sp.app.isOp()){
    		var my_rec = Data.locations.getById(rec.data.uuid);
    		if (my_rec){
    			this.is_mine = true;
    			this.locationRec = rec = my_rec;
    			return;
    		}
    	}
    	
    	// check membership
    	Data.memberships.each(function(m){
    		if (m.getLocation().data.uuid == rec.data.uuid){
    			if (m.data.approved){
    				this.is_member = true;
    			} else {
    				if (m.data.join_type == 'R'){
    					this.has_pending_request = true;
    				} else if (m.data.join_type == 'I'){
    					this.has_pending_invite = true;
    				}
    			}
    			return false;
    		}
    	}, this);
    	
    	// check clearance
    	if (this.is_member){
    		var clr = Sp.ui.data.getPersonClearance(rec.data.uuid);
    		if (clr){
    			if (clr.data.approved){
    				this.has_clearance = true;
    			} else {
    				this.has_pending_clearance = true;
    			}
    		}
    	}
    	
    },
    
    editLocation: function(){
    	var editor_id = this.locationRec.data.uuid + '-editor';
    	var form = this.getComponent(editor_id);
    	if (!form){
	    	var form = Ext.create('Sp.views.locations.EditLocation', 
	    		{
	    			itemId: editor_id, 
	    			locationRec: this.locationRec,
	    			getTbFunction: this.getTbFunction,
	    		});
	    	this.add(form);	
    	}
    	this.getLayout().setActiveItem(form);
    	this.down('#makeReservationBt').hide();
    	this.down('#clearancesBt').hide();
    	this.down('#editBt').hide();
    	this.down('#viewBt').show();
    },
    
    viewLocation: function(){
    	this.getLayout().setActiveItem(0);
    	this.down('#makeReservationBt').show();
    	this.down('#clearancesBt').show();
    	this.down('#editBt').show();
    	this.down('#viewBt').hide();
   	},
   	
   	buildRessourcesStore: function(){
   		var store = this.query('#view #west #ressources #grid')[0].getStore();
   		store.removeAll();
   		
   		// aircrafts
   		var aircrafts = {};
   		this.locationRec.Aircrafts().each(function(a){
   			var label = a.data.type;
   			if (a.data.max_slots){
   				if (a.data.max_slots == 1){
   					label += Ext.String.format(' &nbsp;(1 {0})', TR("slot"));
   				} else {
   					label += Ext.String.format(' &nbsp;({0} {1})', a.data.max_slots, TR("slots"));
   				}
   			}
   			if (!Ext.isDefined(aircrafts[label])){
   				aircrafts[label] = {
   					count: 0,
   				};
   			}
   			aircrafts[label].count += 1;
   		});
   		Ext.Object.each(aircrafts, function(k,v){
   			store.add({
    			order_index: 0,
    			label: "<img src='/static/images/icons/plane_small.png'/> " + k,
    			count: v.count,
    		});
   		});
   		   		
   		// workers
   		var roles = {};
    	this.locationRec.Workers().each(function(w){
    		if (w.data.available_fulltime){
	    		w.WorkerTypes().each(function(wt){
	    			if (!Ext.isDefined(roles[wt.data.type])){
	    				roles[wt.data.type] = {
	    					order_index: wt.data.order_index,
							label: wt.data.plural_label,
	    					count: 0,
	    				};
	    			}
	    			roles[wt.data.type].count += 1;
	    		});
    		}
    	});
    	Ext.Object.each(roles, function(k,v){
    		if (k != 'pilot'){
	    		store.add({
	    			order_index: v.order_index,
	    			label: "<img src='/static/images/icons/roles/" + k + ".png'/> " + v.label,
	    			count: v.count,
	    		});	
    		}
    	});
   	},
   	
   	updateButtons: function(){    	
   		this.down('#joinBt').hide();
		this.down('#cancelJoinBt').hide();
		this.down('#inviteReplyBt').hide();
		this.down('#joinSep').hide();
		this.down('#reqClrBt').hide();
		this.down('#cancelClrBt').hide();
		this.down('#makeReservationBt').hide();
		this.down('#actionSep').hide();
		this.down('#clearancesBt').hide();
		this.down('#adminSep').hide();
		this.down('#viewBt').hide();
		this.down('#editBt').hide();
		this.down('#manageSep').hide();
		this.down('#leaveBt').hide();
		this.down('#leaveSep').hide();
		if (this.is_mine){
			this.down('#makeReservationBt').show();
			this.down('#clearancesBt').show();
			this.down('#adminSep').show();
			this.down('#editBt').show();
			this.down('#manageSep').show();
		} else if (this.is_member){
			this.down('#makeReservationBt').show();
			this.down('#actionSep').show();
			this.down('#leaveBt').show();
			this.down('#leaveSep').show();
			if (!this.has_clearance){
				if (this.has_pending_clearance){
					this.down('#cancelClrBt').show();					
				} else {
					this.down('#reqClrBt').show();
				}
			} 
		} else {
			this.down('#joinSep').show();
			if (this.has_pending_request){
				this.down('#cancelJoinBt').show();
			} else if (this.has_pending_invite){
				this.down('#inviteReplyBt').show();
			} else {
				this.down('#joinBt').show();
			}
		}
   	},
    
    updateView: function(init, dont_update_buttons, dont_update_infos){
    	
    	if (!init){
    		this.getRelationship();    		
    	}
    	
    	// update buttons visibility
    	if (!dont_update_buttons){
    		this.updateButtons();    		
    	}
    	
    	if (dont_update_infos){
    		return;
    	}
    	
    	// country
    	var rec = this.locationRec;
    	var country = null;
    	if (rec.data.country){
    		var country = rec.getCountry();
    		if (country.data.iso_code.length == 0){
    			country = null;
    		}	
    	}
    	
    	// city
    	if (rec.data.city){
    		var city_name = rec.getCity().data.name;
    	} else {
    		var city_name = rec.data.custom_city;
    		if (city_name.length == 0){
    			city_name = null;
    		}
    	}
    	
    	// title = Name ([city - ]country)
    	var title = "<span class='semi-bold'>" + rec.data.name + '</span>';
    	if (country){
	    	if (city_name){
	    		title += ' &nbsp; (' + city_name + ' - ';  
	    	} else {
	    		title += ' &nbsp; (';
	    	}
	    	title += country.data[Sp.utils.i18n.getCountryNameField()] + ')';
    		var flag_img = '/static/images/flags/' + country.data.iso_code.toLowerCase() + '.png';
    	} else {
    		var flag_img = '/static/images/flags/none.png';
    	}
    	
    	// toolbar flag and title
    	this.getDockedItems('toolbar[dock="top"]')[0].getComponent('flag').setSrc(flag_img);
    	this.getDockedItems('toolbar[dock="top"]')[0].getComponent('title').setText(title, false);
    	
    	// picture
    	var picture = '/static/images/nothing.png';
    	if (rec.data.picture){
    		picture = rec.data.picture;
    	}
    	this.down('#image').setSrc(picture);
    	
    	// ressources
    	this.buildRessourcesStore();
    },
    
    getMembership: function(){
    	var membership;
    	Data.memberships.each(function(m){
    		if (m.getLocation().data.uuid == this.locationRec.data.uuid){
    			membership = m;
    			return false;
    		}
    	}, this);
    	return membership;
    },
    
    clearRequestStores: function(membership_uuid){
    	var r = Data.newInvites.getById(membership_uuid);
    	if (r){
    		Data.newInvites.remove(r);
    	}
    	var idx = Data.newRequestsList.findExact('uuid', membership_uuid);
    	if (idx != -1){
    		Data.newRequestsList.removeAt(idx);
    	}
    },
    
    joinLocation: function(){
    	var joinBt = this.down('#joinBt');
    	var cancelBt = this.down('#cancelJoinBt');
		joinBt.disable();
		joinBt.setText(TR("Sending join request..."));
		var r = Data.create('LocationMembership', {
    		location: this.locationRec.data.uuid,
    		person: Data.me.data.uuid,
    	});
    	r.save({
    		callback: function(){
    			Data.load('LocationMembership_R', r.data.uuid, function(membership){
					Data.memberships.add(membership);
					joinBt.hide();
					joinBt.setText(TR("Join"));
					joinBt.enable();
					if (membership.data.approved){
						this.is_member = true;
						this.updateButtons();
						Notify(TR("Welcome"), Ext.String.format(TR("You have successfully joined {0}"), this.locationRec.data.name));
					} else {
						this.has_pending_request = true;
						this.updateButtons();
						Notify(TR("Request sent"), TR("Your join request has been successfully sent"));						
					}
				}, this);
    	},
    	scope: this,
    	});
    },
    
    leaveLocation: function(){
    	var membership = this.getMembership();
    	if (!membership){
    		return;
    	}
    	var leaveBt = this.down('#leaveBt');
    	leaveBt.disable();
    	leaveBt.setText(TR("Leaving..."));
    	Sp.utils.rpc('membership.leaveLocation', [membership.data.uuid], function(){
    		Data.memberships.remove(membership);
    		this.is_member = false;
    		leaveBt.hide();
    		leaveBt.enable();
    		leaveBt.setText(TR("Leave"));
    		this.updateButtons();
    	}, this);
    },
    
    cancelRequest: function(){
    	var membership = this.getMembership();
    	if (!membership){
    		return;
    	}
    	var cancelBt = this.down('#cancelJoinBt');
    	cancelBt.disable();
    	cancelBt.setText(TR("Canceling join request..."));
    	Sp.utils.rpc('membership.cancelRequest', [membership.data.uuid], function(){
    		Data.memberships.remove(membership);
    		this.has_pending_request = false;
    		cancelBt.hide();
    		cancelBt.enable();
    		cancelBt.setText(TR("Cancel join request"));
    		this.updateButtons();
    	}, this);
    },
    
    acceptInvitation: function(){
    	var membership = this.getMembership();
    	if (!membership){
    		return;
    	}
    	var replyBt = this.down('#inviteReplyBt');
    	replyBt.disable();
    	replyBt.setText(TR("Accepting invitation..."));
    	Sp.utils.rpc('membership.acceptInvitation', [membership.data.uuid], function(){
    		// update membership
			membership.beginEdit();
			membership.set('approved', true);
			membership.set('new_approval', false);
			membership.endEdit();
			membership.commit();
			// clear invitation reqquest
			this.clearRequestStores(membership.data.uuid);
			// update ui
			this.is_member = true;
			this.has_pending_invite = false;
			replyBt.hide();
			replyBt.enable();
    		replyBt.setText(TR("Accept invitation"));
			this.updateButtons();
		}, this);
    },
    
    rejectInvitation: function(){
    	var membership = this.getMembership();
    	if (!membership){
    		return;
    	}
    	var replyBt = this.down('#inviteReplyBt');
    	replyBt.disable();
    	replyBt.setText(TR("Declining invitation..."));
    	Sp.utils.rpc('membership.rejectInvitation', [membership.data.uuid], function(){
    		// delete membership
    		Data.memberships.remove(membership);
			// clear invitation reqquest
			this.clearRequestStores(membership.data.uuid);
			// update ui
			this.has_pending_invite = false;
			replyBt.hide();
			replyBt.enable();
    		replyBt.setText(TR("Accept invitation"));
			this.updateButtons();
		}, this);
    },
    
    requestClearance: function(){
    	Ext.create('Sp.views.locations.AddClearance', {
			locationRec: this.locationRec,
			personRequest: true,
		}).show();    	
    },
    
    cancelClearanceRequest: function(){
    	var clearance = Sp.ui.data.getPersonClearance(this.locationRec.data.uuid);
    	if (!clearance){
    		return;
    	}
    	var cancelBt = this.down('#cancelClrBt');
    	cancelBt.disable();
    	cancelBt.setText(TR("Canceling clearance request..."));
    	Sp.utils.rpc('clearance.cancel', [clearance.data.uuid], function(){
    		Data.clearances.remove(clearance);
    		this.has_pending_clearance = false;
    		cancelBt.hide();
    		cancelBt.enable();
    		cancelBt.setText(TR("Cancel clearance request"));
    		this.updateButtons();
    	}, this);
    },
    
    onClose: function(){
    	this.ownerCt.getLayout().prev();
    },
    
});
