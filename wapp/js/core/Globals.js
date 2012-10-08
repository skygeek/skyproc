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

Ext.ns('Sp.core.Globals');

// set to 'null' to disable google maps api loading
// set to an empty string to use google maps without an api key
Sp.core.Globals.GOOGLE_MAPS_API_KEY = '';

Sp.core.Globals.DEBUG = true;
Sp.core.Globals.BRAND = "Skyproc";

Sp.core.Globals.BASE_URL = "/";
Sp.core.Globals.COMET_URL = "https://" + window.location.hostname + ":8080";
Sp.core.Globals.COMET_SECURE = true;
Sp.core.Globals.AJAX_REQUEST_TIMEOUT = 60000;
Sp.core.Globals.PRINT_CSS = "/static/css/print.css";

Sp.core.Globals.MAIN_CTX_PADDING = '15 15 10 10'
Sp.core.Globals.WINDOW_MARGIN = 8

Sp.core.Globals.DATE_FORMAT = "Y-m-d";
Sp.core.Globals.TIME_FORMAT = "H:i:s.u";

Sp.core.Globals.REQ_MSG = "This field is required";
Sp.core.Globals.BLANK_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A" +
                                "/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wJDQMvIH1maqQAAAAZdEVYdENv" +
                                "bW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAEklEQVQ4y2NgGAWjYBSMAggAAAQQAAGFP6py" +
                                "AAAAAElFTkSuQmCC";
