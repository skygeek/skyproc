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

Ext.define('Sp.views.lmanager.Board', {
        
    constructor: function(config){
        Ext.apply(this, config);
        this.taskRunner = new Ext.util.TaskRunner();
        this.store = Data.createStore('Load');
        
        // options
        this.full_grids_count = this.locationRec.data.lboard_full_grids_count;
        this.compact_grids_count = this.locationRec.data.lboard_compact_grids_count;
        this.hide_title = this.locationRec.data.lboard_hide_title;
        this.hide_headers = this.locationRec.data.lboard_hide_headers;
        try {
        	this.scroll_interval = this.locationRec.data.lboard_auto_scroll_interval*1000;
        } catch (e){
        	this.scroll_interval = 5000;
        }
        this.scroll_offset = this.locationRec.data.lboard_auto_scroll_offset;
        this.theme = this.locationRec.data.lboard_theme;
        
        if (this.theme == 'black'){
        	this.ctx_css = 'lmanager-board-black-ctx';
        	this.grid_css = 'lmanager-board-black';
        	this.toolbar_css = 'lmanager-board-black-toolbar';
        	this.title_css = 'lmanager-board-black-title';
        	this.toolbar_text_css = 'lmanager-board-black-toolbar-text';
        	this.note_css = 'lmanager-board-black-note';
        }
    },
    
    onWindowResize: function(event){
    	this.ctx.setSize(event.target.innerWidth, event.target.innerHeight);
    },
    
    onWindowClose: function(event){
    	this.locationRec.Loads().un('datachanged', this.onLoadDataChange, this);
    	this.taskRunner.destroy();
    	Ext.destroy(this.ctx);
    	delete this.boards[this.locationRec.data.uuid];
    },
    
    show: function(){
    	if (this.win){
    		this.win.focus();
    		return;
    	}

    	// create window
		this.win = window.open('', this.locationRec.data.uuid+'-board', 
								"width=850,height=550,location=0,menubar=0,scrollbars=0,status=0,titlebar=0");
		this.win.document.body.innerHTML = '';
    	this.win.document.title = TR("Boarding Informations") + ' - ' + this.locationRec.data.name;
    	
    	// add css
    	var head = this.win.document.getElementsByTagName("head")[0];
    	Ext.each(window.document.getElementsByTagName('link'), function(l){
    		if (l.type == 'text/css' && l.rel == 'stylesheet'){
    			// replace scrollbars css
				var href = l.href;
				var href_parts = l.href.split('/');
				if (href_parts.pop() == 'webkit-scrollbars.css'){
					href_parts.push('webkit-board-scrollbars.css');
					href = href_parts.join('/');
				}
				// create element
				var e = this.win.document.createElement("link");
				e.setAttribute("rel", l.rel);
				e.setAttribute("type", l.type);
				e.setAttribute("href", href);
    			head.appendChild(e);
    		}
    	}, this);
    	
    	// events
    	this.win.onresize = Ext.bind(this.onWindowResize, this);
    	this.win.onbeforeunload = Ext.bind(this.onWindowClose, this);
    	this.locationRec.Loads().on('datachanged', this.onLoadDataChange, this);
    	
    	// create main container
    	this.ctx = Ext.create('widget.container', {
			renderTo: this.win.document.body,
			autoRender: true,
			autoShow: true,
			width: this.win.innerWidth > 0 ? this.win.innerWidth : undefined,
			height: this.win.innerHeight > 0 ? this.win.innerHeight : undefined,
			layout: {
				type: 'vbox',
				align: 'stretch',
			},
			cls: this.ctx_css,
			items: [
				Ext.create('widget.container', {
					autoRender: true,
					autoShow: true,
					layout: {
						type: 'hbox',
						pack: 'center',
					},
					padding: '10 0 20 0',
					items: [
						Ext.create('widget.label', {
							text: this.hide_title ? '' : TR("BOARDING PANEL"),
							cls: this.title_css,
							autoRender: true,
							autoShow: true,
						}),
					],
				}),
				Ext.create('widget.container', {
					itemId: 'gridCtx',
					autoRender: true,
					autoShow: true,
					flex: 1,
					padding: 10,
					layout: {
						type: 'hbox',
						align: 'stretch',
					},
				}),
			],
		});
		
		// add boarding loads
		this.locationRec.Loads().each(function(l){
			if (l.data.state == 'B'){
				this.store.add(l)
			}
		}, this);
		this.updateDisplay();
		
    },
    
    updateDisplay: function(){
    	if (this.full_grids_count == 0 && this.compact_grids_count == 0){
    		return;
    	}
    	var ctx = this.ctx.down('#gridCtx');
    	var full_grids = this.full_grids_count;
    	var compact_grids = this.compact_grids_count;
    	
    	// sort loads
    	this.store.sort({sorterFn: function(l1, l2){
    		if (Ext.isNumber(l1.data.timer) && Ext.isNumber(l2.data.timer)){
    			if (l1.data.timer > l2.data.timer){
    				return 1;
    			} else if (l1.data.timer < l2.data.timer){
    				return -1;
    			} else {
    				return l1.data.number > l2.data.number ? 1 : -1;
    			}
    		} else if (!Ext.isNumber(l1.data.timer) && !Ext.isNumber(l2.data.timer)){
    			return l1.data.number > l2.data.number ? 1 : -1;
    		} else {
    			return Ext.isNumber(l1.data.timer) ? -1 : 1;
    		}
    	}});
    	
    	// remove and recreate loads
    	ctx.removeAll();
    	this.store.each(function(load){
    		if (full_grids == 0 && compact_grids == 0){
    			return false;
    		}
    		if (full_grids > 0){
    			var full_grid = true;
    			full_grids -= 1;
    		} else {
    			var full_grid = false;
    			compact_grids -= 1;
    		}
    		
    		var slots_store = load.Slots();
    		slots_store.sort({sorterFn: Sp.lmanager.slotsSorter});
    		
    		// load text
    		var aircraft = this.locationRec.Aircrafts().getById(load.data.aircraft);
    		var tb_text = Ext.String.format("#{0} {1} - ",
    									load.data.number, aircraft.data.registration);
    		if (Ext.isNumber(load.data.timer)){
    			if (load.data.timer > 0){
    				if (full_grid){
    					tb_text += TR("Board in ") + Sp.lmanager.getTimerLabel(load.data.timer);
    				} else {
    					tb_text += Sp.lmanager.getTimerLabel(load.data.timer);
    				}
    			} else {
    				tb_text += TR("Boarding");
    			}
    		} else {
    			tb_text += TR("Boarding");
    		}
    		if (Ext.isString(load.data.note) && load.data.note.length > 0){
    			tb_text += Ext.String.format("<br><span class='{0}'>{1}</span>", this.note_css, load.data.note);
    		}
    		
    		ctx.add(Ext.create('widget.grid', {
    			cls: this.grid_css,
    			itemId: load.data.uuid,
    			store: slots_store,
    			autoRender: true,
				autoShow: true,
				flex: full_grid ? 2 : 1,
				margin: 5,
				disableSelection: true,
				enableColumnHide: false,
				enableColumnMove: false,
				enableColumnResize: false,
				sortableColumns: false,
				hideHeaders: this.hide_headers,
				scroll: 'vertical',
				viewConfig: {
				    getRowClass: function(rec){
				    	if (rec.data.uuid == load.data.jumpmaster_slot){
				    		return 'jump-master-slot';
				    	}
				    	if (!rec.data.person && !rec.data.phantom && !rec.data.worker){
				    		return 'hidden-el';
				    	}
				    	return '';
				    },
				},
				dockedItems: [
					Ext.create('widget.toolbar', {
						dock: 'top',
						cls: this.toolbar_css,
						items: [
							Ext.create('widget.label', {
								html: tb_text,
								cls: this.toolbar_text_css,
								autoRender: true,
								autoShow: true,
							}),
						],
					}),
				],
    			columns: [
    				{
    					header: TR("Exit"),
    					dataIndex: 'exit_order',
    					width: 60,
    					align: 'center',
    					hidden: !full_grid,
    				},
    				{
    					header: TR("Name"),
    					flex: 1,
    					renderer: function(v,o,r){
    						var label = '';
    						if (r.data.person){
    							label += Sp.ui.misc.formatFullname({data:r.data.person}, Data.me.data.name_order, true);
    						} else if (r.data.phantom){
    							label += r.data.phantom.name;
    						} else if (r.data.worker){
    							var w = this.locationRec.Workers().getById(r.data.worker);
    							label += w.data.name;
    						}
    						return label;
    					},
    					scope: this,
    				},
    				{
    					header: TR("Jump Program"),
    					flex: 1,
    					hidden: !full_grid,
    					renderer: function(v,o,r){
    						var label = [];
    						if (r.data.item && r.data.element){
								var item = this.locationRec.LocationCatalogItems().getById(r.data.item);
								var element = item.LocationCatalogElements().getById(r.data.element);
								label.push(Ext.String.format('{0}{1}', element.data.altitude, element.data.altitude_unit));
							}
							if (r.data.worker_type){
								label.push(Data.workerTypes.getById(r.data.worker_type).data.label);
    						} else if (r.data.jump_type){
    							label.push(Data.jumpTypes.getById(r.data.jump_type).data.label);
    						}
    						if (load.data.jumpmaster_slot == r.data.uuid){
    							label.push(TR("Jumpmaster"));
    						}
    						return label.join('&nbsp;-&nbsp;');
    					},
    					scope: this,
    				},
    			],
    			listeners: {
					afterlayout: this.afterGridLayout,
					scope: this,
				},
    		}));
    	}, this);
    },
    
    onLoadDataChange: function(store){
    	// FIXME: update instead of remove all/add -> this will cause a lot of screen flicker !
    	this.store.removeAll();
    	// loop over unfiltred data    	
    	(store.snapshot || store.data).each(function(l){
			if (l.data.state == 'B'){
				this.store.add(l)
			}
		}, this);
		this.updateDisplay();
    },
    
    afterGridLayout: function(grid){
    	if (Ext.isDefined(grid.scrollerTask)){
    		return;
    	}
    	grid.first_auto_scroll = true;
    	grid.last_scroll_pos = null;
		grid.scrollerTask = this.taskRunner.start({
			run: this.doGridAutoScroll,
			args: [grid],
			scope: this,
			interval: this.scroll_interval,
		});
    },
    
    doGridAutoScroll: function(grid){
    	// skip first call
    	if (grid.first_auto_scroll){
    		grid.first_auto_scroll = false;
    		return;
    	}
    	// scroll
    	var view = grid.getView();
    	view.scrollBy(0, this.scroll_offset, true);
    	
    	// loop
    	if (view.el.dom.scrollTop == grid.last_scroll_pos){
    		grid.last_scroll_pos = null;
    		view.scrollBy(0, -view.el.dom.scrollTop, true);
    	} else {
    		grid.last_scroll_pos = view.el.dom.scrollTop;
    	}
    	
    },
    
    
});
