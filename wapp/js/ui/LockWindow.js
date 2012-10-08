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

Ext.define('Sp.ui.LockWindow', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
                
        Ext.apply(this, {
            width: 380,
            height: 130,
            modal: true,
            resizable: false,
            closable: false,
            title: TR("Session Locked"),
            icon: '/static/images/icons/locked.png',
            layout: 'fit',
            
            items: [
                {
                    xtype: 'form',
                    items: [
                        {
                            xtype: 'textfield',
                            inputType: 'password',
                            emptyText: TR("Type your password to unlock"),
                            anchor: '100%',
                            margin: '20 10 0 10',
                        }
                    ],
                }
            ],
            
            buttons: [
                {
                    text: TR("Unlock"),
                    icon: '/static/images/icons/unlock.png',
                    handler: this.unlock,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
        
    },
        
    unlock: function(){
        this.close();   
    },
    
});
