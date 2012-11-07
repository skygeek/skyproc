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

Ext.define('Sp.views.global.Requests', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
                
        this.focus_over = false;
        this.restore_focus = true;
                
        Ext.apply(this, {
            width: 340,
            height: (Data.newRequestsList.getCount() == 0 ? 80 : 410),
            resizable: false,
            draggable: false,
            closable: false,
            layout: 'fit',
            disableWhatsThis: true,
            items: [
                {
                    xtype: 'grid',
                    itemId: 'grid',
                    header: false,
                    hideHeaders: true,
                    store: Data.newRequestsList,
                    emptyText: TR("No new requests"),
                    viewConfig: {
                        deferEmptyText: false,
                    },
                    scroll: 'vertical',
                    columns: [
                        {
                            dataIndex: 'picture',
                            width: 70,
                            align: 'center',
                            renderer: function(v){
                                return Ext.String.format("<img width='60' height='60' src='{0}'/>", v);
                            },
                        },
                        {
                            dataIndex: 'label',
                            flex: 1,
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 20,
                            items: [
                                {
                                    icon: '/static/images/icons/active.png',
                                    tooltip: TR("Accept"),
                                    handler: function(grid, rowIndex, colIndex) {
                                        this.accept(rowIndex);
                                    },
                                    scope: this,
                                },
                            ],
                        },
                        {
                            xtype: 'actioncolumn',
                            width: 20,
                            items: [
                                {
                                    icon: '/static/images/icons/ban.png',
                                    tooltip: TR("Decline"),
                                    handler: function(grid, rowIndex, colIndex) {
                                        this.reject(rowIndex);
                                    },
                                    scope: this,
                                },
                            ],
                        },
                    ],
                    listeners: {
                        containermouseover: {
                            fn: function(){
                                this.focus();
                                this.focus_over = true;
                            },
                            scope: this,
                        },
                        containermouseout: {
                            fn: function(){
                                this.focus_over = false;
                            },
                            scope: this,
                        },
                        itemmouseenter: {
                            fn: function(){
                                this.focus();
                                this.focus_over = true;
                            },
                            scope: this,
                        },
                        itemmouseleave: {
                            fn: function(){
                                this.focus_over = false;
                            },
                            scope: this,
                        },
                    },
                },
            ],
            listeners: {
                el: {
                    blur: {
                        fn: function(){
                            if (this.focus_over){
                                if (this.restore_focus){
                                    this.focus();
                                }
                            } else {
                                this.close();
                            }
                        },
                        scope:this
                    }
                },
                close: {
                    fn: this.onClose,
                    scope: this,
                },
            },
        });
 
        this.callParent(arguments);
    },
    
    getRec: function(list_rec){
        if (list_rec.data.type == 'R'){ 
            return Data.newRequests.getById(list_rec.data.uuid);
        } else if (list_rec.data.type == 'I'){
            return Data.newInvites.getById(list_rec.data.uuid);
        } else if (list_rec.data.type == 'C'){
            var rec;
            Data.locations.each(function(l){
                rec = l.Clearances().getById(list_rec.data.uuid);
                if (rec){
                    return false;
                }
            });
            return rec;
        } 
    },
    
    accept: function(rowIndex){
        var list_rec = Data.newRequestsList.getAt(rowIndex);
        var rec = this.getRec(list_rec);
        if (list_rec.data.type == 'R' || list_rec.data.type == 'I'){
            this.acceptRequest(rec, rowIndex);
        } else if (list_rec.data.type == 'C'){
            this.acceptClearance(rec, rowIndex);
        }
    },
    
    reject: function(rowIndex){
        var list_rec = Data.newRequestsList.getAt(rowIndex);
        var rec = this.getRec(list_rec);
        if (list_rec.data.type == 'R' || list_rec.data.type == 'I'){
            this.rejectRequest(rec, rowIndex);
        } else if (list_rec.data.type == 'C'){
            this.rejectClearance(rec, rowIndex);
        }
    },
    
    acceptRequest: function(rec, rowIndex){
        var grid = this.down('#grid');
        grid.disable();
        if (rec.data.join_type == 'R'){
            rec.beginEdit();
            rec.set('approved', true);
            rec.endEdit();
            rec.save({
                callback: function(){
                    Data.newRequests.remove(rec);
                    Data.newRequestsList.removeAt(rowIndex);
                    // other stores 
                    var model_name = Data.getModelName('LocationMembership');
                    Ext.StoreManager.each(function(s){
                        if (s.model.$className == model_name){
                            var r = s.getById(rec.data.uuid);
                            if (r){
                                r.beginEdit();
                                r.set('approved', true);
                                r.endEdit();
                                r.commit();                             
                            }
                        }           
                    });
                    grid.enable();
                },
            });
        } else if (rec.data.join_type == 'I'){
            Sp.utils.rpc('membership.acceptInvitation', [rec.data.uuid], function(){
                var r = Data.memberships.getById(rec.data.uuid);
                if (r){
                    r.beginEdit();
                    r.set('approved', true);
                    r.set('new_approval', false);
                    r.endEdit();
                    r.commit();
                    Sp.ui.misc.updateLocationView(r.getLocation().data.uuid);
                }
                Data.newInvites.remove(rec);
                Data.newRequestsList.removeAt(rowIndex);
                grid.enable();                          
            });
        }
    },
    
    rejectRequest: function(rec, rowIndex){
        if (rec.data.join_type == 'R'){
            var name = Sp.ui.misc.formatFullname(rec.getPerson(), Data.me.data.name_order, true);
        } else if (rec.data.join_type == 'I'){
            var name = rec.getLocation().data.name;
        }
        var grid = this.down('#grid');
        this.focus_over = true;
        this.restore_focus = false;
        grid.suspendEvents();
        Ext.MessageBox.confirm( (rec.data.join_type == 'R' ? TR("Join request") : TR("Invitation")), 
            Ext.String.format(
                (rec.data.join_type == 'R' ? TR("Decline the join request from {0} ?") : TR("Decline the invitation from {0} ?")), 
                name),
            function(btn){
                if (btn == 'yes'){
                    if (rec.data.join_type == 'R'){
                        grid.disable();
                        rec.destroy({
                            callback: function(){
                                Data.newRequests.remove(rec);
                                Data.newRequestsList.removeAt(rowIndex);
                                // other stores 
                                var model_name = Data.getModelName('LocationMembership');
                                Ext.StoreManager.each(function(s){
                                    if (s.model.$className == model_name){
                                        var r = s.getById(rec.data.uuid);
                                        if (r){
                                            s.remove(r);                                
                                        }
                                    }           
                                });
                                grid.enable();
                            },
                        });
                    } else if (rec.data.join_type == 'I'){
                        Sp.utils.rpc('membership.rejectInvitation', [rec.data.uuid], function(){
                            var r = Data.memberships.getById(rec.data.uuid);
                            if (r){
                                Data.memberships.remove(r);
                                Sp.ui.misc.updateLocationView(r.getLocation().data.uuid);
                            }
                            Data.newInvites.remove(rec);
                            Data.newRequestsList.removeAt(rowIndex);
                            grid.enable();                          
                        });
                    }
                }
                grid.resumeEvents();
                this.restore_focus = true;
                this.focus_over = false;
                this.focus();
            }, this
        );
    },
    
    acceptClearance: function(rec, rowIndex){
        var grid = this.down('#grid');
        grid.disable();
        rec.beginEdit();
        rec.set('approved', true);
        rec.endEdit();
        rec.save({
            callback: function(){
                Data.newRequestsList.removeAt(rowIndex);
                grid.enable();
            },
        });
    },
    
    rejectClearance: function(rec, rowIndex){
        var grid = this.down('#grid');
        this.focus_over = true;
        this.restore_focus = false;
        grid.suspendEvents();
        Ext.MessageBox.confirm( TR("Confirmation"), 
            Ext.String.format(
                TR("Decline the clearance request from '{0}' ?"), 
                Sp.ui.misc.formatFullname(rec.getPerson(), Data.me.data.name_order, true)),
            function(btn){
                if (btn == 'yes'){
                    grid.disable();
                    rec.destroy({
                        callback: function(r, op){
                            if (!op.success){
                                return;
                            }
                            rec.store.remove(rec);
                            Data.newRequestsList.removeAt(rowIndex);
                            grid.enable();
                        },
                        scope: this,
                    });
                }
                grid.resumeEvents();
                this.restore_focus = true;
                this.focus_over = false;
                this.focus();
            }, this
        );
    },
    
    onClose: function(){
        Sp.RequestsWindowLastClose = new Date();
    },
    
});
