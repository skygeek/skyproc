
Ext.define('Sp.views.tmanager.MainPanel', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
        
        Ext.apply(this, {
            layout: {
                type: 'vbox',
                align: 'center',
            },
            items: [
                {
                    xtype: 'image',
                    src: "/static/images/comingsoon.png",
                    width: 290,
                    maxWidth: 290,
                    height: 292,
                    maxHeight: 292,
                    margin: 50,
                },
            ],
            
        });
        this.callParent(arguments);
    },
    
});
