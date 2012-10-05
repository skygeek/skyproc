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


Ext.define('Sp.views.locations.MembershipOpt', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
    	this.cancel_close = true;
    	
    	var rec = this.locationRec;
    	
        Ext.apply(this, {
        	width: 580,
        	height: 520,
        	modal: true,
        	resizable: false,
        	title: TR("Edit Membership Options"),
        	icon: '/static/images/icons/membership.png',
        	layout: 'fit',
            items: [
            	{
            		xtype: 'form',
            		itemId: 'form',
            		margin: 10,
            		border: 0,
            		layout: {
            			type: 'vbox',
            			align: 'stretch',
            		},
            		items: [
            			{
            				xtype: 'fieldset',
            				title: TR("Membership Profiles"),
            				flex: 1,
            				layout: 'fit',
            				items: [
            					{
            						xtype: 'grid',
            						itemId: 'profilesGrid',
            						store: rec.MembershipProfiles(),
            						columns: [
            							{
            								header: TR("Profiles"),
            								dataIndex: 'name',
            								flex: 1,
            								sortable: true,
            							},
            							{
            								header: TR("Default"),
            								dataIndex: 'default',
            								width: 60,
            								align: 'center',
            								renderer: function(v){
            									if (v){
            										return "<img src='/static/images/icons/default.png'/>";
            									} 
            								},
            							},
            						],
            						selModel: Ext.create('Ext.selection.CheckboxModel'),
				        			sortableColumns: false,
				        			enableColumnHide: false,
				        			enableColumnResize: false,
            						tbar: [
				        				
				        				'->',
				        				{
				        					text: TR("Add profile"),
				        					icon: '/static/images/icons/new_green.png',
				        					handler: this.addProfile,
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
				        							handler: this.editSelectedProfile,
				        							scope: this,
				        						},
				        						{
				        							itemId: 'default',
				        							text: TR("Set as default"),
				        							icon: '/static/images/icons/default.png',
				        							handler: this.setSelectedDefaultProfile,
				        							scope: this,
				        						},
				        						'-',
				        						{
				        							itemId: 'delete',
				        							text: TR("Delete"),
				        							icon: '/static/images/icons/trash.png',
				        							handler: this.deleteSelectedProfiles,
				        							scope: this,
				        						},
				        					],
				        				}
				        			],
				        			listeners: {
				            			itemdblclick: Ext.bind(this.onProfileDblClick, this),
				            			itemcontextmenu: Ext.bind(this.onProfileContextMenu, this),
				            		},
            					},
            				],
            			},
            			{
            				xtype: 'fieldset',
            				title: TR("Auto Accept"),
            				defaults: {
            					anchor: '100%'
            				},
            				items: [
							    {
							    	name: 'member_auto_accept',
							    	xtype: 'checkbox',
							    	boxLabel: TR("Automatically accept new membership requests and add them to the default profile"),
							    },
            				],
            			},
            		],
            	},
            ],
            buttons: [
				{
					text: TR("Apply"),
					icon: '/static/images/icons/save.png',
					handler: this.apply,
					scope: this,
				},
				{
					text: TR("Cancel"),
					icon: '/static/images/icons/cancel.png',
					handler: this.close,
					scope: this,
				},
			],
			listeners: {
				close: Ext.bind(this.onClose, this),
			},
        });
 
 		this.callParent(arguments);
 		
 		var profilesGrid = this.down('#profilesGrid');
 		
 		profilesGrid.getStore().sort([
 			{ property: 'name',  direction: 'ASC' },
 		]);
 		
 		this.down('#form').form.loadRecord(rec);

 		// events
 		profilesGrid.getSelectionModel().on('selectionchange', Ext.bind(this.profileSelectionChanged, this));
 		
    },
    
    editProfile: function(profileRec){
    	Ext.create('Sp.views.locations.EditProfile', {
    		locationRec: this.locationRec,
    		profileRec: profileRec,
    	}).show();
    },
    
    deleteProfiles: function(profiles){
    	var msg;
    	if (profiles.length == 0){
    		return;
    	} else if (profiles.length == 1){
    		msg = Ext.String.format(
				TR("Are you sure you want to remove the profile named '{0}' ?"), 
				profiles[0].data.name);
    	} else {
    		msg = Ext.String.format(
				TR("Are you sure you want to remove the {0} selected profiles ?"), 
				profiles.length);
    	}
    	Ext.MessageBox.confirm( TR("Confirmation"), msg,
			function(btn){
				if (btn == 'yes'){
					this.locationRec.MembershipProfiles().remove(profiles);
				}
			}, this
		);
    },
    
    addProfile: function(){
    	this.editProfile();
    },
    
    onProfileDblClick: function(me, r, el){
    	this.editProfile(r);
    },
    
    profileSelectionChanged: function(sm, selected){
    	var action_bt = this.down('#actionBt');
    	action_bt.setDisabled((selected.length == 0));
    	action_bt.menu.getComponent('edit').setDisabled((selected.length != 1));
    	var set_default_bt = action_bt.menu.getComponent('default');
    	set_default_bt.setDisabled((selected.length != 1));
    	set_default_bt.show();
    	if (selected.length == 1){
    		set_default_bt.setVisible(!selected[0].data['default']);
    	}
    },
    
    deleteSelectedProfiles: function(){
    	this.deleteProfiles(this.down('#profilesGrid').getSelectionModel().getSelection());
    },
    
    editSelectedProfile: function(){
    	this.editProfile(this.down('#profilesGrid').getSelectionModel().getSelection()[0]);    	
    },
    
    setSelectedDefaultProfile: function(){
    	this.setDefaultProfile(this.down('#profilesGrid').getSelectionModel().getSelection()[0]);    	
    },
    
    setDefaultProfile: function(profile){
    	this.locationRec.MembershipProfiles().each(function(p){
    		if (p.data['default']){
    			p.beginEdit();
    			p.set('default', false);
    			p.endEdit();
    		}
    	});
    	profile.beginEdit();
    	profile.set('default', true);
    	profile.endEdit();
    },
    
    onProfileContextMenu: function(grid, record, el, idx, ev){
    	var menu = Ext.create('Ext.menu.Menu', {
		    items: [
			    {
			        text: TR("Edit"),
			        icon: '/static/images/icons/edit.png',
			        handler: function(){
			        	this.editProfile(record);			        				        	
			        },
			        scope: this,
			    },
			    {
			        text: TR("Set as default"),
			        icon: '/static/images/icons/default.png',
			        handler: function(){
			        	this.setDefaultProfile(record);
			        },
			        scope: this,
			        hidden: record.data['default'],
			    },
			    '-',
			    {
			        text: TR("Delete"),
			        icon: '/static/images/icons/trash.png',
			        handler: function(){
			        	this.deleteProfiles([record]);
			        },
			        scope: this,
			    },
		    ]
		});
    	
    	// show context menu
    	ev.preventDefault();
    	menu.showAt(ev.getXY());
    },
    
    apply: function(){
    	this.down('#form').form.updateRecord();
    	this.cancel_close = false;
    	this.close();
    },
    
    onClose: function(){
    	if (this.cancel_close){
    		this.locationRec.MembershipProfiles().rejectChanges();
    	}
    },
    
});
