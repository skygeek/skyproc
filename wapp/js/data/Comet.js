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

Ext.define('Sp.data.Comet', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function (config) {
        this.mixins.observable.constructor.call(this, config);
        this.addEvents('datachanged');
        this.ready = false;
        this.queue = [];
    },
    
    setReady: function(ready){
        this.ready = ready;
        if (ready && this.queue.length > 0){
            for (var i=0,m ; m = this.queue[i] ; i++){
                this.processMessage(m);
            }           
        }
        this.queue = [];
    },
    
    processMessage: function(message){
        if (!this.ready){
            this.queue.push(message);
            return;
        }
        Log('Comet message :')
        Log(message)
        if (message.type == 'datachanged'){
            this.processDataChange(message.data)
        }
    },
    
    processDataChange: function(data){
        var op = data.operation;
        var custom_handler = 'on' + data.model + op.substr(0,1).toUpperCase() + op.substr(1,op.length-1);
        var model_handler = 'on' + data.model + 'Change';
        var fire_event = true;
        if (this[custom_handler]){
            fire_event = this[custom_handler](data);
        } else if (this[model_handler]){
            fire_event = this[model_handler](data);
        }
        if (fire_event !== false){
            this.fireEvent('datachanged', data);
        }
    },
    
    // CUSTOM //////////////////////////////////////////////
    
    onNotificationCreate: function(data){
        Data.load('Notification', data.uuid, function(rec){
            Data.notifications.add(rec);
        });
    },
    
    onLocationMembershipChange: function(data){
        var idx, r;
        var stores = [Data.memberships, Data.newRequests, Data.newRequestsList];
        var extra_stores = [];      
        var model_name = Data.getModelName('LocationMembership');
        Ext.StoreManager.each(function(s){
            if (s.model.$className == model_name){
                if (stores.indexOf(s) == -1){
                    stores.push(s);                 
                }
                extra_stores.push(s);
            }           
        });
        
        if (data.operation == 'delete'){
            for (var i = 0,s ; s = stores[i] ; i++){
                idx = s.findExact('uuid', data.uuid);
                if (idx != -1){
                    s.removeAt(idx);
                }
            }
        } else {
            Data.load('LocationMembership', data.uuid, function(rec){
                // received new request
                if (data.operation == 'create'){
                    Data.memberships.add(rec);
                    if (rec.data.approved === false){
                        Data.newRequests.add(rec);
                        Data.newRequestsList.loadRawData(Sp.ui.data.getNewRequestListItem(rec), true);
                    }
                    for (var i = 0,s ; s = extra_stores[i] ; i++){
                        s.add(rec);
                    }
                }
                // invitation got confirmed
                if (data.operation == 'update' && rec.data.approved == true && rec.data.new_approval == true){
                    rec.beginEdit();
                    rec.set('new_approval', false);
                    rec.endEdit();
                    rec.save();
                    for (var i = 0,s ; s = stores[i] ; i++){
                        r = s.getById(data.uuid);
                        if (r){
                            r.beginEdit();
                            r.set('approved', true);
                            r.set('new_approval', false);
                            r.endEdit();
                            r.commit();
                        }
                    }
                }
            })
        }
    },
    
    onLocationMembership_RChange: function(data){
        var location_uuid;
        if (data.operation == 'delete'){
            var idx, location_uuid;
            var stores = [Data.memberships, Data.newInvites, Data.newRequestsList];
            var r = Data.memberships.getById(data.uuid);
            if (r){
                location_uuid = r.getLocation().data.uuid;
            }
            for (var i = 0,s ; s = stores[i] ; i++){
                idx = s.findExact('uuid', data.uuid);
                if (idx != -1){
                    s.removeAt(idx);
                }
            }
            var r = Data.memberships.getById(data.uuid);
            if (location_uuid){
                Sp.ui.misc.updateLocationView(location_uuid);
            }
        } else {
            Data.load('LocationMembership_R', data.uuid, function(rec){
                // received new invitation
                if (data.operation == 'create' && rec.data.approved == false){
                    Data.memberships.add(rec);
                    Data.newInvites.add(rec);
                    Data.newRequestsList.loadRawData(Sp.ui.data.getNewInviteListItem(rec), true);
                }
                // join request got confirmed
                if (data.operation == 'update' && rec.data.approved == true && rec.data.new_approval == true){
                    Sp.utils.rpc('membership.ackInvitation', [data.uuid]);                  
                    var r = Data.memberships.getById(data.uuid);
                    if (r){
                        r.beginEdit();
                        r.set('approved', true);
                        r.set('new_approval', false);
                        r.endEdit();
                        r.commit();
                    }
                }
                Sp.ui.misc.updateLocationView(rec.getLocation().data.uuid);
            });
        }
    },
    
    onClearanceChange: function(data){
        if (data.operation == 'delete'){
            Data.locations.each(function(l){
                var s = l.Clearances();
                var r = s.getById(data.uuid);
                if (r){
                    s.remove(r);
                    return false;
                }
            });
            var idx = Data.newRequestsList.findExact('uuid', data.uuid);
            if (idx != -1){
                Data.newRequestsList.removeAt(idx);
            }
        } else {
            Data.load('Clearance', data.uuid, function(rec){
                // received new request
                if (data.operation == 'create' && rec.data.approved == false){
                    var l = Data.locations.getById(rec.data.location);
                    if (l){
                        l.Clearances().add(rec);
                    }
                    Data.newRequestsList.loadRawData(Sp.ui.data.getNewClearanceListItem(rec), true);
                }
            });
        }
    },
    
    onClearance_RChange: function(data){
        if (data.operation == 'delete'){
            var clearance = Data.clearances.getById(data.uuid);
            if (clearance){
                Data.clearances.remove(clearance);
                Sp.ui.misc.updateLocationView(clearance.getLocation().data.uuid);
            }
        } else {
            Data.load('Clearance_R', data.uuid, function(rec){
                if (data.operation == 'create'){
                    Data.clearances.add(rec);
                    Sp.ui.misc.updateLocationView(rec.getLocation().data.uuid);
                }
                if (data.operation == 'update' && rec.data.approved == true){
                    var r = Data.clearances.getById(data.uuid);
                    if (r){
                        r.beginEdit();
                        r.set('approved', true);
                        r.endEdit();
                        r.commit();
                    }
                    Sp.ui.misc.updateLocationView(rec.getLocation().data.uuid);
                }
            });
        }
    },
    
    getCalendarStore: function(resaRec){
        return Data.calendarStores[resaRec.data.location];
    },
    
    onReservationCreate: function(data){
        Data.load('Reservation', data.uuid, function(rec){
            Data.reservations.add(rec);
            var store = this.getCalendarStore(rec);
            if (store){
                var r = Ext.create('Extensible.calendar.data.EventModel', rec.data);
                r.phantom = false;
                store.add(r);
                Sp.ui.misc.updateCalendarView(rec.data.location);   
            }
        }, this);
    },
    
    onReservationUpdate: function(data){
        Data.load('Reservation', data.uuid, function(rec){
            var r;
            r = Data.reservations.getById(data.uuid);
            if (r){
                Data.reservations.remove(r);
                Data.reservations.add(rec);
            }
            var store = this.getCalendarStore(rec);
            if (store){
                r = store.findRecord('uuid', data.uuid);
                if (r){
                    r.beginEdit();
                    r.set(rec.data);
                    r.endEdit();
                    r.commit();
                    Sp.ui.misc.updateCalendarView(rec.data.location);
                }
            }
        }, this);
    },
    
    onReservationDelete: function(data){
        var r;
        r = Data.reservations.getById(data.uuid);
        if (r){
            Data.reservations.remove(r);
            var store = this.getCalendarStore(r);
            if (store){
                r = store.findRecord('uuid', data.uuid);
                if (r){
                    store.remove(r);
                    Sp.ui.misc.updateCalendarView(r.data.location);
                }
            }
        }
        
    },
    
    /*
     * Lift manager
     */
    
    notifyPlanner: function(location_uuid, record, operation){
        var planner = Sp.app.vp.down(Ext.String.format('#{0}-planner', location_uuid));
        if (planner){
            planner.onCometMessage(record, operation);
        }
    },
    
    onLoadCreate: function(data){
        if (!Sp.app.isOp()){
            return;
        }
        Data.load('Load', data.uuid, function(rec){
            var location = Data.locations.getById(rec.data.location);
            if (location){
                location.Loads().add(rec);
                this.notifyPlanner(location.data.uuid, rec, 'create');
            }
        }, this);
    },
    
    onLoadUpdate: function(data){
        if (!Sp.app.isOp()){
            return;
        }
        Data.load('Load', data.uuid, function(rec){
            var location = Data.locations.getById(rec.data.location);
            if (location){
                var store = location.Loads();
                var load = store.getById(data.uuid);
                if (load){
                    load.set(rec.data);
                    load.commit();
                    store.fireEvent('datachanged', store);
                    this.notifyPlanner(location.data.uuid, rec, 'update');
                }
            }
        }, this);
    },
    
    onLoadDelete: function(data){
        if (!Sp.app.isOp()){
            return;
        }
        Data.locations.each(function(location){
            var store = location.Loads();
            var load = store.getById(data.uuid);
            if (load){
                store.remove(load, true);
                this.notifyPlanner(load.data.location, load, 'destroy');
                return false;
            }
        }, this);
    },
    
    onSlotCreate: function(data){
        if (!Sp.app.isOp()){
            return;
        }
        Data.load('Slot', data.uuid, function(rec){
            var load = Sp.utils.findLoad(rec.data.load);
            if (load){
                load.Slots().add(rec);
                this.notifyPlanner(load.data.location, rec, 'create');
            }
        }, this);
    },
    
    onSlotUpdate: function(data){
        if (!Sp.app.isOp()){
            return;
        }
        Data.load('Slot', data.uuid, function(rec){
            var load = Sp.utils.findLoad(rec.data.load);
            if (load){
                var slot = load.Slots().getById(data.uuid);
                if (slot){
                    slot.set(rec.data);
                    slot.commit();
                    this.notifyPlanner(load.data.location, rec, 'update');
                }
            }
        }, this);
    },
    
    onSlotDelete: function(data){
        if (!Sp.app.isOp()){
            return;
        }
        var found = false;
        Data.locations.each(function(location){
            location.Loads().each(function(load){
                var store = load.Slots();
                var slot = store.getById(data.uuid);
                if (slot){
                    store.remove(slot, true);
                    this.notifyPlanner(location.data.uuid, slot, 'destroy');
                    found = true;
                    return false;
                }
            }, this);
            if (found){
                return false;
            }
        }, this);
    },
    
});
