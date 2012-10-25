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
Ext.ns('Sp.lmanager');

Sp.lmanager.isInTheAir = function(loadRec) {
    return ['P', 'B'].indexOf(loadRec.data.state) == -1;
}

Sp.lmanager.slotsSorter_get_name = function(r) {
    if (r.data.person) {
        return Sp.ui.misc.formatFullname({
            data : r.data.person
        }, Data.me.data.name_order, true).toLowerCase();
    } else if (r.data.phantom) {
        return r.data.phantom.name.toLowerCase();
    } else if (r.data.worker) {
        var name;
        Data.locations.each(function(l) {
            var w = l.Workers().getById(r.data.worker);
            if (w) {
                name = w.data.name.toLowerCase();
                return false;
            }
        });
        return name;
    }

};

Sp.lmanager.slotsSorter_compare_names = function(n1, n2) {
    var name_rank = 0;
    if (n1 || n2) {
        if (!n1) {
            name_rank = 1;
        } else if (!n2) {
            name_rank = -1;
        } else {
            if (n1 > n2) {
                name_rank = 1;
            } else if (n1 < n2) {
                name_rank = -1;
            }
        }
    }
    return name_rank;
};

Sp.lmanager.slotsSorter = function(r1, r2) {

    var get_name = Sp.lmanager.slotsSorter_get_name;
    var compare_names = Sp.lmanager.slotsSorter_compare_names;

    // get order mode
    if (r1.store && r1.store.slotsOrder) {
        var order = r1.store.slotsOrder;
    } else {
        var order = 'exit';
    }
    var rank = 0;

    var r1_empty = (!r1.data.item && !r1.data.person && !r1.data.phantom && !r1.data.worker);
    var r2_empty = (!r2.data.item && !r2.data.person && !r2.data.phantom && !r2.data.worker);

    if (r1_empty && r2_empty) {
        order = 'exit';
    } else if (r1_empty || r2_empty) {// empty slots are always shown last
        if (r1_empty) {
            return 1;
        } else {
            return -1;
        }
    }

    // sort by exits
    if (order == 'exit') {
        var r1_exit = r1.data.exit_order;
        var r2_exit = r2.data.exit_order;
        if (Ext.isNumber(r1_exit) || Ext.isNumber(r2_exit)) {
            if (!Ext.isNumber(r1_exit)) {
                rank = 1;
            } else if (!Ext.isNumber(r2_exit)) {
                rank = -1;
            } else {
                if (r1_exit > r2_exit) {
                    rank = 1;
                } else if (r1_exit < r2_exit) {
                    rank = -1;
                } else {// same exit order
                    // sort workers by role order
                    if (r1.data.worker_type && r2.data.worker_type) {
                        var wt1 = Data.workerTypes.getById(r1.data.worker_type);
                        var wt2 = Data.workerTypes.getById(r2.data.worker_type);
                        if (wt1.data.order_index > wt2.data.order_index) {
                            rank = 1;
                        } else if (wt1.data.order_index < wt2.data.order_index) {
                            rank = -1;
                        }
                        // sort no workers by name
                    } else if (!r1.data.worker_type && !r2.data.worker_type) {
                        rank = compare_names(get_name(r1), get_name(r2));
                        // workers after person/phantom
                    } else {
                        rank = r1.data.worker_type ? 1 : -1;
                    }
                }
            }
        }
    } else if (order == 'name') {
        rank = compare_names(get_name(r1), get_name(r2));
    }

    return rank;
}

Sp.lmanager.getTimerLabel = function(m) {
    if (!Ext.isNumber(m)) {
        return '';
    }
    if (m < 60) {
        return m + ' min';
    } else {
        var hours = parseInt(m / 60);
        var minutes = m - (hours * 60);
        var label = hours + ' h &nbsp;';
        if (minutes > 0) {
            label += minutes + ' min';
        }
        return label;
    }
}

Sp.lmanager.checkAccount = function(slotRec, locationRec) {
    var membershipRec = slotRec.membershipRec;
    // membershipRec is present only after adding a person
    // if the ui reloads, the slot record is reloaded.
    // in this case we left the slot as is, the verification has
    // been done prior. The problem is if meanwhile something change
    // in the account or profile... also the slot can easily be removed
    // and readded to redo verifications...
    //
    // when billing mode is set to 'other', no verification on limits is
    // done on the payer. because checking payer would require a trip
    // to the server and will slow the ui, we asume that when setting
    // payement to another person, that person has an infinite credit
    // line

    // try: using the previous problematic and probem fields
    // is case of no membershipRec, since the check account is
    // the last check, if problematic flag is set, it must be
    // related to accounts

    if (!membershipRec) {
        Log('NO membershipRec')
        if (slotRec.data.problematic) {
            Log('USING LAST PB')
            return slotRec.data.problem;
        }
        return;
    }
    var pp = Sp.ui.data.getPersonProfile(membershipRec, locationRec);

    // do no check
    if (pp.billing_mode == 'none') {
        Log('billing mode is none')
        return;
    }

    // check catalog infos
    if (!slotRec.data.item) {
        return TR("No catalog item is set for this slot");
    }
    if (!slotRec.data.element) {
        return TR("No catalog element is set for this slot");
    }
    if (!slotRec.data.price) {
        return TR("No catalog price is set for this slot");
    }

    // get catalog infos
    var item = locationRec.LocationCatalogItems().getById(slotRec.data.item);
    if (!item) {
        return TR("Error: catalog item has been removed !");
    }

    // FIXME: what to do with catalog element ?

    var price = item.LocationCatalogPrices().getById(slotRec.data.price);
    if (!price) {
        return TR("Error: catalog price has been removed !");
    }

    // no more check is done for billing other
    if (pp.billing_mode == 'other') {
        Log('billing mode is other')
        return;
    }

    // person has buyed this item
    if (Sp.ui.data.personHasBuyedItem(membershipRec, slotRec.data.item, slotRec.data.price)) {
        Log('has buyed item')
        return;
    }

    // check balance
    if (Ext.isObject(price.data.currency)) {
        var currency_uuid = price.data.currency.uuid;
    } else {
        var currency_uuid = price.data.currency;
    }
    var balance = Sp.ui.data.getPersonBalance(membershipRec, currency_uuid);
    if (!Ext.isNumber(balance)) {
        balance = 0;
    }
    if (balance >= price.data.price) {
        Log('has > balance')
        return;
    }

    // prepaid check stops here
    if (pp.billing_mode == 'pre') {
        return TR("Insufficient funds");
    }

    // just post billing_mode gets here
    var credit_line = Ext.isNumber(pp.credit_line) ? pp.credit_line : 0;
    if (balance + credit_line < price.data.price) {
        return TR("Credit limit has been exceeded");
    }

    Log('has > credit')
    Log('balance: ' + balance)
    Log('credit: ' + credit_line)
    Log('price: ' + price.data.price)

}

Sp.lmanager.getSlotJumperName = function(slotRec, locationRec) {
    var name = '';
    if (slotRec.data.person){
        name = Sp.ui.misc.formatFullname({data:slotRec.data.person}, Data.me.data.name_order, true);
    } else if (slotRec.data.phantom){
        name = slotRec.data.phantom.name;
    } else if (slotRec.data.worker){
        var worker = locationRec.Workers().getById(slotRec.data.worker);
        if (worker){
            name = worker.data.name;
        }
    }
    return name;
}

Sp.lmanager.getSlotJumpProgram = function(loadRec, slotRec, locationRec) {
    var program = [];
    if (slotRec.data.item && slotRec.data.element){
        var item = locationRec.LocationCatalogItems().getById(slotRec.data.item);
        var element = item.LocationCatalogElements().getById(slotRec.data.element);
        program.push(Ext.String.format('{0}{1}', element.data.altitude, element.data.altitude_unit));
    }
    if (slotRec.data.worker_type){
        program.push(Data.workerTypes.getById(slotRec.data.worker_type).data.label);
    } else if (slotRec.data.jump_type){
        program.push(Data.jumpTypes.getById(slotRec.data.jump_type).data.label);
    }
    if (loadRec && loadRec.data.jumpmaster_slot == slotRec.data.uuid){
        program.push(TR("Jumpmaster"));
    }
    return program.join('&nbsp;-&nbsp;');
}

Sp.lmanager.getSlotsInfos = function(loadRec, locationRec){
    var slots_infos = {};
    var aircraft = locationRec.Aircrafts().getById(loadRec.data.aircraft);
    var slots_store = loadRec.Slots();
    slots_infos.total = aircraft.data.max_slots;
    slots_infos.min = aircraft.data.min_slots;
    slots_infos.created = slots_store.getCount();
    slots_infos.used = 0;
    slots_store.each(function(s){
        if (s.data.related_slot || s.data.person || s.data.phantom || s.data.worker){
            slots_infos.used += 1;
        } else if (slots_store.find('related_slot', s.data.uuid) != -1){
            slots_infos.used += 1;
        }
    });
    slots_infos.free = slots_infos.total-slots_infos.used;
    return slots_infos;
}

Sp.lmanager.getLoadHeader = function(loadRec, locationRec, infos){
    infos = infos || Sp.lmanager.getSlotsInfos(loadRec, locationRec);
    if (infos.used > 0){
        var header_text = infos.used + ' ' + (infos.used > 1 ? TR("Jumpers") : TR("Jumper"));
        var groups_count = 0;
        var solo_count = 0;
        var slots_counts = {};
        var slots_store = loadRec.Slots();
        slots_store.each(function(s){
            if (s.data.related_slot){
                if (!Ext.isDefined(slots_counts[s.data.related_slot])){
                    slots_counts[s.data.related_slot] = 0;
                }
                slots_counts[s.data.related_slot] += 1;
            } else {
                if (!s.data.person && !s.data.phantom && !s.data.worker && slots_store.find('related_slot', s.data.uuid) == -1){
                    return
                }
                if (!Ext.isDefined(slots_counts[s.data.uuid])){
                    slots_counts[s.data.uuid] = 0;
                }
                slots_counts[s.data.uuid] += 1;
            }
        });
        Ext.Object.each(slots_counts, function(k,v){
            if (v > 1){
                groups_count += 1;
            } else {
                solo_count += 1;
            }
        });
        if (groups_count == 0){
            header_text += Ext.String.format("&nbsp;&nbsp;({0})", TR("no Groups"));
        } else {
            if (solo_count > 0){
                header_text += Ext.String.format("&nbsp;&nbsp;({0} {1} - {2} {3})", solo_count,
                                (solo_count > 1 ? TR("Solos"): TR("Solo")), groups_count,
                                (groups_count > 1 ? TR("Groups") : TR("Group")));
            } else {
                header_text += Ext.String.format("&nbsp;&nbsp;({0} {1})", groups_count,
                                (groups_count > 1 ? TR("Groups") : TR("Group")));
            }
        }
    } else {
        var header_text = TR("No Jumpers");
    }
    return header_text;
}

Sp.lmanager.hasClearance = function(locationRec, person_uuid) {
    var clr;
    locationRec.Clearances().each(function(c){
        if (c.data.person && c.data.person.uuid == person_uuid){
            clr = c;
            return false;
        }
    });
    if (clr && clr.data.approved){
        var p = Sp.ui.misc.getClearancePeriod(clr);
        if (p.end_date){
            return Ext.Date.between(new Date(), p.start_date, p.end_date);
        } else {
            return Ext.Date.isEqual(Ext.Date.clearTime(new Date()), Ext.Date.clearTime(p.start_date, true));
        }
        
    }
}

Sp.lmanager.getLoadWeight = function(locationRec, loadRec) {
    return '0 Kg';
}
