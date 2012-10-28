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
                currency: this.locationRec.data.default_currency,
            });
            var title = TR("New membership profile");
            var ok_text = TR("Add");
            var ok_handler = this.createProfile;
        }
        
        this.defaultCatalogStore = Sp.ui.data.getDefaultItemsStore(this.locationRec);
        
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
                                    xtype: 'personcombo',
                                    itemId: 'billPerson',
                                    fieldLabel: TR("Member to bill"),
                                    hidden: true,
                                    locationRec: this.locationRec,
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
                                    editable: true,
                                    lastQuery: '',
                                    hidden: true,
                                    tpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '<div class="x-boundlist-item">{code} - {name}</div>',
                                        '</tpl>'
                                    ),
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{code} - {name}',
                                        '</tpl>'
                                    ),
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
                                    store: this.defaultCatalogStore,
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'uuid',
                                    forceSelection: true,
                                    lastQuery: '',
                                    listeners: {
                                        select: function(){
                                            this.buildDefaultPricesStore();
                                        },
                                        scope: this,
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
                                    boxLabel: TR("Let members choose other items from the catalog (when self-manifesting)"),
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
                                    handler: function(){
                                        Ext.create('Sp.views.locations.CatalogItemsSelect', {
                                            locationRec: this.locationRec,
                                            defaultCatalogStore: this.defaultCatalogStore,
                                            store: this.profileRec.ProfileCatalogs(),
                                            create_model: 'ProfileCatalog',
                                            parent_field: 'profile',
                                            parent_uuid: this.profileRec.data.uuid,
                                            title: TR("Select additional available catalog items"),
                                        }).show();
                                    },
                                    scope: this,
                                },
                                {
                                    xtype: 'button',
                                    text: TR("Extra Catalog Items"),
                                    icon: '/static/images/icons/basket_plus.png',
                                    handler: function(){
                                        Ext.create('Sp.views.locations.CatalogItemsSelect', {
                                            locationRec: this.locationRec,
                                            defaultCatalogStore: this.locationRec.LocationCatalogItems(),
                                            store: this.profileRec.ProfileExtraCatalogs(),
                                            create_model: 'ProfileExtraCatalog',
                                            parent_field: 'profile',
                                            parent_uuid: this.profileRec.data.uuid,
                                            title: TR("Select extra catalog items"),
                                        }).show();
                                    },
                                    scope: this,
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
        this.down('#form').form.loadRecord(rec);
        this.buildDefaultPricesStore(true);
    },
    
    buildDefaultPricesStore: function(init){
        var form = this.down('#form').form;
        var item_uuid = form.findField('default_catalog_item').getValue();
        if (item_uuid){
            var currency_uuid = form.findField('currency').getValue();
            var price_field = this.down('#defaultPrice');
            Sp.ui.misc.buildDefaultPricesStore(this.locationRec, this.profileRec, item_uuid, currency_uuid, price_field, init);
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
                    p.set('default', false);
                }
            });
        }
        
        // update record
        form.form.updateRecord();

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
            this.profileRec.ProfileCatalogs().rejectChanges();
            this.profileRec.ProfileExtraCatalogs().rejectChanges();
        }
    },

});
