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

Ext.ns('Rpc');

Sp.utils.rpc = function(){
    var config = {
        rpcBaseUrl: 'rpc/',
    };
    
    // if no arguments, return an error
    if (arguments.length == 0){
        logError("Sp.utils.rpc() cannot be called without arguments");
        return;
    }
    
    // single argument, can be :
    // - a string representing the function name
    // - a config object
    if (arguments.length == 1){
        if (Ext.isString(arguments[0])){
            config.functionName = arguments[0];
            config.functionArgs = {};
            config.async = false;
        } else if (Ext.isObject(arguments[0])){
            Ext.apply(config, arguments[0]);
        } else {
            logError("Sp.utils.rpc(): invalid first argument: " + arguments[0]);
            return;
        }
    }
    
    // Two arguments,
    // first: function name
    // sencond: function argument(s) or callback
    if (arguments.length == 2){
        if (!Ext.isString(arguments[0])){
            logError("Sp.utils.rpc(): invalid first argument: " + arguments[0]);
            return;
        }
        config.functionName = arguments[0];
        if (Ext.isFunction(arguments[1])){
            config.callback = arguments[1];
            config.async = true;
        } else {
            config.functionArgs = arguments[1];
            config.async = false;
        }
    }
    
    // Three (or four) arguments,
    // first: function name
    // sencond: function arguments
    // third: callback or config object
    // Fourth (optional): callback scope
    if (arguments.length == 3 || arguments.length == 4){
        if (!Ext.isString(arguments[0])){
            logError("Sp.utils.rpc(): invalid first argument: " + arguments[0]);
            return;
        }
        config.functionName = arguments[0];
        config.functionArgs = arguments[1];
        if (Ext.isFunction(arguments[2])){
            config.callback = arguments[2];
            config.async = true;
            if (arguments.length == 4){
	        	config.scope = arguments[3];
	        }
        } else if (Ext.isObject(arguments[2])){
            Ext.apply(config, arguments[2]);
        } else {
            logError("Sp.utils.rpc(): invalid third argument: " + arguments[2]);
            return;
        }
    }
    
    // validate config functionName
    if (!Ext.isString(config.functionName)){
        logError("Sp.utils.rpc(): invalid function name: " + config.functionName);
        return;
    }
    
    // validate config functionArgs
    if (!config.functionArgs){
        config.functionArgs = {};
    }
    try {
        config.functionArgs = Ext.encode(config.functionArgs);
    } catch(e){
        logError("Sp.utils.rpc(): Cannot encode arguments [" + config.functionArgs + "]: " + e);
        return;
    }
    
    // validate config async
    if (!Ext.isBoolean(config.async)){
        config.async = Ext.isFunction(config.callback);
    }
    
    // rpc url
    var url = Sp.app.baseUrl + config.rpcBaseUrl + config.functionName.replace(/\./g,'/');
    
    // Do the request
    if (config.async){ // asynch request
        if (!Ext.isFunction(config.callback)){
            config.callback = Ext.emptyFn;
        }
        var headers = {};
        var csrf_token = Ext.util.Cookies.get('csrftoken');
        if (csrf_token){
            headers['X-CSRFToken'] = csrf_token;
        }
        Ext.Ajax.request({
            url: url,
            params: config.functionArgs,
            headers: headers,
            timeout: Sp.core.Globals.AJAX_REQUEST_TIMEOUT,
            success: function(response, opts) {
                try {
                    var rpc_response = Ext.decode(response.responseText);
                } catch(e){
                    logError("Sp.utils.rpc(): Cannot decode server response: " + e);
                    return;
                }
                if (config.scope){
                	Ext.bind(config.callback, config.scope)(rpc_response);
                } else {
                	config.callback(rpc_response);
                }
            },
            scope: config.scope,
            failure: function(response, opts) {
                logError("Sp.utils.rpc(): " + url +" HTTP Error " + response.status + " (" + response.responseText + ")");
            }
        });
    } else { // synch request
        var ret = Sp.utils.request('POST', url, config.functionArgs);
        if (ret){
            try {
                return Ext.decode(ret);
            } catch(e){
                logError("Sp.utils.rpc(): Cannot decode server response: " + e);
            }
        }
    }
    
}
Rpc = Sp.utils.rpc;