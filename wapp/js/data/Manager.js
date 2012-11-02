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

Ext.define('Sp.data.Manager', {
    
    config: {
        modelsNs: 'Sp.data.models',
        modelsDef: null,
    },
    
    constructor: function(config){
        this.initConfig(config);
        // append a dot to models NS if any
        if (Ext.isString(this.config.modelsNs) && this.config.modelsNs.length > 0){
            this.setModelsNs(this.config.modelsNs + '.');
        }
        this.defined_models = {};
    },
    
    loadAllModels: function(){
        this.setModelsDef(Sp.utils.rpc('models.getAll'));
    },
    
    getModelName: function(modelName){
        return this.getModelsNs() + modelName;
    },
    
    getSpModelName: function(model){
        return model.modelName.replace(this.getModelsNs(), '');
    },
    
    getModelUrl: function(modelName){
        return Sp.app.getDataUrl() + modelName;
    },
        
    define: function(modelName, callback){
        if (!Ext.isString(modelName) || modelName.length == 0){
            logError('define(): you must specify a model name as a string');
            return;
        }
        
        // model name with NS
        var name = this.getModelName(modelName);
        
        // return if the model is already defined
        //if (Ext.ModelManager.getModel(name)){
        if (this.defined_models[name]){
            return true;
        }
        
        // get model definition via modelsDef object or an RPC call 
        if (this.modelsDef && this.modelsDef[modelName]){
            var modelDef = this.modelsDef[modelName];
        } else {
            var modelDef = Sp.utils.rpc('models.get', modelName);
        }
        if (!modelDef){
            logError("Model '" + modelName + "' not found");
            return;
        }
        
        // associations
        var associations = {
            belongsTo: [],
            hasMany: [],
            hasOne: [],
        }, models = [];
        for (var i = 0, m; m = modelDef.associations[i] ; i++){
            var association = {
                model: this.getModelName(m.model),
                primaryKey: 'uuid',
                foreignKey: m.fkey,
                associationKey: m.akey,
            };
            // set association names
            if (m.type == 'belongsTo' || m.type == 'hasOne'){
                association.getterName = 'get' + m.model;
                association.setterName = 'set' + m.model;
            } else if (m.type == 'hasMany'){
                association.name = Ext.util.Inflector.pluralize(m.model);
            }
            associations[m.type].push(association);
            models.push(m.model);
        }
            
        var model_config = {
            idProperty: 'uuid',
            fields: modelDef.fields,
            validations: modelDef.validations,
            belongsTo: associations.belongsTo,
            hasMany: associations.hasMany,
            hasOne: associations.hasOne,
            proxy: {
                type: 'spproxy',
                url: this.getModelUrl(modelName),
            },
        };
        if (Sp.app._mobile){
            var model_config = {
                extend: 'Ext.data.Model',
                config: model_config,
            };
            model_config.config.identifier = 'uuid';
        } else {
            model_config.extend = 'Ext.data.Model';
            model_config.idgen = 'uuid';
        }
        
        // define the model
        this.defined_models[name] = true;
        if (Ext.isFunction(callback)){
            Ext.define(name, model_config, callback);
            return;
        } else {
            Ext.define(name, model_config);
        }
        
        // define related models
        for (var i = 0,m ; m = models[i] ; i++){
            this.define(m);
        }
        
        return true;
    },
    
    defineAll: function(callback, scope){
        if (scope){
            callback = Ext.bind(callback, scope);
        }
        var models_count = Ext.Object.getSize(this.modelsDef);
        var models_defined = 0;
        for (var name in this.modelsDef){
            this.define(name, function(){
                models_defined++;
                if (models_defined == models_count){
                    callback();
                }
            });
        }
    },
    
    create: function(modelName, modelData){
        modelData = modelData || {};
        if (!this.define(modelName)){
            return;
        }
        var r = Ext.create(this.getModelName(modelName), modelData);
        r.setDirty();
        r.phantom = true;
        return r;
    },
    
    load: function(modelName, recordId, callback, scope){
        if (!this.define(modelName)){
            return;
        }
        if (Ext.isFunction(callback)){
            var opt = {
                success: function(r){
                    if (scope){
                        Ext.bind(callback, scope)(r);
                    } else {
                        callback(r);                        
                    }
                },
                failure: function(r, op){
                    logError("Failed to load " + modelName + "/" + recordId);
                    logError(op);
                },
            };
            var m = Ext.ModelManager.getModel(this.getModelName(modelName));
            m.load(recordId, opt);
        } else { // sync load: only for testing !
            var url = this.getModelUrl(modelName) + '/' + recordId;
            var ret = Sp.utils.request('GET', url);
            if (ret){
                return Ext.create(this.getModelName(modelName), Ext.decode(ret).data[0].fields);
            }
        }
    },
        
    createStore: function(modelName, storeConfig){
        if (!this.define(modelName)){
            return;
        }
        storeConfig = storeConfig || {};
        storeConfig.model = this.getModelName(modelName);
        if (!storeConfig.storeId){
            storeConfig.storeId = Sp.app.generateUuid();
        }
        if (storeConfig.pageSize && !storeConfig.proxy){
            storeConfig.proxy = {};
        }
        if (storeConfig.proxy){
            storeConfig.proxy.type = 'spproxy';
            storeConfig.proxy.url = this.getModelUrl(modelName);
            if (storeConfig.pageSize){
                storeConfig.proxy.limitParam = 'limit';
            }
        }
        return Ext.create('Ext.data.Store', storeConfig);
    },
    
    translateStore: function(store, fields){
        store.each(function(r){
            for (var i=0,f ; f = fields[i] ; i++){
                r.set(f, TR(r.get(f)));
            }
        });
    },
    
    getRawValues: function(records){
        var raw_values = [];
        for (var i=0,r ; r = records[i] ; i++){
            raw_values.push(Ext.clone(r.data));
        }
        return raw_values;
    },
    
    getCopies: function(records){
        var copies = [], c;
        for (var i=0,r ; r = records[i] ; i++){
            c = r.copy();
            c.setDirty();
            copies.push(c);
        }
        return copies;
    },
    
    htmlEncodeValues: function(values){
        Ext.Object.each(values, function(k,v,o){
            if (Ext.isString(v)){
                o[k] = Ext.String.htmlEncode(v);
            }
        });
        return values;
    },
    
    copy: function(record, values, model){
        values = values || {};
        if (!model) {
            model = record.modelName.replace(this.getModelsNs(), '');   
        }
        var copy = this.create(model);
        copy.copyFrom(record);
        copy.beginEdit();
        copy.setId(Sp.app.generateUuid());
        copy.set(values);
        copy.endEdit();
        copy.setDirty();
        copy.phantom = true;
        return copy;
    },
        
});
