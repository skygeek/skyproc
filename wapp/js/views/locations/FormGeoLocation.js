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


Ext.define('Sp.views.locations.FormGeoLocation', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
    	
    	var rec = this.locationRec;
    	if (rec.data.country){
    		var country = rec.getCountry();
    	} else {
    		var country = null;
    	} 
    	if (rec.data.city){
    		var city = rec.getCity();
    	} else {
    		var city = null;
    	}
    	    	
    	
    	    	
    	// world center :)
    	
    	/*
    	var map_center = new google.maps.LatLng(37.0625, -95.677068);
    	var map_zoom = 2;
    	
    	if (city){
    		var map_center = new google.maps.LatLng(parseFloat(city.data.latitude), parseFloat(city.data.longitude));
    		var map_zoom = 12;
    	}
    	
    	// save the map origin
    	this.map_center = map_center;
    	this.map_zoom = map_zoom;
    	*/
    	
    	
    	// markers
    	var markers = [];
    	this.locationRec.MapMarkers().each(function(r){
    		markers.push({
    			draggable: true,
    			title: r.data.name,
    			lat: parseFloat(r.data.latitude),
    			lng: parseFloat(r.data.longitude),
    			uuid: r.data.uuid,
    		});
    	});
    	
    	
        Ext.apply(this, {
        	header: false,
        	layout: {
		    	type: 'fit',
		    },
            items: [
            	{
            		xtype: 'container',
            		itemId: 'ctx',
            		padding: '10 10 5 10',
            		layout: {
				    	type: 'vbox',
				    	align: 'stretch',
				    },
            		items: [
            			{
		        			xtype: 'label',
		        			text: this.title,
		        			cls: 'page-top-title',
		        		},
		        		/*{
		                    xtype: 'gmappanel',
		                    itemId: 'map',
		                    flex: 1,
		                    margins: '10 0 5 0',
		                    mapOptions: {
		                    	zoom: map_zoom,
		                    },
		                    center: map_center,
		                    listeners: {
						    	mapRender: Ext.bind(this.onMapRender, this),
						    	markerRender: Ext.bind(this.onMarkerRender, this),
						    },
						    markers: markers,
		                    tbar: [
		                    	' ',
								{
									xtype: 'button', 
									icon: '/static/images/icons/center.png',
									tooltip: TR("Center"),
									handler: function(){
										var map = this.query('#ctx #map')[0];
										map.createMap(this.map_center);
									},
									scope: this,
								},
								'-',
								' ',
								{
									xtype: 'textfield',
									itemId: 'searchText',
									width: 450, 
									emptyText: TR("Search for places"),
									enableKeyEvents: true,
									listeners: {
										keypress: Ext.bind(function(me, e){
											if (e.getKey() == 13){
												this.doSearch();
											}
										}, this),
									},
								},
								{
						            xtype: 'button',
						            icon: '/static/images/icons/search.png',
						            tooltip: TR("Search"),
						            handler: this.doSearch,
						            scope: this,
						        },
								
							],
		                },*/
            		],
            	},
            ], 
			
        });
 
 		this.callParent(arguments);
    },
    
    getMap: function(){
    	return this.query('#ctx #map')[0];
    },
    
    onMapRender: function(gmap){
    	
    	// initialize drawing mgr
    	this.drawingManager = new google.maps.drawing.DrawingManager({
    		map: gmap,
			drawingMode: null,
		 	drawingControl: true,
		  	drawingControlOptions: {
		    	position: google.maps.ControlPosition.TOP_CENTER,
		    	drawingModes: [
		    		google.maps.drawing.OverlayType.MARKER,
		    		google.maps.drawing.OverlayType.POLYLINE,
		    		google.maps.drawing.OverlayType.CIRCLE,
		    		google.maps.drawing.OverlayType.RECTANGLE, 
		    		google.maps.drawing.OverlayType.POLYGON, 
		    	],
		 	},
		 	markerOptions: {
		 		draggable: true,
		 	},
		 	polylineOptions: {
		 		editable: true,
		 	},
		 	circleOptions: {
		 		editable: true,
		 	},
		 	rectangleOptions: {
		 		editable: true,
		 	},
		  	polygonOptions: {
		    	editable: true,
		  	},
		});
    	
    	// drawing events
    	google.maps.event.addListener(this.drawingManager, 'markercomplete',
    									Ext.bind(this.onMarkerComplete, this));
    },
    
    doSearch: function(){
    	var map = this.getMap();
    	var tb = map.getDockedItems('toolbar[dock="top"]')[0];
    	var search_text = tb.getComponent('searchText').getValue();
    	map.lookupCode(search_text);
    },
    
    // MARKER //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    
    addMarkerListeners: function(marker){
    	google.maps.event.addListener(marker, 'dblclick',
    									Ext.bind(this.onMarkerDblClicked, this, [marker], true));
    	google.maps.event.addListener(marker, 'dragend',
    									Ext.bind(this.onMarkerMoved, this, [marker], true));
    },
    
    onMarkerRender: function(marker){
    	this.addMarkerListeners(marker);
    },
    
    onMarkerComplete: function(marker){
    	// connect events
    	this.addMarkerListeners(marker);
    	// show options panel
    	var p = Ext.create('Sp.views.locations.EditMapMarker', {
    		locationRec: this.locationRec,
    		marker: marker,
    	});
    	p.show(this.body.dom);
    },
    
    onMarkerMoved: function(e, marker){
    	var r = this.locationRec.MapMarkers().getById(marker.uuid);
    	var pos = marker.getPosition();
    	r.set('latitude', pos.lat());
    	r.set('longitude', pos.lng());
    	r.save();
    },
    
    onMarkerDblClicked: function(e, marker){
    	var r = this.locationRec.MapMarkers().getById(marker.uuid);
    	var p = Ext.create('Sp.views.locations.EditMapMarker', {
    		locationRec: this.locationRec,
    		marker: marker,
    		markerRec: r,
    	});
    	p.show(this.body.dom);
    },
    
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    

});
