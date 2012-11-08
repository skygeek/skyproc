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


Ext.define('Sp.views.locations.AddLocation', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        var lt = this.locationType;
        this.locationRec = Data.create('Location', {type: lt});
        
        Ext.apply(this, {
            width: 450,
            height: 215,
            modal: true,
            title: (lt == 'T') ? TR("New Tunnel") : TR("New Dropzone"),
            icon: '/static/images/icons/new_yellow.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    border: 0,
                    items: [
                        {
                            xtype: 'fieldset',
                            margin: 10,
                            defaults: {
                                anchor: '100%'
                            },
                            items: [
                                {
                                    name: 'name',
                                    xtype: 'textfield',
                                    fieldLabel: (lt == 'T') ? TR("Tunnel name") : TR("Dropzone name"),
                                },
                                Sp.ui.getCountryCombo('country', 'country', TR("Country"), 
                                    {select: Ext.bind(this.onCountrySelect, this)}),
                                Sp.ui.getCityCombo('city', 'city', TR("City"), 
                                    {change: Ext.bind(this.onCityChange, this)}, 
                                    Data.me),
                                Sp.ui.getCustomCityField('custom_city', 'customCity'),
                                {
                                    name: 'load_demo_data',
                                    xtype: 'checkbox',
                                    boxLabel: TR("Load demonstration data"),
                                    margin: '15 0 0 0',
                                },
                            ],
                        },
                    ],
                },
                
            ],
            buttons: [
                {
                    text: TR("Create"),
                    itemId: 'createBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.createLocation,
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
        this.getComponent('form').form.loadRecord(this.locationRec);
    },
    
    onCountrySelect: function(cb, records){
        Sp.ui.countryChanged(records, this.down('#city'), this.down('#customCity'));
    },
    
    onCityChange: function(city_cb, value){
        if (!value){
            this.down('#customCity').setValue('');
        }
    },
    
    createLocation: function(){
        
        var form = this.getComponent('form');
        var record = form.form.getRecord();
        
        // validation
        if (!Sp.ui.data.validateForm(form)){
            return;
        }
        
        // ui busy
        this.down('#createBt').disable();
        this.down('#cancelBt').disable();
        this.body.mask(TR("Please wait"));
        
        // update record
        form.form.updateRecord();
        
        // custom city
        var city_store = this.down('#city').getStore();
        var is_custom_city = Sp.ui.saveCustomCity(record, city_store);
        
        // save location
        record.save({
            callback: function(rec, op){
                if (op.success){
                    Data.load('Location', record.data.uuid, function(locationRec){
                        Ext.data.StoreManager.lookup('mainLocationsStore').add(locationRec);
                        Sp.ui.misc.updateLifManagerLocations();
                        Data.locations.add(locationRec);
                        this.showModuleFunction({
                            id: locationRec.data.uuid,
                            moduleClass: 'Viewer',
                            title: locationRec.data.name,
                            data: locationRec,
                        });
                        this.close();
                    }, this);
                }
            },
            scope: this,
        });
    },
    
});
