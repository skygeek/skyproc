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

Ext.define('Sp.views.locations.FormMembers', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;
        
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'fit',
            },
            items: [
                {
                    xtype: 'container',
                    padding: '10 10 5 10',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    autoScroll: true,
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'grid',
                            itemId: 'membersGrid',
                            flex: 1,
                            store: Data.createStore('LocationMembership', {
                                autoLoad: true,
                                buffered: true,
                                pageSize: 40,
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
                                        value: rec.data.uuid,
                                    },
                                ],
                            }),
                            selModel: Ext.create('Ext.selection.CheckboxModel', {
                                pruneRemoved: false,
                            }),
                            viewConfig: {
                                trackOver: false,
                            },
                            sortableColumns: false,
                            enableColumnHide: false,
                            enableColumnResize: false,
                            emptyText: TR("No members !"),
                            columns: [
                                {
                                    header: TR("Members"),
                                    flex: 1,
                                    renderer: function(v,o,r){
                                        var person = r.getPerson();
                                        return Sp.ui.misc.formatFullname(person, Data.me.data.name_order, true);
                                    },
                                },
                                {
                                    header: TR("From"),
                                    flex: 1,
                                    renderer: function(v,o,r){
                                        return Sp.ui.misc.getCountryCity(r.getPerson());
                                    },
                                },
                                {
                                    header: TR("Profile"),
                                    renderer: function(v,o,r){
                                        if (r.data.profile){
                                            var profile = this.locationRec.MembershipProfiles().getById(r.data.profile);
                                            if (profile){
                                                return profile.data.name;
                                            }
                                        }
                                    },
                                    scope: this,
                                },
                                {
                                    header: TR("Status"),
                                    renderer: function(v,o,r){
                                        if (r.data.approved){
                                            return "<table><tr><td><img src='/static/images/icons/active.png'/></td><td>&nbsp;" + 
                                                    TR("Active") + "</td></tr></table>";
                                        } else {
                                            return "<table><tr><td><img src='/static/images/icons/pending.png'/></td><td>&nbsp;" + 
                                                    TR("Pending") + "</td></tr></table>";
                                        }
                                    },
                                },
                            ],
                            tbar: [
                                {
                                    xtype: 'textfield',
                                    itemId: 'searchField',
                                    width: 250, 
                                    emptyText: TR("Search for members"),
                                    enableKeyEvents: true,
                                    listeners: {
                                        keypress: Ext.bind(function(me, e){
                                            if (e.getKey() == 13){
                                                this.doSearch();
                                            }
                                        }, this),
                                    },
                                },
                                {
                                    xtype: 'button',
                                    icon: '/static/images/icons/search.png',
                                    tooltip: TR("Search"),
                                    handler: this.doSearch,
                                    scope: this,
                                },
                                '->',
                                {
                                    text: TR("Membership profiles"),
                                    icon: '/static/images/icons/membership.png',
                                    handler: function(){
                                        Ext.create('Sp.views.locations.MembershipOpt', {
                                            locationRec: this.locationRec,
                                        }).show();
                                    },
                                    scope: this,
                                },
                                '-',
                                {
                                    text: TR("Add member"),
                                    icon: '/static/images/icons/new_green.png',
                                    menu: [
                                        {
                                            text: TR("Create New"),
                                            icon: '/static/images/icons/new_yellow.png',
                                            handler: function(){
                                                Ext.create('Sp.views.locations.AddMember', {
                                                    locationRec: this.locationRec,
                                                    membersStore: this.down('#membersGrid').getStore(),                                                 
                                                }).show();
                                            },
                                            scope: this,
                                        },
                                        {
                                            text: TR("Invite"),
                                            icon: '/static/images/icons/invite.png',
                                            handler: function(){
                                                Ext.create('Sp.views.locations.InviteMember', {
                                                    locationRec: this.locationRec,
                                                    membersStore: this.down('#membersGrid').getStore(),                                                 
                                                }).show();
                                            },
                                            scope: this,
                                        },
                                    ],
                                },
                                {
                                    itemId: 'actionBt',
                                    text: TR("With selected"),
                                    icon: '/static/images/icons/action.png',
                                    disabled: true,
                                    menu: [
                                        {
                                            itemId: 'edit',
                                            text: TR("Edit"),
                                            icon: '/static/images/icons/edit.png',
                                            handler: this.editSelectedMember,
                                            scope: this,
                                        },
                                        {
                                            itemId: 'setprofile',
                                            text: TR("Set Profile"),
                                            icon: '/static/images/icons/membership.png',
                                            handler: this.setMembersProfile,
                                            scope: this,
                                        },
                                        '-',
                                        {
                                            itemId: 'delete',
                                            text: TR("Remove"),
                                            icon: '/static/images/icons/ban.png',
                                            handler: this.banSelectedMembers,
                                            scope: this,
                                        },
                                    ],
                                }
                            ],
                            listeners: {
                                itemdblclick: this.onMemberDblClick,
                                itemcontextmenu: this.onMemberContextMenu,
                                scope: this,
                            },
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
        // events
        var membersGrid = this.down('#membersGrid');
        membersGrid.getSelectionModel().on('selectionchange', Ext.bind(this.memberSelectionChanged, this));
        membersGrid.getStore().on('datachanged', Ext.bind(this.memberStoreChanged, this));
        
    },
    
    memberSelectionChanged: function(sm, selected){
        var action_bt = this.down('#actionBt');
        action_bt.setDisabled((selected.length == 0));
        action_bt.menu.getComponent('edit').setDisabled((selected.length != 1));
    },
    
    memberStoreChanged: function(store){
        if (store.getCount() == 0){
            var bt = this.down('#actionBt');
            if (bt){
                bt.disable();
            }
        }
    },
    
    editMember: function(membership){
        Ext.create('Sp.views.locations.EditMember', {
            locationRec: this.locationRec,
            membershipRec: membership,
        }).show();
    },
    
    banMembers: function(members){
        var msg;
        if (members.length == 0){
            return;
        } else if (members.length == 1){
            msg = Ext.String.format(
                TR("Are you sure you want to remove '{0}' from the club members ?"), 
                Sp.ui.misc.formatFullname(members[0].getPerson(), Data.me.data.name_order, true));
        } else {
            msg = Ext.String.format(
                TR("Are you sure you want to remove the {0} selected members ?"), 
                members.length);
        }
        //var membersStore = this.down('#membersGrid').getStore();
        Ext.MessageBox.confirm( TR("Confirmation"), msg,
            function(btn){
                if (btn == 'yes'){
                    Ext.MessageBox.confirm( TR("Confirmation"), TR("This action is permanent and cannot be undone.<br/>Continue ?"),
                        function(btn){
                            if (btn == 'yes'){
                                for (var i=0,r ; r = members[i] ; i++){
                                    r.destroy();
                                    //membersStore.remove(r);
                                }                               
                            }
                            this.down('#membersGrid').getStore().remove(members);
                        }, this
                    );
                }
            }, this
        );
    },
    
    banSelectedMembers: function(){
        this.banMembers(this.down('#membersGrid').getSelectionModel().getSelection());
    },
    
    editSelectedMember: function(){
        this.editMember(this.down('#membersGrid').getSelectionModel().getSelection()[0]);
    },
    
    setMembersProfile: function(){
        Ext.create('Sp.views.locations.EditMembersProfile', {
            locationRec: this.locationRec,
            members: this.down('#membersGrid').getSelectionModel().getSelection(),
        }).show();
        
    },
    
    onMemberDblClick: function(me, r, el){
        this.editMember(r);
    },
    
    onMemberContextMenu: function(grid, record, el, idx, ev){
        var items = [];
        var is_member = true;
        if (record.data.approved == false && record.data.join_type == 'R'){
            is_member = false;
            items.push({
                text: TR("Accept"),
                icon: '/static/images/icons/save.png',
                handler: function(){
                    this.acceptMember(record);
                },
                scope: this,
            });
            items.push({
                text: TR("Decline"),
                icon: '/static/images/icons/ban.png',
                handler: function(){
                    this.rejectMember(record);
                },
                scope: this,
            });
            items.push('-');
        }
        items.push({
            text: TR("Edit"),
            icon: '/static/images/icons/edit.png',
            handler: function(){
                this.editMember(record);
            },
            scope: this,
        });
        if (is_member){
            items.push('-');
            items.push({
                text: TR("Remove"),
                icon: '/static/images/icons/ban.png',
                handler: function(){
                    this.banMembers([record]);                      
                },
                scope: this,
            }); 
        }
        
        var menu = Ext.create('Ext.menu.Menu', {
            items: items,
        });
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    clearRequestStores: function(membership_uuid){
        var r = Data.newRequests.getById(membership_uuid);
        if (r){
            Data.newRequests.remove(r);
        }
        var idx = Data.newRequestsList.findExact('uuid', membership_uuid);
        if (idx != -1){
            Data.newRequestsList.removeAt(idx);
        }
    },
    
    acceptMember: function(membership){
        var grid = this.down('#membersGrid');
        grid.disable();
        membership.beginEdit();
        membership.set('approved', true);
        membership.endEdit();
        membership.save({
            callback: function(){
                this.clearRequestStores(membership.data.uuid);
                grid.enable();
            },
            scope: this,
        });     
    },
    
    rejectMember: function(membership){
        var name = Sp.ui.misc.formatFullname(membership.getPerson(), Data.me.data.name_order, true);
        Ext.MessageBox.confirm(
            TR("Join request"),
            Ext.String.format(TR("Decline the join request from {0} ?"), name),
            function(btn){
                if (btn == 'yes'){
                    membership.destroy();
                    this.down('#membersGrid').getStore().remove(membership);
                    this.clearRequestStores(membership.data.uuid);
                }
            },
            this
        );
    },
    
    doSearch: function(){
        var search_text = this.down('#searchField').getValue();
        var store = this.down('#membersGrid').getStore();
        var filters = [{
            property: 'location',
            value: this.locationRec.data.uuid,
        }];
        if (search_text){
            filters.push({
                property: 'person__last_name__icontains',
                value: search_text,
            });
            store.buffered = false;
        } else {
            store.buffered = true;
        }
        store.clearFilter(true);
        store.filter(filters);
    },
    
    membership_save: function(store){
        store.each(function(m){
            var account_store = m.Accounts();
            if (account_store.getModifiedRecords().length > 0 || account_store.getRemovedRecords().length > 0){
                account_store.sync({
                    success: function(){
                        account_store.each(function(a){
                            a.AccountOperations().sync();
                        });
                        m.BuyedItems().sync();
                    },
                });
            } else {
                account_store.each(function(a){
                    a.AccountOperations().sync();
                });
                m.BuyedItems().sync();
                m.MembershipCatalogs().sync();
                m.MembershipExtraCatalogs().sync();
                var person = m.getPerson();
                if (!person.data.self_created && Ext.Object.getSize(person.getChanges()) > 0){
                    person.save();
                }
            }
        });
    },
        
    post_save: function(){
        var profiles_store = this.locationRec.MembershipProfiles();
        profiles_store.sync({
            success: function(){
                profiles_store.each(function(p){
                    p.ProfileCatalogs().sync();
                    p.ProfileExtraCatalogs().sync();
                });        
            },
        });
        var membersGrid = this.down('#membersGrid');
        if (membersGrid){
            var store = membersGrid.getStore();
            if (store.getModifiedRecords().length > 0 || store.getRemovedRecords().length > 0){
                store.sync({
                    success: function(){
                        this.membership_save(store);
                    },
                    scope: this,
                });
            } else {
                this.membership_save(store);
            }
        }
    },
    
    reject: function(){
        this.locationRec.MembershipProfiles().rejectChanges();
        this.locationRec.MembershipProfiles().each(function(p){
            p.ProfileCatalogs().rejectChanges();
            p.ProfileExtraCatalogs().rejectChanges();
        });
        var membersGrid = this.down('#membersGrid');
        if (membersGrid){
            membersGrid.getStore().rejectChanges();
            membersGrid.getStore().each(function(m){
                m.MembershipCatalogs().rejectChanges();
                m.MembershipExtraCatalogs().rejectChanges();
                var person = m.getPerson();
                if (!person.data.self_created){
                    person.reject();
                }
            });
        }
    },
    
});
