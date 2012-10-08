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

//FIXME: rewrite generic functions for handling map objects

Ext.define('Sp.views.locations.FormGeoLocation', {
    extend: 'Ext.panel.Panel',
    
    initComponent: function() {
        
        var rec = this.locationRec;
        var map_center = new google.maps.LatLng(37.0625, -95.677068); // world center :)
        var map_zoom = 2;
        var map_type = google.maps.MapTypeId.HYBRID;
                
        if (rec.data.map_latitude && rec.data.map_longitude){
            map_center = new google.maps.LatLng(parseFloat(rec.data.map_latitude), parseFloat(rec.data.map_longitude));
            map_zoom = rec.data.map_zoom;
            map_type = rec.data.map_type;
        } else if (Ext.isObject(rec.data.city)){
            map_center = new google.maps.LatLng(parseFloat(rec.data.city.latitude), parseFloat(rec.data.city.longitude));
            map_zoom = 12;
        }
        
        // markers
        var markers = [];
        var circles = [];
        var rectangles = [];
        var polygons = [];
        this.locationRec.MapObjects().each(function(o){
            var mapdata = Ext.decode(o.data.mapdata);
            if (mapdata.type == 'marker'){
                markers.push({
                    draggable: true,
                    title: o.data.name,
                    position: new google.maps.LatLng(mapdata.lat, mapdata.lng),
                    uuid: o.data.uuid,
                });
            } else if (mapdata.type == 'circle'){
                circles.push({
                    editable: true,
                    center: new google.maps.LatLng(mapdata.lat, mapdata.lng),
                    radius: mapdata.rad,
                    uuid: o.data.uuid,
                });
            } else if (mapdata.type == 'rectangle'){
                rectangles.push({
                    editable: true,
                    bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(mapdata.swLat, mapdata.swLng),
                        new google.maps.LatLng(mapdata.neLat, mapdata.neLng)
                    ),
                    uuid: o.data.uuid,
                });
            } else if (mapdata.type == 'polygon'){
                var path = [];
                for (var i=0,p ; p=mapdata.path[i] ; i++){
                    path.push(new google.maps.LatLng(p.Xa, p.Ya));
                }
                polygons.push({
                    editable: true,
                    paths: path,
                    uuid: o.data.uuid,
                });
            }
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
                        {
                            xtype: 'gmappanel',
                            itemId: 'map',
                            flex: 1,
                            margins: '10 0 5 0',
                            mapOptions: {
                                zoom: map_zoom,
                                mapTypeId: map_type,
                            },
                            center: map_center,
                            listeners: {
                                mapRender: Ext.bind(this.onMapRender, this),
                                markerRender: Ext.bind(this.onMarkerRender, this),
                                circleRender: Ext.bind(this.onCircleRender, this),
                                rectangleRender: Ext.bind(this.onRectangleRender, this),
                                polygonRender: Ext.bind(this.onPolygonRender, this),
                            },
                            markers: markers,
                            circles: circles,
                            rectangles: rectangles,
                            polygons: polygons,
                            tbar: [
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
                        },
                    ],
                },
            ], 
            
        });
 
        this.callParent(arguments);
    },
        
    onMapRender: function(map){
        
        // initialize drawing mgr
        this.drawingManager = new google.maps.drawing.DrawingManager({
            map: map,
            drawingMode: null,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.MARKER,
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
        
        // map events
        google.maps.event.addListener(map, 'center_changed',
                                        Ext.bind(this.onMapChanged, this, [map], true));
        google.maps.event.addListener(map, 'zoom_changed',
                                        Ext.bind(this.onMapChanged, this, [map], true));
        google.maps.event.addListener(map, 'maptypeid_changed',
                                        Ext.bind(this.onMapChanged, this, [map], true));
                            
        // drawing events
        google.maps.event.addListener(this.drawingManager, 'markercomplete',
                                        Ext.bind(this.onMarkerComplete, this));
        google.maps.event.addListener(this.drawingManager, 'circlecomplete',
                                        Ext.bind(this.onCircleComplete, this));
        google.maps.event.addListener(this.drawingManager, 'rectanglecomplete',
                                        Ext.bind(this.onRectangleComplete, this));
        google.maps.event.addListener(this.drawingManager, 'polygoncomplete',
                                        Ext.bind(this.onPolygonComplete, this));
    },
    
    doSearch: function(){
        var search_str = this.down('#searchText').getValue();
        if (search_str.length > 0){
            this.down('#map').lookupCode(search_str);
        }       
    },
    
    onMapChanged: function(map){
        var center = map.getCenter();
        this.locationRec.set({
            map_type: map.getMapTypeId(),
            map_zoom: map.getZoom(),
            map_latitude: center.lat(),
            map_longitude: center.lng(),
        });     
    },
    
    // MARKER //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    
    addMarkerListeners: function(marker){
        google.maps.event.addListener(marker, 'dblclick',
                                        Ext.bind(this.onMarkerDblClicked, this, [marker], true));
        google.maps.event.addListener(marker, 'rightclick',
                                        Ext.bind(this.onMarkerRightClicked, this, [marker], true));
        google.maps.event.addListener(marker, 'position_changed',
                                        Ext.bind(this.onMarkerChanged, this, [marker]));
    },
    
    onMarkerRender: function(marker){
        this.addMarkerListeners(marker);
    },
    
    onMarkerComplete: function(marker){
        // connect events
        this.addMarkerListeners(marker);
        // show options panel
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: marker,
            marker: marker,
        }).show(this.body.dom);
    },
    
    onMarkerChanged: function(marker){
        var o = this.locationRec.MapObjects().getById(marker.uuid);
        var pos = marker.getPosition();
        Sp.ui.data.updateMapData(o, {
            lat: pos.lat(),
            lng: pos.lng(),
        });
    },
    
    editMarker: function(marker){
        var o = this.locationRec.MapObjects().getById(marker.uuid);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: marker,
            objectRec: o,
            marker: marker,
        }).show(this.body.dom);
    },
    
    onMarkerDblClicked: function(e, marker){
        this.editMarker(marker);
        Ext.EventManager.preventDefault(e.b);
    },
    
    onMarkerRightClicked: function(e, marker){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editMarker(marker);
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        var store = this.locationRec.MapObjects();
                        store.remove(store.getById(marker.uuid));
                        marker.setMap(null);
                    },
                    scope: this,
                },
            ],
        });
        try {
            Ext.EventManager.preventDefault(e.b);
            menu.showAt(Ext.EventManager.getPageXY(e.b));    
        } catch (e){}
    },
    
    // CIRCLE //////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    
    addCircleListeners: function(circle){
        google.maps.event.addListener(circle, 'dblclick',
                                        Ext.bind(this.onCircleDblClicked, this, [circle], true));
        google.maps.event.addListener(circle, 'rightclick',
                                        Ext.bind(this.onCircleRightClicked, this, [circle], true));
        google.maps.event.addListener(circle, 'center_changed',
                                        Ext.bind(this.onCircleChanged, this, [circle]));
        google.maps.event.addListener(circle, 'radius_changed',
                                        Ext.bind(this.onCircleChanged, this, [circle]));
    },
    
    onCircleRender: function(circle){
        this.addCircleListeners(circle);
    },
    
    onCircleComplete: function(circle){
        this.addCircleListeners(circle);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: circle,
            circle: circle,
        }).show(this.body.dom);
    },
    
    onCircleChanged: function(circle){
        var o = this.locationRec.MapObjects().getById(circle.uuid);
        var center = circle.getCenter();
        Sp.ui.data.updateMapData(o, {
            lat: center.lat(),
            lng: center.lng(),
            rad: circle.getRadius(),
        });
    },
    
    editCircle: function(circle){
        var o = this.locationRec.MapObjects().getById(circle.uuid);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: circle,
            objectRec: o,
            circle: circle,
        }).show(this.body.dom);
    },
    
    onCircleDblClicked: function(e, circle){
        this.editCircle(circle);
        Ext.EventManager.preventDefault(e.b);
    },
    
    onCircleRightClicked: function(e, circle){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editCircle(circle);
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        var store = this.locationRec.MapObjects();
                        store.remove(store.getById(circle.uuid));
                        circle.setMap(null);
                    },
                    scope: this,
                },
            ],
        });
        try {
            Ext.EventManager.preventDefault(e.b);
            menu.showAt(Ext.EventManager.getPageXY(e.b));    
        } catch (e){}
    },
    
    // RECTANGLE////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    
    addRectangleListeners: function(rectangle){
        google.maps.event.addListener(rectangle, 'dblclick',
                                        Ext.bind(this.onRectangleDblClicked, this, [rectangle], true));
        google.maps.event.addListener(rectangle, 'rightclick',
                                        Ext.bind(this.onRectangleRightClicked, this, [rectangle], true));
        google.maps.event.addListener(rectangle, 'bounds_changed',
                                        Ext.bind(this.onRectangleChanged, this, [rectangle]));
    },
    
    onRectangleRender: function(rectangle){
        this.addRectangleListeners(rectangle);
    },
    
    onRectangleComplete: function(rectangle){
        this.addRectangleListeners(rectangle);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: rectangle,
            rectangle: rectangle,
        }).show(this.body.dom);
    },
    
    onRectangleChanged: function(rectangle){
        var o = this.locationRec.MapObjects().getById(rectangle.uuid);
        var bounds = rectangle.getBounds();
        Sp.ui.data.updateMapData(o, {
            swLat: bounds.getSouthWest().lat(),
            swLng: bounds.getSouthWest().lng(),
            neLat: bounds.getNorthEast().lat(),
            neLng: bounds.getNorthEast().lng(),
        });
    },
    
    editRectangle: function(rectangle){
        var o = this.locationRec.MapObjects().getById(rectangle.uuid);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: rectangle,
            objectRec: o,
            rectangle: rectangle,
        }).show(this.body.dom);
    },
    
    onRectangleDblClicked: function(e, rectangle){
        this.editRectangle(rectangle);
        Ext.EventManager.preventDefault(e.b);
    },
    
    onRectangleRightClicked: function(e, rectangle){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editRectangle(rectangle);
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        var store = this.locationRec.MapObjects();
                        store.remove(store.getById(rectangle.uuid));
                        rectangle.setMap(null);
                    },
                    scope: this,
                },
            ],
        });
        try {
            Ext.EventManager.preventDefault(e.b);
            menu.showAt(Ext.EventManager.getPageXY(e.b));    
        } catch (e){}
    },
    
    // POLYGON//////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    
    addPolygonListeners: function(polygon){
        google.maps.event.addListener(polygon, 'dblclick',
                                        Ext.bind(this.onPolygonDblClicked, this, [polygon], true));
        google.maps.event.addListener(polygon, 'rightclick',
                                        Ext.bind(this.onPolygonRightClicked, this, [polygon], true));
        var path = polygon.getPath();
        google.maps.event.addListener(path, 'insert_at',
                                        Ext.bind(this.onPolygonChanged, this, [polygon]));
        google.maps.event.addListener(path, 'remove_at',
                                        Ext.bind(this.onPolygonChanged, this, [polygon]));
        google.maps.event.addListener(path, 'set_at',
                                        Ext.bind(this.onPolygonChanged, this, [polygon]));
                                        
    },
    
    onPolygonRender: function(polygon){
        this.addPolygonListeners(polygon);
    },
    
    onPolygonComplete: function(polygon){
        this.addPolygonListeners(polygon);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: polygon,
            polygon: polygon,
        }).show(this.body.dom);
    },
    
    onPolygonChanged: function(polygon){
        var o = this.locationRec.MapObjects().getById(polygon.uuid);
        Sp.ui.data.updateMapData(o, {
            path: polygon.getPath().getArray(),
        });
    },
    
    editPolygon: function(polygon){
        var o = this.locationRec.MapObjects().getById(polygon.uuid);
        Ext.create('Sp.views.locations.EditMapObject', {
            locationRec: this.locationRec,
            object: polygon,
            objectRec: o,
            polygon: polygon,
        }).show(this.body.dom);
    },
    
    onPolygonDblClicked: function(e, polygon){
        this.editPolygon(polygon);
        Ext.EventManager.preventDefault(e.b);
    },
    
    onPolygonRightClicked: function(e, polygon){
        var menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: TR("Edit"),
                    icon: '/static/images/icons/edit.png',
                    handler: function(){
                        this.editPolygon(polygon);
                    },
                    scope: this,
                },
                '-',
                {
                    text: TR("Delete"),
                    icon: '/static/images/icons/trash.png',
                    handler: function(){
                        var store = this.locationRec.MapObjects();
                        store.remove(store.getById(polygon.uuid));
                        polygon.setMap(null);
                    },
                    scope: this,
                },
            ],
        });
        try {
            Ext.EventManager.preventDefault(e.b);
            menu.showAt(Ext.EventManager.getPageXY(e.b));    
        } catch (e){}
    },
    
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    
    post_save: function(){
        this.locationRec.MapObjects().sync();
    },
    
    reject: function(){
        this.locationRec.MapObjects().rejectChanges();
    },
    
});
