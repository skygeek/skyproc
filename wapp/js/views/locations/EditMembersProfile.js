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


Ext.define('Sp.views.locations.EditMembersProfile', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
    	
        Ext.apply(this, {
        	width: 360,
        	height: 160,
        	modal: true,
        	//resizable: false,
        	title: TR("Set members profile"),
        	icon: '/static/images/icons/membership.png',
        	layout: 'fit',
            items: [
            	{
            		xtype: 'fieldset',
            		margin: 10,
            		defaults: {
            			anchor: '100%',
            		},
            		layout: 'form',
            		items: [
            			{
					    	itemId: 'profile',
							xtype: 'combobox',
							fieldLabel: TR("Profile"),
							labelWidth: 60,
							anchor: '100%',
							store: this.locationRec.MembershipProfiles(),
							queryMode: 'local',
							displayField: 'name',
							valueField: 'uuid',
							forceSelection: true,
							lastQuery: '',
							allowBlank: false,
							listeners: {
								afterrender: function(me){
									var default_profile = me.getStore().findRecord('default', true);
									if (default_profile){
										me.setValue(default_profile);
									}
								},
							},
						},
						{
							itemId: 'disable_overrides',
							xtype: 'checkbox',
							boxLabel: TR("Disable members overrides")
						},
            		],
            	}
            ],
            buttons: [
				{
					text: TR("Apply"),
					icon: '/static/images/icons/save.png',
					handler: this.setProfile,
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
    
    setProfile: function(){
    	var profile_uuid = this.down('#profile').getValue();
    	var disable_overrides = this.down('#disable_overrides').getValue();
    	if (!profile_uuid){
    		return;
    	}
    	for (var i=0,r ; r = this.members[i] ; i++){
    		r.beginEdit();
    		r.set('profile', profile_uuid);
    		if (disable_overrides){
    			r.set('override_profile', false);
    		}
    		r.endEdit();
    	}
    	this.close();
    },
    
});
