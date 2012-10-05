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
Ext.ns('Sp.ui.data');

Sp.ui.data.selectFromStore = function(sm, store){
	var selected = [],
		sm_store = sm.getStore();
	store.each(function(rec){
		var r = sm_store.getById(rec.data.uuid);
		if (r){
			selected.push(r);			
		}
	});
	sm.select(selected);
}

Sp.ui.data.updateFromSelection = function(sm, record, field, store){
	var selected = sm.getSelection();
	record.beginEdit();
	record.set(field, Data.getRawValues(selected));
	record.endEdit();
	store.removeAll();
	store.add(Data.getCopies(selected));
}

Sp.ui.data.getFormValues = function(form, extraValues){
	var values = form.form.getFieldValues();
	if (Ext.isObject(extraValues)){
		Ext.apply(values, Data.htmlEncodeValues(extraValues));
	}
	return values;
}

Sp.ui.data.createFormRecord = function(form, modelName, extraValues){
	
	// user input values
	var values = Sp.ui.data.getFormValues(form, extraValues);
 
	// create record
	var record = Data.create(modelName, values);
	
	// validation check
	var errors = record.validate();
	if (errors.isValid()){
		return record;		
	}
	
	// mark form errors
	var f, marked = false;	
	errors.eachKey(function(k,v){
		f = form.form.findField(v.field);
		if (f){
			f.markInvalid(v.message);
			marked = true;	
		}
	});
	
	// return the record if no visible error
	// it may contains user irrelevants errors... 
	if (!marked){
		return record;
	}
	
}

Sp.ui.data.validateForm = function(form, extraValues){
	if (form.form.hasInvalidField()){
		return false;
	}
	var record = form.form.getRecord();
	if (!record){
		return true;
	}
	var errors = Ext.create(record.$className, Sp.ui.data.getFormValues(form, extraValues)).validate();
	if (errors.isValid()){
		return true;		
	}	
	// mark form errors
	var f, marked = false;	
	errors.eachKey(function(k,v){
		f = form.form.findField(v.field);
		if (f){
			f.markInvalid(v.message);
			marked = true;	
		}
	});
	return !marked;
}

Sp.ui.data.getNewRequestListItem = function(r){
	var rec = {};
	rec.uuid = r.data.uuid;
	rec.type = 'R';
	
	var p = r.getPerson();
	
	rec.label = '';
	rec.label += "<span class='bold'>" + Sp.ui.misc.formatFullname(p, Data.me.data.name_order, true) + '</span>';
	var from = Sp.ui.misc.getCountryCity(p, true);
	if (from){
		rec.label += "<br>" + from;
	}
	rec.label += "<br><table><tr><td><img src='/static/images/icons/join.png'/></td><td>&nbsp;" + 
				TR("New join request") + "</td></tr></table>";
	
	rec.picture = Sp.ui.misc.getPicture(p, true);
	
	return rec;
}

Sp.ui.data.getNewInviteListItem = function(i){
	var rec = {};
	rec.uuid = i.data.uuid;
	rec.type = 'I';
	
	var l = i.getLocation();
	
	rec.label = '';
	rec.label += "<span class='bold'>" + l.data.name + '</span>';
	var from = Sp.ui.misc.getCountryCity(l, true);
	if (from){
		rec.label += "<br>" + from;
	}
	rec.label += "<br><table><tr><td><img src='/static/images/icons/invite.png'/></td><td>&nbsp;" + 
				TR("New invitation") + "</td></tr></table>";
	
	rec.picture = Sp.ui.misc.getPicture(l, true);
	
	return rec;
}

Sp.ui.data.getNewClearanceListItem = function(c){
	var rec = {};
	rec.uuid = c.data.uuid;
	rec.type = 'C';
	
	var person = c.getPerson();
	
	rec.label = '';
	rec.label += "<span class='bold'>" + Sp.ui.misc.formatFullname(person, Data.me.data.name_order, true) + '</span>';
	
	var p = Sp.ui.misc.getClearancePeriod(c);
	rec.label += "<table>";
	rec.label += Ext.String.format("<tr><td><img src='/static/images/icons/start.png'/></td><td>&nbsp;{0}</td></tr>", 
				Ext.Date.format(p.start_date, Data.me.data.date_format));
	if (p.end_date){
		rec.label += Ext.String.format("<tr><td><img src='/static/images/icons/end.png'/></td><td>&nbsp;{0}</td></tr>", 
					Ext.Date.format(p.end_date, Data.me.data.date_format));
	}
	rec.label += "</table>";
	
	rec.label += "<table class='badge-table'><tr><td><img src='/static/images/icons/clearance.png'/></td><td>&nbsp;" + 
				TR("Clearance request") + "</td><td>&nbsp;(" + p.count_label + ")</td></tr></table>";
	
	rec.picture = Sp.ui.misc.getPicture(person, true);
	
	return rec;
}

Sp.ui.data.buildNewRequestsStore = function(){
	var data = [];
	Data.newRequests.each(function(r){
		data.push(Sp.ui.data.getNewRequestListItem(r));
	});
	Data.newInvites.each(function(i){
		data.push(Sp.ui.data.getNewInviteListItem(i));
	});
	Data.locations.each(function(l){
		l.Clearances().each(function(c){
			if (!c.data.approved){
				data.push(Sp.ui.data.getNewClearanceListItem(c));
			}
		});
	});
	return Ext.create('Ext.data.Store', {
		fields: [
			'uuid',
			'type',
			'label',
			'picture',
		],
		data: data,
	});	
}

Sp.ui.data.getPersonClearance = function(location_uuid){
	var clr;
	Data.clearances.each(function(c){
		if (c.getLocation().data.uuid == location_uuid){
			clr = c;
			return false;
		}
	});
	return clr;
}

Sp.ui.data.buildCalendarStore = function(location_uuid, fn, scope){
	var store = Ext.create('Extensible.calendar.data.MemoryEventStore', {autoMsg: false});
	Data.reservations.each(function(resa){
		if (resa.data.location == location_uuid){
			var r = Ext.create('Extensible.calendar.data.EventModel', resa.data);
			r.phantom = false;
			store.add(r);	
		}
	});
	if (Ext.isFunction(fn)){
		store.on('write', fn, scope);
	}
	Data.calendarStores[location_uuid] = store;
	return store;
}

Sp.ui.data.decorateCalendarEvent = function(resaRec){
	resaRec.beginEdit();
	resaRec.set('Title', 'TXXT');
	resaRec.set('CalendarId', resaRec.data.confirmed ? 2 : 1);
	resaRec.endEdit();
}

Sp.ui.data.getPersonCurrency = function(membershipRec, locationRec){
	// person override	
	if (membershipRec.data.override_profile && membershipRec.data.currency){
		if (Ext.isObject(membershipRec.data.currency)){
			return membershipRec.getCurrency();
		} else {
			return Data.currencies.getById(membershipRec.data.currency);
		}
	}
	// profile currency
	if (membershipRec.data.profile){
		var profile = locationRec.MembershipProfiles().getById(membershipRec.data.profile);
		if (profile && profile.data.currency){
			if (Ext.isObject(profile.data.currency)){
				return profile.getCurrency();
			} else {
				return Data.currencies.getById(profile.data.currency);
			}
		}
	}
	// location currency
	if (locationRec.data.default_currency){
		if (Ext.isObject(locationRec.data.default_currency) && locationRec.data.default_currency.uuid){
			return Data.currencies.getById(locationRec.data.default_currency.uuid);
		} else if (Sp.utils.isUuid(locationRec.data.default_currency)){
			return Data.currencies.getById(locationRec.data.default_currency);
		}
	}
}

Sp.ui.data.getPersonProfile = function(membershipRec, locationRec, override_values){
	override_values = override_values || {};
	var profile = {};
	profile.billing_mode = 'pre';
	profile.credit_line = null;
	profile.currency = Sp.ui.data.getPersonCurrency(membershipRec, locationRec);
	profile.bill_person = null;
	profile.catalog_item = null;
	profile.catalog_element = null;
	profile.catalog_price = null;
	
	// profile
	var p;
	if (override_values.profile){
		p = locationRec.MembershipProfiles().getById(override_values.profile);
	} else if (membershipRec.data.profile){
		p = locationRec.MembershipProfiles().getById(membershipRec.data.profile);
	}
	
	// catalog item
	if (override_values.override_profile && override_values.default_catalog_item){
		profile.catalog_item = override_values.default_catalog_item;
	} else if (membershipRec.data.override_profile && membershipRec.data.default_catalog_item){
		profile.catalog_item = membershipRec.data.default_catalog_item;
	} else if (p && p.data.default_catalog_item){
		profile.catalog_item = p.data.default_catalog_item;
	}
	if (Ext.isObject(profile.catalog_item)){
		profile.catalog_item = profile.catalog_item.uuid;
	}
	
	// catalog element will be set only if the item has one and one only element
	if (profile.catalog_item){
		var item = locationRec.LocationCatalogItems().getById(profile.catalog_item);
		if (item && item.LocationCatalogElements().getCount() == 1){
			profile.catalog_element = item.LocationCatalogElements().getAt(0).data.uuid;
		}
	}
	
	// catalog price
	if (override_values.override_profile && override_values.default_catalog_price){
		profile.catalog_price = override_values.default_catalog_price;
	} else if (membershipRec.data.override_profile && membershipRec.data.default_catalog_price){
		profile.catalog_price = membershipRec.data.default_catalog_price;
	} else if (p && p.data.default_catalog_price){
		profile.catalog_price = p.data.default_catalog_price;
	}
	if (Ext.isObject(profile.catalog_price)){
		profile.catalog_price = profile.catalog_price.uuid;
	}
	
	// billing_mode
	if (override_values.override_profile && override_values.billing_mode){
		profile.billing_mode = override_values.billing_mode;
	} else if (membershipRec.data.override_profile && membershipRec.data.billing_mode){
		profile.billing_mode = membershipRec.data.billing_mode;
	} else if (p && p.data.billing_mode){
		profile.billing_mode = p.data.billing_mode;
	}
	
	// credit_line
	if (profile.billing_mode == 'post' || profile.billing_mode == 'other'){
		if (override_values.override_profile && Ext.isNumeric(override_values.credit_line)){
			profile.credit_line = parseInt(override_values.credit_line);
		} else if (membershipRec.data.override_profile && Ext.isNumber(membershipRec.data.credit_line)){
			profile.credit_line = membershipRec.data.credit_line;
		} else if (p && Ext.isNumber(p.data.credit_line)){
			profile.credit_line = p.data.credit_line;
		}
	}
	
	// bill_person
	if (profile.billing_mode == 'other'){
		if (override_values.override_profile && override_values.bill_person){
			profile.bill_person = override_values.bill_person;
		} else if (membershipRec.data.override_profile && membershipRec.data.bill_person){
			profile.bill_person = membershipRec.data.bill_person;
		} else if (p && p.data.bill_person){
			profile.bill_person = p.data.bill_person;
		}
		if (Ext.isObject(profile.bill_person)){
			profile.bill_person_data = profile.bill_person;
			profile.bill_person = profile.bill_person.uuid;
		}
	}
	
	return profile;
}

Sp.ui.data.personHasBuyedItem = function(membershipRec, item_uuid, price_uuid){
	var has_buyed_item = false;
	membershipRec.BuyedItems().each(function(i){
		if (i.data.item == item_uuid && i.data.price == price_uuid && !i.data.consumed){
			has_buyed_item = true;
			return false;
		}
	});
	return has_buyed_item;
}

Sp.ui.data.getPersonBalance = function(membershipRec, currency_uuid){
	var account = membershipRec.Accounts().findRecord('currency', currency_uuid);
	if (account){
		return account.data.balance;
	}
}

Sp.ui.data.getCatalogElementSlots = function(locationRec, element, ignore_roles){
	ignore_roles = ignore_roles || [];
	var slots = {};
	slots.jumpers = element.data.slots;
	slots.workers = [];
	slots.workers_count = 0;
	element.LocationCatalogHires().each(function(h){
		if (Ext.isObject(h.data.worker_type)){
			var wt = h.getWorkerType();
		} else {
			var wt = Data.workerTypes.getById(h.data.worker_type);
		}
		if (ignore_roles.indexOf(wt.data.type) != -1){
			return;
		}
		slots.workers.push({
			wt: wt,
			count: h.data.count,
		});
		slots.workers_count += h.data.count;
	});
	return slots;
}

Sp.ui.data.isActiveRessource = function(rec){
	return rec.data.available_fulltime;
}

Sp.ui.data.getActiveRessources = function(locationRec, stores){
	stores = stores || {};
	var recs;
	
	// aircrafts
	if (stores.aircrafts){
		stores.aircrafts.removeAll(true);
	} else {
		stores.aircrafts = Data.createStore('Aircraft');
		stores.aircrafts.sort('registration', 'ASC');
	}
	recs = [];
	locationRec.Aircrafts().each(function(a){
		if (Sp.ui.data.isActiveRessource(a)){
			recs.push(a);
		}
	});
	stores.aircrafts.add(recs);
	
	// workers types
	Data.workerTypes.each(function(t){
		if (stores[t.data.type]){
			stores[t.data.type].removeAll(true);
		} else {
			stores[t.data.type] = Data.createStore('Worker');
			stores[t.data.type].sort('name', 'ASC');
		}
	});
	
	// workers
	if (stores.workers){
		stores.workers.removeAll(true);
	} else {
		stores.workers = Data.createStore('Worker');
		stores.workers.sort('name', 'ASC');
	}
	recs = [];
	locationRec.Workers().each(function(w){
		if (Sp.ui.data.isActiveRessource(w)){
			recs.push(w);
			w.WorkerTypes().each(function(t){
				stores[t.data.type].add(w);
			});
		}
	});
	stores.workers.add(recs);
	
	return stores
}

Sp.ui.data.getPricesLabel = function(prices){
	if (!prices){
		return;
	}
	if (prices == 'N/A'){
		return TR("N/A");
	}
	if (!Ext.isObject(prices)){
		prices = Ext.decode(prices);
	}
	var label = [];
	Ext.Object.each(prices, function(c,a){
		label.push(Ext.util.Format.currency(a, ' '+c, 0, true));
	});
	return label.join(' | ');	
}
