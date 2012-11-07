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

Ext.define('Sp.views.global.Notifications', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
                
        this.focus_over = false;
        this.restore_focus = true;
        var notif_count = Data.notifications.getCount();
        
        if (notif_count > 0){
            var buttons = [
                {
                    itemId: 'clearBt',
                    icon: '/static/images/icons/trash.png',
                    maxWidth: 22,
                    tooltip: TR("Clear notifications"),
                    handler: function(me){
                        //me.disable();
                        Sp.utils.rpc('notification.clear');
                        Data.notifications.removeAll();
                        this.handleButtonsState();
                        Sp.app.updateNotificationCounter();
                    },
                    scope: this,
                },
                '->',
                {
                    itemId: 'ackBt',
                    text: TR("Mark all notifications as seen"),
                    icon: '/static/images/icons/ackall.png',
                    handler: function(me){
                        //me.disable();
                        Sp.utils.rpc('notification.ack');
                        Data.notifications.each(function(n){
                            if (n.data['new']){
                                n.beginEdit();
                                n.set('new', false);
                                n.endEdit();
                                n.commit();
                            }
                        });
                        this.handleButtonsState();
                        Sp.app.updateNotificationCounter();
                    },
                    scope: this,
                },
            ];
        } else {
            var buttons = undefined;
        }
                
        Ext.apply(this, {
            width: 340,
            height: (notif_count == 0 ? 80 : 410),
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
                    store: Data.notifications,
                    emptyText: TR("No new notifications"),
                    viewConfig: {
                        deferEmptyText: false,
                        trackOver: false,
                    },
                    selModel: {
                        pruneRemoved: false,
                    },
                    scroll: (notif_count == 0 ? false : 'vertical'),
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
                            flex: 1,
                            renderer: Ext.bind(function(v,o,r){
                                render_fn = this[r.data.type + '_label'];
                                if (Ext.isFunction(render_fn)){
                                    return render_fn.apply(this, [r]);
                                }
                            }, this),
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
                        itemclick: function(me, rec){
                            if (rec.data['new']){
                                rec.beginEdit();
                                rec.set('new', false);
                                rec.endEdit();
                                rec.save();
                                rec.commit();
                            }
                        },
                    },
                },
            ],
            buttons: buttons,
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
        if (notif_count > 0){
            this.handleButtonsState();
            Data.notifications.on('datachanged', this.handleButtonsState, this);
        }
    },
    
    getDateLabel: function(r, table_class){
        table_class = table_class || 'notif-time-6px';
        var label = '';
        label += "<table class='" + table_class + "'><tr>";
        if (r.data['new']){
            label += "<td><img src='/static/images/icons/available.png'/></td>";
        }
        var today = new Date();
        label += '<td>';
        if (Ext.Date.isEqual(r.data.created, today)){
            label += TR("Today");
        } else if (Ext.Date.isEqual(r.data.created, Ext.Date.add(today, Ext.Date.DAY, -1))){
            label += TR("Yesterday");
        } else {
            label += Ext.Date.format(r.data.created, Data.me.data.date_format);                                 
        }
        label += ' ';
        label += Ext.Date.format(r.data.created, Data.me.data.time_format);
        label += '</td>';
        label += "</tr></table>";
        return label;
    },
    
    join_accept_label: function(r){
        var label = '';
        label += this.getDateLabel(r);
        label += "<span class='bold'>" + r.data.text + '</span>';
        label += '<br>';
        label += TR("Accepted your join request");
        return label;
    },
    
    invite_accept_label: function(r){
        var label = '';
        label += this.getDateLabel(r);
        label += "<span class='bold'>" + r.data.text + '</span>';
        label += '<br>';
        label += TR("Accepted your join invitation");
        return label;
        
    },
    
    auto_join_label: function(r){
        var label = '';
        label += this.getDateLabel(r);
        label += "<span class='bold'>" + r.data.text + '</span>';
        label += '<br>';
        label += Ext.String.format(TR("Joined {0}"), r.data.text2);
        return label;
    },
    
    got_clearance_label: function(r){
        var label = '';
        var p = Sp.ui.misc.getClearancePeriod(Data.create('Clearance', Ext.decode(r.data.text2)[0]));
        label += this.getDateLabel(r, 'notif-time-4px');
        label += "<span class='bold'>" + r.data.text + '</span>';
        label += "<table>";
        label += Ext.String.format(
            "<tr><td><img src='/static/images/icons/clearance.png'/></td><td>&nbsp;Received clearance for <span class='semi-bold'>{0}</span></td></tr>", 
            p.count_label);
        label += Ext.String.format("<tr><td><img src='/static/images/icons/start.png'/></td><td>&nbsp;{0}</td></tr>", 
                    Ext.Date.format(p.start_date, Data.me.data.date_format));
        if (p.end_date){
            label += Ext.String.format("<tr><td><img src='/static/images/icons/end.png'/></td><td>&nbsp;{0}</td></tr>", 
                        Ext.Date.format(p.end_date, Data.me.data.date_format));
        }
        label += "</table>";
        return label;
    },
    
    handleButtonsState: function(){
        this.down('#clearBt').setDisabled((Data.notifications.getCount() == 0));
        this.down('#ackBt').setDisabled((Data.notifications.find('new', true) == -1));
    },
        
    onClose: function(){
        Data.notifications.un('datachanged', this.handleButtonsState, this);
        Sp.NotificationsWindowLastClose = new Date();
    },
    
});
