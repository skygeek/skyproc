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

// NS
Ext.ns('Sp.ui.misc');

Sp.ui.misc.errMsg = function(msg, title){
    Ext.MessageBox.show({
        title: title ? title : TR("Error"),
        msg: msg,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR,
    });
}

Sp.ui.misc.warnMsg = function(msg, title){
    Ext.MessageBox.show({
        title: title ? title : TR("Warning"),
        msg: msg,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.WARNING,
    });
}

Sp.ui.misc.okMsg = function(msg, title){
    Ext.MessageBox.show({
        title: title ? title : TR("Information"),
        msg: msg,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.INFO,
    });
}

Sp.ui.misc.showAbout = function(){
    var msg = '';
    msg += "<span style='font-size:14px'>&copy; 2012, Skyproc (beta)</span><br><br>";
    msg += "<span style='font-size:11px'>Skyproc is a free software released under";
    msg += "<br><a href='http://www.gnu.org/licenses/agpl-3.0.html' target='_blank'>The GNU Affero General Public License</a>";
    msg += "<br><br><a href='mailto:contact@skyproc.com' target='_blank'>contact@skyproc.com</a></span>";
    Ext.MessageBox.show({
        title: TR("About"),
        msg: msg,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.INFO,
    });
}

Sp.ui.misc.reportProxyException = function(proxy, response, operation){
    
    if (response.status == 401){
        window.location = '/logout/';
        return;
    }
    
    // ui notification
    Ext.MessageBox.show({
        title: TR("SERVER ERROR") + Ext.String.format(" ({0})",response.status),
        msg: Ext.String.format(
            TR("There was an error communicating with {0} server. <br/>Your request could not be completed !"), 
            Sp.core.Globals.BRAND),
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.ERROR,
    });
    
    // console log
    Log("=== Proxy Exception ===========");
    Log('Proxy Object:');
    Log(proxy);
    Log('Response:');
    Log(response);
    Log('Operation:');
    Log(response);
    Log("===============================");
}

Sp.ui.misc.formatFullname = function(person, name_order, capitalize){
    name_order = name_order || person.data.name_order || 'FL';
    if (capitalize){
        var fn = person.data.first_name;
        var first_name = fn.substring(0, 1).toUpperCase() + fn.substring(1, fn.length).toLowerCase();
        var last_name = person.data.last_name.toUpperCase();
    } else {
        var first_name = person.data.first_name;
        var last_name = person.data.last_name;
    }
    if (name_order == 'FL'){
        return first_name + ' ' + last_name;
    } else {
        return last_name + ' ' + first_name;
    }
}

Sp.ui.misc.getUserFullname = function(){
    return Sp.ui.misc.formatFullname(Data.me);
}

Sp.ui.misc.getCountryCity = function(rec, show_flag, hide_city, new_line_city){
    var label = '';
    var flag_img = '/static/images/flags/none.png';
    var country;
    if (rec.data.country){
        if (Ext.isObject(rec.data.country)){
            country = rec.getCountry();
        } else {
            country = Data.countries.getById(rec.data.country);
        }
        label += country.get(Sp.utils.i18n.getCountryNameField());
    }
    var city = null;
    if (rec.data.city){
        if (Ext.isObject(rec.data.city)){
            city = rec.getCity().data.name;
        }
    } else if (rec.data.custom_city){
        city = rec.data.custom_city;
    }
    if (city && !hide_city && !new_line_city){
        if (label.length > 0){
            label += ', ';
        }
        label += city;
    }
    var city_row = '';
    if (city && new_line_city){
        city_row = Ext.String.format("<tr><td colspan='2'>{0}</td></tr>", city);
    }
    if (show_flag){
        if (country){
            var flag_img = '/static/images/flags/' + country.data.iso_code.toLowerCase() + '.png';
        }
        return Ext.String.format("<table><tr><td><img src='{0}'></td><td>&nbsp;{1}</td></tr>{2}</table>", flag_img, label, city_row);
    } else {
        return label;
    }
    
}

Sp.ui.misc.getCountryCity2 = function(rec){
    var city_row = '';
    var country_row = '';
    
    var country;
    if (rec.data.country){
        if (Ext.isObject(rec.data.country)){
            country = rec.getCountry();
        } else {
            country = Data.countries.getById(rec.data.country);
        }
    }
    var city = null;
    if (rec.data.city){
        if (Ext.isObject(rec.data.city)){
            city = rec.getCity().data.name;
        }
    } else if (rec.data.custom_city){
        city = rec.data.custom_city;
    }
    
    if (city){
        city_row = Ext.String.format("<tr><td colspan='2'>{0}</td></tr>", city);
    }
    if (country){
        country_row = Ext.String.format("<tr><td><img src='{0}'/></td><td>{1}</td></tr>", 
                                        '/static/images/flags/' + country.data.iso_code.toLowerCase() + '.png', 
                                        country.get(Sp.utils.i18n.getCountryNameField()));
    }
    
    return Ext.String.format("<table>{0}{1}</table>", city_row, country_row);
    
}

Sp.ui.misc.getPicture = function(rec, image_only, size){
    if (Ext.isDefined(rec.data.gender)){
        if (rec.data.gender){
            var gender = rec.data.gender.toLowerCase(); 
        } else {
            var gender = 'm';
        }
        var picture = '/static/images/no_profile_pic_' + gender + '.png';
    } else {
        var picture = '/static/images/nothing.png';
    }
    if (rec.data.picture){
        picture = rec.data.picture;
    }
    if (image_only){
        return picture;
    }
    if (Ext.isDefined(size)){
        return Ext.String.format("<img src='{0}' width='{1}' height='{1}'/>", picture, size);
    } else {
        return Ext.String.format("<img src='{0}'/>", picture);
    }
    
}

Sp.ui.misc.readPicture = function(e, callback){
    // FIXME: image validation: type & size
    var reader = new FileReader();
    reader.onload = callback; 
    reader.readAsDataURL(e.target.files[0]);
}

Sp.ui.misc.notify = function(title, msg){
    if(!Sp.ui.misc.notifyEl){
        Sp.ui.misc.notifyEl = Ext.core.DomHelper.insertFirst(document.body, {id:'notif-el'}, true);
        Sp.ui.misc.notifyEl.alignTo(document, 't-t');
    }
    if (title && msg){
        var notif_html = Ext.String.format("<div class='msg'><h3>{0}</h3><p>{1}</p></div>", title, msg);
    } else {
        var notif_html = Ext.String.format("<div class='msg'>{0}</div>", title);
    }
    var notif_el = Ext.core.DomHelper.append(Sp.ui.misc.notifyEl, {html:notif_html}, true);
    notif_el.setOpacity(0);
    notif_el.fadeIn({
        opacity: 1,
        easing: 'easeIn',
        duration: 500,
        callback: function(){
            notif_el.ghost('t', {
                easing: 'easeOut',
                duration: 500,
                delay: 3500,
                remove: true,
            });
        },
    });    
}
Notify = Sp.ui.misc.notify;

Sp.ui.misc.updateLocationView = function(location_uuid){
    var view = Sp.app.vp.down('#locations #mainContainer #' + location_uuid);
    if (view){
        view.updateView(false, false, true);
    }
}

Sp.ui.misc.getPeriodLabel = function(duration, unit, cap_first){
    var units_label = {
        d: TR("day"),
        ds: TR("days"),
        w: TR("week"),
        ws: TR("weeks"),
        m: TR("month"),
        ms: TR("months"),
        y: TR("year"),
        ys: TR("years"),
    };
    if (duration > 1){
        var unit_label = units_label[unit + 's'];
    } else {
        var unit_label = units_label[unit];
    }
    if (cap_first){
        unit_label = unit_label.substr(0,1).toUpperCase() + unit_label.substr(1,unit_label.length-1)
    }
    return duration + ' ' + unit_label;
}

Sp.ui.misc.getClearancePeriod = function(clr){
    var p = {};
    p.start_date = clr.data.start_date;
    if (clr.data.end_date){
        var diff = Ext.Date.getElapsed(clr.data.end_date, clr.data.start_date);
        p.end_date = clr.data.end_date;
        p.duration = (diff/1000/60/60/24)+1;
        p.unit = 'd';
        p.count_label = Sp.ui.misc.getPeriodLabel(p.duration, 'd');
    } else if (clr.data.duration){
        p.duration = clr.data.duration;
        p.unit = clr.data.unit;
        if (clr.data.unit == 'd'){
            p.end_date = Ext.Date.add(clr.data.start_date, Ext.Date.DAY, clr.data.duration-1);
        } else if (clr.data.unit == 'w'){
            p.end_date = Ext.Date.add(clr.data.start_date, Ext.Date.DAY, clr.data.duration*7);
        } else if (clr.data.unit == 'm'){
            p.end_date = Ext.Date.add(clr.data.start_date, Ext.Date.MONTH, clr.data.duration);
        } else if (clr.data.unit == 'y'){
            p.end_date = Ext.Date.add(clr.data.start_date, Ext.Date.YEAR, clr.data.duration);
        }
        p.count_label = Sp.ui.misc.getPeriodLabel(clr.data.duration, clr.data.unit);
    } else {
        p.duration = 1;
        p.unit = 'd';
        p.count_label = Sp.ui.misc.getPeriodLabel(1, 'd');
    }
    if (p.duration == 1 && p.unit == 'd'){
        p.end_date = undefined;
    }
    return p;   
}

Sp.ui.misc.updateCalendarView = function(location_uuid){
    var cal = Sp.app.vp.down('#reservations #calendarsCtx #' + location_uuid + '-cal');
    if (cal){
        var active = cal.layout.getActiveItem();
        if (Ext.isFunction(active.refresh)){
            active.refresh();
        }   
    }
}

Sp.ui.misc.getCatalogElementLabel = function(element){
    var label = {};
    label['short'] = '';
    label.full = '';    
    if (element.data.slots == 1){
        label['short'] += '1 ' + TR("Slot");
    } else if (element.data.slots > 1){
        label['short'] += element.data.slots + ' ' + TR("Slots");
    }
    if (element.data.altitude > 0){
        if (label['short'].length > 0){
            label['short'] += ', ';
        }
        label['short'] += Ext.String.format("{0} ({1})", element.data.altitude, element.data.altitude_unit);
    }
    
    label.full += label['short'];
    
    var workers_count = 0;
    element.LocationCatalogHires().each(function(h){
        if (h.data.count > 0){
            var wt = h.getWorkerType();
            label.full += "<table><tr>";
            label.full += Ext.String.format("<td>+ {0}&nbsp;&nbsp;</td>", h.data.count);
            label.full += Ext.String.format("<td><img src='/static/images/icons/roles/{0}.png'></td>", wt.data.type);
            label.full += Ext.String.format("<td>&nbsp;{0}</td>", h.data.count == 1 ? TR(wt.data.label) : TR(wt.data.plural_label));
            label.full += "</tr></table>";
            workers_count += h.data.count;
        }
    });
    
    if (workers_count > 0){
        if (label['short'].length > 0){
            label['short'] += '  +  ';
        }
        label['short'] += Ext.String.format("[{1}: {0}]", workers_count, TR("Staff"));
    }
    
    return label;
}

Sp.ui.misc.passwordAction = function(callback, previous_pwd, title){
    title = title || TR("Please type your password");
    var msgbox = Ext.Msg.prompt(title, '', function(btn, pwd){
        if (btn == 'ok'){
            Ext.getBody().mask(TR("Please wait"));
            s = new SRP(null, {
                email: Sp.app.getUsername(),
                password: pwd,
                csrf: Ext.util.Cookies.get('csrftoken'), 
                callback: function(verified){
                    Ext.getBody().unmask();
                    if (verified){
                        callback(pwd);
                    } else {
                        Sp.ui.misc.passwordAction(callback, pwd, title);
                    }
                },
            });
            s.identify();
        }
    }, window, false, previous_pwd);
    msgbox.textField.inputEl.dom.type = 'password';
}

Sp.ui.misc.buildDefaultPricesStore = function(locationRec, record, item_uuid, currency_uuid, price_field, init){
    var item_rec = locationRec.LocationCatalogItems().getById(item_uuid);
    if (item_rec){
        var prices = [],
            def_currency = Data.currencies.getById(locationRec.data.default_currency),
            pre_select_currency,
            pre_select_price,
            def_curr_price;
        
        if (currency_uuid){
            pre_select_currency = currency_uuid;
        } else if (def_currency){
            pre_select_currency = def_currency.data.uuid;
        }
        item_rec.LocationCatalogPrices().each(function(p){
            if (Ext.isObject(p.data.currency)){
                var currency = p.getCurrency();
            } else {
                var currency = Data.currencies.getById(p.data.currency);
            }
            prices.push({
                uuid: p.data.uuid,
                price: p.data.price + ' ' + currency.data.code,
            });
            if (p.data['default'] && currency.data.uuid == pre_select_currency){
                pre_select_price = p.data.uuid;
            }
            if (p.data['default'] && currency.data.uuid == def_currency.data.uuid){
                def_curr_price = p.data.uuid;
            }
        });
        var store = price_field.getStore();
        store.loadRawData(prices);
        if (init && record.data.default_catalog_price){
            if (Ext.isObject(record.data.default_catalog_price)){
                var price_uuid = record.data.default_catalog_price.uuid;
            } else {
                var price_uuid = record.data.default_catalog_price;
            }
            price_field.setValue(price_uuid);
        } else if (pre_select_price || def_curr_price){
            price_field.setValue(pre_select_price || def_curr_price);
        }
    }
}

Sp.ui.misc.updateLifManagerLocations = function(){
    if (!Sp.app.isOp()){
        return;
    }
    var p = Sp.app.vp.down('#liftManagerMainPanel');
    if (p){
        p.buildLocationsStore(true);
    }
}

Sp.ui.misc.trOperationNote = function(label){
    var tr_strings = [
        "Deposit operation",
        "Withdraw operation",
        "Buyed",
        "Refund",
        "Billed",
    ];
    for (var i=0,s ; s = tr_strings[i] ; i++){
        label = label.replace(s, TR(s));
    }
    return label;
}