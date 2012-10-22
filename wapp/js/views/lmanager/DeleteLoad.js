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

Ext.define('Sp.views.lmanager.DeleteLoad', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 400,
            height: 210,
            modal: true,
            resizable: false,
            title: TR("Deleting confirmation"),
            icon: '/static/images/icons/trash.png',
            layout: {
                type: 'vbox',
                align: 'stretch',
            },
            items: [
                {
                    xtype: 'container',
                    margin: '10 0 10 15',
                    layout: {
                        type: 'hbox',
                        align: 'middle',
                    },
                    items: [
                        {
                            xtype: 'image',
                            width: 32,
                            height: 32,
                            src: '/static/images/icons/icon-question.gif',
                            margin: '5 10 0 0',
                        },
                        {
                            xtype: 'label',
                            text: Ext.String.format(TR("Confirm deleting operation of load n°{0} ?"), this.loadRec.data.number),
                            flex: 1,
                        },
                    ],
                },
                {
                    xtype: 'form',
                    itemId: 'form',
                    margin: '0 10 0 10',
                    border: 0,
                    flex: 1,
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'fieldset',
                            padding: '5 0 0 10',
                            items: [
                                {
                                    xtype: 'checkbox',
                                    name: 'delLoad',
                                    boxLabel: TR("Delete report log"),
                                },
                                {
                                    xtype: 'checkbox',
                                    name: 'delLogbook',
                                    boxLabel: TR("Delete logbook logs"),
                                },
                                {
                                    xtype: 'checkbox',
                                    name: 'noBalance',
                                    boxLabel: TR("Do not update accounts"),
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/ban.png',
                    handler: this.deleteLoad,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
    },
    
    
    
    deleteLoad: function(){
        if (this.loadRec.data.state == 'B'){
            this.cancelBoardingTimerUpdater(this.loadRec);
        }
        Sp.utils.rpc('lmanager.delete_load', [this.loadRec.data.uuid, this.down('#form').form.getValues()]);
        this.loadRec.store.remove(this.loadRec, true);
        this.close();
    },
                
});
