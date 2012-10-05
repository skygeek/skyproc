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

Sp.utils.request = function(method, url, body, params, headers){
    params = params || {};
    headers = headers || {};
    if(method == 'POST' || method == 'PUT' || method == 'DELETE'){
        var csrf_token = Ext.util.Cookies.get('csrftoken');
        if (csrf_token){
            headers['X-CSRFToken'] = csrf_token;
        }
    }
    var xhr = Ext.Ajax.request({
        method: method,
        url: url,
        params: params,
        headers: headers,
        rawData: body,
        async: false,
        timeout: Sp.core.Globals.AJAX_REQUEST_TIMEOUT,
    });
    if (Ext.isDefined(xhr) && Ext.isDefined(xhr.status) && Ext.isDefined(xhr.responseText)){
        if (xhr.status == 200){
            return xhr.responseText;
        } else {
            logError("AJAX HTTP request error: " + xhr.status + ' ' + xhr.responseText + ' (' + url + ')');
        }
    } else {
        logError("AJAX request failed");
    }
}
