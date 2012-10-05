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


Ext.define('Sp.views.locations.AddClearance', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
    	this.clearanceRec = Data.create('Clearance');
    	
    	var items = [];
    	if (!this.personRequest){
	    	items.push({
				xtype: 'fieldset',
				title: TR("Find member"),
				hidden: this.personRequest,
				items: [
					{
				    	name: 'person',
				    	xtype: 'combobox',
				    	itemId: 'personCbx',
				    	fieldLabel: TR("Member's Name"),
				    	emptyText: TR("search by member's last name"),
				    	store: Data.createStore('LocationMembership', {
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
		    				proxy: {
					        	extraParams: {
					            	query_field: 'person__last_name',
					            },
					        },
		    			}),
					    valueField: 'uuid',
					    hideTrigger: true,
					    queryDelay: 250,
					    typeAhead: true,
					    forceSelection: true,
					    minChars: 1,
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
				   },
				],
			});
		}
		items.push({
			xtype: 'fieldset',
			title: TR("Clearance validity period"),
			items: [
				{
					name: 'start_date',
					xtype: 'datefield',
					fieldLabel: TR("Start date"),
					minValue: new Date(),
				},
				{
					xtype: 'fieldcontainer',
					fieldLabel: TR("Duration"),
					layout: {
						type: 'hbox',
					},
					defaults: {
						flex: 1,
					},
					items: [
						{
							name: 'duration',
							xtype: 'numberfield',
							minValue: 1,
							maxValue: 99,
						},
						{
					    	name: 'unit',
					    	xtype: 'combobox',
					    	store: Ext.create('Ext.data.Store', {
							    fields: ['unit', 'label'],
							    data : [
							        {unit:'d', label: TR("Day(s)")},
							        {unit:'w', label: TR("Week(s)")},
							        {unit:'m', label: TR("Month(s)")},
							        {unit:'y', label: TR("Year(s)")},
							    ]
							}),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
						    displayField: 'label',
						    valueField: 'unit',
					    },
					],
				},
				{
					name: 'end_date',
					xtype: 'datefield',
					fieldLabel: TR("End date"),
					minValue: new Date(),
					emptyText: TR("optional end date instead of duration"),
				},
			],
		});
    	
        Ext.apply(this, {
        	width: this.personRequest ? 450 : 480,
        	height: this.personRequest ? 200 : 280,
        	modal: true,
        	resizable: false,
        	title: this.personRequest ? TR("Request clearance") : TR("Issue new clearance"),
        	icon: '/static/images/icons/new_green.png',
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
            		items: items,
            	},
            ],
            buttons: [
				{
					itemId: 'addBt',
					text: this.personRequest ? TR("Send Request") : TR("Issue Clearance"),
					icon: '/static/images/icons/save.png',
					handler: this.addClearance,
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
        var form = this.getComponent('form').form;
 		form.loadRecord(this.clearanceRec);
 		form.findField('start_date').setValue(new Date());
    },
    
    setBusy: function(busy){
    	if (busy){
    		this.body.mask(TR("Please wait..."));
    	} else {
    		this.body.unmask();
    	}
    	this.down('#addBt').setDisabled(busy);
    	this.down('#cancelBt').setDisabled(busy);
    },
    
    addClearance: function(){
    	var form = this.getComponent('form');
    	var record = form.form.getRecord();
		
		// validation
    	if (!Sp.ui.data.validateForm(form)){
    		return;
    	}
    	
    	if (this.personRequest){
    		var p = Data.me;
    	} else {
    		var person_cbx = this.down('#personCbx');
    		var p = person_cbx.getStore().getById(person_cbx.getValue()).getPerson();
    	}
    	
    	// ui busy
    	this.setBusy(true);
    	
    	// check duplicate
    	Sp.utils.rpc('clearance.hasOne', [this.locationRec.data.uuid, p.data.uuid], function(has_clearance){
    		if (has_clearance){
    			Ext.MessageBox.show({
				    title: TR("Clearance exists"),
				    msg: Ext.String.format(TR("Member '{0}' already has a clearance"), 
				    Sp.ui.misc.formatFullname(p, Data.me.data.name_order, true)),
				    buttons: Ext.MessageBox.OK,
				    icon: Ext.MessageBox.ERROR,
				});
				this.setBusy(false);
    			return;
    		}
    		// save clearance
    		form.form.updateRecord();
	    	record.beginEdit();
	    	record.set('location', this.locationRec.data.uuid);
	    	record.set('person', p.data.uuid);
	    	record.set('approved', !this.personRequest);
	    	record.endEdit();
	    	record.save({
	    		callback: function(r, op){
	    			if (!op.success){
	    				this.setBusy(false);
	    				return;
	    			}
	    			if (this.personRequest){
		    			Data.load('Clearance_R', record.data.uuid, function(rec){
		    				Data.clearances.add(rec);
		    				Sp.ui.misc.updateLocationView(this.locationRec.data.uuid);
		    				this.close();
	    					Notify( TR("Request sent"), Ext.String.format(
	    							TR("Clearance request successfully sent to '{0}'"), 
	    							rec.getLocation().data.name
							));
		    			}, this);
	    			} else {
		    			Data.load('Clearance', record.data.uuid, function(rec){
		    				this.locationRec.Clearances().add(rec);
		    				this.close();
		    				if (this.standalone){
		    					Notify( TR("Clearance issued"), Ext.String.format(
		    							TR("Clearance successfully issued for '{0}'"), 
		    							Sp.ui.misc.formatFullname(p, Data.me.data.name_order, true)
								));
		    				}
		    			}, this);	
	    			}
	    			
	    		},
	    		scope: this,
	    	});
    	}, this);
    },
        
});
