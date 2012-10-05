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


Ext.define('Sp.views.locations.EditProfile', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
    	this.cancel_close = true;
    	var rec;
    	
    	if (this.profileRec){
    		rec = this.profileRec;
    		var title = rec.data.name + ' - ' + TR("Edit membership profile");
    		var ok_text = TR("Apply");
    		var ok_handler = this.editProfile;
    	} else {
    		rec = this.profileRec = Data.create('MembershipProfile', {
    			location: this.locationRec.data.uuid,
    		});
    		var title = TR("New membership profile");
    		var ok_text = TR("Add");
    		var ok_handler = this.createProfile;
    	}
    	
        Ext.apply(this, {
        	width: 550,
        	height: 510,
        	modal: true,
        	resizable: false,
        	title: title,
        	layout: 'fit',
        	
            items: [
            	{
            		xtype: 'form',
            		itemId: 'form',
            		padding: 10,
            		border: 0,
            		items: [
            			{
            				xtype: 'fieldset',
            				title: TR("Profile identification"),
            				defaults: {
            					anchor: '100%',
            				},
            				items: [
            					{
            						name: 'name',
            						xtype: 'textfield',
            						fieldLabel: TR("Profile Name"),
            					},
            					{
            						name: 'default',
            						xtype: 'checkbox',
            						fieldLabel: TR("Default Profile"),
            					},
            				],
            			},
            			{
            				xtype: 'fieldset',
            				title: TR("Billing Options"),
            				defaults: {
            					anchor: '100%',
            				},
            				items: [
            					{
							    	name: 'billing_mode',
							    	xtype: 'combobox',
							    	fieldLabel: TR("Billing Mode"),
							    	store: Ext.create('Ext.data.Store', {
									    fields: ['mode', 'label'],
									    data : [
									        {mode:'pre', label: TR("Prepaid")},
									        {mode:'post', label: TR("Postpaid")},
									        {mode:'other', label: TR("Bill Other")},
									        {mode:'none', label: TR("No Billing")},
									    ]
									}),
									queryMode: 'local',
									forceSelection: true,
									editable: false,
								    displayField: 'label',
								    valueField: 'mode',
								    listeners: {
						            	change: Ext.bind(function(cb, newValue){
						            		if (newValue == 'pre'){
						            			this.down('#creditLine').hide();
						            			this.down('#currency').show();
						            			this.down('#billPerson').hide();
						            			this.down('#catalogFs').show();
						            			this.down('#catalogDetailsCtx').show();
						            		} else if (newValue == 'post'){
						            			this.down('#creditLine').show();
						            			this.down('#currency').show();
						            			this.down('#billPerson').hide();
						            			this.down('#catalogFs').show();
						            			this.down('#catalogDetailsCtx').show();
						            		} else if (newValue == 'other'){
						            			this.down('#creditLine').hide();
						            			this.down('#currency').show();
						            			this.down('#billPerson').show();
						            			this.down('#catalogFs').show();
						            			this.down('#catalogDetailsCtx').show();
						            		} else if (newValue == 'none'){
						            			this.down('#creditLine').hide();
						            			this.down('#currency').hide();
						            			this.down('#billPerson').hide();
						            			this.down('#catalogFs').hide();
						            			this.down('#catalogDetailsCtx').hide();
						            		}
						            	}, this),
						            },
							    },
							    {
							    	name: 'bill_person',
							    	xtype: 'combobox',
							    	itemId: 'billPerson',
							    	fieldLabel: TR("Member to bill"),
							    	hidden: true,
							    	store: Data.createStore('LocationMembership', {
				        				buffered: true,
				        				pageSize: 20,
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
				        				filters: [
				        					{
				        						property: 'location',
				        						value: this.locationRec.data.uuid,
				        					},
				        				],
				        				proxy: {
								        	extraParams: {
								            	query_field: 'person__last_name',
								            },
								        },
				        			}),
								    valueField: 'person',
								    hideTrigger: true,
								    queryDelay: 250,
								    typeAhead: true,
								    minChars: 3,
							    	tpl: Ext.create('Ext.XTemplate',
								        '<tpl for=".">',
								            '<div class="x-boundlist-item">',
								            "{person.last_name} {person.first_name}",
								            '</div>',
								        '</tpl>'
								    ),
								    displayTpl: Ext.create('Ext.XTemplate',
								        '<tpl for=".">',
								            '{person.last_name} {person.first_name}',
								        '</tpl>'
								   ),
								   listConfig: {
						                loadingText: TR("Searching..."),
						                emptyText: TR("No matching members found"),
						            },
						            pageSize: 20,
						            listeners: {
						            	afterrender: Ext.bind(function(cb){
						            		if (this.profileRec.data.bill_person){
						            			var store = cb.getStore();
						            			var on_load_fn = Ext.bind(function(store, records, successful){
						            				if (successful && records[0]){
						            					cb.setValue(records[0]);
						            				}
						            				store.filters.removeAt(1);
						            				store.un('load', on_load_fn);
						            			}, this)
						            			store.on('load', on_load_fn);
						            			store.filter('person', this.profileRec.data.bill_person);
						            		}
						            	}, this),
						            },
							   	},
							    {
							    	name: 'credit_line',
							    	xtype: 'numberfield',
							    	itemId: 'creditLine',
							    	fieldLabel: TR("Credit Line"),
							    	minValue: 0,
							    	maxValue: 999999999,
							    	emptyText: TR("No Limit"),
							    	hidden: true,
							    },
							    {
							    	name: 'currency',
    								xtype: 'combobox',
    								itemId: 'currency',
    								fieldLabel: TR("Default Currency"),
    								store: this.locationRec.Currencies(),
    								queryMode: 'local',
    								displayField: 'code',
    								valueField: 'uuid',
    								forceSelection: true,
    								lastQuery: '',
    								hidden: true,
    								listeners: {
    									select: Ext.bind(this.buildDefaultPricesStore, this),
    								},
    							},
            				],
            			},
            			{
            				xtype: 'fieldset',
            				title: TR("Catalog Options"),
            				itemId: 'catalogFs',
            				hidden: true,
            				defaults: {
            					anchor: '100%',
            				},
            				items: [
            					{
							    	name: 'default_catalog_item',
    								xtype: 'combobox',
    								fieldLabel: TR("Default Item"),
    								store: this.locationRec.LocationCatalogItems(),
    								queryMode: 'local',
    								displayField: 'name',
    								valueField: 'uuid',
    								forceSelection: true,
    								lastQuery: '',
    								listeners: {
    									select: Ext.bind(this.buildDefaultPricesStore, this),
    								},
    							},
    							{
							    	name: 'default_catalog_price',
							    	xtype: 'combobox',
							    	itemId: 'defaultPrice',
							    	fieldLabel: TR("Default Price"),
							    	store: Ext.create('Ext.data.Store', {
									    fields: ['uuid', 'price'],
									}),
									queryMode: 'local',
									forceSelection: true,
									editable: false,
								    displayField: 'price',
								    valueField: 'uuid',
							    },
							    {
							    	name: 'catalog_access',
							    	xtype: 'checkbox',
							    	boxLabel: TR("The user can choose other items from the catalog"),
							    	listeners: {
							    		change: Ext.bind(function(me, value){
							    			this.down('#catalogItemsAvailBt').setDisabled(!value);
							    		}, this),
							    	},
							    },
            				],
            			},
            			{
            				xtype: 'container',
            				itemId: 'catalogDetailsCtx',
            				layout: {
            					type: 'hbox',
            					padding: '0 40 0 40',
            				},
            				defaults: {
            					flex: 1,
            					iconAlign: 'top',
            				},
            				items: [
            					{
            						xtype: 'button',
            						itemId: 'catalogItemsAvailBt',
            						text: TR("Available Catalog Items"),
            						icon: '/static/images/icons/basket.png',
            						margin: '0 50 0 0',
            						disabled: true,
            					},
            					{
            						xtype: 'button',
            						text: TR("Extra Catalog Items"),
            						icon: '/static/images/icons/basket_plus.png',
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
			listeners: {
				close: Ext.bind(this.onClose, this),
			},
        });
 
 		this.callParent(arguments);
 		
 		this.getComponent('form').form.loadRecord(rec);
 		
 		this.buildDefaultPricesStore();
    },
    
    buildDefaultPricesStore: function(){
    	var form = this.getComponent('form').form;
    	var item_uuid = form.findField('default_catalog_item').getValue();
    	var currency_field = form.findField('currency');
    	var currency_uuid = currency_field.getValue();
    	var currency_code = currency_field.getRawValue();
    	var price_field = this.down('#defaultPrice');
    	if (item_uuid && currency_uuid){
    		var item_rec = this.locationRec.LocationCatalogItems().getById(item_uuid);
    		if (item_rec){
    			var prices = [];
    			item_rec.LocationCatalogPrices().each(function(p){
    				if (p.getCurrency().data.uuid == currency_uuid){
	    				prices.push({
	    					uuid: p.data.uuid,
	    					price: p.data.price + ' ' + currency_code,
	    				});	
    				}
    			}, this);
    			var store = price_field.getStore();
    			store.loadRawData(prices);
    			if (this.profileRec.data.default_catalog_price){
    				if (Ext.isObject(this.profileRec.data.default_catalog_price)){
	    				var price_uuid = this.profileRec.data.default_catalog_price.uuid;
	    			} else {
	    				var price_uuid = this.profileRec.data.default_catalog_price;
	    			}
    				var r = store.findRecord('uuid', price_uuid);
    				if (r){
    					price_field.setValue(r);
    				}
    			}
    		}
    	}
    },

    updateProfile: function(create){
    	
    	var form = this.getComponent('form');
    	var record = form.form.getRecord();
    	
    	// validation
    	if (!Sp.ui.data.validateForm(form)){
    		return;
    	}
    	
    	// only one profile has to be default one
    	if (form.form.findField('default').getValue() && !record.data['default']){
    		this.locationRec.MembershipProfiles().each(function(p){
    			if (p.data['default']){
    				p.beginEdit();
    				p.set('default', false);
    				p.endEdit();
    			}
    		});
    	}
    	
    	// update record
    	form.form.updateRecord();
    	
    	// person to bill
    	if (Ext.isObject(record.data.bill_person)){
    		record.beginEdit();
    		record.set('bill_person', record.data.bill_person.uuid);
    		record.endEdit();
    	}
    	
    	if (create){
    		// add record to the store
    		this.locationRec.MembershipProfiles().add(record);
    	} else {
    		// update view
	    	record.afterCommit();
    	}
	    
    	// close window
    	this.cancel_close = false;
    	this.close();
    },
    
    createProfile: function(){
    	this.updateProfile(true);
    },
    
    editProfile: function(){
    	this.updateProfile();
    },
    
    onClose: function(){
    	if (this.cancel_close){
    	}
    },

});
