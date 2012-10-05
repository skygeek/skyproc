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


Ext.define('Sp.views.locations.AddMember', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
    	this.personRec = Data.create('Person');
    	
        Ext.apply(this, {
        	width: 560,
        	height: 400,
        	modal: true,
        	resizable: false,
        	title: TR("New Member"),
        	icon: '/static/images/icons/add_user.png',
        	layout: 'fit',
            items: [
            	{
            		xtype: 'form',
            		itemId: 'form',
            		margin: Sp.core.Globals.WINDOW_MARGIN,
            		border: 0,
            		defaults: {
            			defaults: {
							anchor: '100%',
						},
            		},
            		items: [
            			{
							xtype: 'fieldset',
							title: TR("Personnal informations"),
							items: [
								{
									name: Data.me.data.name_order == 'FL' ? 'first_name' : 'last_name',
									xtype: 'textfield',
									fieldLabel: Data.me.data.name_order == 'FL' ? TR("First name") : TR("Last name"),
								},
								{
									name: Data.me.data.name_order == 'FL' ? 'last_name' : 'first_name',
									xtype: 'textfield',
									fieldLabel: Data.me.data.name_order == 'FL' ? TR("Last name") : TR("First name"),
								},
								{
									name: 'email',
									xtype: 'textfield',
									fieldLabel: TR("Email"),
								},
							    {
							        xtype: 'radiogroup',
							        fieldLabel: TR("Gender"),
							        anchor: '55%',
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
							    	name: 'birthday',
							        xtype: 'datefield',
							        fieldLabel: TR("Birthday"),
							        maxValue: new Date(),
							        minValue: new Date(new Date().getFullYear()-150+'-1-1'),
							        editable: false,
							    },
								Sp.ui.getCountryCombo('country', 'country', TR("Country"), 
							    	{select: Ext.bind(this.onCountrySelect, this)}),
							    Sp.ui.getCityCombo('city', 'city', TR("City"), 
							    	{change: Ext.bind(this.onCityChange, this)}),
							    Sp.ui.getCustomCityField('custom_city', 'customCity'),
							],
						},
						{
            				xtype: 'fieldset',
            				title: TR("Add to profile"),
            				items: [
            					{
							    	name: 'profile',
    								xtype: 'combobox',
    								fieldLabel: TR("Profile"),
    								store: this.locationRec.MembershipProfiles(),
    								queryMode: 'local',
    								displayField: 'name',
    								valueField: 'uuid',
    								forceSelection: true,
    								lastQuery: '',
    								allowBlank: false,
    								listeners: {
    									afterrender: function(me){
    										var default_profile = me.getStore().findRecord('default', true);
    										if (default_profile){
    											me.setValue(default_profile);
    										}
    									},
    								},
    							},
            				],
            			},
            		],
            	},
            ],
            buttons: [
				{
					text: TR("Create"),
					itemId: 'createBt',
					icon: '/static/images/icons/save.png',
					handler: this.create,
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
 		this.getComponent('form').form.loadRecord(this.personRec);
    },
    
    onCountrySelect: function(cb, records){
    	Sp.ui.countryChanged(records, this.down('#city'), this.down('#customCity'));
    },
    
    onCityChange: function(city_cb, value){
    	if (!value){
    		this.down('#customCity').setValue('');
    	}
    },
    
    setBusy: function(busy){
    	if (busy){
    		this.body.mask(TR("Please wait..."));
    	} else {
    		this.body.unmask();
    	}
    	this.down('#createBt').setDisabled(busy);
    	this.down('#cancelBt').setDisabled(busy);
    },
    
    create: function(){
		var form = this.getComponent('form');
    	var record = form.form.getRecord();
		
		// validation
    	if (!Sp.ui.data.validateForm(form)){
    		return;
    	}
    	
    	// update record
    	form.form.updateRecord();
    	
    	// custom city
    	var city_store = this.down('#city').getStore();
    	var is_custom_city = Sp.ui.saveCustomCity(record, city_store);
    	
    	this.setBusy(true);
    	
    	// check duplicate
    	Sp.utils.rpc('membership.emailExists', [record.data.email], function(email_exists){
    		if (email_exists){
    			Ext.MessageBox.show({
				    title: TR("Duplicate email address"),
				    msg: Ext.String.format(TR("The email address '{0}' is already in use"), record.data.email),
				    buttons: Ext.MessageBox.OK,
				    icon: Ext.MessageBox.ERROR,
				});
				this.setBusy(false);
    			return;
    		}
    		// save person
    		record.save({
	    		callback: function(rec, op){
	    			if (!op.success){
	    				this.setBusy(false);
	    				return;
	    			}
	    			// create membership
	    			var membership = Data.create('LocationMembership', {
	    				location: this.locationRec.data.uuid,
	    				person: record.data.uuid,
	    				join_type: 'I',
	    				approved: true,
	    				new_approval: false,
	    				profile: form.form.findField('profile').getValue(),
	    			});
	    			// save membership
	    			membership.save({
	    				callback: function(rec, op){
	    					if (!op.success){
	    						this.setBusy(false);
			    				return;
			    			}
			    			// reload membership
			    			Data.load('LocationMembership', membership.data.uuid, function(membership_rec){
			    				this.membersStore.add(membership_rec);
			    				this.close();
			    			}, this);
	    				},
	    				scope: this,
	    			});
	    		},
	    		scope: this,
	    	});
    	}, this);
    },
                
});
