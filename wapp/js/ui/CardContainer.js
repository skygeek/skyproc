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

Ext.define('Sp.ui.CardContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.cardcontainer',
    
    initComponent: function() {
        Ext.apply(this, {
            layout: 'card',
        });
        Sp.ui.CardContainer.superclass.initComponent.apply(this, arguments);
        
        if (Ext.isFunction(this.getTbFunction)){
            this.on('add', this.moduleAdded, this);
            this.on('remove', this.moduleRemoved, this);
            this.on('afterlayout', this.viewChanged, this);         
        }
        
    },
    
    showModule: function(config){
        var module = this.getComponent(config.id);
        if (!module){
            var klass = (Ext.isString(config.moduleClass)) ? config.moduleClass : config.id;
            klass = this.modulesNs.replace('#', klass); 
            module = Ext.create(klass, {
                itemId: config.id, 
                title:config.title, 
                moduleData: config.data,
                showModuleFunction: Ext.bind(this.showModule, this),
                getTbFunction: this.getTbFunction,
            });
            this.add(module);
        }
        this.getLayout().setActiveItem(module);
        return module;
    },
        
    moduleAdded: function(me, module){
        if (!module.title || !module.itemId){
            return;
        }
        var tb = this.getTbFunction();
        tb.add([
            {
                xtype: 'tbseparator',
                itemId: module.itemId + 'Separator',
            },
            {
                xtype: 'button',
                itemId: module.itemId, 
                text: module.title,
                handler: function(bt){
                    this.showModule({id:bt.itemId});                
                },
                scope: this,
            },
        ]);
        
    },
    
    moduleRemoved: function(me, module){
        var tb = this.getTbFunction();
        if (!module.itemId || !tb.getComponent(module.itemId)){
            return;
        }
        tb.remove(module.itemId);
        tb.remove(module.itemId + 'Separator');
    },
    
    viewChanged: function(me, layout){
        var tb = this.getTbFunction();
        var active = layout.getActiveItem();
        if (!active){
            active = {itemId:null};
        }
        tb.cascade(function(i){
            if (i.xtype == 'button'){
                i.setDisabled(i.itemId == active.itemId);
            }
        });     
    },

});
