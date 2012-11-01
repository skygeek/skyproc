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


Ext.define('Sp.views.locations.Locator', {
    extend: 'Ext.container.Container',
    
    initComponent: function() {
        
        this.my_locations = [];
        if (Sp.app.isOp()){
            this.my_locations = Data.locations.getRange();
        }
        Data.memberships.each(function(m){
            this.my_locations.push(m.getLocation());
        }, this);
        
        var locator_store = Data.createStore('Location_P', {
            storeId: 'mainLocationsStore',
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                },
            ],
            remoteFilter: true,
            pageSize: 20,
        });
                                    
        Ext.apply(this, {
            layout: {
                type: 'border',
            },
            items: [
                {
                    region: 'north',
                    xtype: 'form',
                    itemId: 'form',
                    title: TR("Find a dropzone &nbsp;(click to expand the search form)"),
                    icon: '/static/images/icons/find.png',
                    collapsible: true,
                    collapseMode: 'header',
                    titleCollapse: true,
                    collapsed: this.my_locations.length > 0,
                    layout: {
                        type: 'hbox',
                    },
                    items: [
                        {
                            xtype: 'container',
                            width: 280,
                            margin: 5,
                            layout: 'form',
                            defaults: {
                                labelWidth: 65,
                                anchor: '100%',
                            },
                            items: [
                                Sp.ui.getCountryCombo('country', 'country', TR("Country"), 
                                    {select: Ext.bind(this.onCountrySelect, this)}),
                                Sp.ui.getCityCombo('city', 'city', TR("City"), {}, Data.me),
                            ],
                        },
                        {
                            xtype: 'container',
                            width: 330,
                            margin: 5,
                            layout: 'form',
                            defaults: {
                                labelWidth: 110,
                                anchor: '100%',
                                listeners: {
                                    specialkey: function(me, e){
                                        if (e.getKey() == e.ENTER){
                                            this.doSearch();
                                        }
                                    },
                                    scope: this,
                                },
                            },
                            margin: '5 5 5 15',
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'name',
                                    fieldLabel: TR("Dropzone name"),
                                    
                                },
                                {
                                    name: 'aircraft_name',
                                    xtype: 'textfield',
                                    fieldLabel: TR("Aircraft model"),
                                },
                            ],
                        },
                        {
                            xtype: 'container',
                            margin: 10,
                            flex: 1,
                            layout: {
                                type: 'hbox',
                                pack: 'end',
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    text: TR("Search"),
                                    icon: '/static/images/icons/search.png',
                                    margin: '0 4 0 0',
                                    handler: this.doSearch,
                                    scope: this, 
                                },
                                {
                                    xtype: 'button',
                                    text: TR("Clear fields"),
                                    icon: '/static/images/icons/clear_field.png',
                                    margin: '0 8 0 0',
                                    handler: function(){
                                        this.down('#form').form.reset();
                                        this.down('#grid').getStore().loadRawData(this.my_locations);
                                    },
                                    scope: this, 
                                },
                                {
                                    xtype: 'button',
                                    text: TR("More options"),
                                    icon: '/static/images/icons/more_options.png',
                                    disabled: true, 
                                },
                                
                            ],
                        },
                    ],
                },
                {
                    region: 'center',
                    xtype: 'grid',
                    itemId: 'grid',
                    margin: '12 0 0 0',
                    loadMask: true,
                    enableColumnHide: false,
                    enableColumnMove: false,
                    enableColumnResize: false,
                    sortableColumns: false,
                    emptyText: TR("No dropzone"),
                    store: locator_store,
                    columns: [
                        {
                            dataIndex: 'name',
                            header: TR("Dropzone, Location"),
                            flex: 1,
                            renderer: function(v,o,r){
                                var label = '';
                                var img = r.data.picture ? r.data.picture : '/static/images/nothing.png';
                                label += "<table class='location-table'><tr>";
                                label += Ext.String.format("<td><img width='60' height='60' src='{0}'/></td>", img);
                                label += "<td>";
                                label += "<span class='bold'>" + r.data.name + '</span>';
                                label += Sp.ui.misc.getCountryCity2(r);
                                label += "</td>";
                                label += "</tr></table>";
                                return label;
                            },
                        },
                        {
                            header: TR("Contact infos"),
                            flex: 1,
                            renderer: function(v,o,r){
                                var label = [];
                                if (r.data.website){
                                    label.push(Sp.utils.getWebsiteLink(r.data.website));
                                }
                                if (r.data.email){
                                    label.push(Sp.utils.getEmailLink(r.data.email));
                                }
                                if (r.data.phone){
                                    label.push(Ext.String.htmlEncode(r.data.phone));
                                }
                                return label.join('<br>');
                            },
                        },
                        {
                            header: TR("Active Aircrafts"),
                            align: 'center',
                            renderer: function(v,o,r){
                                var count = 0;
                                r.Aircrafts().each(function(a){
                                    if (a.data.available_fulltime){
                                        count++;
                                    }
                                });
                                return count;
                            },
                        },
                        {
                            header: TR("Total Slots"),
                            align: 'center',
                            renderer: function(v,o,r){
                                var slots = 0;
                                r.Aircrafts().each(function(a){
                                    if (a.data.available_fulltime){
                                        slots += a.data.max_slots;
                                    }
                                });
                                return slots;
                            },
                        },
                    ],
                    bbar: [
                        {
                            xtype: 'pagingtoolbar',
                            itemId: 'pgTb',
                            store: locator_store,
                            displayInfo: true
                        },
                    ],
                    listeners: {
                        itemmouseenter: Ext.bind(this.onLocationMouseEnter, this),
                        itemmouseleave: Ext.bind(this.onLocationMouseLeave, this),
                        itemclick: Ext.bind(this.onLocationClick, this),
                    },
                },
            ],
            
        });
 
        this.callParent(arguments);

        try {
            this.down('#pgTb #refresh').hide();
        } catch (e){}
        locator_store.loadRawData(this.my_locations);
        
        // events
        this.down('#country').on('specialkey', function(me, e){
            if (e.getKey() == e.ENTER){
                if (Sp.utils.isUuid(me.getValue())){
                    this.doSearch();
                }
            }
        }, this);
        this.down('#city').on('specialkey', function(me, e){
            if (e.getKey() == e.ENTER){
                if (Sp.utils.isUuid(me.getValue())){
                    this.doSearch();
                }
            }
        }, this);
    },
    
    onCountrySelect: function(cb, records){
        Sp.ui.countryChanged(records, this.down('#city'));
    },
    
    onLocationMouseEnter: function(me, r, el){
        var domEl = new Ext.dom.Element(el);
        domEl.setStyle('cursor', 'pointer');
    },
    
    onLocationMouseLeave: function(me, r, el){
        var domEl = new Ext.dom.Element(el);
        domEl.setStyle('cursor', 'default');
    },
    
    onLocationClick: function(me, r){
        this.showModuleFunction({
            id: r.data.uuid,
            moduleClass: 'Viewer',
            title: r.data.name,
            data: r,
        });
    },
    
    doSearch: function(){
        var store = this.down('#grid').getStore();
        var values = this.down('#form').form.getValues();
        var filters = [{property: 'public', value: true}];
        Ext.Object.each(values, function(k,v){
            if (!v){
                return;
            }
            if (k == 'name'){
                filters.push({property: 'name__icontains', value: v});
            } else if (k == 'country'){
                filters.push({property: k, value: v});
            } else if (k == 'city'){
                if (Sp.utils.isUuid(v)){
                    filters.push({property: k, value: v});
                } else {
                    filters.push({property: 'custom_city__icontains', value: v});
                }
            } else if (k == 'aircraft_name'){
                filters.push({property: 'aircraft__type__icontains', value: v});
            }
            
        });
        if (filters.length == 0){
            Sp.ui.misc.warnMsg(TR("Please provide a search term"), TR("Search error"));
            return;
        }
        
        store.removeAll(true);
        store.clearFilter(true);
        store.filter(filters);
    },
    
});
