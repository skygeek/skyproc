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


Ext.define('Sp.views.locations.FormPrivacy', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        this.currenciesGridRendered = false;
        
        var rec = this.locationRec;
                
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'anchor',
            },
            items: [
                {
                    xtype: 'container',
                    itemId: 'ctx',
                    padding: '10 10 5 10',
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Dropzone visibility"),
                            margin: '10 0 0 0',
                            items: [
                                {
                                    name: 'public',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Show this dropzone in the public search"),
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Club members options"),
                            margin: '10 0 0 0',
                            items: [
                                {
                                    name: 'use_clearances',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Enforce the clearance system"),
                                },
                                {
                                    name: 'enable_self_manifesting',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Enable members self-manifesting"),
                                },
                                {
                                    name: 'share_account_data',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Share accounts data with members"),
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Password protection"),
                            margin: '10 0 0 0',
                            items: [
                                {
                                    name: 'pwd_protect_manage',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Protect the manage zone with password"),
                                },
                            ],
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
    },
    
});
