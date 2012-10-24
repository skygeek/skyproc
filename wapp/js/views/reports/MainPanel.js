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

Ext.define('Sp.views.reports.MainPanel', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        Ext.apply(this, {
            border: 0,
            layout: 'card',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                margin: '5 0 0 0',
                defaults: {
                    iconAlign: 'top',
                    scale: 'large',
                    width: 80,
                    margin: '0 12 0 0',
                    handler: function(me){
                        this.showModule(me.moduleClass);
                    },
                    scope: this,
                },
                items: [
                
                    {
                        text: TR("Dashboard"),
                        icon: '/static/images/icons/dashboard.png',
                        moduleClass: 'Dashboard',
                    },
                    {
                        text: TR("Loads"),
                        icon: '/static/images/icons/loads_log.png',
                        moduleClass: 'LoadsReport',
                    },
                    {
                        text: TR("Accounts"),
                        icon: '/static/images/icons/balances.png',
                        moduleClass: 'AccountsReport',
                    },
                    '->',
                    {
                        text: TR("Clear Data"),
                        icon: '/static/images/icons/purge.png',
                        moduleClass: 'ClearData',
                        margin: '0 7 0 0',
                    },
                ]
            }],
        });
        this.callParent(arguments);
    },
    
    showModule: function(module){
        if (module == 'ClearData'){
            Ext.create('Sp.views.reports.ClearData').show();
            return;
        }
        var m = this.down('#' + module);
        if (!m){
            m = Ext.create('Sp.views.reports.' + module, {
                itemId: module,
            });
            this.add(m);
        }
        this.getLayout().setActiveItem(m);
    },
    
});
