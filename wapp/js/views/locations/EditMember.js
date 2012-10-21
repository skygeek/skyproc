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

//FIXME: code for profile editing is duplicated from EditProfile.js

Ext.define('Sp.views.locations.EditMember', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        this.cancel_close = true;
        var rec = this.membershipRec;
        var member_name = Sp.ui.misc.formatFullname(rec.getPerson(), Data.me.data.name_order, true);
        
        this.membershipRec.BuyedItems().sort('created', 'DESC');
        
        this.defaultCatalogStore = Data.createStore('LocationCatalogItem');
        this.locationRec.LocationCatalogItems().each(function(i){
            if (i.LocationCatalogElements().getCount() == 1){
                this.defaultCatalogStore.add(i);
            }
        }, this);
                
        Ext.apply(this, {
            width: 530,
            height: 520,
            modal: true,
            resizable: false,
            title:  member_name + ' - ' + TR("Edit member"),
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    padding: 10,
                    border: 0,
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'tabpanel',
                            border: 0,
                            items: [
                                {
                                    title: TR("Personal infos"),
                                    icon: '/static/images/icons/member.png',
                                    border: 0,
                                    items: [],
                                },
                                {
                                    title: TR("Jumper infos"),
                                    icon: '/static/images/icons/parachute_small.png',
                                    border: 0,
                                    items: [],
                                },
                                {
                                    title: TR("Profile"),
                                    icon: '/static/images/icons/membership.png',
                                    border: 0,
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Membership profile"),
                                            defaults: {
                                                anchor: '100%',
                                            },
                                            margin: '5 0 8 0',
                                            items: [
                                                {
                                                    name: 'profile',
                                                    xtype: 'combobox',
                                                    fieldLabel: TR("Profile"),
                                                    labelWidth: 60,
                                                    store: this.locationRec.MembershipProfiles(),
                                                    queryMode: 'local',
                                                    displayField: 'name',
                                                    valueField: 'uuid',
                                                    forceSelection: true,
                                                    lastQuery: '',
                                                    allowBlank: false,
                                                    listeners: {
                                                        change: this.updateAccountTabState,
                                                        scope: this,
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            checkboxName: 'override_profile',
                                            xtype: 'fieldset',
                                            itemId: 'overrideFs',
                                            title: TR("Override profile settings"),
                                            checkboxToggle: true,
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
                                                        change: function(cb, newValue){
                                                            this.updateAccountTabState();
                                                            if (newValue == 'pre'){
                                                                this.down('#creditLine').hide();
                                                                this.down('#currency').show();
                                                                this.down('#billPerson').hide();
                                                                this.down('#defaultCatalogItem').show();
                                                                this.down('#defaultPrice').show();
                                                                this.down('#catalogAccess').show();
                                                                this.down('#catalogDetailsCtx').show();
                                                            } else if (newValue == 'post'){
                                                                this.down('#creditLine').show();
                                                                this.down('#currency').show();
                                                                this.down('#billPerson').hide();
                                                                this.down('#defaultCatalogItem').show();
                                                                this.down('#defaultPrice').show();
                                                                this.down('#catalogAccess').show();
                                                                this.down('#catalogDetailsCtx').show();
                                                            } else if (newValue == 'other'){
                                                                this.down('#creditLine').hide();
                                                                this.down('#currency').show();
                                                                this.down('#billPerson').show();
                                                                this.down('#defaultCatalogItem').show();
                                                                this.down('#defaultPrice').show();
                                                                this.down('#catalogAccess').show();
                                                                this.down('#catalogDetailsCtx').show();
                                                            } else if (newValue == 'none'){
                                                                this.down('#creditLine').hide();
                                                                this.down('#currency').hide();
                                                                this.down('#billPerson').hide();
                                                                this.down('#defaultCatalogItem').hide();
                                                                this.down('#defaultPrice').hide();
                                                                this.down('#catalogAccess').hide();
                                                                this.down('#catalogDetailsCtx').hide();
                                                            }
                                                        },
                                                        scope: this,
                                                    },
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
                                                },
                                                {
                                                    name: 'credit_line',
                                                    xtype: 'numberfield',
                                                    itemId: 'creditLine',
                                                    fieldLabel: TR("Credit Line"),
                                                    minValue: 0,
                                                    maxValue: 999999999,
                                                    emptyText: TR("No Limit"),
                                                },
                                                {
                                                    name: 'bill_person',
                                                    xtype: 'combobox',
                                                    itemId: 'billPerson',
                                                    fieldLabel: TR("Member to bill"),
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
                                                    minChars: 1,
                                                    forceSelection: true,
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
                                                            if (this.membershipRec.data.bill_person){
                                                                var store = cb.getStore();
                                                                var on_load_fn = Ext.bind(function(store, records, successful){
                                                                    if (successful && records[0]){
                                                                        cb.setValue(records[0]);
                                                                    }
                                                                    store.filters.removeAt(1);
                                                                    store.un('load', on_load_fn);
                                                                }, this)
                                                                store.on('load', on_load_fn);
                                                                store.filter('person', this.membershipRec.data.bill_person);
                                                            }
                                                        }, this),
                                                    },
                                               },
                                               {
                                                    name: 'default_catalog_item',
                                                    xtype: 'combobox',
                                                    itemId: 'defaultCatalogItem',
                                                    fieldLabel: TR("Default Item"),
                                                    store: this.defaultCatalogStore,
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
                                                    itemId: 'catalogAccess',
                                                    boxLabel: TR("Let the member choose other items from the catalog (when self-manifesting)"),
                                                    listeners: {
                                                        change: Ext.bind(function(me, value){
                                                            this.down('#catalogItemsAvailBt').setDisabled(!value);
                                                        }, this),
                                                    },
                                                },
                                                {
                                                    xtype: 'container',
                                                    itemId: 'catalogDetailsCtx',
                                                    layout: {
                                                        type: 'hbox',
                                                        padding: '15 60 15 60',
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
                                                            margin: '0 55 0 0',
                                                            disabled: true,
                                                            handler: function(){
                                                                Ext.create('Sp.views.locations.CatalogItemsSelect', {
                                                                    locationRec: this.locationRec,
                                                                    defaultCatalogStore: this.defaultCatalogStore,
                                                                    store: this.membershipRec.MembershipCatalogs(),
                                                                    create_model: 'MembershipCatalog',
                                                                    parent_field: 'membership',
                                                                    parent_uuid: this.membershipRec.data.uuid,
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
                                                                    defaultCatalogStore: this.defaultCatalogStore,
                                                                    store: this.membershipRec.MembershipExtraCatalogs(),
                                                                    create_model: 'MembershipExtraCatalog',
                                                                    parent_field: 'membership',
                                                                    parent_uuid: this.membershipRec.data.uuid,
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
                                },
                                {
                                    title: TR("Account"),
                                    itemId: 'accountTab',
                                    icon: '/static/images/icons/bank.png',
                                    layout: {
                                        type: 'vbox',
                                        align: 'stretch',
                                    },
                                    border: 0,
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Account balance"),
                                            margin: '5 0 8 0',
                                            items: [
                                                {
                                                    xtype: 'toolbar',
                                                    items: [
                                                        ' ',
                                                        {
                                                            xtype: 'image',
                                                            src: '/static/images/icons/coins.png',
                                                            width: 16,
                                                            height: 16,
                                                        },
                                                        ' ',
                                                        {
                                                            xtype: 'textfield',
                                                            itemId: 'balanceText',
                                                            width: 320,
                                                            readOnly: true,
                                                            listeners: {
                                                                afterrender: function(){
                                                                    this.updateBalance();
                                                                },
                                                                scope: this,
                                                            },
                                                        },
                                                        '->',
                                                        '-',
                                                        '->',
                                                        {
                                                            xtype: 'button',
                                                            text: TR("Make a deposit"),
                                                            icon: '/static/images/icons/cash.png',
                                                            handler: function(){
                                                                Ext.create('Sp.views.locations.MakeDeposit', {
                                                                    membershipRec: this.membershipRec,
                                                                    locationRec: this.locationRec,
                                                                    updateBalance: Ext.bind(this.updateBalance, this),
                                                                }).show();
                                                            },
                                                            scope: this,
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: TR("Buyed items"),
                                            flex: 1,
                                            layout: 'fit',
                                            items: [
                                                {
                                                    xtype: 'grid',
                                                    itemId: 'buyedItemsGrid',
                                                    store: this.membershipRec.BuyedItems(),
                                                    header: false,
                                                    hideHeaders: true,
                                                    columns: [
                                                        {
                                                            width: 22,
                                                            align: 'center',
                                                            renderer: function(v,o,r){
                                                                var icon;
                                                                if (r.data.consumed){
                                                                    icon = 'stopped.png';
                                                                } else if (r.data.consuming){
                                                                    icon = 'available.png';
                                                                } else {
                                                                    icon = 'star_empty.png';
                                                                }
                                                                return Ext.String.format("<img src='/static/images/icons/{0}'/>", icon);
                                                            },
                                                        },
                                                        {
                                                            dataIndex: 'created',
                                                            header: TR("Date"),
                                                            xtype: 'datecolumn',
                                                            flex: 1,
                                                        },
                                                        {
                                                            header: TR("Item"),
                                                            flex: 2,
                                                            renderer: function(v,o,r){
                                                                var item = this.locationRec.LocationCatalogItems().getById(r.data.item);
                                                                var price = item.LocationCatalogPrices().getById(r.data.price);
                                                                if (Ext.isObject(price.data.currency)){
                                                                    var currency = price.getCurrency();
                                                                } else {
                                                                    var currency = Data.currencies.getById(price.data.currency);
                                                                }
                                                                var remain = null;
                                                                var label = '';
                                                                label += item.data.name;
                                                                label += Ext.String.format("<br>{0}: {1}", TR("Price"),
                                                                         Ext.util.Format.currency(price.data.price, ' '+currency.data.code, 0, true))
                                                                if (remain !== null){
                                                                    label += Ext.String.format(
                                                                            "&nbsp;-&nbsp;{0}: <span class='semi-bold'>{1}</span>", 
                                                                            TR("Remaining"), remain);
                                                                }
                                                                return label;
                                                            },
                                                            scope: this,
                                                        },
                                                        {
                                                            xtype: 'actioncolumn',
                                                            width: 20,
                                                            items: [
                                                                {
                                                                    icon: '/static/images/icons/ban.png',
                                                                    tooltip: 'Cancel',
                                                                    getClass: function(v,o,r){
                                                                        if (r.data.consumed || r.data.consuming){
                                                                            return 'hidden-el';
                                                                        }
                                                                    },
                                                                    handler: function(grid, rowIndex, colIndex) {
                                                                        this.deleteBuyedItem(grid.getStore().getAt(rowIndex));
                                                                    },
                                                                    scope: this,
                                                                },
                                                            ],
                                                        },
                                                    ],
                                                    buttons: [
                                                        {
                                                            text: TR("Add new item"),
                                                            icon: '/static/images/icons/new_green.png',
                                                            handler: function(){
                                                                Ext.create('Sp.views.locations.BuyItem', {
                                                                    membershipRec: this.membershipRec,
                                                                    locationRec: this.locationRec,
                                                                    updateBalance: Ext.bind(this.updateBalance, this),
                                                                    profile: Sp.ui.data.getPersonProfile(this.membershipRec,
                                                                                this.locationRec,
                                                                                this.down('#form').form.getValues()),
                                                                }).show();
                                                            },
                                                            scope: this,
                                                        },
                                                    ],
                                                },
                                            ],
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
                    text: this.instantSave ? TR("Save") : TR("Apply"),
                    itemId: 'okBt',
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
            listeners: {
                close: Ext.bind(this.onClose, this),
            },
        });
 
        this.callParent(arguments);
        this.getComponent('form').form.loadRecord(rec);
        this.buildDefaultPricesStore();
        this.updateAccountTabState();
        this.down('#overrideFs').checkboxCmp.on('change', this.updateAccountTabState, this);
    },
    
    buildDefaultPricesStore: function(){
        var form = this.getComponent('form').form;
        var item_uuid = form.findField('default_catalog_item').getValue();
        var currency_field = form.findField('currency');
        var currency_uuid = currency_field.getValue();
        var currency_code = currency_field.getRawValue();
        var price_field = this.down('#defaultPrice');
        if (item_uuid){
            var item_rec = this.locationRec.LocationCatalogItems().getById(item_uuid);
            if (item_rec){
                var prices = [];
                item_rec.LocationCatalogPrices().each(function(p){
                    if (Ext.isObject(p.data.currency)){
                        var currency = p.getCurrency();
                    } else {
                        var currency = Data.currencies.getById(p.data.currency);
                    }
                    prices.push({
                        uuid: p.data.uuid,
                        price: p.data.price + ' ' + currency.data.code,
                    }); 
                }, this);
                var store = price_field.getStore();
                store.loadRawData(prices);
                if (this.membershipRec.data.default_catalog_price){
                    if (Ext.isObject(this.membershipRec.data.default_catalog_price)){
                        var price_uuid = this.membershipRec.data.default_catalog_price.uuid;
                    } else {
                        var price_uuid = this.membershipRec.data.default_catalog_price;
                    }
                    var r = store.findRecord('uuid', price_uuid);
                    if (r){
                        price_field.setValue(r);
                    }
                }
            }
        }
    },
    
    updateAccountTabState: function(){
        //var values = this.down('#form').form.getValues();
        //var profile = Sp.ui.data.getPersonProfile(this.membershipRec, this.locationRec, values);
        //this.down('#accountTab').setDisabled(profile.billing_mode == 'other' || profile.billing_mode == 'none');
    },
    
    updateBalance: function(buyedItem, removed){
        var accounts_store = this.membershipRec.Accounts();
        // local update balance
        if (buyedItem){
            var item = this.locationRec.LocationCatalogItems().getById(buyedItem.data.item);
            var price =  item.LocationCatalogPrices().getById(buyedItem.data.price);
            if (Ext.isObject(price.data.currency)){
                var currency = price.getCurrency();
            } else {
                var currency = Data.currencies.getById(price.data.currency);
            }
            var account = accounts_store.findRecord('currency', currency.data.uuid);
            if (account){
                var amount = price.data.price;
                if (!removed){
                    amount = -amount;
                }
                var balance = account.data.balance + amount;
                account.set('balance', balance);
            }
        }
        var balance = [];
        accounts_store.each(function(a){
            if (a.data.balance != 0){
                var currency = Data.currencies.getById(a.data.currency);
                balance.push(Ext.util.Format.currency(a.data.balance, ' '+currency.data.code, 0, true));
            }
        });
        this.down('#balanceText').setValue(balance.join(' | '));        
    },
    
    deleteBuyedItem: function(buyedItem){
        var store = this.down('#buyedItemsGrid').getStore();
        store.remove(buyedItem);
        this.updateBalance(buyedItem, true);
    },
    
    apply: function(){
        var form = this.getComponent('form');
        var record = form.form.getRecord();
        
        // validation
        if (!Sp.ui.data.validateForm(form)){
            return;
        }
        
        // update record
        form.form.updateRecord();
        
        // person to bill
        if (Ext.isObject(record.data.bill_person)){
            record.beginEdit();
            record.set('bill_person', record.data.bill_person.uuid);
            record.endEdit();
        }
        
        if (this.instantSave){
            this.membershipRec.save();
            this.membershipRec.Accounts().sync({
                success: function(){
                    this.membershipRec.Accounts().each(function(a){
                        a.AccountOperations().sync();
                    });
                    this.membershipRec.BuyedItems().sync();
                },
                scope: this,
            });
            this.afterSlotEdit(this.slotRec);
        } else {
            record.afterCommit();
        }
        
        // close window
        this.cancel_close = false;
        this.close();
    },
    
    onClose: function(){
        if (this.cancel_close){
            this.membershipRec.BuyedItems().rejectChanges();
            this.membershipRec.Accounts().rejectChanges();
            this.membershipRec.Accounts().each(function(a){
                a.AccountOperations().rejectChanges();
            });
            this.membershipRec.MembershipCatalogs().rejectChanges();
            this.membershipRec.MembershipExtraCatalogs().rejectChanges();
        }
    },

});
