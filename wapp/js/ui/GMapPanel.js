/**
 * @author Shea Frederick
 */

Ext.define('Sp.ui.GMapPanel', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.gmappanel',

    requires : ['Ext.window.MessageBox'],

    initComponent: function() {
        this.map_objects = [];
        Ext.applyIf(this, {
            plain : true,
            gmapType : 'map',
            border : false,
        });
        if (!Sp.app.hasGMap()){
            this.layout = {
                type: 'hbox',
                align: 'middle',
                pack: 'center',
            };
            this.items = [{
                xtype: 'label',
                text: TR("Google maps service is not available"),
                cls: 'placeholder-color',
            }];
        }
        this.callParent();
    },

    afterFirstLayout: function() {
        var center = this.center;
        this.callParent();
        if (!Sp.app.hasGMap()){
            return;
        }
        if (center) {
            if (center.geoCodeAddr) {
                this.lookupCode(center.geoCodeAddr, center.marker);
            } else {
                this.createMap(center);
            }
        } else {
            Ext.Error.raise('center is required');
        }

    },

    createMap: function(center, marker) {
        if (!Sp.app.hasGMap()){
            return;
        }
        var options = Ext.apply({}, this.mapOptions);
        options = Ext.applyIf(options, {
            zoom : 14,
            center : center,
            mapTypeId : google.maps.MapTypeId.HYBRID,
        });
        this.gmap = new google.maps.Map(this.body.dom, options);
        this.fireEvent('mapRender', this.gmap);
        if (marker) {
            this.addMarker(Ext.applyIf(marker, {
                position : center
            }));
        }
        Ext.each(this.markers, this.addMarker, this);
        Ext.each(this.circles, this.addCircle, this);
        Ext.each(this.rectangles, this.addRectangle, this);
        Ext.each(this.polygons, this.addPolygon, this);
    },

    addMarker: function(marker) {
        Ext.apply(marker, {
            map : this.gmap,
        });
        if (!marker.position) {
            marker.position = new google.maps.LatLng(marker.lat, marker.lng);
        }
        var o = new google.maps.Marker(marker);
        if (marker.uuid) {
            o.uuid = marker.uuid;
        }
        this.fireEvent('markerRender', o);
        Ext.Object.each(marker.listeners, function(name, fn) {
            google.maps.event.addListener(o, name, fn);
        });
        this.setupMapObject(o);
        return o;
    },

    addCircle: function(circle) {
        Ext.apply(circle, {
            map : this.gmap,
        });
        var o = new google.maps.Circle(circle);
        if (circle.uuid) {
            o.uuid = circle.uuid;
        }
        this.fireEvent('circleRender', o);
        this.setupMapObject(o);
        return o;
    },

    addRectangle: function(rectangle) {
        Ext.apply(rectangle, {
            map : this.gmap,
        });
        var o = new google.maps.Rectangle(rectangle);
        if (rectangle.uuid) {
            o.uuid = rectangle.uuid;
        }
        this.fireEvent('RectangleRender', o);
        this.setupMapObject(o);
        return o;
    },

    addPolygon: function(polygon) {
        Ext.apply(polygon, {
            map : this.gmap,
        });
        var o = new google.maps.Polygon(polygon);
        if (polygon.uuid) {
            o.uuid = polygon.uuid;
        }
        this.fireEvent('PolygonRender', o);
        this.setupMapObject(o);
        return o;
    },
    
    setupMapObject: function(o) {
        this.map_objects.push(o);
        google.maps.event.addListener(o, 'mouseover', Ext.bind(this.onMapObjectOver, this, [o], true));
        google.maps.event.addListener(o, 'mouseout', Ext.bind(this.onMapObjectOut, this, [o], true));
    },
    
    onMapObjectOver: function(e, o) {
        this.fireEvent('MapObjectMouseOver', o);
    },
    
    onMapObjectOut: function(e, o) {
        this.fireEvent('MapObjectMouseOut', o);
    },
    
    clearMapObjects: function() {
        for (var i=0,o ; o=this.map_objects[i] ; i++){
            o.setMap(null);
        }
    },
    
    addMapObjects: function(objects) {
        Ext.each(objects.markers, this.addMarker, this);
        Ext.each(objects.circles, this.addCircle, this);
        Ext.each(objects.rectangles, this.addRectangle, this);
        Ext.each(objects.polygons, this.addPolygon, this);
    },

    lookupCode: function(addr, marker) {
        this.geocoder = new google.maps.Geocoder();
        this.geocoder.geocode({
            address : addr
        }, Ext.Function.bind(this.onLookupComplete, this, [marker], true));
    },

    onLookupComplete: function(data, response, marker) {
        if (response != 'OK') {
            if (response == 'ZERO_RESULTS') {
                var msg = TR("No results found !");
            } else {
                var msg = Ext.String.format('Message: {0}', response);
            }
            Sp.ui.misc.warnMsg(msg, TR("Map lookup"));
            return;
        }
        this.createMap(data[0].geometry.location, marker);
    },

    afterComponentLayout: function(w, h) {
        this.callParent(arguments);
        this.redraw();
    },

    redraw: function() {
        var map = this.gmap;
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }
    },

    getMap: function() {
        return this.gmap;
    },
});


