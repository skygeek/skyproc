# -*- coding: utf-8 -*-

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

GENDERS = (
    ('M', 'Male'),
    ('F', 'Female'),
)

NAME_ORDER = (
    ('FL', 'First-Last'),
    ('LF', 'Last-First'),
)

LANGS = (
    ('EN','English'),
    ('FR','Français'),
)

SPOKEN_LANGS = (
    ('EN','English'),
    ('FR','French'),
    ('ES','Spanish'),
    ('DE','Deutch'),
)

DATE_FORMATS = [
    ['F j, Y', "F j, Y"],
    ['j F Y', "j F Y"],
    ['j. F Y', "j F Y"],
    ['D, M j, Y', "D, M j, Y"],
    ['D, j M Y', "D, j M Y"],
    ['l, F j, Y', "l, F j, Y"],
    ['l, j F Y', "l, j F Y"],
    ['m/d/Y', "(M/D/Y)"],
    ['d/m/Y', "(D/M/Y)"],
    ['Y/m/d', "(Y/M/D)"],
    ['m-d-Y', "(M-D-Y)"],
    ['d-m-Y', "(D-M-Y)"],
    ['Y-m-d', "(Y-M-D)"],
    ['m.d.Y', "(M.D.Y)"],
    ['d.m.Y', "(D.M.Y)"],
    ['Y.m.d', "(Y.M.D)"],
    ['n/j/Y', "(M/D/Y with no leading zeroes)"],
    ['j/n/Y', "(D/M/Y with no leading zeroes)"],
    ['Y/n/j', "(Y/M/D with no leading zeroes)"],
    ['n-j-Y', "(M-D-Y with no leading zeroes)"],
    ['j-n-Y', "(D-M-Y with no leading zeroes)"],
    ['Y-n-j', "(Y-M-D with no leading zeroes)"],
    ['n.j.Y', "(M.D.Y with no leading zeroes)"],
    ['j.n.Y', "(D.M.Y with no leading zeroes)"],
    ['Y.n.j', "(Y.M.D with no leading zeroes)"],
]

TIME_FORMATS = [
    ['H:i', "(24-hour clock)"],
    ['h:i A', "(12-hour clock)"],
    ['G:i', "(24-hour clock without leading zeros)"],
    ['g:i A', "(12-hour clock without leading zeros)"],
]

ALTITUDE_UNITS = (
    ('m','Meters'),
    ('ft','Feet'),
)

SPEED_UNITS = (
    ('kts',"Knots (kts)"),
    ('mph',"Miles per hour (mph)"),
    ('ms',"Meters per second (m/s)"),
    ('kmh',"Kilometers per hour (km/h)"),
)

DISTANCE_UNITS = (
    ('m', 'Metric (cm/m/km)'),
    ('us', 'U.S. (in/ft/mi)'),
)

WEIGHT_UNITS = (
    ('kg', 'Kilograms'),
    ('lb', 'Pounds'),
)

TEMPERATURE_UNITS = (
    ('c','Degrees Celsius (C°)'),
    ('f','degrees Fahrenheit (F°)'),
)



LOCATIONS_TYPE = (
    ('D','Dropzone'),
    ('T','Tunnel'),
)

JOIN_TYPE  = (
    ('R','Request'),
    ('I','Invite'),
)

BILLING_MODES = (
    ('none','No Billing'),
    ('pre','Prepaid'),
    ('post','Postpaid'),
    ('other','Bill Other'),
) 

PERIOD_UNITS = (
    ('d','Days'),
    ('w','Weeks'),
    ('m','Months'),
    ('y','Years'),
)

PAYMENT_STATUS = (
    ('N','Not yet paid'),
    ('P','Partially paid'),
    ('T','Totally paid'),
)

ACCOUNT_OPERATIONS = (
    ('D','Deposit'),
    ('B','Buying'),
    ('C','Cancellation'),
)

LOAD_STATES = (
    ('P','Planned'),
    ('B','Boarding'),
    ('T','Took Off'),
    ('D','Dispatching'),
    ('S','Descending'),
    ('L','Landed'),
    ('I','Incident'),
)
