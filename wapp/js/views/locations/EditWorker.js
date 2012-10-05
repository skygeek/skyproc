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


Ext.define('Sp.views.locations.EditWorker', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
    	this.spokenLangsGridRendered = false;
    	this.RolesGridRendered = false;
    	
    	var rec = this.workerRec;
    	
    	if (rec){
    		var title = rec.data.name + ' - ' + TR("Edit staff member");
    		var ok_text = TR("Apply");
    		var ok_handler = this.editWorker;
    	} else {
    		var title = TR("New staff member");
    		var ok_text = TR("Add");
    		var ok_handler = this.createWorker;
    	}
    	
        Ext.apply(this, {
        	width: 700,
        	height: 500,
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
		            				title: TR("Identification"),
		            				icon: '/static/images/icons/person.png',
		            				padding: '5 5 0 5',
		            				items: [
		            					{
		            						xtype: 'fieldset',
		            						title: TR("Personnal informations"),
		            						defaults: {
		            							anchor: '100%',
		            						},
		            						items: [
		            							{
		            								name: 'name',
		            								xtype: 'textfield',
		            								fieldLabel: TR("Name"),
		            							},
		            							{
											    	name: 'birthday',
											        xtype: 'datefield',
											        fieldLabel: TR("Birthday"),
											        maxValue: new Date(),
											        minValue: new Date(new Date().getFullYear()-150+'-1-1'),
											        editable: false,
											    },
											    {
											        xtype: 'radiogroup',
											        fieldLabel: TR("Gender"),
											        anchor: '40%',
											        items: [
											        	{
											        		boxLabel: TR("Male"), 
											            	name: 'gender', 
											            	inputValue: 'M',
											            },
											            {
											            	boxLabel: TR("Female"),
											            	name: 'gender',
											            	inputValue: 'F',
											            },
											        ]
											    },
											    {
											    	name: 'phone',
		            								xtype: 'textfield',
		            								fieldLabel: TR("Phone"),
		            							},
		            							{
		            								name: 'email',
		            								xtype: 'textfield',
		            								fieldLabel: TR("Email"),
		            							},
		            							{
											    	name: 'postal_address',
											    	xtype: 'textarea',
											        fieldLabel: TR("Address"),
											        rows: 3,
											    },
		            						],
		            					},
		            					{
		            						xtype: 'fieldset',
		            						itemId: 'langs_fs',
		            						title: TR("Select the languages spoken by this staff member"),
		            						defaults: {
		            							anchor: '100%',
		            						},
		            						items: [
		            							{
		            								xtype: 'fieldcontainer',
		            								itemId: 'ctx',
		            								fieldLabel: TR("Languages"),
		            								items: [
		            									{
				            								xtype: 'grid',
				            								itemId: 'spoken_langs',
				            								header: false,
				            								hideHeaders: true,
				            								rowLines: false,
				            								stripeRows: false,
				            								height: 100,
				            								store: Data.spokenLangs,
				            								selModel: Ext.create('Ext.selection.CheckboxModel'),
				            								columns: [
				            									{
				            										dataIndex: 'lang',
				            										width: 22,
				            										renderer: function(lang){
				            											var flag_img = "/static/images/flags/" + lang.toLowerCase() + ".png";
				            											return "<img src='" + flag_img + "'/>";
				            										}
				            									},
				            									{
				            										dataIndex: 'label',
				            										flex: 1,
				            									},
				            								],
				            								listeners: {
				            									afterlayout: Ext.bind(this.onSpokenLangsGridLayout, this),
				            								},
				            							},
		            								],
		            							},
		            						],
		            					},
		            				],
		            			},
		            			{
		            				title: TR("Roles"),
		            				itemId: 'roles',
		            				icon: '/static/images/icons/user_registered.png',
		            				padding: '5 5 0 5',
		            				items: [
		            					{
		            						xtype: 'fieldset',
		            						itemId: 'fs',
		            						title: TR("Select one or more roles"),
		            						defaults: {
		            							anchor: '100%',
		            						},
		            						items: [
		            							{
		            								xtype: 'fieldcontainer',
		            								itemId: 'ctx',
		            								fieldLabel: TR("Roles"),
		            								items: [
		            									{
				            								xtype: 'grid',
				            								itemId: 'roles',
				            								height: 360,				            								
				            								header: false,
				            								hideHeaders: true,
				            								rowLines: false,
				            								stripeRows: false,
				            								store: Data.workerTypes,
				            								selModel: Ext.create('Ext.selection.CheckboxModel'),
				            								columns: [
				            									{
				            										dataIndex: 'type',
				            										width: 22,
				            										renderer: function(type){
				            											return "<img src='/static/images/icons/" + type + ".png'/>";
				            										}
				            									},
				            									{
				            										dataIndex: 'label',
				            										flex: 1,
				            									},
				            								],
				            								listeners: {
				            									afterlayout: Ext.bind(this.onRolesGridLayout, this),
				            								},
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
						                    boxLabel: TR("This staff member is available full time"),
						                    checked: true,
						                    //inputValue: true,
						               },
		            				],
		            			},
		            			{
		            				title: TR("Remuneration"),
		            				icon: '/static/images/icons/money.png',
		            				padding: '15 0 0 10',
		            				items: [
		            					{
		            						name: 'employee',
		            						xtype: 'checkbox',
						                    boxLabel: TR("This staff member is a salaried employee"),
						                    checked: true,
						                    //inputValue: true,
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
					handler: ok_handler,
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
 		
 		if (rec){
 			this.getComponent('form').form.loadRecord(rec);
 		}
 		
    },
    
    onSpokenLangsGridLayout: function(grid){
    	if (this.spokenLangsGridRendered === true){
    		return;
    	}
    	this.spokenLangsGridRendered = true;
    	if (this.workerRec){
    		// select spoken langs
    		Sp.ui.data.selectFromStore(
    			grid.getSelectionModel(), 
    			this.workerRec.SpokenLangs()
    		);
    	}
    },
    
    onRolesGridLayout: function(grid){
    	if (this.RolesGridRendered === true){
    		return;
    	}
    	this.RolesGridRendered = true;
    	if (this.workerRec){
    		// select roles
    		Sp.ui.data.selectFromStore(
    			grid.getSelectionModel(), 
    			this.workerRec.WorkerTypes()
    		);
    	}
    },

    createWorker: function(){
    	
    	// create record
		var r = Sp.ui.data.createFormRecord(this.getComponent('form'), 'Worker');
		
		if (!r){
			return;
		}
		
		// update spoken langs
		if (this.spokenLangsGridRendered){
			Sp.ui.data.updateFromSelection(
	    		this.query('#form #tabs #id #langs_fs #ctx #spoken_langs')[0].getSelectionModel(), 
	    		r, 
	    		'spoken_langs',
	    		r.SpokenLangs()
	    	);
		}
		
    	// update roles
    	if (this.RolesGridRendered){
    		Sp.ui.data.updateFromSelection(
	    		this.query('#form #tabs #roles #fs #ctx #roles')[0].getSelectionModel(), 
	    		r, 
	    		'roles',
	    		r.WorkerTypes()
	    	);
    	}
    	
    	// add record to the store
    	this.locationRec.Workers().add(r);
    	
    	// close window
    	this.close();
    },
    
    editWorker: function(){
    	
    	// update record
    	this.getComponent('form').form.updateRecord();
    	
    	// update spoken langs
    	if (this.spokenLangsGridRendered){
	    	Sp.ui.data.updateFromSelection(
	    		this.query('#form #tabs #id #langs_fs #ctx #spoken_langs')[0].getSelectionModel(), 
	    		this.workerRec, 
	    		'spoken_langs',
	    		this.workerRec.SpokenLangs()
	    	);
    	}
    	
    	// update roles
    	if (this.RolesGridRendered){
	    	Sp.ui.data.updateFromSelection(
	    		this.query('#form #tabs #roles #fs #ctx #roles')[0].getSelectionModel(), 
	    		this.workerRec, 
	    		'roles',
	    		this.workerRec.WorkerTypes()
	    	);
	    }
	    
	    // update view
	    this.workerRec.afterCommit();
    	
    	// close window
    	this.close();
    },

});
