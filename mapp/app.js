var DEV = true;

if (DEV){
    Ext.Loader.setPath('Sp', '/static/js/mobile');
    Ext.syncRequire([
        'Ext.data.identifier.Uuid',
        'Ext.data.ModelManager',
        'Ext.util.Inflector',
        'Ext.data.association.BelongsTo',
        'Ext.data.association.HasOne',
        'Ext.data.association.HasMany',
        'Ext.data.proxy.Rest',
        
        'Sp.core.Globals',
        'Sp.utils.Misc',
        'Sp.utils.Help',
        'Sp.core.Overrides',
        'Sp.core.Comet',
        
        'Sp.utils.Request',    
        'Sp.utils.Rpc',
        'Sp.utils.i18n',
        
        'Sp.data.Proxy',
        'Sp.data.StoresLoader',
    ]);
}

Ext.application({
    name: 'Sp',

    requires: [
        'Ext.MessageBox'
    ],

    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },
    
    getBaseUrl: function(){
        return "/";
    },
    
    getDataUrl: function(){
        return "/data/";
    },
    
    getCometUrl: function(){
        return 'https://' + window.location.hostname + ':8080';
    },
    
    appOverrides: function(){
    },
    
    launch: function() {
        // keep a reference to the app
        Sp.app = this;
        Sp.app._mobile = true;
        
        // app overrides
        this.appOverrides();
        
        // setup server messaging channel
        Ext.ns('Comet');
        Comet = Ext.create('Sp.data.Comet');
        Sp.core.comet.connect();
        
        // load models def
        Sp.utils.rpc('models.getAll', [], this.onDataModelsLoad, this);
    },
    
    onDataModelsLoad: function(modelsDef){
        // additional data
        this.additional_data = Ext.clone(modelsDef.__additional_data__);
        delete modelsDef.__additional_data__;
        // Data manager
        Ext.ns('Data');
        Data = Ext.create('Sp.data.Manager', {modelsDef: modelsDef});
        Data.modelsDef = Data._modelsDef;
        Data.modelsNs = Data._modelsNs;
        Data.defineAll(this.onModelsLoad, this);
    },
    
    onModelsLoad: function(){
        Data.load('Person', this.getCookie('sp_id'), this.onMyProfileLoad, this);
    },
        
    onMyProfileLoad: function(myProfile){
        Data.me = myProfile;        
        // user overrides
        this.userOverrides();
        // i18n
        if (Sp.utils.i18n.setup()){
            this.deferBuildInterface();
        } else {
            this.buildInterface();
        }
    },
    
    userOverrides: function(){
    },
    
    deferBuildInterface: function(){
        if (Sp.utils.i18n.STRINGS){
            this.buildInterface();
        } else {
            Ext.defer(this.deferBuildInterface, 250, this); 
        }
    },
    
    i18nOverrides: function(){
    },
    
    buildInterface: function(){
        // late i18n overrides
        this.i18nOverrides();
        // Destroy the #appLoadingIndicator element
        Ext.fly('appLoadingIndicator').destroy();
        // Initialize the main view
        Ext.Viewport.add(Ext.create('Sp.core.Main'));
        Log("Ready");
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },
    
    getCookie: function(name){
        var arg = name + "=",
            alen = arg.length,
            clen = document.cookie.length,
            i = 0,
            j = 0;
            
        while(i < clen){
            j = i + alen;
            if(document.cookie.substring(i, j) == arg){
                return this.getCookieVal(j);
            }
            i = document.cookie.indexOf(" ", i) + 1;
            if(i === 0){
                break;
            }
        }
        return null; 
    },
    
    getCookieVal : function(offset){
        var endstr = document.cookie.indexOf(";", offset);
        if(endstr == -1){
            endstr = document.cookie.length;
        }
        return unescape(document.cookie.substring(offset, endstr));
    },
    
    getUsername: function(){
        var username = Ext.clone(this.getCookie('sp_user'));
        if (username[0] == '"' && username[username.length-1] == '"'){
            return username.slice(1, username.length-1);
        }
        return username;
    },
    
    getCsrfToken: function(){
        return this.getCookie('csrftoken');
    },
    
    generateUuid: function(){
        return Ext.data.identifier.Uuid.Global.generate();
    },
    

});
