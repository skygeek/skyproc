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

Ext.override(Ext.data.writer.Writer, {

    // write only the changes   
    writeAllFields: false,
    
    // use dateFormat to format dates
    getRecordData: function(record, operation) {
        var isPhantom = record.phantom === true,
            writeAll = this.writeAllFields || isPhantom,
            nameProperty = this.nameProperty,
            fields = record.fields,
            fieldItems = fields.items,
            data = {},
            clientIdProperty = record.clientIdProperty,
            changes,
            name,
            field,
            key,
            f, fLen;
            
        if (writeAll) {
            fLen = fieldItems.length;

            for (f = 0; f < fLen; f++) {
                field = fieldItems[f];

                if (field.persist) {
                    name       = field[nameProperty] || field.name;
                    data[name] = record.get(field.name);
                    // added 3 lignes
                    if (field.dateFormat && Ext.isDate(data[name])){
                        data[name] = Ext.Date.format(data[name], field.dateFormat);
                    }
                }
            }
        } else {
            // Only write the changes
            changes = record.getChanges();
            for (key in changes) {
                if (changes.hasOwnProperty(key)) {
                    field      = fields.get(key);
                    name       = field[nameProperty] || field.name;
                    data[name] = changes[key];
                    // added 3 lignes
                    if (field.dateFormat && Ext.isDate(data[name])){
                        data[name] = Ext.Date.format(data[name], field.dateFormat);
                    }
                }
            }
        }
        if(isPhantom) {
            if(clientIdProperty && operation && operation.records.length > 1) {
                // include clientId for phantom records, if multiple records are being written to the server in one operation.
                // The server can then return the clientId with each record so the operation can match the server records with the client records
                data[clientIdProperty] = record.internalId;
            }
        } else {
            // always include the id for non phantoms
            data[record.idProperty] = record.getId();
        }

        return data;
    }
    
});



// decode html chars in text fields
Ext.override(Ext.form.field.Text, {
    
    setValue: function(value) {
        if (Ext.isDefined(value) && Ext.isString(value)){
            arguments[0] = Ext.String.htmlDecode(value);
        }
        return this.callParent(arguments);
    },  
    
}); 


// decode html chars in htmleditor fields
Ext.override(Ext.form.field.HtmlEditor, {
    
    setValue: function(value) {
        if (Ext.isDefined(value) && Ext.isString(value)){
            arguments[0] = Ext.String.htmlDecode(value);
        }
        return this.callParent(arguments);
    },  
    
});

// html encode form values
Ext.override(Ext.form.Basic, {
    
    updateRecord: function(record) {
        var ret = this.callParent(arguments);
        record = record || this._record;
        record.setDirty();
        return ret;
    },
    
    getFieldValues: function(){
        return Data.htmlEncodeValues(this.callParent(arguments));
    },
    
});

// combobox: read uuid value from an object
Ext.override(Ext.form.field.ComboBox, {
    
    setValue: function() {
        var value = arguments[0];
        if (Ext.isObject(value) && Ext.isDefined(value.uuid)){
            arguments[0] = value.uuid;
        }
        return this.callParent(arguments);
    }
    
});

// return true instead of "on"
Ext.override(Ext.form.field.Checkbox, {
    inputValue: true,
});

// set fields msgTarget to 'side' by default
Ext.override(Ext.form.Panel, {
    fieldDefaults: {
        msgTarget: 'side',  
    },
});




Ext.override(Ext.view.AbstractView, {
    deferEmptyText: false,
    
    onAdd : function(ds, records, index) {
        // don't know why index is set to -1
        // this happend when dropping a slot at the top of the view
        if (index < 0){
            index = 0;
        }
        this.callParent([ds, records, index]);
    }
    
});

Ext.override(Ext.AbstractManager, {
    register: function(item) {
        this.callParent(arguments);
        Sp.utils.help.setupWhatsThis(item);
    },
});

Ext.override(Ext.window.Window, {
    addTools: function() {
        this.callParent();
        this.addTool({
            type: 'help',
            handler: Sp.utils.help.startWhatsThis,
            overCls: 'help-cursor',
        });
        
    },
});

//Ext.override(, {
//});


/*Ext.require('', function(){
    Ext.override(, {
    });
});*/
