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


Ext.define('Sp.views.logbook.EditJumpLog', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        if (this.jumpLog){
            var title = Ext.String.format(TR("Edit log entry for jump n° {0}"), this.jumpLog.data.number);
            this.create = false;
        } else {
            this.jumpLog = Data.create('JumpLog', {
                date: new Date(),
            });
            var title = TR("Add log entry");
            this.create = true;
        }
        
        Ext.apply(this, {
            width: 480,
            height: 360,
            modal: true,
            resizable: false,
            title: title,
            icon: '/static/images/icons/book_small.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    border: 0,
                    defaults: {
                        defaults: {
                            anchor: '100%',
                        },
                    },
                    items: [
                        {
                            xtype: 'fieldset',
                            items: [
                                {
                                    name: 'number',
                                    xtype: 'numberfield',
                                    fieldLabel: TR("Jump number"),
                                    emptyText: TR("Automatic"),
                                    minValue: 1,
                                    maxValue: 99999,
                                },
                                {
                                    name: 'date',
                                    xtype: 'datefield',
                                    fieldLabel: TR("Jump Date"),
                                    allowBlank: false,
                                },
                                {
                                    name: 'location_name',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Dropzone"),
                                },
                                {
                                    name: 'aircraft_type',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Aircraft"),
                                },
                                {
                                    name: 'altitude',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Altitude"),
                                },
                                {
                                    name: 'jump_type',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Jump Program"),
                                },
                                {
                                    name: 'note',
                                    xtype: 'textarea',
                                    fieldLabel: TR("Note"),
                                    rows: 5,
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: this.create ? TR("Add") : TR("Save"),
                    itemId: 'saveBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.save,
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
        this.down('#form').form.loadRecord(this.jumpLog);
    },
    
    save: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        this.body.mask(TR("Saving log entry"));
        this.down('#saveBt').disable();
        this.down('#cancelBt').disable();
        form.updateRecord();
        var fn = this.create ? 'archive.create_jump' : 'archive.edit_jump';
        var record = form.getRecord();
        var writer = new Ext.data.writer.Json();
        var jump_data = writer.getRecordData(record);
        Sp.utils.rpc(fn, [jump_data], function(jump_number){
            if (this.create){
                record.set('number', jump_number);
                this.store.add(record);
            }
            record.commit();
            this.close();
        }, this);
    },
        
});
