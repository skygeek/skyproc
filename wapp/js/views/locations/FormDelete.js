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


Ext.define('Sp.views.locations.FormDelete', {
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
            		xtype: 'fieldset',
            		margin: '20 20 20 20',
            		padding: 20,
            		border: 3,
            		layout: {
            			type: 'vbox',
            			align: 'center',
            		},
            		items: [
            			{
            				xtype: 'button',
            				text: Ext.String.format(TR("Permanently Delete {0} from {1}"), rec.data.name, Sp.core.Globals.BRAND),
            				icon: '/static/images/icons/trash.png',
            				height: 25,
            				handler: function(){
            					Ext.MessageBox.confirm(
            						TR("Delete Confirmation"),
            						Ext.String.format(
            							TR("Are you really sure you want to delete {0} from {1} ?"), 
            							rec.data.name, Sp.core.Globals.BRAND),
            						this.deleteLocation, this
            					)            					
            				},
            				scope: this, 
            			},
            		],
            	},
            ], 
			
        });
 
 		this.callParent(arguments);
 		
    },
    
    deleteLocation: function(btn){
    	if (btn == 'no'){
    		return;
    	}

    	// delete from user's location store
    	Data.locations.remove(Data.locations.getById(this.locationRec.data.uuid));
    	
    	// delete from display store
    	var store = Ext.data.StoreManager.lookup('mainLocationsStore');
    	store.remove(store.getById(this.locationRec.data.uuid));
    	
    	// delete location record
    	this.locationRec.destroy();
    	
    	// close location view
    	this.ownerCt.ownerCt.ownerCt.close();
    	
    },

});
