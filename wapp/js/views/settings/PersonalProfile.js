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

Ext.define('Sp.views.settings.PersonalProfile', {
    extend: 'Sp.ui.SettingsForm',
        
    initComponent: function() {
        
        // pp
        if (Data.me.data.gender){
            var gender = Data.me.data.gender.toLowerCase(); 
        } else {
            var gender = 'm';
        }
        var profile_picture = '/static/images/no_profile_pic_' + gender + '.png';
        if (Data.me.data.profile_picture){
            profile_picture = Data.me.data.profile_picture;
        }
        
        // ensure all countries will be visible
        Data.countries.clearFilter();
        
        Ext.apply(this, {
            
            items: [
                {
                    xtype: 'label',
                    text: this.title,
                    cls: 'page-top-title',
                    
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
                                    src: profile_picture,
                                    width: 140,
                                    height: 140,
                                    margin: '0 0 10 0'
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
                            title: TR("Personal informations"),
                            defaults: {
                                anchor: '100%'
                            },
                            flex: 1,
                            items:[
                                {
                                    name: 'first_name',
                                    xtype: 'textfield',
                                    fieldLabel: TR("First Name"),
                                    allowBlank: false
                                },{
                                    name: 'last_name',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Last Name"),
                                    allowBlank: false
                                },
                                {
                                    name: 'name_order',
                                    xtype: 'combobox',
                                    fieldLabel: TR("Display as"),
                                    store: Ext.create('Ext.data.Store', {
                                        fields: ['order', 'value'],
                                        data : [
                                            {
                                                order:"FL", 
                                                value: Ext.String.htmlDecode(Data.me.data.first_name) 
                                                + ' ' + Ext.String.htmlDecode(Data.me.data.last_name)
                                            },
                                            {
                                                order:"LF", 
                                                value: Ext.String.htmlDecode(Data.me.data.last_name) 
                                                + ' ' + Ext.String.htmlDecode(Data.me.data.first_name)
                                            },
                                        ]
                                    }),
                                    queryMode: 'local',
                                    editable: false,
                                    displayField: 'value',
                                    valueField: 'order',
                                },
                                {
                                    name: 'birthday',
                                    xtype: 'datefield',
                                    fieldLabel: TR("Birthday"),
                                    maxValue: new Date(),
                                    minValue: new Date(new Date().getFullYear()-150+'-1-1'),
                                    editable: false,
                                },
                                {
                                    xtype: 'radiogroup',
                                    fieldLabel: TR("Gender"),
                                    anchor: '40%',
                                    items: [
                                        {
                                            boxLabel: TR("Male"), 
                                            name: 'gender', 
                                            inputValue: 'M',
                                        },
                                        {
                                            boxLabel: TR("Female"),
                                            name: 'gender',
                                            inputValue: 'F',
                                        },
                                    ]
                                },
                            ],
                        },
                    ],
                },
                {
                    xtype:'fieldset',
                    title: TR("Contact informations"),
                    defaults: {
                        anchor: '100%'
                    },
                    items:[
                        {
                            name: 'phone',
                            xtype: 'textfield',
                            fieldLabel: TR("Phone"),
                        },
                        {
                            name: 'postal_address',
                            xtype: 'textarea',
                            fieldLabel: TR("Address"),
                            rows: 3,
                        },
                        Sp.ui.getCountryCombo('country', 'country', TR("Country"), 
                            {select: Ext.bind(this.onCountrySelect, this)}),
                        Sp.ui.getCityCombo('city', 'city', TR("City"), 
                            {change: Ext.bind(this.onCityChange, this)}, 
                            Data.me),
                        Sp.ui.getCustomCityField('custom_city', 'customCity'),
                    ],
                },
            ],
            
        });
        
        this.callParent(arguments);
        
        // load form
        this.form.loadRecord(Data.me);
                
        // city display
        Sp.ui.displayCity(this.down('#city'), Data.me);
        
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
        Data.me.beginEdit();
        Data.me.set('profile_picture', e.target.result);
        Data.me.endEdit();
    },
    
    onCountrySelect: function(cb, records){
        Sp.ui.countryChanged(records, this.down('#city'), this.down('#customCity'));
    },
    
    onCityChange: function(city_cb, value){
        if (!value){
            this.down('#customCity').setValue('');
        }
    },
        
    save: function(){
        this.callParent([false, false, Ext.bind(this.onSave, this)]);
    },
    
    onSave: function(){
        // refresh name
        Sp.app.vp.down('#topToolbarUserButton').setText(Sp.ui.misc.getUserFullname());
        
        // refresh country
        if (Data.me.data.country){
            var country = Data.me.getCountry();
            if (Sp.utils.isUuid(Data.me.data.country) && Data.me.data.country != country.data.uuid){
                country.copyFrom(Data.countries.getById(Data.me.data.country));
            }   
        }
        // refresh city
        if (Data.me.data.city){
            var city = Data.me.getCity();
            if (Sp.utils.isUuid(Data.me.data.city) && Data.me.data.city != city.data.uuid){
                city.copyFrom(this.down('#city').getStore().getById(Data.me.data.city));
            }   
        }
    },
    
});
