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


Ext.define('Sp.views.locations.FormGeneral', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;
                
        Ext.apply(this, {
            header: false,
            layout: {
                type: 'anchor',
            },
            items: [
                {
                    xtype: 'container',
                    itemId: 'ctx',
                    padding: '10 10 5 10',
                    items: [
                        {
                            xtype: 'label',
                            text: this.title,
                            cls: 'page-top-title',
                        },
                        {
                            xtype: 'fieldset',
                            itemId: 'fs',
                            title: TR("Contact infos"),
                            defaults: {
                                anchor: '100%'
                            },
                            margin: '10 0 0 0',
                            items: [
                                {
                                    name: 'name',
                                    xtype: 'textfield',
                                    fieldLabel: (rec.data.type == 'T') ? TR("Tunnel name") : TR("Dropzone name"),
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
                                {
                                    name: 'phone',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Phone"),
                                },
                                {
                                    name: 'email',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Email"),
                                },
                                {
                                    name: 'website',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Website"),
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Airport"),
                            defaults: {
                                anchor: '100%'
                            },
                            margin: '5 0 0 0',
                            hidden: (rec.data.type == 'T'),
                            items: [
                                {
                                    name: 'airport_name',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Airport name"),
                                },
                                {
                                    name: 'airport_icao',
                                    xtype: 'textfield',
                                    fieldLabel: TR("ICAO code"),
                                },
                            ],
                        },
                        {
                            xtype: 'fieldset',
                            title: TR("Local time"),
                            defaults: {
                                anchor: '100%'
                            },
                            margin: '5 0 0 0',
                            items: [
                                {
                                    name: 'timezone',
                                    xtype: 'timezonecombo',
                                    fieldLabel: TR("Time zone"),
                                },
                            ],
                        },
                    ],
                },
            ], 
        });

        this.callParent(arguments);
    },
    
    initValues: function(){
        // country display
        if (this.locationRec.data.country){
            var country = this.locationRec.getCountry();
            this.down('#country').setValue(country.data.uuid);
        }
        
        // city display
        Sp.ui.displayCity(this.down('#city'), this.locationRec);
    },
    
    onCountrySelect: function(cb, records){
        Sp.ui.countryChanged(records, this.down('#city'), this.down('#customCity'));
    },
    
    onCityChange: function(city_cb, value){
        if (!value){
            this.down('#customCity').setValue('');
        }
    },
    
    pre_save: function(){
        // country
        if (Sp.utils.isUuid(this.locationRec.data.country)){
            this.locationRec.getCountry().copyFrom(Data.countries.getById(this.locationRec.data.country));
        }
        // custom city
        var city_store = this.down('#city').getStore();
        var is_custom_city = Sp.ui.saveCustomCity(this.locationRec, city_store);
        // listed city
        if (is_custom_city !== true){
            if (Sp.utils.isUuid(this.locationRec.data.city)){
                this.locationRec.getCity().copyFrom(city_store.getById(this.locationRec.data.city));
            }                       
        }
    },
    
});
