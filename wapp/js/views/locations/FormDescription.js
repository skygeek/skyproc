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


Ext.define('Sp.views.locations.FormDescription', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;     
        var picture = rec.data.picture || '/static/images/nothing.png';
        
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'fit',
            },
            items: [
                {
                    xtype: 'container',
                    padding: '10 10 5 10',
                    layout: {
                        type: 'vbox',
                        align: 'stretch',
                    },
                    overflowY: 'auto',
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                            margin: '0 0 10 0',
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch',
                            },
                            items: [
                                {
                                    xtype:'fieldset',
                                    border: 4,
                                    margin: '0 16 0 0',
                                    padding: '5 5 0 5',
                                    layout: {
                                        type: 'vbox',
                                        align: 'center',
                                    },
                                    items:[
                                        {
                                            xtype: 'image',
                                            itemId: 'picture',
                                            src: picture,
                                            width: 130,
                                            height: 130,
                                            margin: '5 10 15 10'
                                        },
                                        {
                                            xtype: 'fileuploadfield',
                                            buttonOnly: true,
                                            buttonText: TR("Change Picture..."),
                                            listeners: {
                                                render: Ext.bind(this.onFileUploadRender, this),
                                            },
                                        },
                                    ],
                                },
                                {
                                    xtype:'fieldset',
                                    title: TR("Short description"),
                                    flex: 1,
                                    layout: 'fit',
                                    items:[
                                        {
                                            name: 'short_description',
                                            xtype: 'textarea',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            xtype:'fieldset',
                            title: TR("Detailed description"),
                            layout: 'fit',
                            flex: 1,
                            minHeight: 160,
                            margin: '10 0 0 0',
                            items:[
                                {
                                    name: 'long_description',
                                    xtype: 'htmleditor',
                                    enableSourceEdit: false,
                                },
                            ],
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
        
        
        
    },
    
    onFileUploadRender: function(fileupload){
        fileupload.fileInputEl.dom.addEventListener('change', Ext.bind(this.onPictureChange, this), false);
    },
    
    onPictureChange: function(e){
        Sp.ui.misc.readPicture(e, Ext.bind(this.onPictureLoad, this));
    },
    
    onPictureLoad: function(e){
        // update display
        this.down('#picture').setSrc(e.target.result);
        // update record
        this.locationRec.beginEdit();
        this.locationRec.set('picture', e.target.result);
        this.locationRec.endEdit();
    },
            
});
