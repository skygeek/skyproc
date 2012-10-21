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
                                    xtype: 'combobox',
                                    itemId: 'name',
                                    fieldLabel: TR("Member's Name"),
                                    emptyText: TR("search by member's last name"),
                                    store: Data.createStore('Person_P', {
                                        pageSize: 20,
                                        remoteSort: true,
                                        sorters: [
                                            {
                                                property: 'last_name',
                                                direction: 'ASC'
                                            },
                                            {
                                                property: 'first_name',
                                                direction: 'ASC'
                                            }
                                        ],
                                        proxy: {
                                            extraParams: {
                                                query_field: 'last_name',
                                                exclude: Ext.encode([
                                                    {'uuid': Data.me.data.uuid},
                                                ]),
                                            },
                                        },
                                    }),
                                    valueField: 'uuid',
                                    hideTrigger: true,
                                    queryDelay: 250,
                                    typeAhead: true,
                                    minChars: 1,
                                    tpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '<div class="x-boundlist-item">',
                                            "{last_name} {first_name}",
                                            '</div>',
                                        '</tpl>'
                                    ),
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{last_name} {first_name}',
                                        '</tpl>'
                                   ),
                                   listConfig: {
                                        loadingText: TR("Searching..."),
                                        emptyText: TR("No matching members found"),
                                    },
                                    pageSize: 20,
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
                                    xtype: 'combobox',
                                    itemId: 'email',
                                    fieldLabel: TR("Member's Email"),
                                    emptyText: TR("or search by member's email"),
                                    store: Data.createStore('Person_P', {
                                        buffered: true,
                                        pageSize: 20,
                                        remoteSort: true,
                                        sorters: [
                                            {
                                                property: 'last_name',
                                                direction: 'ASC'
                                            },
                                            {
                                                property: 'first_name',
                                                direction: 'ASC'
                                            }
                                        ],
                                        proxy: {
                                            extraParams: {
                                                query_field: 'email',
                                            },
                                        },
                                    }),
                                    valueField: 'uuid',
                                    hideTrigger: true,
                                    queryDelay: 250,
                                    typeAhead: true,
                                    minChars: 1,
                                    tpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '<div class="x-boundlist-item">',
                                            "{last_name} {first_name}",
                                            '</div>',
                                        '</tpl>'
                                    ),
                                    displayTpl: Ext.create('Ext.XTemplate',
                                        '<tpl for=".">',
                                            '{last_name} {first_name}',
                                        '</tpl>'
                                   ),
                                   listConfig: {
                                        loadingText: TR("Searching..."),
                                        emptyText: TR("No matching members found"),
                                    },
                                    pageSize: 20,
                                    listeners: {
                                        change: Ext.bind(function(me, value){
                                            if (value){
                                                this.down('#name').clearValue();
                                            }
                                        }, this)
                                    },
                               }
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
                                    allowBlank: false,
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
                    icon: '/static/images/icons/save.png',
                    handler: this.invite,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
            
    },
    
    invite: function(){
        var me = this;
        var form = this.getComponent('form');
        
        // validation
        if (!Sp.ui.data.validateForm(form)){
            return;
        }
        
        var values = form.form.getFieldValues();
        
        if (!values.name && !values.email){
            return;
        }
        
        if (values.name){
            var person_uuid = values.name;
        } else {
            var person_uuid = values.email;
        }
        
        var r = Data.create('LocationMembership', {
            location: this.locationRec.data.uuid,
            person: person_uuid,
            join_type: 'I',
            profile: values.profile,
        });
        r.save({
            callback: function(){
                Data.load('LocationMembership', r.data.uuid, function(membership){
                    me.membersStore.add(membership);
                });
            }
        });
        
        Notify(TR("Invitation sent"), TR("Your invitation has been successfully sent"));
        this.close();
    },
        
});
