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

Ext.define('Sp.ui.HelpHtmlDisplay', {
    extend: 'Ext.form.field.HtmlEditor',
    alias: 'widget.helphtmldisplay',
    
    initComponent: function() {
        Ext.apply(this, {
            readOnly: true,
            enableFont: false,
        });
        this.callParent(arguments);
    },
    
    createToolbar: function(){
        this.toolbar = Ext.widget('toolbar', {
            id: this.id + '-toolbar',
            cls: 'hidden-el',            
        });
    },
});

Ext.define('Sp.ui.Help', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        this.cache = {};
        
        Ext.apply(this, {
            width: 780,
            height: 580,
            bodyPadding: 6,
            maximizable: true,
            disableWhatsThis: true,
            title: TR("Help Center"),
            icon: '/static/images/icons/help.png',
            layout: {
                type: 'hbox',
                align: 'stretch',
            },
            items: [
                {
                    xtype: 'grid',
                    itemId: 'chapters',
                    width: 160,
                    margin: '0 4 0 0',
                    store: Ext.create('store.store', {
                        fields: ['id','label','icon'],
                        data: [
                            {id:'intro', label: TR("Introduction"), icon: 'book2.png'},
                            {id:'dz', label: TR("Dropzones"), icon: 'location.png'},
                            {id:'members', label: TR("Members"), icon: 'members.png'},
                            {id:'profiles', label: TR("Profiles"), icon: 'profile.png'},
                            {id:'catalogs', label: TR("Catalogs"), icon: 'cart.png'},
                            {id:'aircrafts', label: TR("Aircrafts"), icon: 'plane_small.png'},
                            {id:'staff', label: TR("Staff"), icon: 'staff.png'},
                            {id:'lmanager', label: TR("Lift Manager"), icon: 'process.png'},
                            {id:'clearance', label: TR("Clearances"), icon: 'clearance.png'},
                            {id:'logbook', label: TR("Logbook"), icon: 'log.png'},
                            {id:'reports', label: TR("Reports"), icon: 'report_small.png'},
                        ],
                    }),
                    hideHeaders: true,
                    rowLines: false,
                    viewConfig: {
                        getRowClass: function(){
                            return 'pointer-cursor';
                        },
                    },
                    columns: [
                        {
                            width: 22,
                            renderer: function(v,o,r){
                                return Ext.String.format("<img src='/static/images/icons/{0}'/>", r.data.icon);
                            },
                        },
                        {
                            dataIndex: 'label',
                            flex: 1,
                        },
                    ],
                    listeners: {
                        itemclick: function(me, rec){
                            this.showChapter(rec.data.id);
                        },
                        scope: this,
                    },
                },
                {
                    xtype: 'helphtmldisplay',
                    itemId: 'chapterText',
                    flex: 1,                            
                },
            ],
            buttons: [
                {
                    text: TR("Close"),
                    icon: '/static/images/icons/close.png',
                    handler: this.close,
                    scope: this,
                },
            ],
            listeners: {
                resize: function(){
                    this.down('#chapterText').updateLayout();
                },
                scope: this,
            },
        });
 
        this.callParent(arguments);
    },
    
    
    
    showChapter: function(chapter){
        var chapterText = this.down('#chapterText');
        if (this.cache[chapter]){
            chapterText.setValue(this.cache[chapter]);
            chapterText.unmask();
            return;
        }
        chapterText.mask(TR("Loading"));
        var lang_url = Ext.String.format("{0}static/help/{1}/{2}.html", Sp.app.getBaseUrl(), Data.me.data.lang.toLowerCase(), chapter);
        var en_url = Ext.String.format("{0}static/help/en/{1}.html", Sp.app.getBaseUrl(), chapter);
        Ext.Ajax.request({
            url: lang_url,
            success: function(response){
                this.chapterLoaded(chapter, response.responseText);
            },
            failure: function(response){
                if (lang_url == en_url){
                    this.chapterNotFound(chapter);
                } else {
                    Ext.Ajax.request({
                        url: en_url,
                        success: function(response){
                            this.chapterLoaded(chapter, response.responseText);
                        },
                        failure: function(response){
                            this.chapterNotFound(chapter);
                        },
                        scope: this,
                    });
                }
            },
            scope: this,
        });
    },
    
    chapterLoaded: function(chapter, text){
        this.cache[chapter] = text;
        this.showChapter(chapter);
    },
    
    chapterNotFound: function(chapter){
        var r = this.down('#chapters').getStore().findRecord('id', chapter);
        this.cache[chapter] = '<h4>' + Ext.String.format(TR("'{0}' chapter is not yet written..."), r.data.label) + '</h4>';
        this.showChapter(chapter);
    },
    
});

