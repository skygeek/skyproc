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

Ext.ns('Sp.utils.i18n');

Sp.utils.i18n.includes = {
    fr: [
        '/static/extjs/locale/ext-lang-fr.js',
        '/static/extensible/src/locale/extensible-lang-fr.js',
        '/static/js/i18n/fr.js'
    ],
}

Sp.utils.i18n.STRINGS = undefined;

Ext.define('Sp.utils.i18n.Translator', {
    
    tr: function(string){
        var tr =  Sp.utils.i18n.STRINGS[string];
        if (tr){
            return tr;
        } else {
            if (Sp.core.Globals.DEBUG){
                Log(Ext.String.format('"{0}": "",', string));
            }
            return string;
        }
    },
        
    no_tr: function(string){
        return string;
    },

});

Sp.utils.i18n.setup = function(){
    var lang = Data.me.data.lang.toLowerCase();
    Sp.utils.i18n.TR = Ext.create('Sp.utils.i18n.Translator');
    TR = Sp.utils.i18n.TR.no_tr;
    if (Sp.utils.i18n.includes[lang]){
        for (var i=0,f ; f = Sp.utils.i18n.includes[lang][i] ; i++){
            var el = document.createElement("script");
            el.type = "text/javascript";
            el.src = f;
            document.getElementsByTagName("head")[0].appendChild(el);
        }
        TR = Sp.utils.i18n.TR.tr;
        return true;
    }
}

Sp.utils.i18n.getCountryNameField = function(){
    try {
        var lang = Data.me.data.lang;
    } catch(e) {
        var lang = 'EN';
    }
    lang = lang == 'FR' ? 'FR' : 'EN';
    return 'iso_name_' + lang;

}