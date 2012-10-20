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

Ext.define('Sp.ui.TimezoneCombo', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.timezonecombo',
    
    initComponent: function() {
        
        Ext.applyIf(this, {
            store: Data.timezones,
            queryMode: 'local',
            forceSelection: true,
            editable: true,
            typeAhead: true,
            valueField: 'uuid',
            lastQuery: '',
            emptyText: TR("Automatic"),
            tpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '<div class="x-boundlist-item">{name} ({utc_offset_label})</div>',
                '</tpl>'
            ),
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '{name} ({utc_offset_label})',
                '</tpl>'
           ),
        });
                
        this.callParent(arguments);
    },
     
});