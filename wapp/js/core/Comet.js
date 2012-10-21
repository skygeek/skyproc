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


Ext.ns('Sp.core.comet');

Sp.core.comet.connect = function(){
    if (!Sp.app.getCometUrl()){
        return;
    }
    
    Sp.core.comet.socket = io.connect(Sp.app.getCometUrl(), {
        secure: Sp.core.Globals.COMET_SECURE,
        'connect timeout': 30000,
        'max reconnection attempts': 20,
    });
    
    Sp.core.comet.socket.on('connect', function() {
        Sp.core.comet.socket.send('sp:'+Ext.util.Cookies.get('sp_session'));
    });

    Sp.core.comet.socket.on('message', function(message) {
        Comet.processMessage(Ext.decode(message));
    });

    Sp.core.comet.socket.on('disconnect', function() {
      Log('socket.io disconnected.');
    });
    
    Sp.core.comet.socket.on('reconnect_failed', function() {
      logError('socket.io reconnect failed.');
    });

}
