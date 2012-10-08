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

Ext.define('Sp.ui.BigButton', {
    extend: 'Ext.button.Button',
    alias: 'widget.bigbutton',
    
    initComponent: function() {
                        
        Ext.apply(this, {
            ui: 'big-button',
            scale: 'large',
            padding: '100 0 0 0',
            width: 150,
            height: 150,            
        });
 
        Sp.ui.BigButton.superclass.initComponent.apply(this, arguments);
    }

});
