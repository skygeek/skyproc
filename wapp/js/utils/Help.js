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

Ext.ns('Sp.utils.help');

Sp.utils.help.getElementCmp = function(element){
	var cmp = Ext.ComponentManager.get(element.id);
	if (cmp){
		return cmp;
	} else if (element.parentNode){
		return Sp.utils.help.getElementCmp(element.parentNode);
	}
}

Sp.utils.help.setupWhatsThis = function(item){
	if (item.el){
		// over event
		item.el.on('mouseover', function(e, el){
			if (!Sp.whatsThis){
				return;
			}
			// set help cursor
			var element = new Ext.dom.Element(el);
			var cmp = Sp.utils.help.getElementCmp(element.dom);
			if (cmp && cmp.whatsThis && !Sp.whatsThisTargets.hasOwnProperty(element.id)){
				var previous_cursor = element.getStyle('cursor');
				previous_cursor = previous_cursor == 'help' ? 'auto' : previous_cursor;
				Sp.whatsThisTargets[element.id] = {};
				Sp.whatsThisTargets[element.id].previous_cursor = previous_cursor;
				Sp.whatsThisTargets[element.id].whatsthis_text = cmp.whatsThis;
				element.setStyle('cursor','help');
			}
		});	
		// click event
		item.el.on('click', function(e, el){
			if (!Sp.whatsThis){
				return;
			}
			// display what's this help
			element = new Ext.dom.Element(el);
			if (Sp.whatsThisTargets.hasOwnProperty(element.id)){
				Sp.utils.help.showWhatsThis(Sp.whatsThisTargets[element.id].whatsthis_text);
			}
			// restore cursors
			Sp.utils.help.endWhatsThis();
		});
	}
}

Sp.utils.help.startWhatsThis = function(){
	Sp.utils.help.endWhatsThis();
	Sp.whatsThis = true;
}

Sp.utils.help.endWhatsThis = function(){
	Sp.whatsThis = false;
	var id, element;
	for (id in Sp.whatsThisTargets){
		element = Ext.dom.Element.get(id);
		if (element){
			element.setStyle('cursor', Sp.whatsThisTargets[id].previous_cursor);
		}
	}
	Sp.whatsThisTargets = {};
}

Sp.utils.help.showWhatsThis = function(text){
	Log(text)
}
