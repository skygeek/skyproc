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

Ext.define('Sp.views.locations.Viewer', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
                
        this.next_loads_filter = null;
        this.locationRec = this.moduleData;
        this.getRelationship();
        
        if (this.has_clearance){
            this.applyNextLoadsFilter();
        }
        
        var map_infos = Sp.ui.data.getLocationMapInfos(this.locationRec, false);
        
        Ext.apply(this, {
            layout: {
                type: 'card',
            },
            header: false,
            tbar: [
                ' ',
                {
                    xtype: 'image',
                    itemId: 'flag',
                    width: 16,
                    height: 11,
                },
                ' ',
                {
                    xtype: 'label',
                    itemId: 'title',
                },
                '->',
                {
                    xtype: 'button',
                    itemId: 'joinBt',
                    text: TR("Join"),
                    icon: '/static/images/icons/join.png',
                    handler: this.joinLocation,
                    scope: this,
                },
                {
                    xtype: 'button',
                    itemId: 'cancelJoinBt',
                    text: TR("Cancel join request"),
                    icon: '/static/images/icons/req_cancel.png',
                    handler: this.cancelRequest,
                    scope: this,
                },
                {
                    xtype: 'splitbutton',
                    itemId: 'inviteReplyBt',
                    text : TR("Accept invitation"),
                    icon: '/static/images/icons/reply.png',
                    menu: new Ext.menu.Menu({
                        items: [
                            {
                                text: TR("Accept"),
                                icon: '/static/images/icons/save.png',
                                handler: this.acceptInvitation,
                                scope: this,
                            },
                            {
                                text: TR("Decline"), 
                                icon: '/static/images/icons/ban.png',
                                handler: this.rejectInvitation,
                                scope: this,
                            },
                        ],
                    }),
                    handler: this.acceptInvitation,
                    scope: this,
                },
                {xtype: 'tbseparator', itemId: 'joinSep'},
                {
                    xtype: 'button',
                    itemId: 'reqClrBt',
                    text: TR("Request Clearance"),
                    icon: '/static/images/icons/clearance.png',
                    handler: this.requestClearance,
                    scope: this,
                },
                {
                    xtype: 'button',
                    itemId: 'cancelClrBt',
                    text: TR("Cancel clearance request"),
                    icon: '/static/images/icons/time_cancel.png',
                    handler: this.cancelClearanceRequest,
                    scope: this,
                },
                {
                    xtype: 'button',
                    itemId: 'makeReservationBt',
                    text: TR("Make Reservation"),
                    icon: '/static/images/icons/datetime.png',
                    hidden: true,
                },
                {xtype: 'tbseparator', itemId: 'actionSep'},
                {
                    xtype: 'splitbutton',
                    itemId: 'clearancesBt',
                    text : TR("Clearances"),
                    icon: '/static/images/icons/clearance.png',
                    menu: new Ext.menu.Menu({
                        items: [
                            {
                                text: TR("Issue new"),
                                icon: '/static/images/icons/new_green.png',  
                                handler: function(){
                                    Ext.create('Sp.views.locations.AddClearance', {
                                        locationRec: this.locationRec,
                                        standalone: true,
                                    }).show();  
                                },
                                scope: this,
                            },
                            {
                                text: TR("View current"), 
                                icon: '/static/images/icons/list.png',
                                handler: function(){
                                    Ext.create('Sp.views.locations.Clearances', {
                                        locationRec: this.locationRec,
                                    }).show();
                                },
                                scope: this,
                            },
                        ],
                    }),
                    handler: function(bt){
                        bt.showMenu();
                    },
                },
                {xtype: 'tbseparator', itemId: 'adminSep'},
                {
                    xtype: 'button',
                    itemId: 'viewBt',
                    text: TR("Preview"),
                    icon: '/static/images/icons/view.png',
                    handler: this.viewLocation,
                    scope: this,
                },
                {
                    xtype: 'button',
                    itemId: 'editBt',
                    text: TR("Manage"),
                    icon: '/static/images/icons/settings.png',
                    handler: this.editLocation,
                    scope: this,
                },
                {xtype: 'tbseparator', itemId: 'manageSep'},
                {
                    xtype: 'button',
                    itemId: 'leaveBt',
                    text: TR("Leave"),
                    icon: '/static/images/icons/leave.png',
                    handler: function(){
                        if (this.locationRec.data.member_auto_accept){
                            this.leaveLocation();
                        } else {
                            Ext.MessageBox.confirm( TR("Confirmation"),
                                Ext.String.format(TR("Are you sure you want to leave {0}"), this.locationRec.data.name),
                                function(btn){
                                    if (btn == 'yes'){
                                        this.leaveLocation();
                                    }
                            }, this);   
                        }
                    },
                    scope: this,
                },
                {xtype: 'tbseparator', itemId: 'leaveSep'},
                {
                    xtype: 'button',
                    itemId: 'closeBt',
                    text: TR("Close"),
                    icon: '/static/images/icons/close.png',
                    handler: this.close,
                    scope: this,
                },
            ],
            items: [
                {
                    xtype: 'container',
                    itemId: 'view',
                    layout: {
                        type: 'border',
                    },
                    padding: '10 10 0 10',
                    items: [
                        {
                            region: 'west',
                            xtype: 'container',
                            itemId: 'west',
                            width: 180,
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                                
                            },
                            padding: '0 0 10 0',
                            items: [
                                {
                                    xtype: 'panel',
                                    itemId: 'badge',
                                    height: 160,
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    padding: '0 0 5 0',
                                    items: {
                                        xtype: 'image',
                                        itemId: 'image',
                                        width: 140,
                                        height: 140,
                                        padding: '10 0 0 0',
                                        margin: '0 0 10 0',
                                    },
                                },
                                {
                                    xtype: 'panel',
                                    itemId: 'ressources',
                                    title: TR("Resources"),
                                    padding: '0 0 0 0',
                                    flex: 1,
                                    layout: 'fit',
                                    items: [
                                        {
                                            xtype: 'grid',
                                            itemId: 'grid',
                                            header: false,
                                            hideHeaders: true,
                                            border: 0,
                                            rowLines: false,
                                            disableSelection: true,
                                            scroll: 'vertical',
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    {name:'order_index', type:'int'},
                                                    {name:'label', type:'string'},
                                                    {name:'count', type:'int'},
                                                ],
                                                sorters: [
                                                    {
                                                        property: 'order_index',
                                                        direction: 'ASC'
                                                    },
                                                ],
                                            }),
                                            columns: [
                                                {
                                                    dataIndex: 'label',
                                                    flex: 1,
                                                },
                                                {
                                                    dataIndex: 'count',
                                                    width: 30,
                                                    align: 'right',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            region: 'center',
                            xtype: 'container',
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                                
                            },
                            padding: '0 5 0 5',
                            items: [
                                {
                                    xtype: 'toolbar',
                                    hidden: (this.is_mine || !this.is_member || (
                                        !this.locationRec.data.enable_self_manifesting &&
                                        !this.locationRec.data.share_account_data
                                    )),
                                    margin: '0 0 8 0',
                                    items: [
                                        {
                                            text: TR("Dropzone infos"),
                                            icon: '/static/images/icons/info_blue.png',
                                            toggleGroup: 'locationSubMenu',
                                            pressed: true,
                                            handler: function(){
                                                this.down('#dzPagesCtx').getLayout().setActiveItem(this.down('#dzInfosPage'));
                                            },
                                            scope: this,
                                        },
                                        '-',
                                        {
                                            text: TR("Boarding"),
                                            icon: '/static/images/icons/plane_small.png',
                                            toggleGroup: 'locationSubMenu',
                                            handler: function(){
                                                this.down('#dzPagesCtx').getLayout().setActiveItem(this.down('#dzLoadsPage'));
                                            },
                                            scope: this,
                                            hidden: !this.locationRec.data.enable_self_manifesting,
                                        },
                                        '-',
                                        {
                                            text: TR("Account"),
                                            icon: '/static/images/icons/bank.png',
                                            toggleGroup: 'locationSubMenu',
                                            handler: function(){
                                                this.down('#dzPagesCtx').getLayout().setActiveItem(this.down('#dzAccountPage'));
                                            },
                                            scope: this,
                                            hidden: !this.locationRec.data.share_account_data,
                                        },
                                        
                                    ],
                                },
                                {
                                    xtype: 'container',
                                    itemId: 'dzPagesCtx',
                                    layout: 'card',
                                    flex: 1,
                                    items: [
                                        {
                                            xtype: 'container',
                                            itemId: 'dzInfosPage',
                                            layout: {
                                                type: 'vbox',
                                                align: 'stretch',
                                            },
                                            items: [
                                                {
                                                    xtype: 'fieldset',
                                                    itemId: 'terrainFs',
                                                    title: TR("Terrain informations"),
                                                    layout: 'card',
                                                    items: [
                                                        {
                                                            xtype: 'container',
                                                            itemId: 'terrainInfosCtx',
                                                            layout: {
                                                                type: 'hbox',
                                                                pack: 'center',
                                                            },
                                                            items: [
                                                                {
                                                                    xtype: 'label',
                                                                    text: TR("Latitude") + ':',
                                                                    cls: 'header-color',
                                                                    margin: '0 3 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'terrainLat',
                                                                    margin: '0 8 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    text: TR("Longitude") + ':',
                                                                    cls: 'header-color',
                                                                    margin: '0 3 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'terrainLng',
                                                                    margin: '0 8 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    text: TR("Elevation") + ':',
                                                                    cls: 'header-color',
                                                                    margin: '0 3 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'terrainElev',
                                                                    margin: '0 8 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    text: TR("Landing area") + ':',
                                                                    cls: 'header-color',
                                                                    margin: '0 3 0 0',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'landingArea',
                                                                },
                                                            ],
                                                        },
                                                        {
                                                            xtype: 'container',
                                                            itemId: 'terrainLabelCtx',
                                                            layout: {
                                                                type: 'hbox',
                                                                pack: 'center',
                                                            },
                                                            items: [
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'terrainLabel',
                                                                },
                                                            ],                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: 'fieldset',
                                                    title: TR("Dropzone map"),
                                                    flex: 1,
                                                    layout: 'fit',
                                                    items: [
                                                        {
                                                            xtype: 'gmappanel',
                                                            itemId: 'viewMap',
                                                            mapOptions: {
                                                                zoom: map_infos.map_zoom,
                                                                mapTypeId: map_infos.map_type,
                                                            },
                                                            center: map_infos.map_center,
                                                            listeners: {
                                                                MapObjectMouseOver: this.onMapObjectMouseOver,
                                                                MapObjectMouseOut: this.onMapObjectMouseOut,
                                                                scope: this,
                                                            },
                                                            markers: map_infos.markers,
                                                            circles: map_infos.circles,
                                                            rectangles: map_infos.rectangles,
                                                            polygons: map_infos.polygons,
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: 'fieldset',
                                                    title: TR("Contact informations"),
                                                    layout: {
                                                        type: 'hbox',
                                                        pack: 'center',
                                                    },
                                                    items: [
                                                        {
                                                            xtype: 'label',
                                                            text: TR("Website") + ':',
                                                            cls: 'header-color',
                                                            margin: '0 3 0 0',
                                                        },
                                                        {
                                                            xtype: 'label',
                                                            itemId: 'website',
                                                            margin: '0 8 0 0',
                                                        },
                                                        {
                                                            xtype: 'label',
                                                            text: TR("E-mail") + ':',
                                                            cls: 'header-color',
                                                            margin: '0 3 0 0',
                                                        },
                                                        {
                                                            xtype: 'label',
                                                            itemId: 'email',
                                                            margin: '0 8 0 0',
                                                        },
                                                        {
                                                            xtype: 'label',
                                                            text: TR("Phone") + ':',
                                                            cls: 'header-color',
                                                            margin: '0 3 0 0',
                                                        },
                                                        {
                                                            xtype: 'label',
                                                            itemId: 'phone',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'container',
                                            itemId: 'dzLoadsPage',
                                            layout: {
                                                type: 'vbox',
                                                align: 'stretch',
                                            },
                                            items: [
                                                {
                                                    xtype: 'fieldset',
                                                    title: TR("Clearance status"),
                                                    margin: '2 0 12 0',
                                                    padding: '4 6 8 6',
                                                    items: [
                                                        {
                                                            xtype: 'label',
                                                            itemId: 'clrLabel',
                                                        },
                                                    ],
                                                    hidden: !this.locationRec.data.use_clearances,
                                                },
                                                {
                                                    xtype: 'panel',
                                                    itemId: 'nextLoadsPanel',
                                                    title: TR("Next available loads"),
                                                    icon: '/static/images/icons/available_load.png',
                                                    flex: 1,
                                                    layout: 'fit',
                                                    hidden: !this.has_clearance,
                                                    items: [
                                                        {
                                                            xtype: 'grid',
                                                            itemId: 'nextLoadsGrid',
                                                            store: this.locationRec.Loads(),
                                                            sortableColumns: false,
                                                            enableColumnMove: false,
                                                            enableColumnHide: false,
                                                            enableColumnResize: false,
                                                            emptyText: TR("No loads"),
                                                            columns: [
                                                                {
                                                                    dataIndex: 'number',
                                                                    header: TR("N°"),
                                                                    width: 30,
                                                                    align: 'center',
                                                                },
                                                                {
                                                                    dataIndex: 'state',
                                                                    header: TR("State"),
                                                                    flex: 1,
                                                                    renderer: function(v,o,r){
                                                                        if (v == 'P'){
                                                                            return TR("Planned");
                                                                        }
                                                                        if (v == 'B'){
                                                                            var label = TR("Boarding");
                                                                            if (Ext.isNumber(r.data.timer) && r.data.timer>0){
                                                                                label += Ext.String.format(" {0} {1}", TR("in"), 
                                                                                                Sp.lmanager.getTimerLabel(r.data.timer));
                                                                            }
                                                                            return label;
                                                                        }
                                                                    },
                                                                    scope: this,
                                                                },
                                                                {
                                                                    dataIndex: 'aircraft',
                                                                    header: TR("Aircraft"),
                                                                    width: 60,
                                                                    renderer: function(v,o,r){
                                                                        var aircraft = this.locationRec.Aircrafts().getById(v);
                                                                        if (aircraft){
                                                                            return aircraft.data.registration;
                                                                        }
                                                                    },
                                                                    scope: this,
                                                                },
                                                                {
                                                                    dataIndex: 'pilot',
                                                                    header: TR("Pilot"),
                                                                    width: 100,
                                                                    renderer: function(v,o,r){
                                                                        var pilot = this.locationRec.Workers().getById(v);
                                                                        if (pilot){
                                                                            return pilot.data.name;
                                                                        }
                                                                    },
                                                                    scope: this,
                                                                },
                                                                {
                                                                    header: TR("Free"),
                                                                    width: 50,
                                                                    align: 'center',
                                                                    renderer: function(v,o,r){
                                                                        return "<span class='bold'>" + this.getLoadFreeSlots(r) + "</span>";
                                                                    },
                                                                    scope: this,
                                                                },
                                                                {
                                                                    xtype: 'actioncolumn',
                                                                    itemId: 'takeSlotCol',
                                                                    width: 20,
                                                                    sortable: false,
                                                                    align: 'center',
                                                                    items: [
                                                                        {
                                                                            icon: '/static/images/icons/join_load.png',
                                                                            tooltip: TR("Take slot"),
                                                                            handler: function(grid, rowIndex, colIndex) {
                                                                                this.takeSlot(grid.getStore().getAt(rowIndex));
                                                                            },
                                                                            scope: this,
                                                                        }
                                                                    ],
                                                                    listeners: {
                                                                        mouseover: function(view, el, row, col, e, rec){
                                                                            var domEl = new Ext.dom.Element(el);
                                                                            domEl.setStyle('cursor', 'pointer');
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    xtype: 'actioncolumn',
                                                                    itemId: 'cancelSlotCol',
                                                                    width: 20,
                                                                    sortable: false,
                                                                    align: 'center',
                                                                    hidden: true,
                                                                    items: [
                                                                        {
                                                                            icon: '/static/images/icons/ban.png',
                                                                            tooltip: TR("Cancel slot"),
                                                                            handler: function(grid, rowIndex, colIndex) {
                                                                                this.cancelSlot(grid.getStore().getAt(rowIndex));
                                                                            },
                                                                            scope: this,
                                                                            getClass: function(v,o,r){
                                                                            },
                                                                        }
                                                                    ],
                                                                    listeners: {
                                                                        mouseover: function(view, el, row, col, e, rec){
                                                                            var domEl = new Ext.dom.Element(el);
                                                                            domEl.setStyle('cursor', 'pointer');
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                            bbar: [
                                                                {
                                                                    xtype: 'label',
                                                                    text: TR("Show") + ':',
                                                                    cls: 'x-toolbar-text',
                                                                },
                                                                {
                                                                    xtype: 'combobox',
                                                                    itemId: 'nextLoadsFilter',
                                                                    store: Ext.create('store.store', {
                                                                        fields: ['filter', 'label', 'icon'],
                                                                        data: [
                                                                            {filter: 'available', label: TR("Available loads"), icon: 'available_load.png'},
                                                                            {filter: 'in', label: TR("Loads I'm in"), icon: 'loads_in.png'},
                                                                        ],
                                                                    }),
                                                                    valueField: 'filter',
                                                                    displayField: 'label',
                                                                    queryMode: 'local',
                                                                    forceSelection: true,
                                                                    editable: false,
                                                                    width: 125,
                                                                    tpl: Ext.create('Ext.XTemplate',
                                                                        '<tpl for=".">',
                                                                            '<div class="x-boundlist-item">',
                                                                            "<img src='/static/images/icons/{icon}'/>&nbsp;{label}",
                                                                            '</div>',
                                                                        '</tpl>'
                                                                    ),
                                                                    listeners: {
                                                                        afterrender: function(me){
                                                                            me.setValue(me.getStore().findRecord('filter', 'available'));
                                                                        },
                                                                        select: function(me, recs){
                                                                            this.next_loads_filter = recs[0].data.filter;
                                                                            this.applyNextLoadsFilter();
                                                                            var nextLoadsPanel = this.down('#nextLoadsPanel');
                                                                            if (this.next_loads_filter == 'in'){
                                                                                nextLoadsPanel.setTitle(TR("Next loads I'm in"));
                                                                                nextLoadsPanel.setIcon('/static/images/icons/loads_in.png');
                                                                                this.down('#cancelSlotCol').show();
                                                                                this.down('#takeSlotCol').hide();
                                                                            } else {
                                                                                nextLoadsPanel.setTitle(TR("Next available loads"));
                                                                                nextLoadsPanel.setIcon('/static/images/icons/available_load.png');
                                                                                this.down('#cancelSlotCol').hide();
                                                                                this.down('#takeSlotCol').show();
                                                                            }
                                                                        },
                                                                        scope: this,
                                                                    },
                                                                },
                                                                '-',
                                                                {
                                                                    text: TR("Boarding panel"),
                                                                    icon: '/static/images/icons/display.png',
                                                                    handler: function(){
                                                                        Ext.create('Sp.views.locations.MemberBoard', {
                                                                            locationRec: this.locationRec,
                                                                        }).show();
                                                                    },
                                                                    scope: this,
                                                                },
                                                                '-',
                                                                {
                                                                    text: TR("Refresh"),
                                                                    icon: '/static/images/icons/reload.png',
                                                                    handler: function(){
                                                                        this.reloadMembership();
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
                                            xtype: 'container',
                                            itemId: 'dzAccountPage',
                                            layout: {
                                                type: 'vbox',
                                                align: 'stretch',
                                            },
                                            items: [
                                                {
                                                    xtype: 'fieldset',
                                                    title: TR("Balance"),
                                                    margin: '2 0 12 0',
                                                    padding: '4 6 8 6',
                                                    items: [
                                                        {
                                                            xtype: 'label',
                                                            itemId: 'balanceLabel',
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: 'panel',
                                                    itemId: 'nextLoadsPanel',
                                                    title: TR("Operations history"),
                                                    icon: '/static/images/icons/listing.png',
                                                    flex: 1,
                                                    layout: 'fit',
                                                    tbar: [
                                                        {
                                                            xtype: 'label',
                                                            text: TR("From"),
                                                            cls: 'x-toolbar-text',
                                                        },
                                                        {
                                                            xtype: 'datefield',
                                                            itemId: 'opStartDate',
                                                            width: 130,
                                                        },
                                                        ' ',
                                                        {
                                                            xtype: 'label',
                                                            text: TR("To"),
                                                            cls: 'x-toolbar-text',
                                                        },
                                                        {
                                                            xtype: 'datefield',
                                                            itemId: 'opEndDate',
                                                            width: 130,
                                                        },
                                                        '->',
                                                        {
                                                           xtype: 'button',
                                                           text: TR("Filter"),
                                                           icon: '/static/images/icons/filter.png',
                                                           handler: function(){
                                                               this.filterAccountOperations();
                                                           },
                                                           scope: this,
                                                        },
                                                    ],
                                                    items: [
                                                        {
                                                            xtype: 'grid',
                                                            itemId: 'operationsGrid',
                                                            enableColumnMove: false,
                                                            enableColumnHide: false,
                                                            enableColumnResize: false,
                                                            emptyText: TR("No operations"),
                                                            store: Data.createStore('AccountOperationLog', {
                                                                autoLoad: true,
                                                                buffered: true,
                                                                pageSize: 100,
                                                                remoteSort: true,
                                                                sorters: [
                                                                    {
                                                                        property: 'date',
                                                                        direction: 'DESC'
                                                                    },
                                                                ],
                                                                remoteFilter: true,
                                                                filters: [
                                                                    {
                                                                        property: 'location',
                                                                        value: this.locationRec.data.uuid,
                                                                    },
                                                                ],
                                                            }),
                                                            selModel: {
                                                                pruneRemoved: false,
                                                            },
                                                            viewConfig: {
                                                                trackOver: false,
                                                            },
                                                            columns: [
                                                                {
                                                                    dataIndex: 'date',
                                                                    header: TR("Date"),
                                                                    renderer: function(v,o,r){
                                                                        return Ext.Date.format(v, Data.me.data.date_format);
                                                                    },
                                                                },
                                                                {
                                                                    dataIndex: 'note',
                                                                    header: TR("Label"),
                                                                    flex: 1,
                                                                },
                                                                {
                                                                    dataIndex: 'amount',
                                                                    header: TR("Amount"),
                                                                    align: 'right',
                                                                    renderer: function(v,o,r){
                                                                        return Ext.util.Format.currency(v, ' '+r.data.currency, 0, true);
                                                                    },
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
                        {
                            region: 'east',
                            xtype: 'container',
                            width: 200,
                            layout: {
                                type: 'vbox',
                                align: 'stretch',
                                
                            },
                            padding: '0 0 10 0',
                            items: [
                                {
                                    xtype: 'panel',
                                    itemId: 'weatherPanel',
                                    height: 230,
                                    padding: '0 0 5 0',
                                    layout: 'card',
                                    items: [
                                        {
                                            xtype: 'container',
                                            itemId: 'weatherInfosCtx',
                                            layout: {
                                                type: 'vbox',
                                                align: 'stretch',
                                            },
                                            items: [
                                                {
                                                    xtype: 'container',
                                                    flex: 1,
                                                    layout: {
                                                        type: 'hbox',
                                                        align: 'stretch',
                                                    },
                                                    items: [
                                                        {
                                                            xtype: 'label',
                                                            itemId: 'weatherDataLabel',
                                                            margin: '0 0 0 8',
                                                            flex: 1,
                                                        },
                                                        {
                                                            xtype: 'container',
                                                            width: 93,
                                                            layout: {
                                                                type: 'vbox',
                                                                align: 'center',
                                                            },
                                                            items: [
                                                                {
                                                                    xtype: 'image',
                                                                    itemId: 'cloudsImg',
                                                                    width: 93,
                                                                    height: 93,
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'tempLabel',
                                                                },
                                                                {
                                                                    xtype: 'label',
                                                                    itemId: 'creditLabel',
                                                                    style: {
                                                                        'font-size': '9px',
                                                                        'text-align': 'center',
                                                                    },
                                                                    margin: '10 0 0 0',
                                                                    html: Ext.String.format(
                                                                        "{0}<br><a href='http://www.geonames.org/' target='_blank'>GeoNames</a>",
                                                                        TR("Data provided by")),
                                                                },
                                                            ],
                                                        },
                                                        
                                                    ],
                                                },
                                                {
                                                    xtype: 'label',
                                                    itemId: 'weatherSrcDate',
                                                    margin: '0 0 4 0',
                                                    style: {
                                                        'text-align': 'center',
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            xtype: 'container',
                                            itemId: 'noWeatherData',
                                            layout: {
                                                type: 'hbox',
                                                align: 'middle',
                                                pack: 'center',
                                            },
                                            items: [
                                                {
                                                    xtype: 'container',
                                                    layout: {
                                                        type: 'vbox',
                                                        align: 'center',
                                                    },
                                                    items: [
                                                        {
                                                            xtype: 'label',
                                                            text: TR("No weather data"),
                                                            cls: 'placeholder-color',
                                                            style: {
                                                                'text-align': 'center',
                                                            },
                                                        },
                                                        {
                                                            xtype: 'button',
                                                            itemId: 'updateWeatherBt',
                                                            icon: '/static/images/icons/overcast.png',
                                                            text: TR("Update weather data"),
                                                            margin: '50 0 0 0',
                                                            handler: function(){
                                                                this.updateWeatherData();
                                                            },
                                                            scope: this,
                                                            hidden: true,
                                                        },
                                                    ],
                                                },
                                                
                                            ],
                                        },
                                    ],
                                },
                                {
                                    xtype: 'panel',
                                    title: TR("Events"),
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'middle',
                                        pack: 'center',
                                    },
                                    items: [
                                        {
                                            xtype: 'label',
                                            text: TR("Events feature is not yet available"),
                                            cls: 'placeholder-color',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],                  
                }
            ],
            listeners: {
                close: this.onClose,
            },
        });
 
        this.callParent(arguments);
        
        this.updateView(true);
    },
    
    getRelationship: function(){
        var rec = this.locationRec;
        this.is_mine = false;
        this.is_member = false;
        this.has_pending_invite = false;
        this.has_pending_request = false;
        this.has_clearance = false;
        this.has_pending_clearance = false;

        // check ownership
        if (Sp.app.isOp()){
            var my_rec = Data.locations.getById(rec.data.uuid);
            if (my_rec){
                this.is_mine = true;
                this.locationRec = rec = my_rec;
                return;
            }
        }
        
        // check membership
        Data.memberships.each(function(m){
            if (m.getLocation().data.uuid == rec.data.uuid){
                if (m.data.approved){
                    this.is_member = true;
                } else {
                    if (m.data.join_type == 'R'){
                        this.has_pending_request = true;
                    } else if (m.data.join_type == 'I'){
                        this.has_pending_invite = true;
                    }
                }
                return false;
            }
        }, this);
        
        // check clearance
        if (this.is_member){
            var clr = Sp.ui.data.getPersonClearance(rec.data.uuid);
            if (clr){
                if (clr.data.approved){
                    this.has_clearance = true;
                    this.clearance_period = Sp.ui.misc.getClearancePeriod(clr);
                    
                } else {
                    this.has_pending_clearance = true;
                }
            }
        }
        
    },
    
    doEditLocation: function(){
        var editor_id = this.locationRec.data.uuid + '-editor';
        var form = this.getComponent(editor_id);
        if (!form){
            var form = Ext.create('Sp.views.locations.EditLocation', 
                {
                    itemId: editor_id, 
                    locationRec: this.locationRec,
                    getTbFunction: this.getTbFunction,
                });
            this.add(form); 
        }
        this.getLayout().setActiveItem(form);
        //this.down('#makeReservationBt').hide();
        this.down('#clearancesBt').hide();
        this.down('#editBt').hide();
        this.down('#manageSep').hide();
        this.down('#closeBt').hide();
        this.down('#viewBt').show();
    },
    
    editLocation: function(){
        if (this.locationRec.data.pwd_protect_manage){
            var form = this.getComponent(this.locationRec.data.uuid + '-editor');
            if (form){
                this.doEditLocation();
            } else {
                Sp.ui.misc.passwordAction(Ext.bind(this.doEditLocation, this));
            }
        } else {
            this.doEditLocation();
        }
    },
    
    viewLocation: function(){
        this.getLayout().setActiveItem(0);
        //this.down('#makeReservationBt').show();
        this.down('#clearancesBt').show();
        this.down('#editBt').show();
        this.down('#manageSep').show();
        this.down('#closeBt').show();
        this.down('#viewBt').hide();
    },
    
    buildRessourcesStore: function(){
        var store = this.query('#view #west #ressources #grid')[0].getStore();
        store.removeAll();
        
        // aircrafts
        var aircrafts = {};
        this.locationRec.Aircrafts().each(function(a){
            var label = a.data.type;
            if (a.data.max_slots){
                if (a.data.max_slots == 1){
                    label += Ext.String.format(' &nbsp;(1 {0})', TR("slot"));
                } else {
                    label += Ext.String.format(' &nbsp;({0} {1})', a.data.max_slots, TR("slots"));
                }
            }
            if (!Ext.isDefined(aircrafts[label])){
                aircrafts[label] = {
                    count: 0,
                };
            }
            aircrafts[label].count += 1;
        });
        Ext.Object.each(aircrafts, function(k,v){
            store.add({
                order_index: 0,
                label: "<img src='/static/images/icons/plane_small.png'/> " + k,
                count: v.count,
            });
        });
                
        // workers
        var roles = {};
        this.locationRec.Workers().each(function(w){
            if (w.data.available_fulltime){
                w.WorkerTypes().each(function(wt){
                    if (!Ext.isDefined(roles[wt.data.type])){
                        roles[wt.data.type] = {
                            order_index: wt.data.order_index,
                            label: wt.data.plural_label,
                            count: 0,
                        };
                    }
                    roles[wt.data.type].count += 1;
                });
            }
        });
        Ext.Object.each(roles, function(k,v){
            if (k != 'pilot'){
                store.add({
                    order_index: v.order_index,
                    label: "<img src='/static/images/icons/roles/" + k + ".png'/> " + v.label,
                    count: v.count,
                }); 
            }
        });
    },
    
    updateButtons: function(){      
        this.down('#joinBt').hide();
        this.down('#cancelJoinBt').hide();
        this.down('#inviteReplyBt').hide();
        this.down('#joinSep').hide();
        this.down('#reqClrBt').hide();
        this.down('#cancelClrBt').hide();
        //this.down('#makeReservationBt').hide();
        this.down('#actionSep').hide();
        this.down('#clearancesBt').hide();
        this.down('#adminSep').hide();
        this.down('#viewBt').hide();
        this.down('#editBt').hide();
        this.down('#manageSep').hide();
        this.down('#leaveBt').hide();
        this.down('#leaveSep').hide();
        if (this.is_mine){
            //this.down('#makeReservationBt').show();
            this.down('#clearancesBt').show();
            this.down('#adminSep').show();
            this.down('#editBt').show();
            this.down('#manageSep').show();
        } else if (this.is_member){
            //this.down('#makeReservationBt').show();
            this.down('#actionSep').show();
            this.down('#leaveBt').show();
            this.down('#leaveSep').show();
            if (!this.has_clearance){
                if (this.has_pending_clearance){
                    this.down('#cancelClrBt').show();                   
                } else {
                    this.down('#reqClrBt').show();
                }
            } 
        } else {
            this.down('#joinSep').show();
            if (this.has_pending_request){
                this.down('#cancelJoinBt').show();
            } else if (this.has_pending_invite){
                this.down('#inviteReplyBt').show();
            } else {
                this.down('#joinBt').show();
            }
        }
    },
    
    updateWeather: function(){
        var store = this.locationRec.WeatherObservations();
        var panel = this.down('#weatherPanel');
        if (store.getCount() == 0){
            panel.getLayout().setActiveItem(this.down('#noWeatherData'));
            this.down('#updateWeatherBt').setVisible(this.is_mine);
        } else {
            var infos = store.getAt(0);
            panel.getLayout().setActiveItem(this.down('#weatherInfosCtx'));
            
            // data
            var data_label = [];
            var header_attrs = "class='header-color' style='font-size:11px;padding-top:2px'";
            
            // dew point
            data_label.push(Ext.String.format("<dt {0}>{1}</dt>", header_attrs, TR("Dew point")));
            if (infos.data.dew_point){
                data_label.push(Ext.String.format("<dt>{0}</dt>", Sp.utils.getUserUnit(infos.data.dew_point, 'temperature')));
            } else {
                data_label.push(Ext.String.format("<dt>{0}</dt>", TR("N/A")));
            }
            
            // wind speed
            data_label.push(Ext.String.format("<dt {0}>{1}</dt>", header_attrs, TR("Wind speed")));
            if (infos.data.wind_speed){
                data_label.push(Ext.String.format("<dt>{0}</dt>", Sp.utils.getUserUnit(infos.data.wind_speed, 'wind_speed')));
                
            } else {
                data_label.push(Ext.String.format("<dt>{0}</dt>", TR("N/A")));
            }
            
            // wind direction
            data_label.push(Ext.String.format("<dt {0}>{1}</dt>", header_attrs, TR("Wind direction")));
            if (infos.data.wind_direction){
                data_label.push(Ext.String.format("<dt>{0} °</dt>", infos.data.wind_direction));
            } else if (infos.data.wind_speed){
                data_label.push(Ext.String.format("<dt>{0}</dt>", TR("Variable")));
            } else {
                data_label.push(Ext.String.format("<dt>{0}</dt>", TR("N/A")));
            }
            
            // humidity
            data_label.push(Ext.String.format("<dt {0}>{1}</dt>", header_attrs, TR("Humidity")));
            if (infos.data.humidity){
                data_label.push(Ext.String.format("<dt>{0} %</dt>", infos.data.humidity));
            } else {
                data_label.push(Ext.String.format("<dt>{0}</dt>", TR("N/A")));
            }
            
            // QNH
            data_label.push(Ext.String.format("<dt {0}>{1}</dt>", header_attrs, TR("Pressure (QNH)")));
            if (infos.data.qnh){
                data_label.push(Ext.String.format("<dt>{0} hPa</dt>", infos.data.qnh));
            } else {
                data_label.push(Ext.String.format("<dt>{0}</dt>", TR("N/A")));
            }

            // set data label
            this.down('#weatherDataLabel').setText('<dl>' + data_label.join('') + '</dl>', false);
            
            // clouds image
            var clouds = infos.data.clouds || 'none';
            if (infos.data.sunrise && infos.data.sunset && !Ext.Date.between(new Date(), infos.data.sunrise, infos.data.sunset)){
                clouds += '_night';
            }
            this.down('#cloudsImg').setSrc(Ext.String.format("/static/images/weather/clouds_{0}.png", clouds));
            
            // temperature
            var temp_label = TR("N/A");
            if (infos.data.temperature){
                temp_label = Sp.utils.getUserUnit(infos.data.temperature, 'temperature');
            }
            this.down('#tempLabel').setText(Ext.String.format("<span style='font-size: 26px'>{0}</span>", temp_label), false);
            
            // source and datetime
            var src_label = "<dl style='font-size: 11px'>";
            var station = infos.data.station || TR("N/A");
            src_label += Ext.String.format("<dt><span class='header-color'>Station:</span>&nbsp;{0}</dt>", station);
            src_label += Ext.String.format("<dt><span class='header-color'>Last update:</span>&nbsp;{0}</dt>", 
                            Ext.Date.format(infos.data.datetime, Data.me.data.time_format));
            src_label += Ext.String.format("<dt><span class='header-color'>Sunset:</span>&nbsp;{0}</dt>", 
                            Ext.Date.format(infos.data.sunset, Data.me.data.time_format));
            src_label += '</dl>';
            this.down('#weatherSrcDate').setText(src_label, false);
        }
    },
    
    updateWeatherData: function(){
        var panel = this.down('#weatherPanel');
        panel.body.mask(TR("Updating"));
        Sp.utils.rpc('weather.update', [this.locationRec.data.uuid], function(weather_data){
            if (weather_data){
                weather_data = Ext.decode(weather_data);
            }
            if (weather_data && weather_data.length > 0){
                var r = Data.create('WeatherObservation', weather_data[0]);
                r.commit();
                this.locationRec.WeatherObservations().add(r);
                this.updateWeather();
            } else {
                Sp.ui.misc.warnMsg(TR("No weather data found"), TR("No data"));
            }
            panel.body.unmask();
        }, this);
    },
    
    updateBalanceLabel: function(){
        var membership = this.getMembership();
        var balance_label = [];
        membership.Accounts().each(function(a){
            if (a.data.balance != 0){
                var currency = Data.currencies.getById(a.data.currency);
                balance_label.push(Ext.util.Format.currency(a.data.balance, ' '+currency.data.code, 0, true));  
            }
        });
        if (balance_label.length > 0){
            balance_label = balance_label.join(' | ');
        } else {
            balance_label = TR("None");
        }
        this.down('#balanceLabel').setText(balance_label, false);
    },
    
    updateView: function(init, dont_update_buttons, dont_update_infos){
        var rec = this.locationRec, val;
        
        if (!init){
            this.getRelationship();
        }
        
        // update buttons visibility
        if (!dont_update_buttons){
            this.updateButtons();           
        }
        
        if (dont_update_infos){
            return;
        }
        
        // country
        var country = null;
        if (rec.data.country){
            var country = rec.getCountry();
            if (country.data.iso_code.length == 0){
                country = null;
            }   
        }
        
        // city
        if (rec.data.city){
            var city_name = rec.getCity().data.name;
        } else {
            var city_name = rec.data.custom_city;
            if (city_name.length == 0){
                city_name = null;
            }
        }
        
        // title = Name ([city - ]country)
        var title = "<span class='semi-bold'>" + rec.data.name + '</span>';
        if (country){
            if (city_name){
                title += ' &nbsp; (' + city_name + ' - ';  
            } else {
                title += ' &nbsp; (';
            }
            title += country.data[Sp.utils.i18n.getCountryNameField()] + ')';
            var flag_img = '/static/images/flags/' + country.data.iso_code.toLowerCase() + '.png';
        } else {
            var flag_img = '/static/images/flags/none.png';
        }
        
        // toolbar flag and title
        this.getDockedItems('toolbar[dock="top"]')[0].getComponent('flag').setSrc(flag_img);
        this.getDockedItems('toolbar[dock="top"]')[0].getComponent('title').setText(title, false);
        
        // contact infos
        val = TR("N/A");
        if (rec.data.website){
            val = Sp.utils.getWebsiteLink(rec.data.website);
        }
        this.down('#website').setText(val, false);
        
        val = TR("N/A");
        if (rec.data.email){
            val = Sp.utils.getEmailLink(rec.data.email);
        }
        this.down('#email').setText(val, false);
        
        val = TR("N/A");
        if (rec.data.phone){
            val = rec.data.phone;
        }
        this.down('#phone').setText(val);
        
        // picture
        var picture = '/static/images/nothing.png';
        if (rec.data.picture){
            picture = rec.data.picture;
        }
        this.down('#image').setSrc(picture);
        
        // ressources
        this.buildRessourcesStore();
        
        // clearance label
        var clr_label = "<span class='bold'>" + TR("No valid clearance") + "</span>";
        if (this.has_clearance){
            var tpl = "<span class='bold'>{0}</span>&nbsp;&nbsp;(expires on {1})";
            clr_label = Ext.String.format(tpl, TR("VALID"), 
                        Ext.Date.format(this.clearance_period.end_date, Data.me.data.date_format));
        } else if (this.has_pending_clearance){
            clr_label = "<span class='bold'>" + TR("Clearance is pending") + "...</span>";
        }
        this.down('#clrLabel').setText(clr_label, false);
        
        // balance label
        if (this.is_member){
            this.updateBalanceLabel();
        }
        
        // weather infos
        this.updateWeather();
        
        // update map
        var map = this.down('#viewMap');
        if (map.getMap()){
            var map_infos = Sp.ui.data.getLocationMapInfos(rec, false);
            var gmap = map.getMap();
            map.clearMapObjects();
            gmap.setMapTypeId(map_infos.map_type);
            gmap.setZoom(map_infos.map_zoom);
            gmap.setCenter(map_infos.map_center);
            map.addMapObjects(map_infos); 
        }
        
        // terrain infos
        // GPS pos
        if (rec.data.terrain_latitude && rec.data.terrain_longitude){
            var pos_label = Sp.utils.getLatLngLabel(rec.data.terrain_latitude, rec.data.terrain_longitude);
            this.down('#terrainLat').setText(pos_label.lat);
            this.down('#terrainLng').setText(pos_label.lng);
        } else {
            this.down('#terrainLat').setText(TR("N/A"));
            this.down('#terrainLng').setText(TR("N/A"));
        }
        // elevation
        val = TR("N/A");
        if (rec.data.terrain_elevation){
            val = Sp.utils.getUserUnit(rec.data.terrain_elevation, 'altitude');
        }
        this.down('#terrainElev').setText(val);
        // landing area
        val = TR("N/A");
        if (rec.data.landing_area){
            val = Sp.utils.getUserUnit(rec.data.landing_area, 'area');
        }
        this.down('#landingArea').setText(val, false);
        
    },
    
    onMapObjectMouseOver: function(object){
        if (!object.uuid){
            return;
        }
        var mapObject = this.locationRec.MapObjects().getById(object.uuid);
        if (!mapObject){
            return;
        }
        var at = Data.areaTypes.getById(mapObject.data.type);
        var label = at.data.label;
        if (mapObject.data.name){
            label += Ext.String.format(": {0}", mapObject.data.name);
        }
        if (mapObject.data.description){
            if (mapObject.data.name){
                label += ', ';
            } else {
                label += ': ';
            }
            label += mapObject.data.description;
        }
        this.down('#terrainLabel').setText(label);
        this.down('#terrainFs').getLayout().setActiveItem('terrainLabelCtx');
    },
    
    onMapObjectMouseOut: function(object){
        this.down('#terrainFs').getLayout().setActiveItem('terrainInfosCtx');
        this.down('#terrainLabel').setText('');
    },
    
    getMembership: function(){
        var membership;
        Data.memberships.each(function(m){
            if (m.getLocation().data.uuid == this.locationRec.data.uuid){
                membership = m;
                return false;
            }
        }, this);
        return membership;
    },
    
    clearRequestStores: function(membership_uuid){
        var r = Data.newInvites.getById(membership_uuid);
        if (r){
            Data.newInvites.remove(r);
        }
        var idx = Data.newRequestsList.findExact('uuid', membership_uuid);
        if (idx != -1){
            Data.newRequestsList.removeAt(idx);
        }
    },
    
    joinLocation: function(){
        var joinBt = this.down('#joinBt');
        var cancelBt = this.down('#cancelJoinBt');
        joinBt.disable();
        joinBt.setText(TR("Sending join request..."));
        var r = Data.create('LocationMembership', {
            location: this.locationRec.data.uuid,
            person: Data.me.data.uuid,
            join_type: 'R',
        });
        r.save({
            callback: function(){
                Data.load('LocationMembership_R', r.data.uuid, function(membership){
                    Data.memberships.add(membership);
                    joinBt.hide();
                    joinBt.setText(TR("Join"));
                    joinBt.enable();
                    if (membership.data.approved){
                        this.is_member = true;
                        this.updateButtons();
                        Notify(TR("Welcome"), Ext.String.format(TR("You have successfully joined {0}"), this.locationRec.data.name));
                    } else {
                        this.has_pending_request = true;
                        this.updateButtons();
                        Notify(TR("Request sent"), TR("Your join request has been successfully sent"));                     
                    }
                }, this);
        },
        scope: this,
        });
    },
    
    leaveLocation: function(){
        var membership = this.getMembership();
        if (!membership){
            return;
        }
        var leaveBt = this.down('#leaveBt');
        leaveBt.disable();
        leaveBt.setText(TR("Leaving..."));
        Sp.utils.rpc('membership.leaveLocation', [membership.data.uuid], function(){
            Data.memberships.remove(membership);
            this.is_member = false;
            leaveBt.hide();
            leaveBt.enable();
            leaveBt.setText(TR("Leave"));
            this.updateButtons();
        }, this);
    },
    
    cancelRequest: function(){
        var membership = this.getMembership();
        if (!membership){
            return;
        }
        var cancelBt = this.down('#cancelJoinBt');
        cancelBt.disable();
        cancelBt.setText(TR("Canceling join request..."));
        Sp.utils.rpc('membership.cancelRequest', [membership.data.uuid], function(){
            Data.memberships.remove(membership);
            this.has_pending_request = false;
            cancelBt.hide();
            cancelBt.enable();
            cancelBt.setText(TR("Cancel join request"));
            this.updateButtons();
        }, this);
    },
    
    acceptInvitation: function(){
        var membership = this.getMembership();
        if (!membership){
            return;
        }
        var replyBt = this.down('#inviteReplyBt');
        replyBt.disable();
        replyBt.setText(TR("Accepting invitation..."));
        Sp.utils.rpc('membership.acceptInvitation', [membership.data.uuid], function(){
            // update membership
            membership.beginEdit();
            membership.set('approved', true);
            membership.set('new_approval', false);
            membership.endEdit();
            membership.commit();
            // clear invitation reqquest
            this.clearRequestStores(membership.data.uuid);
            // update ui
            this.is_member = true;
            this.has_pending_invite = false;
            replyBt.hide();
            replyBt.enable();
            replyBt.setText(TR("Accept invitation"));
            this.updateButtons();
        }, this);
    },
    
    rejectInvitation: function(){
        var membership = this.getMembership();
        if (!membership){
            return;
        }
        var replyBt = this.down('#inviteReplyBt');
        replyBt.disable();
        replyBt.setText(TR("Declining invitation..."));
        Sp.utils.rpc('membership.rejectInvitation', [membership.data.uuid], function(){
            // delete membership
            Data.memberships.remove(membership);
            // clear invitation reqquest
            this.clearRequestStores(membership.data.uuid);
            // update ui
            this.has_pending_invite = false;
            replyBt.hide();
            replyBt.enable();
            replyBt.setText(TR("Accept invitation"));
            this.updateButtons();
        }, this);
    },
    
    requestClearance: function(){
        Ext.create('Sp.views.locations.AddClearance', {
            locationRec: this.locationRec,
            personRequest: true,
        }).show();
    },
    
    cancelClearanceRequest: function(){
        var clearance = Sp.ui.data.getPersonClearance(this.locationRec.data.uuid);
        if (!clearance){
            return;
        }
        var cancelBt = this.down('#cancelClrBt');
        cancelBt.disable();
        cancelBt.setText(TR("Canceling clearance request..."));
        Sp.utils.rpc('clearance.cancel', [clearance.data.uuid], function(){
            Data.clearances.remove(clearance);
            this.has_pending_clearance = false;
            cancelBt.hide();
            cancelBt.enable();
            cancelBt.setText(TR("Cancel clearance request"));
            this.updateButtons();
        }, this);
    },
    
    getLoadFreeSlots: function(loadRec){
        var used = 0;
        var slots_store = loadRec.Slots();
        var aircraft = this.locationRec.Aircrafts().getById(loadRec.data.aircraft);
        slots_store.each(function(s){
            if (s.data.related_slot || s.data.person || s.data.phantom || s.data.worker || s.data.item){
                used += 1;
            } else if (slots_store.find('related_slot', s.data.uuid) != -1){
                used += 1;
            }
        });
        return aircraft.data.max_slots-used;
    },
    
    amiInLoad: function(loadRec){
        var im_in = false;
        loadRec.Slots().each(function(s){
            if (s.data.person && s.data.person.uuid == Data.me.data.uuid){
                im_in = true;
                return false;
            }
        });
        return im_in;
    },
    
    filterNextLoads: function(loadRec){
        // show only planned and boarding
        if (['P','B'].indexOf(loadRec.data.state) == -1){
            return false;
        }
        var filter = this.next_loads_filter || 'available';
        if (filter == 'in'){
            return this.amiInLoad(loadRec);
        } else {
            return this.getLoadFreeSlots(loadRec) > 0 && !this.amiInLoad(loadRec);
        }
    },
    
    applyNextLoadsFilter: function(){
        this.locationRec.Loads().filterBy(this.filterNextLoads, this);
    },
    
    reloadMembership: function(){
        var m = this.getMembership();
        if (!m){
            return;
        }
        var grid = this.down('#nextLoadsGrid');
        grid.body.mask(TR("Refreshing"));
        Data.load('LocationMembership_R', m.data.uuid, function(membership){
            Data.memberships.remove(m);
            Data.memberships.add(membership);
            this.locationRec = membership.getLocation();
            var loads_store = this.locationRec.Loads();
            this.applyNextLoadsFilter();
            grid.getView().bindStore(loads_store);
            this.updateBalanceLabel();
            grid.body.unmask();
        }, this);
    },
    
    takeSlot: function(loadRec){
        Ext.create('Sp.views.locations.TakeSlot', {
            locationRec: this.locationRec,
            membership: this.getMembership(),
            loadRec: loadRec,
            applyNextLoadsFilter: Ext.bind(this.applyNextLoadsFilter, this),
        }).show();
    },
    
    cancelSlot: function(loadRec){
        Ext.MessageBox.confirm( TR("Confirmation"),
            Ext.String.format(TR("Cancel your slot in load n° {0} ?"), loadRec.data.number),
            function(btn){
                if (btn == 'yes'){
                    var slots_store = loadRec.Slots();
                    var grid = this.down('#nextLoadsGrid');
                    grid.body.mask(TR("Please wait"));
                    Sp.utils.rpc('lmanager.cancel_slot', [Data.me.data.uuid, loadRec.data.uuid], function(slots){
                        Ext.each(slots, function(s){
                            slots_store.remove(slots_store.getById(s), true);
                        });
                        this.applyNextLoadsFilter();
                        grid.body.unmask();
                    }, this);
                }
        }, this);
    },
    
    filterAccountOperations: function(){
        var store = this.down('#operationsGrid').getStore();
        var startDate = this.down('#opStartDate').getValue();
        var endDate = this.down('#opEndDate').getValue();
        var filters = [];
        filters.push({
            property: 'location',
            value: this.locationRec.data.uuid,
        });
        if (startDate && endDate){
            filters.push({
                property: 'date__gte',
                value: Ext.Date.format(startDate, Sp.core.Globals.DATE_FORMAT),
            });
            filters.push({
                property: 'date__lte',
                value: Ext.Date.format(endDate, Sp.core.Globals.DATE_FORMAT),
            });
        } else if (startDate){
            filters.push({
                property: 'date',
                value: Ext.Date.format(startDate, Sp.core.Globals.DATE_FORMAT),
            });
        } else if (endDate){
            filters.push({
                property: 'date__lte',
                value: Ext.Date.format(endDate, Sp.core.Globals.DATE_FORMAT),
            });
        }
        store.clearFilter(true);
        store.filter(filters);
    },
    
    onClose: function(){
        this.ownerCt.getLayout().prev();
    },
    
});
