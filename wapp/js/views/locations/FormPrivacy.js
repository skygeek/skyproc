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
                        
                        
                        
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
    },
    
});
