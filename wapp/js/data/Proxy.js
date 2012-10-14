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

Ext.define('Sp.data.Proxy', {
    extend: 'Ext.data.proxy.Rest',
    alias : 'proxy.spproxy',
    
    constructor: function(config){
        Ext.applyIf(config, {
            reader: {
                root: 'data',
            },
            timeout: Sp.core.Globals.AJAX_REQUEST_TIMEOUT,
            headers: {
                'X-CSRFToken': Ext.util.Cookies.get('csrftoken'),
            },
            limitParam: undefined,
            listeners: {
                exception: Sp.ui.misc.reportProxyException,
            },
        });        
        this.callParent(arguments);
    },
    
});
