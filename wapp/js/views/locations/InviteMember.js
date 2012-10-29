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


Ext.define('Sp.views.locations.InviteMember', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 500,
            height: 260,
            modal: true,
            resizable: false,
            title: Ext.String.format(TR("Invite {0} member"), Sp.core.Globals.BRAND),
            icon: '/static/images/icons/invite.png',
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
                            title: TR("Find member"),
                            items: [
                                {
                                    name: 'name',
                                    xtype: 'personcombo',
                                    itemId: 'name',
                                    fieldLabel: TR("Member's Name"),
                                    emptyText: TR("search by member's name"),
                                    selfCreated: true,
                                    listeners: {
                                        change: Ext.bind(function(me, value){
                                            if (value){
                                                this.down('#email').clearValue();
                                            }
                                        }, this)
                                    },
                                },
                                {
                                    name: 'email',
                                    xtype: 'personcombo',
                                    itemId: 'email',
                                    fieldLabel: TR("Member's Email"),
                                    emptyText: TR("or search by member's email"),
                                    selfCreated: true,
                                    queryField: 'email',
                                    listeners: {
                                        change: Ext.bind(function(me, value){
                                            if (value){
                                                this.down('#name').clearValue();
                                            }
                                        }, this)
                                    },
                                },
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
                    text: TR("Send Invitation"),
                    itemId: 'sendBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.invite,
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
            
    },
    
    invite: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        var values = form.getValues();
        if (!values.name && !values.email){
            form.findField('name').markInvalid(TR(Sp.core.Globals.REQ_MSG));
            return;
        }
        this.body.mask(TR("Please wait"));
        this.down('#sendBt').disable();
        this.down('#cancelBt').disable();
        var r = Data.create('LocationMembership', {
            location: this.locationRec.data.uuid,
            person: values.name ? values.name.uuid : values.email.uuid,
            join_type: 'I',
            profile: values.profile,
        });
        r.save({
            callback: function(recs, op){
                if (op.success){
                    Data.load('LocationMembership', r.data.uuid, function(membership){
                        this.membersStore.add(membership);
                        Notify(TR("Invitation sent"));
                        this.close();
                    }, this);
                } else {
                    var name = Sp.ui.misc.formatFullname({data:values.name ? values.name : values.email}, Data.me.data.name_order, true);
                    this.body.unmask();
                    this.down('#sendBt').enable();
                    this.down('#cancelBt').enable();
                    Sp.ui.misc.errMsg(Ext.String.format(TR("'{0}' has already been invited"), name), TR("Invitation error"));
                }
            },
            scope: this,
        });
    },
     
});