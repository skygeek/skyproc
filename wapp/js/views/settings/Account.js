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

Ext.define('Sp.views.settings.Account', {
    extend: 'Sp.ui.SettingsForm',
        
    initComponent: function() {
    	
        Ext.apply(this, {
        	
        	items: [
        		{
        			xtype: 'label',
        			text: this.title,
        			cls: 'page-top-title',
        			
        		},
        		{
        			xtype:'fieldset',
        			title: TR("Email & Password"),
        			defaults: {
				        anchor: '100%'
				    },
        			items:[
					    {
					    	name: 'email',
					    	xtype: 'textfield',
					        fieldLabel: 'Email',
					        allowBlank: false,
					        readOnly: true,
					    },
					    {
					    	xtype: 'textfield',
					    	inputType: 'password',
					        fieldLabel: TR("Password"),
					        value: '############',
					    },
					    {
					    	xtype: 'textfield',
					    	inputType: 'password',
					        fieldLabel: TR("Confirmation"),
					        value: '############',
					    }
					    
		            ],
        		},
        		{
        			xtype:'fieldset',
        			title: Ext.String.format(TR("{0} user's profiles"), Sp.core.Globals.BRAND),
        			defaults: {
				        anchor: '100%'
				    },
        			items:[
        				{
        					name: 'is_consumer',
        					xtype: 'checkbox',
        					boxLabel: TR("I'm a fun skydiver"),
        				},
        				/*{
        					name: 'is_pro_jumper',
        					xtype: 'checkbox',
        					boxLabel: TR("I'm a professional skydiver"),
        				},*/
        				{
        					name: 'is_dz_operator',
        					xtype: 'checkbox',
        					boxLabel: TR("I'm operating a dropzone"),
        				},
        				/*{
        					name: 'is_tn_operator',
        					xtype: 'checkbox',
        					boxLabel: TR("I'm operating a wind tunnel"),
        				},*/
        			],
        		},
        	],
        	
        });
        
        this.callParent(arguments);
        
        // load form
        this.form.loadRecord(Data.me);
        
    },
    
    save: function(){
    	var profile_changed = (this.form.findField('is_consumer').getValue() != Sp.app.isCm() 
    							|| this.form.findField('is_dz_operator').getValue() != Sp.app.isDzOp() 
    							|| this.form.findField('is_tn_operator').getValue() != Sp.app.isTnOp());
    	if (profile_changed){
    		this.callParent([false, true]);
    		Ext.MessageBox.confirm(TR("Profile change"), 
				Ext.String.format(
					TR("To apply the profile change, {0} must be reinitialized.<br/>Do you want to reinitialise now ?"), 
					Sp.core.Globals.BRAND
				),
				function(btn){
					if (btn == 'yes'){
						Sp.app.buildInterface(true);
					}
				}
			);
    	} else {
    		this.callParent();
    	}
    },
    
});
