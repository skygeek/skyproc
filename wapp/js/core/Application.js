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

var DEV = true;

if (DEV){
    Ext.Loader.setPath('Extensible', '/static/extensible/src/');
    Ext.syncRequire([
        'Ext.data.UuidGenerator',
        'Ext.util.Inflector',
        'Ext.data.association.BelongsTo',
        'Ext.data.association.HasOne',
        'Ext.data.association.HasMany',
        'Ext.data.proxy.Rest',
        'Ext.util.Cookies',
        'Ext.form.field.HtmlEditor',
        
        'Extensible.calendar.data.MemoryEventStore',
        'Extensible.calendar.CalendarPanel',
        'Extensible.calendar.gadget.CalendarListPanel',
        
        'Sp.core.Globals',
        'Sp.utils.Misc',
        'Sp.utils.Help',
        'Sp.core.Overrides',
        'Sp.core.Comet',
        
        'Sp.utils.Request',    
        'Sp.utils.Rpc',
        'Sp.utils.i18n',
        
        'Sp.data.Proxy',
        'Sp.data.StoresLoader',
        
        'Sp.ui.Misc',
        'Sp.ui.Data',
        'Sp.ui.BigButton',
        'Sp.ui.CardContainer',
        'Sp.ui.SettingsForm',
        'Sp.ui.GMapPanel',
        'Sp.ui.CountryCity',
        'Sp.ui.LockWindow',
        'Sp.ui.PersonCombo',
        'Sp.ui.TimezoneCombo',
        'Sp.ui.ux.StatusBar',
        'Sp.ui.ux.RowExpander',
        'Sp.ui.ux.Printer',
        
        'Sp.views.lmanager.Misc',
        
    ]);
}

// main App
Ext.define('Sp.core.Application', {
    extend: 'Ext.app.Application',
        
    config: {
        baseUrl: Sp.core.Globals.BASE_URL,
        cometUrl: Sp.core.Globals.COMET_URL,
    },
    
    constructor: function(config){
        this.initConfig(config);
        this.callParent(arguments);
        // keep a reference to the app
        Sp.app = this;
        // setup server messaging channel
        Ext.ns('Comet');
        Comet = Ext.create('Sp.data.Comet');
        Sp.core.comet.connect();
        // application overrides
        this.appOverrides();
        // disable browser context menu
        if (!DEV){
            Ext.getBody().on('contextmenu', function(e){
                e.preventDefault();
            });
        }
        // variable for auto collapse menu on first clisk
        this.menu_never_clicked = true;
    },
    
    appOverrides: function(){
        // extensible
        var M = Extensible.calendar.data.EventMappings;
        M.EventId.name = 'uuid';
        M.Location.name = 'location';
        Extensible.calendar.data.EventModel.reconfigure();
        // ux grid printer
        Ext.ux.grid.Printer.stylesheetPath = Sp.core.Globals.PRINT_CSS;
        Ext.ux.grid.Printer.printAutomatically = true;
    },
    
    launch: function() {
        Ext.tip.QuickTipManager.init();
        Ext.getBody().mask('Loading ' + Sp.core.Globals.BRAND);
        Comet.ready = false;
        this.loadDataModels();
    },
        
    loadDataModels: function(){
        try {
            Data;
            this.loadMyProfile();
            return;
        } catch(e){
            var fn = Ext.bind(this.onDataModelsLoad, this);
            Sp.utils.rpc('models.getAll', fn);  
        }
    },
    
    onDataModelsLoad: function(modelsDef){
        // Data manager
        Ext.ns('Data');
        Data = Ext.create('Sp.data.Manager', {modelsDef: modelsDef});
        this.loadMyProfile();
    },
    
    loadMyProfile: function(){
        var fn = Ext.bind(this.onMyProfileLoad, this);
        Data.load('Person', Ext.util.Cookies.get('sp_id'), fn);
    },
    
    onMyProfileLoad: function(myProfile){
        Data.me = myProfile;
        // user overrides
        this.userOverrides();
        // i18n
        if (Sp.utils.i18n.setup()){
            this.deferBuildInterface();
        } else {
            this.buildInterface();
        }
    },
    
    userOverrides: function(){
        // date format
        Ext.Date.defaultFormat = Data.me.data.date_format;
        Ext.override(Ext.form.field.Date, {
            format: Data.me.data.date_format,
            submitFormat: Sp.core.Globals.DATE_FORMAT,
            startDay: Data.me.data.week_start,
        }); 
        Ext.override(Ext.picker.Date, {
            format: Data.me.data.date_format,
            longDayFormat: Data.me.data.date_format,
            startDay: Data.me.data.week_start,
            ariaTitle: '{0}',
        });
        // time format
        var tf = Data.me.data.time_format;
        Ext.override(Ext.form.field.Time, {
            format: tf,
            submitFormat: Sp.core.Globals.TIME_FORMAT,
        });
        // extensible
        Ext.override(Extensible.calendar.view.AbstractCalendar, {
            startDay: Data.me.data.week_start,
        });
        Extensible.Date.use24HourTime = (tf == 'H:i' || tf == 'G:i');
    },
    
    deferBuildInterface: function(){
        if (Sp.utils.i18n.STRINGS){
            this.buildInterface();
        } else {
            Ext.defer(this.deferBuildInterface, 250, this); 
        }
    },
    
    i18nOverrides: function(){
        Ext.override(Extensible.calendar.view.AbstractCalendar, {
            ddCreateEventText: TR("New reservation for {0}"),
            ddCopyEventText: TR("Copy to {0}"),
            ddMoveEventText: TR("Move to {0}"),
            ddResizeEventText: TR("Update to {0}"),
        });
        Ext.override(Ext.view.AbstractView, {
            loadingText: TR("Loading"),
        });
    },
    
    buildInterface: function(dontReload){
        
        // late i18n overrides
        this.i18nOverrides();
        
        // destroy UI
        this.destroyInterface();
        
        // override validation messages
        Ext.data.validations.presenceMessage = TR("This field is required");
        Ext.data.validations.lengthMessage = TR("The data entered is too long");
        
        var menu_items = [
            {
                id: 'locations',
                label: TR("Dropzones"),
                icon: '/static/images/icons/parachute.png',
            },
            {
                id: 'reservations',
                label: "<span class='disabled-text'>" + TR("Reservations") + "</span>",
                icon: '/static/images/icons/calendar.png',
            },
            {
                id: 'lmanager',
                label: TR("Lift Manager"),
                icon: '/static/images/icons/plane.png',
                dz_operator_only: true,
            },
            /*{
                id: 'tmanager',
                label: "<span class='disabled-text'>" + TR("Tunnel Manager") + "</span>",
                icon: '/static/images/icons/fan.png',
                tn_operator_only: true,
            },*/
            {
                id: 'logbook',
                label: TR("Logbook"),
                icon: '/static/images/icons/book.png',
                consumer_only: true,
            },
            /*{
                id: 'teams',
                label: "<span class='disabled-text'>" + TR("Teams") + "</span>",
                icon: '/static/images/icons/group.png',
            },
            {
                id: 'events',
                label: "<span class='disabled-text'>" + TR("Events") + "</span>",
                icon: '/static/images/icons/date.png',
            },
            {
                id: 'competitions',
                label: "<span class='disabled-text'>" + TR("Competitions") + "</span>",
                icon: '/static/images/icons/medal.png',
            },*/
            {
                id: 'reports',
                label: TR("Reports"),
                icon: '/static/images/icons/report.png',
                operator_only: true,
            },
        ]
        
        // Main menu
        var main_menu = [];
        var isCm = this.isCm();
        var isOp = this.isOp();
        var isDzOp = this.isDzOp();
        var isTnOp = this.isTnOp();
        for (var i in menu_items){
            if ((menu_items[i].operator_only && !isOp) 
            || (menu_items[i].consumer_only && !isCm)
            || (menu_items[i].dz_operator_only && !isDzOp)
            || (menu_items[i].tn_operator_only && !isTnOp)){
                continue;
            }
            var menu_entry = {};
            menu_entry.id = menu_items[i].id;
            menu_entry.text = "<img src='" + menu_items[i].icon + "'> " + menu_items[i].label;
            menu_entry.leaf = true;
            main_menu.push(menu_entry);
        }
        
        // Main menu store
        var main_menu_store = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: main_menu, 
            }
        });
        
        // create main viewport
        this.vp = Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                {
                    region: 'north',
                    xtype: 'toolbar',
                    itemId: 'topToolbar',
                    ui: 'top-toolbar',
                    height: 41,
                    border: 0,
                    items: [
                    
                        { xtype: 'tbspacer', width: 10 },
                        
                        {
                            xtype: 'image',
                            width: 16,
                            height: 16,
                            src: '/static/images/sp_icon.png',
                        },
                        
                        {
                            xtype: 'label',
                            baseCls: 'logo-text',
                            padding: '0 0 0 6',
                            text: Sp.core.Globals.BRAND,
                        },
                        
                        { xtype: 'tbspacer', width: 60 },
                        
                        {
                            xtype: 'textfield',
                            width: 360,
                            emptyText: TR("Global Search..."),
                        },
                        {
                            xtype: 'button',
                            ui: 'top-toolbar',
                            iconCls: 'icon-search',
                            iconAlign: 'right',
                        },
                        
                        '->',
                        
                        {
                            xtype: 'button',
                            itemId: 'requestCounter',
                            ui: 'top-toolbar',
                            iconCls: 'icon-requests',
                            tooltip: TR("New requests"),
                            handler: function(bt){
                                var el = bt.getEl();
                                Ext.create('Sp.views.global.Requests').showAt(el.getX()-150, el.getY()+24);
                            },
                        },
                        { xtype: 'tbspacer', width: 5 },
                        {
                            xtype: 'button',
                            itemId: 'notificationCounter',
                            ui: 'top-toolbar',
                            iconCls: 'icon-notifications',
                            tooltip: TR("New notifications"),
                            handler: function(bt){
                                var el = bt.getEl();
                                Ext.create('Sp.views.global.Notifications').showAt(el.getX()-150, el.getY()+24);
                            },
                        },
                        
                        { xtype: 'tbspacer', width: 80 },
                        
                        {
                            text : Sp.ui.misc.getUserFullname(),
                            icon:'/static/images/icons/member.png',
                            itemId: 'topToolbarUserButton',
                            ui: 'top-toolbar',
                            arrowCls: 'top-toolbar-menu-arrow',
                            menu: [
                                {
                                    text: TR("Settings"), 
                                    icon:'/static/images/icons/preferences.png', 
                                    handler: function(){
                                        var module = Sp.app.showModule({id:'settings'});
                                        module.showModule({id: 'home'});
                                    },
                                },
                                '-',
                                {
                                    text: TR("Help Center"), 
                                    icon:'/static/images/icons/help.png',
                                    disabled: true,
                                },
                                {
                                    text: TR("What's This"), 
                                    icon:'/static/images/icons/whatsthis.png',
                                    activeCls: 'help-cursor',
                                    handler: function(){
                                        Sp.utils.help.startWhatsThis();
                                    },
                                    disabled: true,
                                },
                                '-',
                                {
                                    text: Ext.String.format(TR("About {0}"), Sp.core.Globals.BRAND), 
                                    icon:'/static/images/icons/about.png',
                                    handler: function(){
                                        Sp.ui.misc.showAbout();
                                    },
                                },
                                '-',
                                {
                                    text: TR("Lock Session"), 
                                    icon:'/static/images/icons/lock.png',
                                    handler: this.lock,
                                    scope: this,
                                },
                                {
                                    text: TR("Log Out"), 
                                    icon:'/static/images/icons/logout.png', 
                                    handler: function(){
                                        location.href = "/logout/";
                                    }
                                },
                            ],
                        },
                        { xtype: 'tbspacer', width: 26 },
                    ],
                },
                {
                    region: 'west',
                    xtype: 'panel',
                    itemId: 'mainMenuPanel',
                    ui: 'main-menu',
                    width: 160,
                    header: false,
                    split: true,
                    collapsible: true,
                    titleCollapse: true,
                    layout: {
                        type: 'vbox',
                        align: 'center',
                    },
                    items: [{
                        xtype: 'treepanel',
                        itemId: 'mainMenuTree',
                        cls: 'main-menu-tree',
                        store: main_menu_store,
                        rootVisible: false,
                        lines: false,
                        hideHeaders: true,
                        flex: 1,
                        listeners: {
                            itemclick: function(v, r){
                                this.showModule({id:r.data.id});
                                if (this.menu_never_clicked && this.vp.getWidth() <= 1024){
                                    this.vp.down('#mainMenuPanel').collapse();
                                }
                                this.menu_never_clicked = false;
                            },
                            itemcontextmenu: this.onMainMenuCtxMenu,
                            scope: this,
                        },
                    }],
                },
                {
                    region: 'center',
                    xtype: 'cardcontainer',
                    itemId: 'mainContainer',
                    modulesNs: 'Sp.views.#.MainPanel',
                },
            ]
        });
        
        if (!dontReload){
            this.appReady();            
        }
    },
    
    destroyInterface: function(){
        if (this.vp){
            Ext.destroy(this.vp);
        }
    },
    
    showModule: function(config){
        return this.vp.getComponent('mainContainer').showModule(config);
    },
    
    onMainMenuCtxMenu: function(tree, rec, el, idx, ev){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Reload"),
                    icon: '/static/images/icons/reload.png',
                    handler: function(){
                        var ctx = this.vp.getComponent('mainContainer');
                        var module = ctx.getComponent(rec.data.id);
                        if (module){
                            ctx.remove(module);
                        }
                        this.showModule({id:rec.data.id});
                    },
                    scope: this,
                }
            ],
        });
        // show context menu
        ev.preventDefault();
        menu.showAt(ev.getXY());
    },
    
    appReady: function() {
        Ext.TaskManager.start({
            run: this.loadAppData,
            scope: this,
            interval: 0,
            repeat: 1,
        });
    },
    
    loadAppData: function() {
        Ext.getBody().unmask();
        Comet.setReady(false);
        
        var country_name_field = Sp.utils.i18n.getCountryNameField();
        
        // load google maps api
        if (Sp.core.Globals.GOOGLE_MAPS_API_KEY !== null){
            var api_url = Ext.String.format(
                        "https://maps.googleapis.com/maps/api/js" + 
                        "?v=3.9&key={0}&sensor=false&libraries=drawing&language={1}&callback=Ext.emptyFn",
                        Sp.core.Globals.GOOGLE_MAPS_API_KEY, Data.me.data.lang);
            if (Data.me.data.country){
                var country = Data.me.getCountry();
                api_url += "&region=" + country.data.iso_code;
            }  
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = api_url;
            document.body.appendChild(script);    
        }
        
        // data loading
        this.storesLoader = new Sp.data.StoresLoader();
        
        // load my locations
        if (this.isOp()){
            
            Data.newRequests = Data.createStore('LocationMembership', {
                remoteFilter: true,
                filters: [
                    {
                        property: 'join_type',
                        value: 'R',
                    },
                    {
                        property: 'approved',
                        value: false,
                    },
                    
                ],
                remoteSort: true,
                sorters: [{
                    property: 'created',
                    direction: 'ASC'
                }],
            });
            this.storesLoader.add(Data.newRequests);
            
            Data.newInvites = Data.createStore('LocationMembership_R', {
                remoteFilter: true,
                filters: [
                    {
                        property: 'join_type',
                        value: 'I',
                    },
                    {
                        property: 'approved',
                        value: false,
                    },
                ],
                remoteSort: true,
                sorters: [{
                    property: 'created',
                    direction: 'ASC'
                }],
            });
            this.storesLoader.add(Data.newInvites);

            Data.reservations = Data.createStore('Reservation');
            this.storesLoader.add(Data.reservations);
            
            Data.locations = Data.createStore('Location');
            this.storesLoader.add(Data.locations);
        }
        
        // Worker Types
        Data.workerTypes = Data.createStore('WorkerType', {
            listeners: {
                load: function(me){
                    Data.translateStore(me, ['label','plural_label']);
                },
            },
        });
        this.storesLoader.add(Data.workerTypes);
        
        // Spoken langs
        Data.spokenLangs = Data.createStore('SpokenLang', {
            listeners: {
                load: function(me){
                    Data.translateStore(me, ['label']);                 
                },
            },
        });
        this.storesLoader.add(Data.spokenLangs);
        
        // countries list
        Data.countries = Data.createStore('Country', {
            remoteSort: true,
            sorters: [{
                property: country_name_field,
                direction: 'ASC'
            }],
            proxy: {
                extraParams: {
                    fields: ['iso_code', country_name_field],
                },              
            },
        });
        this.storesLoader.add(Data.countries);
        
        // currency list
        Data.currencies = Data.createStore('Currency', {
            remoteSort: true,
        });
        this.storesLoader.add(Data.currencies);
        
        // currency list
        Data.timezones = Data.createStore('Timezone', {
            remoteSort: true,
        });
        this.storesLoader.add(Data.timezones);
                
        // Area Types
        Data.areaTypes = Data.createStore('AreaType', {
            listeners: {
                load: function(me){
                    Data.translateStore(me, ['label']);                 
                },
            },
        });
        this.storesLoader.add(Data.areaTypes);
        
        // Main Catalog items
        Data.catalogItems = Data.createStore('CatalogItem', {
            remoteSort: false,
            sorters: [{
                property: 'name',
                direction: 'ASC'
            }],
        });
        this.storesLoader.add(Data.catalogItems);
        
        // Jump types
        Data.jumpTypes = Data.createStore('JumpType', {
            listeners: {
                load: function(me){
                    Data.translateStore(me, ['label']);                 
                },
            },
        });
        this.storesLoader.add(Data.jumpTypes);
        
        // memberships 
        Data.memberships = Data.createStore('LocationMembership_R');
        this.storesLoader.add(Data.memberships);
        
        // clearances
        Data.clearances = Data.createStore('Clearance_R');
        this.storesLoader.add(Data.clearances);
        
        // notifications
        Data.notifications = Data.createStore('Notification', {
            buffered: true,
            pageSize: 50,
            sorters: [
                {
                    property: 'created',
                    direction: 'DESC',
                },
            ],
        });
        this.storesLoader.add(Data.notifications);
        
        // load data
        this.storesLoader.load(Ext.bind(this.onAppDataLoaded, this));
        
    },
    
    onAppDataLoaded: function(){
        Data.calendarStores = {};
        Data.newRequestsList = Sp.ui.data.buildNewRequestsStore();
        this.updateRequestCounter();
        this.updateNotificationCounter();
        Data.newRequestsList.on('datachanged', this.updateRequestCounter, this);
        Data.notifications.on('datachanged', this.updateNotificationCounter, this);
        Comet.setReady(true);
        
        // collapse menu in small resolution
        /*if (this.vp.getWidth() <= 1024){
            this.vp.down('#mainMenuPanel').collapse();
        }*/
        
        Log("Ready");
    },
    
    updateRequestCounter: function(){
        var count = Data.newRequestsList.getCount();
        this.vp.down('#requestCounter').setText(Ext.String.format("<span class='semi-bold'>{0}</span>", count));
    },
    
    updateNotificationCounter: function(){
        var count = 0;
        Data.notifications.each(function(n){
            if (n.data['new']){
                count += 1;             
            }
        });
        this.vp.down('#notificationCounter').setText(Ext.String.format("<span class='semi-bold'>{0}</span>", count));
    },
    
    isCm: function(){
        return Data.me.data.is_consumer;
    },
    
    isOp: function(){
        return (Data.me.data.is_dz_operator || Data.me.data.is_tn_operator);
    },
    
    isDzOp: function(){
        return Data.me.data.is_dz_operator;
    },
    
    isTnOp: function(){
        return Data.me.data.is_tn_operator;
    },
    
    lock: function(){
        var w = Ext.create('Sp.ui.LockWindow');
        w.show();
    },
        
});
