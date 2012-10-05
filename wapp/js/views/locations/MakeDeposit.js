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


Ext.define('Sp.views.locations.MakeDeposit', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
        Ext.apply(this, {
        	width: 375,
        	height: 110,
        	modal: true,
        	resizable: false,
        	title: TR("Make a deposit"),
        	icon: '/static/images/icons/cash.png',
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
            				xtype: 'fieldcontainer',
            				fieldLabel: TR("Amount"),
            				labelWidth: 60,
            				layout: 'hbox',
            				items: [
            					{
            						name: 'amount',
            						xtype: 'numberfield',
            						allowBlank: false,
            						minValue: -999999999,
            						maxValue: 999999999,
            						flex: 1,
            					},
            					{
							    	name: 'currency',
    								xtype: 'combobox',
    								store: this.locationRec.Currencies(),
    								queryMode: 'local',
    								displayField: 'code',
    								valueField: 'uuid',
    								forceSelection: true,
    								lastQuery: '',
    								width: 80,
    								listeners: {
    									afterrender: function(me){
    										var currency = Sp.ui.data.getPersonCurrency(this.membershipRec, this.locationRec);
    										if (currency){
    											me.setValue(currency);
    										}
    									},
    									scope: this,
    								},
    							},
            				],
            			},
            		],
            	},
            ],
            buttons: [
				{
					itemId: 'addBt',
					text: TR("Confirm"),
					icon: '/static/images/icons/save.png',
					handler: this.makeDeposit,
					scope: this,
				},
				{
					itemId: 'cancelBt',
					text: TR("Cancel"),
					icon: '/static/images/icons/cancel.png',
					handler: this.close,
					scope: this,
				},
			],
        });
        
        this.callParent(arguments);
    },
    
    makeOperation: function(account, amount){
    	var op = Data.create('AccountOperation', {
			account: account.data.uuid,
			type: 'D',
		    amount: amount,
		    note: amount < 0 ? TR("Withdraw operation") : TR("Deposit operation"),
		});
		account.AccountOperations().add(op);
		var balance = account.data.balance + parseInt(amount);
		account.set('balance', balance);
		this.updateBalance();
		this.close();
    },
    
    makeDeposit: function(){
    	// form validation
    	var form = this.down('#form').form;
    	if (!form.isValid()){
    		return;
    	}
    	// get data
    	var values = form.getValues();
    	var account_store = this.membershipRec.Accounts();
    	// get account
    	var account = account_store.findRecord('currency', values.currency);
    	if (account){ // just create operation
    		this.makeOperation(account, values.amount);
    	} else { // create account
    		var account = Data.create('Account', {
    			membership: this.membershipRec.data.uuid,
			    currency: values.currency,
    		});
    		account_store.add(account);
    		this.makeOperation(account, values.amount);
    	}
    },
        
});
