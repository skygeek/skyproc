# Copyright 2012, Nabil SEFRIOUI
#
# This file is part of Skyproc.
#
# Skyproc is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as 
# published by the Free Software Foundation, either version 3 of 
# the License, or any later version.
#
# Skyproc is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public 
# License along with Skyproc. If not, see <http://www.gnu.org/licenses/>.

import logging
import httplib
import urllib
import datetime
import ujson
import ephem
from django.db import models
from django.conf import settings

Location = models.get_model(settings.DATA_APP, 'Location')
MapObject = models.get_model(settings.DATA_APP, 'MapObject')
WeatherObservation = models.get_model(settings.DATA_APP, 'WeatherObservation')

def __geonames_request(service, params):
    try:
        params['username'] = settings.GEONAMES_USER
        conn = httplib.HTTPConnection("api.geonames.org")
        conn.request("GET", "/%s?%s" % (service, urllib.urlencode(params)))
        r = conn.getresponse()
        return ujson.decode(r.read())['weatherObservation']
    except KeyError:
        logging.info("No weather data available (%s)" % service)
    except Exception, e:
        logging.info("Unable to retreive weather data (%s): %s" % (service, e))
    
def __get_map_object_position(mapdata):
    lat = None
    lng = None
    try:
        mapdata = ujson.decode(mapdata)
        if mapdata['type'] in ('marker', 'circle'):
            lat = mapdata['lat']
            lng = mapdata['lng']
        elif mapdata['type'] == 'rectangle':
            lat = mapdata['swLat']
            lng = mapdata['swLng']
        elif mapdata['type'] == 'polygon':
            lat = mapdata['path'][0]['Xa']
            lng = mapdata['path'][0]['Ya']
    except: pass
    return lat, lng

def __get_sun_infos(lat, lng, dt, utc_offset=0):
    infos = {}
    o = ephem.Observer()
    o.lat, o.long, o.date = str(lat), str(lng), dt
    sun = ephem.Sun(o)
    infos['sunrise'] = ephem.Date(o.next_rising(sun, start=o.date) + utc_offset*ephem.hour).datetime()
    infos['sunset'] = ephem.Date(o.next_setting(sun, start=o.date) + utc_offset*ephem.hour).datetime()
    return infos

def update_location(location):
    lat = None
    lng = None
    weather_data = None
    
    # use the airport icao code
    if location.airport_icao:
        weather_data = __geonames_request('weatherIcaoJSON', {'ICAO':location.airport_icao})
        if weather_data:
            lat = weather_data['lat']
            lng = weather_data['lng']
            
    # try to get a position (lat,lng) either from:
    # 1. landing map object
    # 2. swoop spot map object
    # 3. location city
    # 4. any map object
    if not lat:
        try:
            lat, lng = __get_map_object_position( \
                        MapObject.objects.filter(location=location, deleted=False, type__type='landing')[0].mapdata)
        except: pass
        if not lat:
            try:
                lat, lng = __get_map_object_position( \
                            MapObject.objects.filter(location=location, deleted=False, type__type='swoop')[0].mapdata)
            except: pass
        if not lat and location.city:
            lat, lng = location.city.latitude, location.city.longitude
        if not lat:
            try:
                lat, lng = __get_map_object_position( \
                            MapObject.objects.filter(location=location, deleted=False)[0].mapdata)
            except: pass
        if lat and lng:
            weather_data = __geonames_request('findNearByWeatherJSON', {'lat':lat, 'lng':lng})
    
    # got weather data
    if weather_data:
        WeatherObservation.objects.filter(location=location).delete()
        data = {}
        data['owner'] = location.owner
        data['location'] = location
        fields = (
            ('station', 'stationName'),
            ('datetime', 'datetime'),
            ('clouds', 'cloudsCode'),
            ('temperature', 'temperature'),
            ('dew_point', 'dewPoint'),
            ('wind_speed', 'windSpeed'),
            ('wind_direction', 'windDirection'),
            ('humidity', 'humidity'),
            ('qnh', 'hectoPascAltimeter'),
        )
        for i in fields:
            try: data[i[0]] = weather_data[i[1]]
            except: pass
        # create record
        obs_record = WeatherObservation(**data)
        obs_record.clean_fields()
        # update sunrise/sunset
        sun_infos = __get_sun_infos(lat, lng, obs_record.datetime)
        obs_record.sunrise = sun_infos['sunrise']
        obs_record.sunset = sun_infos['sunset']
        obs_record.save(force_insert=True)
        logging.info("Updated location weather for: %s" % location.name)
        return obs_record
    elif lat and lng:
        # only calculate sunrise/sunset
        WeatherObservation.objects.filter(location=location).delete()
        now = datetime.datetime.now() 
        data = {}
        data['owner'] = location.owner
        data['location'] = location
        data['datetime'] = now
        data.update(__get_sun_infos(lat, lng, now))
        obs_record = WeatherObservation.objects.create(**data)
        logging.info("Updated location sun infos for: %s" % location.name)
        return obs_record
    else:
        # no lat,lng
        logging.info("No weather update for location: %s" % location.name)
    
def update():
    logging.info("== Starting weather update task ==")
    for location in Location.objects.filter(deleted=False):
        update_location(location)
    logging.info("== Weather update task finished ==")
