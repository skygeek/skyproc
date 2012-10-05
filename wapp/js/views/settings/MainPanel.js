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

Ext.define('Sp.views.settings.MainPanel', {
    extend: 'Ext.container.Container',
    
    getMainItems: function(){
    	return [
	    	{
	    		id: 'PersonalProfile',
	    		label: TR("Personal Profile"),
	    		iconCls: 'icon-setting-personal-profile',
	    	},
	    	{
	    		id: 'Account',
	    		label: TR("Account & Password"),
	    		iconCls: 'icon-setting-account-profile',
	    	},
	    	{
	    		id: 'l10n',
	    		label: TR("Language & Units"),
	    		iconCls: 'icon-setting-l10n',
	    	},
	    	{
	    		id: 'JumperProfile',
	    		label: TR("Jumper Profile"),
	    		iconCls: 'icon-setting-jumper-profile',
	    		consumer_only: true,
	    	},
	    	{
	    		id: 'JumperGear',
	    		label: TR("Personal Gear"),
	    		iconCls: 'icon-setting-jumper-gear',
	    		consumer_only: true,
	    	},
	    	{
	    		id: 'Privacy',
	    		label: TR("Privacy"),
	    		iconCls: 'icon-setting-privacy',
	    		consumer_only: true,
	    	},
	    	{
	    		id: 'Catalog',
	    		label: TR("Main Catalog"),
	    		iconCls: 'icon-setting-catalog',
	    		operator_only: true,
	    	},
	    	{
	    		id: 'Regulation',
	    		label: TR("Regulation Rules"),
	    		iconCls: 'icon-setting-regulation',
	    		operator_only: true,
	    	},
    	];
    },
    
    initComponent: function() {
    	
    	var main_items = [];
    	var isCm = Sp.app.isCm();
    	var isOp = Sp.app.isOp();
    	var isDzOp = Sp.app.isDzOp();
    	var isTnOp = Sp.app.isTnOp();
    	var mainItems = this.getMainItems();
    	for (var i in mainItems){
    		if ((mainItems[i].operator_only && !isOp) 
    		|| (mainItems[i].consumer_only && !isCm)
    		|| (mainItems[i].tz_operator_only && !isDzOp)
    		|| (mainItems[i].tn_operator_only && !isTnOp)){
    			continue;
    		}
    		var setting_item = {};
    		setting_item.xtype = 'bigbutton';
    		setting_item.itemId = mainItems[i].id;
    		setting_item.text = mainItems[i].label;
    		setting_item.cls = mainItems[i].iconCls;
    		setting_item.handler = function(bt){
    			this.showModule({id:bt.itemId, title:bt.getText()});
    		};
    		setting_item.scope = this;
    		main_items.push(setting_item);
    	}
    	
        Ext.apply(this, {
        	padding: Sp.core.Globals.MAIN_CTX_PADDING,
        	layout: {
		    	type: 'border',
		    },
            items: [
            	{
		    		region: 'north',
		    		xtype: 'toolbar',
		    		itemId: 'navigationTb',
		    		padding: 5,
		    		items: [
		    			{
		    				xtype: 'button',
		    				itemId: 'home',
		    				text: TR("Home"),
		    				icon: '/static/images/icons/glyphicons/home.png',
		    				handler: function(bt){
		    					this.showModule({id:'home', title:bt.getText()});		    					
		    				},
		    				scope: this,
		    			},
		    		],
		    	},
		    	{
		    		region: 'center',
		    		xtype: 'cardcontainer',
		    		itemId: 'mainContainer',
		    		modulesNs: 'Sp.views.settings.#',
		    		getTbFunction: Ext.bind(this.getNavigationToolbar, this),
		    		items: [
		    			{
				    		xtype: 'container',
				    		itemId: 'home',
				    		cls: 'settings-items-container',
				    		layout: {
				    			type: 'table',
				    			columns: 5,
				    		},
				    		autoScroll: true,
				    		padding: '12 0 0 0',
				    		items: main_items,
				    	},
		    		],
		    	},
		    ],
			
        });
 
        Sp.views.settings.MainPanel.superclass.initComponent.apply(this, arguments);
    },
    
    getNavigationToolbar: function(){
    	return this.getComponent('navigationTb');
    },
    
    showModule: function(config){
    	this.getComponent('mainContainer').showModule(config);
    },

});
