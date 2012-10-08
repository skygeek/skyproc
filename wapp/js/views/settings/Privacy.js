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

Ext.define('Sp.views.settings.Privacy', {
    extend: 'Ext.panel.Panel',
        
    initComponent: function() {
        
        Ext.apply(this, {
            
            header: false,
            border: 0,
            layout: {
                type: 'vbox',
                align: 'center',
            },
            items: [
                {
                    xtype: 'image',
                    src: "/static/images/comingsoon.png",
                    width: 290,
                    maxWidth: 290,
                    height: 292,
                    maxHeight: 292,
                    margin: 50,
                },
            ],
            buttons: [
                {
                    text: TR("Close"),
                    icon: '/static/images/icons/cancel.png',
                    handler: function() {
                        this.ownerCt.getLayout().prev();
                        this.ownerCt.remove(this);
                        Ext.destroy(this);
                    },
                    scope: this,
                }
            ],
            
        });
        
        this.callParent(arguments);        
    },
    
});
