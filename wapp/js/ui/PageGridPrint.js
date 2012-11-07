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

Ext.define('Sp.ui.PageGridPrint', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
        
        var store = this.grid.getStore();
        var multipages = store.getTotalCount() > store.pageSize;
        
        Ext.apply(this, {
            width: 410,
            height: 220,
            modal: true,
            resizable: false,
            closable: false,
            title: TR("Print Dialog"),
            icon: '/static/images/icons/printer.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    border: 0,
                    items: [
                        {
                            xtype: 'fieldset',
                            title: TR("Select page(s) to print"),
                            defaults: {
                                anchor: '100%',
                            },
                            items: [
                                {
                                    xtype: 'radio',
                                    boxLabel: TR("All pages"),
                                    name: 'print',
                                    inputValue: 'all', 
                                    checked: true,
                                },
                                {
                                    xtype: 'radio',
                                    boxLabel: TR("Current page"),
                                    name: 'print',
                                    inputValue: 'current',
                                    disabled: !multipages, 
                                },
                                {
                                    xtype: 'radio',
                                    boxLabel: TR("Pages"),
                                    name: 'print',
                                    inputValue: 'pages',
                                    disabled: !multipages,
                                    listeners: {
                                        change: function(me, checked){
                                            this.down('#pages').setDisabled(!checked);
                                        },
                                        scope: this,
                                    }, 
                                },
                                {
                                    xtype: 'textfield',
                                    name: 'pages',
                                    itemId: 'pages',
                                    emptyText: TR("Specify page numbers or pages range, ex: 2, 3, 5 or 1-5"),
                                    disabled: true,
                                    margin: '10 0 0 0',
                                },
                            ],
                        },
                    ],
                },
            ],
            buttons: [
                {
                    text: TR("Print"),
                    itemId: 'printBt',
                    icon: '/static/images/icons/printer.png',
                    handler: this.print,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    icon: '/static/images/icons/cancel.png',
                    handler: this.cancel,
                    scope: this,
                },
            ],
        });
 
        this.callParent(arguments);
        
        
    },
    
    createStores: function(){
        var store = this.grid.getStore();
        // create a copy of the data store
        this.store_copy = Data.createStore(Data.getSpModelName(store.model), {
            pageSize: store.pageSize,
            remoteSort: store.remoteSort,
            remoteFilter: store.remoteFilter,
            proxy: {
                extraParams: store.proxy.extraParams,
            },
            filters: store.filters ? store.filters.getRange() : undefined,
            sorters: store.sorters ? store.sorters.getRange() : undefined,
        });
        
        this.columns = [];
        this.print_columns = [];
        var print_fields = [];
        Ext.each(this.grid.columns, function(c){
            // only columns with a header
            if (c.hasOwnProperty('text')){
                this.columns.push({
                    id: c.id,
                    dataIndex: c.dataIndex,
                    renderer: c.renderer,
                    header: c.text,
                });
                this.print_columns.push({
                    header: c.text,
                    dataIndex: c.id,
                    width: Ext.isNumber(c.width) ? c.width : undefined,
                });
                print_fields.push(c.id);
            }
        }, this);
        // create print store
        this.print_store = Ext.create('store.store', {
                fields: print_fields,
        });
    },
    
    loadPage: function(){
        var page = this.pages[this.current_page];
        // load data
        this.body.mask(Ext.String.format(TR("Preparing page {0}  ({1} of {2})"), page, this.current_page+1, this.pages.length));
        this.store_copy.loadPage(page, {
            callback: function(recs, op){
                // get print data
                var print_rows = [];
                for (var i=0,r ; r=recs[i] ; i++){
                    var d = {};
                    for (var j=0,c ; c=this.columns[j] ; j++){
                        if (Ext.isFunction(c.renderer)){
                            var args = [];
                            if (c.dataIndex){
                                args.push(r.data[c.dataIndex]);
                            } else {
                                args.push(null);
                            }
                            args.push(null);
                            args.push(r);
                            d[c.id] = c.renderer.apply(this.gridScope, args);
                        } else if (c.dataIndex){
                            d[c.id] = r.data[c.dataIndex];
                        } else {
                            d[c.id] = '';
                        }
                    }
                    print_rows.push(d);
                }
                // append data to the print store
                this.print_store.add(print_rows);
                // get next page (if any)
                this.current_page++;
                this.loadData();
            },
            scope: this,
        });
    },
    
    loadData: function(){
        if (this.cancel_print){
            return;
        }
        if (this.current_page == this.pages.length){
            this.onDataLoaded();
        } else {
            this.loadPage();
        }
    },
    
    onDataLoaded: function(){
        // create print grid
        var grid = Ext.create('Ext.grid.Panel', {
            store: this.print_store,
            columns: this.print_columns,
        });
        // close print dialog
        this.close();
        // show bowser print dialog
        Ext.ux.grid.Printer.documentTitle = this.documentTitle;
        Ext.ux.grid.Printer.mainTitle = Ext.isDefined(this.mainTitle) ? this.mainTitle : '';
        Ext.ux.grid.Printer.print(grid);
    },
        
    print: function(){
        // ui busy
        this.down('#printBt').disable();
        this.createStores();
        // pages to print
        this.pages = [];
        this.current_page = 0;
        var values = this.down('#form').form.getValues();
        var store = this.grid.getStore();
        // print all pages
        if (values.print == 'all'){
            var pages = store.getTotalCount()/store.pageSize;
            var pages_int = parseInt(pages);
            if (pages_int !== pages){
                pages_int++;
            }
            for (var i=0 ; i<pages_int ; i++){
                this.pages.push(i+1);
            }
        } else if (values.print == 'current'){
            this.pages.push(store.currentPage);
        } else if (values.pages){
            values.pages = values.pages.trim();
            if (values.pages.indexOf('-') != -1){
                var pages = values.pages.split('-');
                var start = parseInt(pages[0]);
                var end = parseInt(pages[1]);
                if (start === NaN || end === NaN || start>end){
                    Sp.ui.misc.warnMsg(TR("Invalid page range specification"), TR("Format error"));
                    return;
                }
                for (var i=start ; i<end+1 ; i++){
                    this.pages.push(i);
                }
            } else {
                var pages = values.pages.split(',');
                for (var i=0,p ; p=pages[i] ; i++){
                    p = parseInt(p);
                    if (p === NaN){
                        Sp.ui.misc.warnMsg(TR("Invalid page range specification"), TR("Format error"));
                        return;
                    }
                    this.pages.push(p);
                }
            }
        }
        // load data
        this.loadData();
    },
    
    cancel: function(){
        this.cancel_print = true;
        this.close();
    },
        
});
