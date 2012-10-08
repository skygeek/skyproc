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


Ext.define('Sp.views.locations.MainPanel', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
        
        var create_button;
        if (Sp.app.isOp()){
            if (Sp.app.isDzOp() && Sp.app.isTnOp()){
                var create_button = {
                    xtype: 'splitbutton',
                    text : TR("Create"),
                    icon: '/static/images/icons/new_yellow.png',
                    margin: '0 10 0 20',
                    width: 90,
                    menu: new Ext.menu.Menu({
                        items: [
                            {
                                itemId: 'D',
                                text: TR("New Dropzone"), 
                                icon: '/static/images/icons/windsock.png', 
                                handler: Ext.bind(this.addLocation, this),
                            },
                            {
                                itemId: 'T',
                                text: TR("New Tunnel"), 
                                icon: '/static/images/icons/fan_small.png',
                                handler: Ext.bind(this.addLocation, this),
                                disabled: true,
                            },
                        ],
                    }),
                    handler: function(bt){
                        bt.showMenu();
                    },
                };
            } else if (Sp.app.isDzOp()){
                var create_button = {
                    xtype: 'button',
                    itemId: 'D',
                    text : TR("Create Dropzone"),
                    icon: '/static/images/icons/new_yellow.png',
                    margin: '0 10 0 20',
                    handler: this.addLocation,
                    scope: this,
                };
            } else if (Sp.app.isTnOp()){
                var create_button = {
                    xtype: 'button',
                    itemId: 'T',
                    text : TR("Create Tunnel"),
                    icon: '/static/images/icons/new_yellow.png',
                    margin: '0 10 0 20',
                    handler: this.addLocation,
                    scope: this,
                    disabled: true,
                };
            }
        }
        
        Ext.apply(this, {
            padding: Sp.core.Globals.MAIN_CTX_PADDING,
            layout: {
                type: 'border',
            },
            listeners: {
                render: function(me){
                    me.showModule({id:'Locator'});
                },
            },
            items: [
                {
                    region: 'north',
                    xtype: 'container',
                    itemId: 'northContainer',
                    layout: {
                        type: 'hbox',
                        align: 'middle',
                    },
                    margins: '0 0 15 0',
                    items: [
                        {
                            xtype: 'toolbar',
                            itemId: 'navigationTb',
                            padding: 5,
                            flex: 1,
                            items: [
                                {
                                    xtype: 'button',
                                    itemId: 'Locator',
                                    text: TR("Locator"),
                                    icon: '/static/images/icons/glyphicons/map_marker.png',
                                    handler: function(bt){
                                        this.showModule({id:'Locator'});
                                    },
                                    scope: this,
                                },
                            ],
                        },
                        create_button,
                    ],
                },
                {
                    region: 'center',
                    xtype: 'cardcontainer',
                    itemId: 'mainContainer',
                    modulesNs: 'Sp.views.locations.#',
                    getTbFunction: Ext.bind(this.getNavigationToolbar, this),
                },
            ],
            
        });
 
        this.callParent(arguments);
    },
    
    getNavigationToolbar: function(){
        return this.getComponent('northContainer').getComponent('navigationTb');
    },
    
    showModule: function(config){
        this.getComponent('mainContainer').showModule(config);
    },
    
    addLocation: function(bt){
        var w = Ext.create('Sp.views.locations.AddLocation', {
            locationType: bt.itemId,
            showModuleFunction: Ext.bind(this.showModule, this),
        });
        w.show();
    },

});
