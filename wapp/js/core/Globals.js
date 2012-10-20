
Ext.ns('Sp.core.Globals');

// set to 'null' to disable google maps api loading
// set to an empty string to use google maps without an api key
Sp.core.Globals.GOOGLE_MAPS_API_KEY = null;

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
