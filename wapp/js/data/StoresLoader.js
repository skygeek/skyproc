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

Ext.define('Sp.data.StoresLoader', {
    
    constructor: function(stores){
        this.stores = stores || [];
        this.waitMsgBox = Ext.create('Ext.window.MessageBox', {
            maxHeight: 68,
            cls: 'stores-load-progress-bar',
        });
    },
    
    add: function(store){
        this.stores.push(store);
    },
    
    load: function(callback){
        this.waitMsgBox.show({
            progressText: Ext.String.format("<span class='spfont'>{0}</span>", TR("Loading Data, Please Wait...")),
            progress: true,
            closable: false,
        });
        this.callback = callback;
        this.current = 0;
        this.loadNext();    
    },
    
    loadNext: function(){
        if (this.current >= this.stores.length){
            Ext.defer(function(){
                this.waitMsgBox.close();
            }, 100, this);
            this.callback.apply();
            return;
        }
        var store = this.stores[this.current];
        store.load(Ext.bind(this.onStoreLoad, this));
        this.current++;
    },
    
    onStoreLoad: function(){
        this.waitMsgBox.updateProgress(this.current/this.stores.length);
        this.loadNext();
    },
    
});
