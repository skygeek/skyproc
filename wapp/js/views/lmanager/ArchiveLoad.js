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

Ext.define('Sp.views.lmanager.ArchiveLoad', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        Ext.apply(this, {
            width: 400,
            height: 200,
            modal: true,
            resizable: false,
            title: TR("Archving confirmation"),
            icon: '/static/images/icons/archive.png',
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
                            text: Ext.String.format(TR("Confirm archiving operation of load n°{0} ?"), this.loadRec.data.number),
                            flex: 1,
                        },
                    ],
                },
                {
                    xtype: 'container',
                    margin: '0 10 10 10',
                    flex: 1,
                    layout: 'fit',
                    items: [
                        {
                            xtype: 'textarea',
                            itemId: 'note',
                            emptyText: TR("Enter here an optional private note about this load"),
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Archive"),
                    itemId: 'archiveBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.archive,
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
    
    
    
    archive: function(){
        this.down('#archiveBt').disable();
        this.down('#cancelBt').disable();
        this.body.mask(TR("Please wait"));
        Sp.utils.rpc('lmanager.archive_load', [this.loadRec.data.uuid, this.down('#note').getValue()], function(){
            if (this.loadRec.data.state == 'B'){
                this.cancelBoardingTimerUpdater(this.loadRec);
            }
            this.loadRec.store.remove(this.loadRec, true);
            this.resetActions(this.loadRec.data.location);
            delete this.slots_grids[this.loadRec.data.uuid];
            this.close();
        }, this);
    },
                
});
