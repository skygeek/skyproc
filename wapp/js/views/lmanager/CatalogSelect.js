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

Ext.define('Sp.views.lmanager.CatalogSelect', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
        Ext.apply(this, {
        	width: 340,
        	height: 180,
        	modal: true,
        	resizable: false,
        	title: TR("Select Catalog Item"),
        	icon: '/static/images/icons/cart.png',
        	layout: 'fit',
            items: [
            	{
            		xtype: 'form',
            		itemId: 'form',
            		margin: Sp.core.Globals.WINDOW_MARGIN,
            		border: 0,
            		defaults: {
            			anchor: '100%',
            			labelWidth: 60,
            		},
            		items: [
            			{
							name: 'item',
							itemId: 'itemCbx',
					    	xtype: 'combobox',
					    	fieldLabel: TR("Item"),
					    	store: this.locationRec.LocationCatalogItems(),
							queryMode: 'local',
							forceSelection: true,
							editable: false,
							lastQuery: '',
						    displayField: 'name',
						    valueField: 'uuid',
						    allowBlank: false,
						    listeners: {
						    	select: this.onCatalogItemSelect,
						    	scope: this,
						    },
					    },
					    {
					    	name: 'element',
					    	xtype: 'combobox',
					    	itemId: 'elementCbx',
					    	hidden: true,
					    	fieldLabel: TR("Element"),
					    	store: Ext.create('Ext.data.Store', {
					    		fields: ['uuid','short_label','full_label'],
					    	}),
					    	queryMode: 'local',
							editable: false,
						    lastQuery: '',
						    valueField: 'uuid',
						    allowBlank: false,
						    tpl: Ext.create('Ext.XTemplate',
						        '<tpl for=".">',
						            '<div class="x-boundlist-item">',
						            "{full_label}",
						            '</div>',
						        '</tpl>'
						    ),
						    displayTpl: Ext.create('Ext.XTemplate',
						        '<tpl for=".">',
						            '{short_label}',
						        '</tpl>'
						  	),
					    },
					    {
					    	name: 'price',
					    	xtype: 'combobox',
					    	itemId: 'priceCbx',
					    	fieldLabel: TR("Price"),
					    	hidden: true,
					    	store: Ext.create('Ext.data.Store', {
					    		fields: ['uuid','price','currency','default'],
					    		sorters: [
					    			{
					    				property: 'currency',
					    				direction: 'ASC',
					    			},
					    			{
					    				property: 'price',
					    				direction: 'ASC',
					    			},
					    		],
					    	}),
					    	queryMode: 'local',
							editable: false,
							lastQuery: '',
						    valueField: 'uuid',
						    allowBlank: false,
						    tpl: Ext.create('Ext.XTemplate',
						        '<tpl for=".">',
						            '<div class="x-boundlist-item">',
						            "{price} {currency}",
						            '</div>',
						        '</tpl>'
						    ),
						    displayTpl: Ext.create('Ext.XTemplate',
						        '<tpl for=".">',
						            '{price} {currency}',
						        '</tpl>'
						  	),
					    },
					    {
					    	name: 'payer',
							xtype: 'personcombo',
							fieldLabel: TR("Payer"),
							emptyText: TR("search by member's last name"),
							locationRec: this.locationRec,
							allowPhantom: false,
						},
            		],
            	},
            ],
            buttons: [
				{
					text: TR("Ok"),
					itemId: 'createBt',
					icon: '/static/images/icons/save.png',
					handler: this.apply,
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
 		
 		if (this.slotRec.data.item){
 			var item = this.locationRec.LocationCatalogItems().getById(this.slotRec.data.item);
 			if (item){
 				this.onCatalogItemSelect(null, [item]);
 			}
 		}
 		
 		this.down('#form').loadRecord(this.slotRec);
 		
    },
    
    onCatalogItemSelect: function(cbx, recs){
    	var rec = recs[0];
    	if (!rec){
    		return;
    	}
    	
    	var elementCbx = this.down('#elementCbx');
    	var priceCbx = this.down('#priceCbx');
    	
    	// price
    	var prices = [];
    	var priceCbx_store = priceCbx.getStore();
    	rec.LocationCatalogPrices().each(function(p){
    		var currency = Ext.isObject(p.data.currency) ? p.getCurrency() : Data.currencies.getById(p.data.currency);
    		prices.push({
    			uuid: p.data.uuid,
    			price: p.data.price,
    			currency: currency.data.code,
    			'default': p.data['default'],
    		});
    	});
    	priceCbx_store.loadRawData(prices);
    	priceCbx.clearValue();
    	priceCbx.show();
    	priceCbx.clearInvalid();
    	var def = priceCbx_store.findRecord('default', true);
    	if (def){
    		priceCbx.setValue(def);
    	}
    	
    	// element
    	var elements = [];
    	var elementCbx_store = elementCbx.getStore();
    	rec.LocationCatalogElements().each(function(e){
    		var l = Sp.ui.misc.getCatalogElementLabel(e);
    		elements.push({
    			uuid: e.data.uuid,
    			short_label: l['short'],
				full_label: l.full,    			
    		});
    	});
    	elementCbx_store.loadRawData(elements);
    	elementCbx.clearValue();
    	
    	if (elements.length == 1){
    		elementCbx.hide();
    		var e = elementCbx_store.getAt(0);
    		elementCbx.setValue(e);
    	} else {
    		elementCbx.show();
    		elementCbx.clearInvalid();
    	}
    	 
    },
    
    apply: function(){
    	// form validation
    	var form = this.down('#form').form;
    	if (!form.isValid()){
    		return;
    	}
    	// get values
    	var slotRec = this.slotRec;
    	var loadRec = this.locationRec.Loads().getById(slotRec.data.load);
    	var values = form.getValues();
    	
    	// check if enought slots are available
    	var item = this.locationRec.LocationCatalogItems().getById(values.item);
		var element = item.LocationCatalogElements().getById(values.element);
		var slots_infos = Sp.ui.data.getCatalogElementSlots(this.locationRec, element, ['packer']);
		var load_infos = this.getSlotsInfos(loadRec);
		var slots_store = loadRec.Slots();
		var related_count = 0;
		slots_store.each(function(s){
			if (s.data.related_slot == slotRec.data.uuid){
				related_count += 1;
			}
		});
		var sd = slotRec.data;
		var countme = (sd.person || sd.phantom || sd.worker || slots_store.find('related_slot', sd.uuid) != -1);
		var free = (load_infos.total-load_infos.used)+related_count;
		var needed = slots_infos.jumpers+slots_infos.workers_count;
		if (countme){
			needed -= 1;
		}
		// no enough free slots
		if (needed > free){
			Sp.ui.misc.errMsg(TR("There is no enough free slots in this load"), TR("Insufficient slots"));
			return;
		}
    	// store previous values for undo
    	var previous_values = {};
    	Ext.Object.each(values, function(k,v){
    		previous_values[k] = slotRec.get(k);
    	}, this);
    	// jump type
    	previous_values['jump_type'] = slotRec.get('jump_type');
    	if (Ext.isObject(item.data.jump_type)){
    		values.jump_type = item.data.jump_type.uuid;
		} else {
			values.jump_type = item.data.jump_type;
		}
    	// update record
    	slotRec.set(values);
    	// return if no change
    	if (Ext.Object.getSize(slotRec.getChanges()) == 0){
    		this.close();
			return;
		}
		// related slots		
		var have_related = this.handleRelatedSlots(slotRec, 'update');
		if (have_related){
			loadRec.afterCommit();
		}
		// after edit
		this.afterSlotEdit(slotRec);
		// save
		this.actionOperation(slotRec, 'save', have_related);
		// store action
		this.storeAction(this.locationRec.data.uuid, {
			action: 'update',
			record: slotRec,
			values: previous_values,
			handleRelatedSlots: this.handleRelatedSlots,
		});
    	this.close();
    },
                
});
