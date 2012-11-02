
Ext.define("Sp.core.Main", {
    extend: 'Ext.tab.Panel',
    requires: [
        'Ext.TitleBar',
        'Ext.Video'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                title: TR("Dropzones"),
                iconCls: 'locate',
                scrollable: true,
                items: [],

            },
            {
                title: TR("Logbook"),
                iconCls: 'bookmarks',
                scrollable: true,
                items: [],

            },
            
            {
                title: TR("Settings"),
                iconCls: 'settings',
                scrollable: true,
                items: [
                ]
            }
        ]
    }
});
