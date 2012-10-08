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

Ext.define('Sp.ui.SettingsForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.settingsform',
    
    constructor: function(config) {
        Ext.applyIf(config, {
            trackResetOnLoad: true,
        });
        this.callParent(arguments);
    },
    
    initComponent: function() {
        
        this.save_close = false;
        
        Ext.apply(this, {
            header: false,
            border: 0,
            autoScroll: true,
            margin: '15 0 0 6',
            defaults: {
                margin: '12 20 0 0',
            },
            
            buttons: [
                {
                    text: TR("Save"),
                    icon: '/static/images/icons/save.png',
                    formBind: true,
                    disabled: true,
                    handler: function() {
                        this.save();
                    },
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    icon: '/static/images/icons/cancel.png',
                    handler: function() {
                        this.quit();
                    },
                    scope: this,
                }
            ],
            
        });
        
        this.callParent(arguments);
        
    },
    
    saveRecord: function(callback){
        var record = this.form.getRecord();
        
        if (!this.form.isDirty()){
            this.save_close = true;
            this.quit();
            return;
        }
        
        // validation
        if (!Sp.ui.data.validateForm(this)){
            return;
        }
                
        // update form  
        this.form.updateRecord();
        
        // city field (if present)
        var city_field = this.down('#city');
        if (city_field){
            Sp.ui.saveCustomCity(record, city_field.getStore());
        }               
        
        // save record
        if (callback){
            record.save({callback: callback});
        } else {
            record.save();  
        }
        record.commit();
        
        return true;
        
    },
            
    save: function(dontSave, dontNotify, callback){
        
        // save record
        if (dontSave){
            var saved = true;
        } else {
            var saved = this.saveRecord(callback);
        }

        if (!saved){
            return;
        }
        
        // notify
        if (!dontNotify){
            Notify(TR("Saved"), this.title + ' ' + TR("updated"));  
        }
        
        // quit
        this.save_close = true;
        this.quit();
    },
    
    quit: function(){
        if (!this.save_close){
            this.form.getRecord().reject();
        }
        this.ownerCt.getLayout().prev();
        this.ownerCt.remove(this);
        Ext.destroy(this);
    },

});
