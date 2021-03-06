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


Ext.define('Sp.views.locations.TakeSlot', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
                
        this.profile = Sp.ui.data.getPersonProfile(this.membership, this.locationRec);
        
        Ext.apply(this, {
            width: 400,
            height: this.profile.catalog_access ? 160 : 140,
            modal: true,
            resizable: false,
            title: Ext.String.format(TR("Take a slot in load n° {0}"), this.loadRec.data.number),
            icon: '/static/images/icons/join_load.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    border: 0,
                    items: [
                        {
                            xtype: 'fieldset',
                            defaults: {
                                anchor: '100%',
                            },
                            items: [
                                {
                                    name: 'jump_type',
                                    xtype: 'combobox',
                                    itemId: 'jump_type',
                                    fieldLabel: TR("Jump Program"),
                                    store: Data.jumpTypes,
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    valueField: 'uuid',
                                    displayField: 'label',
                                },
                                {
                                    name: 'item',
                                    xtype: 'combobox',
                                    itemId: 'item',
                                    fieldLabel: TR("Catalog Item"),
                                    store: Ext.create('store.store', {
                                        fields: ['uuid','name','price'],
                                        data: this.profile.available_catalog,
                                    }),
                                    queryMode: 'local',
                                    forceSelection: true,
                                    editable: false,
                                    valueField: 'uuid',
                                    displayField: 'name',
                                    hidden: !this.profile.catalog_access,
                                    
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    itemId: 'takeBt',
                    text: TR("Take Slot"),
                    icon: '/static/images/icons/save.png',
                    handler: this.takeSlot,
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
        
        if (Data.me.data.default_jump_type){
            var jump_type = this.down('#jump_type');
            jump_type.setValue(jump_type.getStore().getById(Data.me.data.default_jump_type));
        }
        
        if (this.profile.catalog_access && this.profile.catalog_item){
            var itemCbx = this.down('#item');
            itemCbx.setValue(itemCbx.getStore().findRecord('uuid', this.profile.catalog_item));
        }
        
    },
    
    takeSlot: function(){
        this.body.mask(TR("Please wait"));
        this.down('#takeBt').disable();
        this.down('#cancelBt').disable();
        var values = this.down('#form').form.getValues();
        var catalog_item = this.down('#item').getStore().findRecord('uuid', values.item);
        if (catalog_item && catalog_item.data.price){
            values.price = catalog_item.data.price;
        }
        Sp.utils.rpc('lmanager.take_slot', [Data.me.data.uuid, this.loadRec.data.uuid, values], function(slot_data){
            slot_data = Ext.decode(slot_data);
            var s = Data.create('Slot', slot_data[0]);
            s.commit();
            this.loadRec.Slots().add(s);
            this.applyNextLoadsFilter();
            this.close();
            Sp.ui.misc.notify(TR("ROGER"), 
                Ext.String.format(TR("You have taken one slot in load n°{0}"), this.loadRec.data.number));
        }, this, function(){
            this.close();
        });
    },
        
});
