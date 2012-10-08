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


Ext.define('Sp.views.locations.BuyItem', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        this.rec = Data.create('BuyedItem', {
            membership: this.membershipRec.data.uuid,
        });
        
        Ext.apply(this, {
            width: 400,
            height: 130,
            modal: true,
            resizable: false,
            title: TR("Buy a catalog item"),
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
                                select: {
                                    fn: this.onCatalogItemSelect,
                                    scope: this,
                                },
                            },
                        },
                        {
                            name: 'price',
                            xtype: 'combobox',
                            itemId: 'priceCbx',
                            fieldLabel: TR("Price"),
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
                    ],
                },
            ],
            buttons: [
                {
                    itemId: 'addBt',
                    text: TR("Confirm"),
                    icon: '/static/images/icons/save.png',
                    handler: this.buy,
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
        this.down('#form').form.loadRecord(this.rec);
    },
    
    onCatalogItemSelect: function(cbx, recs){
        var rec = recs[0];
        if (!rec){
            return;
        }
        
        var default_currency = Sp.ui.data.getPersonCurrency(this.membershipRec, this.locationRec);
        var priceCbx = this.down('#priceCbx');
        priceCbx.clearInvalid();
        
        var prices = [];
        var priceCbx_store = priceCbx.getStore();
        rec.LocationCatalogPrices().each(function(p){
            if (Ext.isObject(p.data.currency)){
                var currency = p.getCurrency();
            } else {
                var currency = Data.currencies.getById(p.data.currency);
            }
            prices.push({
                uuid: p.data.uuid,
                price: p.data.price,
                currency: currency.data.code,
                'default': (p.data['default'] && currency &&  default_currency && currency.data.uuid == default_currency.data.uuid),
            });
        });
        priceCbx_store.loadRawData(prices);
        priceCbx.clearValue();
        var def = priceCbx_store.findRecord('default', true);
        if (def){
            priceCbx.setValue(def);
        }
        
    },
    
    buy_bak: function(){
        // form validation
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        // create account if not exists
        var values = form.getValues();
        var account_store = this.membershipRec.Accounts();
        var item = this.locationRec.LocationCatalogItems().getById(values.item);
        var price = item.LocationCatalogPrices().getById(values.price);
        if (Ext.isObject(price.data.currency)){
            var currency = price.getCurrency();
        } else {
            var currency = Data.currencies.getById(price.data.currency);
        }
        if (account_store.find('currency', currency.data.uuid) == -1){
            var account = Data.create('Account', {
                membership: this.membershipRec.data.uuid,
                currency: currency.data.uuid,
            });
            account.save();
            account_store.add(account);
            this.cancelBt.setText(TR("Close"));
        }
        
        form.updateRecord();
        this.rec.set('created', new Date());
        this.buyedItemsStore.add(this.rec);
        this.updateBalance(this.rec);
        this.close();
    },
    
    buy: function(){
        // form validation
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        // create account if not exists
        var values = form.getValues();
        var account_store = this.membershipRec.Accounts();
        var item = this.locationRec.LocationCatalogItems().getById(values.item);
        var price = item.LocationCatalogPrices().getById(values.price);
        if (Ext.isObject(price.data.currency)){
            var currency = price.getCurrency();
        } else {
            var currency = Data.currencies.getById(price.data.currency);
        }
        
        var account = account_store.findRecord('currency', currency.data.uuid);
        if (!account){
            account = Data.create('Account', {
                membership: this.membershipRec.data.uuid,
                currency: currency.data.uuid,
            });
            account_store.add(account);
        }
        
        var credit;
        if (this.profile.billing_mode == 'pre'){
            credit = account.data.balance;
        } else if (this.profile.billing_mode == 'post' && Ext.isNumber(this.profile.credit_line)){
            credit = account.data.balance+this.profile.credit_line;
        }
        if (Ext.isNumber(credit) && price.data.price > credit){
            var missing = credit-price.data.price;
            Sp.ui.misc.warnMsg(Ext.String.format(TR("No enough {0} credit ({1})"), currency.data.code, missing));
            return;
        }

        form.updateRecord();
        this.rec.set('created', new Date());
        this.membershipRec.BuyedItems().add(this.rec);
        this.updateBalance(this.rec);
        this.close();
    },
        
});
