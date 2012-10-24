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

Ext.define('Sp.views.reports.ClearData', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 360,
            height: 210,
            modal: true,
            resizable: false,
            title: TR("Clear loads data"),
            icon: '/static/images/icons/trash.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    border: 0,
                    items: [
                        {
                            xtype: 'fieldset',
                            items: [
                                {
                                    name: 'period',
                                    xtype: 'radiofield',
                                    boxLabel: TR("Clear all loads"),
                                    inputValue: 'all',
                                    checked: true,
                                },
                                {
                                    name: 'period',
                                    xtype: 'radiofield',
                                    boxLabel: TR("Clear loads for a specific period"),
                                    inputValue: 'subset',
                                    listeners: {
                                        change: function(me, val){
                                            this.down('#startDate').setDisabled(!val);
                                            this.down('#endDate').setDisabled(!val);
                                        },
                                        scope: this,
                                    },
                                },
                                {
                                    name: 'startDate',
                                    itemId: 'startDate',
                                    xtype: 'datefield',
                                    fieldLabel: TR("From"),
                                    labelWidth: 40,
                                    anchor: '100%',
                                    margin: '10 0 2 0',
                                    disabled: true,
                                },
                                {
                                    name: 'endDate',
                                    itemId: 'endDate',
                                    xtype: 'datefield',
                                    fieldLabel: TR("To"),
                                    labelWidth: 40,
                                    anchor: '100%',
                                    disabled: true,
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Clear"),
                    itemId: 'clearBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.clearData,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    itemId: 'cancelBt',
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
    },
    
    
    
    clearData: function(){
        var startDate_field = this.down('#startDate');
        var endDate_field = this.down('#endDate');
        var startDate = startDate_field.getValue();
        var endDate = endDate_field.getValue();
        var values = this.down('#form').form.getValues();
        if ((startDate && !startDate_field.validate()) || (endDate && !endDate_field.validate())){
            return;
        }
        if (values.period == 'subset' && !startDate && !endDate){
            startDate_field.markInvalid(TR("Please specify a date"));
            return;
        }
        Ext.MessageBox.confirm(
            TR("Confirmation"),
            Ext.String.format(TR("Confirm data deletion ?")),
            function(btn){
                if (btn == 'yes'){
                    this.down('#clearBt').disable();
                    this.down('#cancelBt').disable();
                    this.body.mask(TR("Deleting data"));
                    Sp.utils.rpc('archive.delete_loads', [values], function(){
                        this.close();
                    }, this);
                }
            },
            this
        );
    },
                
});
