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


Ext.define('Sp.views.locations.FormPayment', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        this.currenciesGridRendered = false;
        
        var rec = this.locationRec;
                
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'anchor',
            },
            items: [
                {
                    xtype: 'container',
                    itemId: 'ctx',
                    padding: '10 10 5 10',
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'fieldset',
                            itemId: 'fs',
                            title: TR("Select the accepted currencies"),
                            margin: '10 0 0 0',
                            defaults: {
                                anchor: '100%',
                            },
                            items: [
                                {
                                    xtype: 'fieldcontainer',
                                    itemId: 'ctx',
                                    fieldLabel: TR("Currencies"),
                                    items: [
                                        {
                                            xtype: 'grid',
                                            itemId: 'grid',
                                            header: false,
                                            hideHeaders: true,
                                            rowLines: false,
                                            stripeRows: false,
                                            height: 180,
                                            store: Data.currencies,
                                            selModel: Ext.create('Ext.selection.CheckboxModel'),
                                            columns: [
                                                {
                                                    dataIndex: 'code',
                                                    width: 50,
                                                },
                                                {
                                                    dataIndex: 'name',
                                                    flex: 1,
                                                },
                                            ],
                                            listeners: {
                                                afterlayout: this.onCurrenciesGridLayout,
                                                selectionchange: this.showSelectedCurrencies,
                                                scope: this,
                                            },
                                        },
                                    ],
                                },
                                {
                                    xtype: 'textfield',
                                    itemId: 'selectedCurLabel',
                                    readOnly: true,
                                    hideEmptyLabel: false,
                                },
                                {
                                    name: 'default_currency',
                                    xtype: 'combobox',
                                    fieldLabel: TR("Default Currency"),
                                    store: Data.currencies,
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: true,
                                    typeAhead: true,
                                    valueField: 'uuid',
                                    lastQuery: '',
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
                            title: TR("Select the accepted payment methods"),
                            margin: '10 0 0 0',
                            defaults: {
                                anchor: '100%',
                            },
                            items: [
                                {
                                    name: 'payment_accept_cash',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Cash"),
                                },
                                {
                                    name: 'payment_accept_cc',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Credit Card"),
                                    listeners: {
                                        change: function(me, val){
                                            this.down('#ccTypes').setVisible(val);
                                        },
                                        scope: this,
                                    },
                                },
                                {
                                    xtype: 'fieldcontainer',
                                    itemId: 'ccTypes',
                                    layout: {
                                        type: 'hbox',
                                    },
                                    defaults: {
                                        margin: '0 10 0 0',
                                    },
                                    hidden: true,
                                    items: [
                                        {
                                            name: 'payment_accept_cc_visa',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/visa.png'/>",
                                            afterBoxLabelTextTpl: TR("Visa"),
                                        },                                      
                                        {
                                            name: 'payment_accept_cc_mastercard',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/mastercard.png'/>",
                                            afterBoxLabelTextTpl: TR("MasterCard"),
                                        },
                                        {
                                            name: 'payment_accept_cc_discover',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/discover.png'/>",
                                            afterBoxLabelTextTpl: TR("Discover"),
                                        },
                                        {
                                            name: 'payment_accept_cc_amex',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/amex.png'/>",
                                            afterBoxLabelTextTpl: TR("AmEx"),
                                        },
                                        {
                                            name: 'payment_accept_cc_diners',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/diners.png'/>",
                                            afterBoxLabelTextTpl: TR("Diners"),
                                        },
                                        {
                                            name: 'payment_accept_cc_maestro',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/maestro.png'/>",
                                            afterBoxLabelTextTpl: TR("Maestro"),
                                        },
                                        {
                                            name: 'payment_accept_cc_cirrus',
                                            xtype: 'checkbox',
                                            boxLabel: "<img align='absmiddle' src='/static/images/icons/cc/cirrus.png'/>",
                                            afterBoxLabelTextTpl: TR("Cirrus"),
                                        },
                                    ],
                                },
                                {
                                    name: 'payment_accept_other',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Other"),
                                    listeners: {
                                        change: function(me, val){
                                            this.down('#customPayment').setVisible(val);
                                        },
                                        scope: this,
                                    },
                                },
                                {
                                    name: 'payment_others',
                                    xtype: 'textfield',
                                    itemId: 'customPayment',
                                    emptyText: TR("Enter here other payment methods"),
                                    hidden: true,
                                },
                            ],
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
    },
    
    showSelectedCurrencies: function(){
        var selected = this.down('#grid').getSelectionModel().getSelection(); 
        var label = [];
        Ext.each(selected, function(i){
            label.push(i.data.code);
        })
        this.down('#selectedCurLabel').setValue(label.join(' '));
    },
    
    onCurrenciesGridLayout: function(grid){
        if (this.currenciesGridRendered === true){
            return;
        }
        this.currenciesGridRendered = true;
        Sp.ui.data.selectFromStore(
            grid.getSelectionModel(), 
            this.locationRec.Currencies()
        );
        this.showSelectedCurrencies();
    },
    
    pre_save: function(){
        if (this.currenciesGridRendered === true){
            var sm = this.down('#grid').getSelectionModel();
            Sp.ui.data.updateFromSelection(sm, this.locationRec, 'currencies', this.locationRec.Currencies());
        }
    },
    
});
