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


Ext.define('Sp.views.locations.EditLocation', {
    extend: 'Ext.form.Panel',
    
    getMenuStore: function(){
        
        var store = Ext.create('Ext.data.Store', {
            fields:['id', 'label', 'icon'],
            data: [
                {id: 'General', label:TR("General Informations"), icon: '/static/images/icons/general.png'},
                {id: 'Members', label:TR("Club Members"), icon: '/static/images/icons/members.png'},
                {id: 'Description', label:TR("Logo & Descriptions"), icon: '/static/images/icons/profile.png'},
                {id: 'GeoLocation', label:TR("Map & Locations"), icon: '/static/images/icons/map.png'},
                {id: 'Payment', label:TR("Payment Informations"), icon: '/static/images/icons/payment_card.png'},
                {id: 'Aircrafts', label:TR("Aircrafts"), icon: '/static/images/icons/plane_small.png'},
                {id: 'Workers', label:TR("Staff"), icon: '/static/images/icons/staff.png'},
                //{id: 'Parachutes', label:TR("Parachutes"), icon: '/static/images/icons/parachute_small.png'},
                //{id: 'Services', label:TR("Services"), icon: '/static/images/icons/star.png'},
                {id: 'Catalog', label:TR("Catalog"), icon: '/static/images/icons/cart.png'},
                {id: 'Options', label:TR("Options"), icon: '/static/images/icons/options.png'},
                //{id: 'Permissions', label:TR("Permissions"), icon: '/static/images/icons/key.png'},
                {id: 'Privacy', label:TR("Privacy"), icon: '/static/images/icons/privacy.png'},
                {id: 'Delete', label:TR("Delete"), icon: '/static/images/icons/trash.png'},
            ],
        });
        if (!Sp.app.hasGMap()){
            store.removeAt(store.find('id', 'GeoLocation'));
        }
        return store;
        
    },
    
    constructor: function(config) {
        Ext.apply(config, {
            trackResetOnLoad: true,
        });
        this.callParent(arguments);
    },
    
    initComponent: function() {
        
        this.save_close = false;
        
        // ensure all countries will be visible
        Data.countries.clearFilter();
        
        var rec = this.locationRec;
        var menu_store = this.getMenuStore();
        this.main_ctx_items = [];
        menu_store.each(function(r){
            this.main_ctx_items.push(
                Ext.create('Sp.views.locations.Form' + r.data.id, {
                    locationRec: this.locationRec, 
                    title: r.data.label, 
                    itemId: r.data.id,
                    autoScroll: true,
                })
            );
        }, this);
                    
        Ext.apply(this, {
            layout: {
                type: 'hbox',
                align: 'stretch',
            },
            padding: '10 10 10 10',
            border: 0,
            items: [
                {
                    xtype: 'grid',
                    width: 180,
                    padding: '0 5 0 0',
                    store: menu_store,
                    header: false,
                    hideHeaders: true,
                    columnLines: false,
                    rowLines: false,
                    border: 1,
                    viewConfig: {
                        stripeRows: false,
                    },
                    columns: [
                        {
                            dataIndex: 'icon',
                            width: 22, 
                            renderer: function(v, data, r){
                                return "<img src='" + r.data.icon + "'/>";
                            },
                        },
                        {
                            dataIndex: 'label',
                            flex: 1,
                        },
                    ],
                    listeners: {
                        afterrender: function(me){
                            me.getSelectionModel().select(0);
                        },
                        itemmouseenter: function(me, r, el){
                            var domEl = new Ext.dom.Element(el);
                            domEl.setStyle('cursor', 'pointer');
                        },
                        itemmouseleave: function(me, r, el){
                            var domEl = new Ext.dom.Element(el);
                            domEl.setStyle('cursor', 'default');
                        },
                        itemclick: Ext.bind(this.onMenuClick, this),
                    },
                },
                {
                    xtype: 'container',
                    itemId: 'mainContainer',
                    layout: {
                        type: 'card'
                    },
                    flex: 1,
                    items: this.main_ctx_items,
                }
            ],
            buttons: [
                {
                    text: TR("Save & Close"),
                    itemId: 'saveAndCloseBt',
                    icon: '/static/images/icons/save_exit.png',
                    formBind: true,
                    disabled: true,
                    handler: function(){
                        this.save(true);
                    },
                    scope: this,
                },
                ' ',
                {
                    text: TR("Save"),
                    itemId: 'saveBt',
                    icon: '/static/images/icons/save.png',
                    formBind: true,
                    disabled: true,
                    handler: function(){
                        this.save();
                    },
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
        
        // load form
        this.loadRecord(rec);
        
        // set initial values
        for (var i=0,p ; p = this.main_ctx_items[i] ; i++){
            if (p.initValues){
                p.initValues(); 
            }
        }
            
    },
    
    onMenuClick: function(me, r){
        var ctx = this.getComponent('mainContainer');
        var form = ctx.getComponent(r.data.id);
        if (form){
            ctx.getLayout().setActiveItem(form);
        }
    },
    
    save: function(close){
        
        // validation
        if (!Sp.ui.data.validateForm(this)){
            return;
        }
        
        this.down('#saveAndCloseBt').disable();
        this.down('#saveBt').disable();
        this.down('#cancelBt').disable();
        this.body.mask(TR("Saving"));
        
        // update record
        this.form.updateRecord();
        
        // form panels specific actions
        for (var i=0,p ; p = this.main_ctx_items[i] ; i++){
            if (p.pre_save){
                p.pre_save(this);
            }
        }
        
        // save record if changed
        if (Ext.Object.getSize(this.locationRec.getChanges()) > 0){
            this.locationRec.save({callback: Ext.bind(this.onLocationSaved, this, [close])});    
        } else {
            this.onLocationSaved(close);
        }
    },
    
    onLocationSaved: function(close){
        
        // forms saves
        for (var i=0,p ; p = this.main_ctx_items[i] ; i++){
            if (p.post_save){
                p.post_save(this);  
            }
        }
        
        // update location view
        if (close){
            this.ownerCt.updateView(true);
        } else {
            // dont update toolbar buttons
            this.ownerCt.updateView(true, true);
        }
        
        // update nav tb button
        this.getTbFunction().getComponent(this.locationRec.data.uuid).setText(this.locationRec.data.name);
        
        if (close){
            this.save_close = true;
            this.close();
            return;
        }
        
        // change cancel boutton label
        this.down('#cancelBt').setText(TR("Close"));
        this.down('#saveAndCloseBt').enable();
        this.down('#saveBt').enable();
        this.down('#cancelBt').enable();
        this.body.unmask();
    },
        
    onClose: function(){
        if (!this.save_close){
            this.locationRec.reject();
            for (var i=0,p ; p = this.main_ctx_items[i] ; i++){
                if (p.reject){
                    p.reject(); 
                }
            }
        }
        this.ownerCt.getLayout().prev();
        this.ownerCt.down('#editBt').show();
        this.ownerCt.down('#closeBt').show();
        this.ownerCt.down('#viewBt').hide();
        //this.ownerCt.down('#makeReservationBt').show();
        this.ownerCt.down('#clearancesBt').show();
        this.ownerCt.updateMap();
    },
    
});
