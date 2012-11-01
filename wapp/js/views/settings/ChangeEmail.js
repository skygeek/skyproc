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

Ext.define('Sp.views.settings.ChangeEmail', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
                
        Ext.apply(this, {
            width: 360,
            height: 110,
            modal: true,
            resizable: false,
            disableWhatsThis: true,
            title: TR("Set a new email address"),
            icon: '/static/images/icons/mail.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    border: 0,
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    items: [
                        {
                            name: 'email',
                            itemId: 'email',
                            xtype: 'textfield',
                            anchor: '100%',
                            fieldLabel: TR("New address"),
                            labelWidth: 85,
                            vtype: 'email',
                            allowBlank: false,
                            listeners: {
                                specialkey: function(me, e){
                                    if (e.getKey() == e.ENTER){
                                        this.changeEmail();
                                    }
                                },
                                scope: this,
                            },
                        },
                    ],
                }
            ],
            
            buttons: [
                {
                    text: TR("Set address"),
                    itemId: 'changeBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.changeEmail,
                    scope: this,
                },
                {
                    text: TR("Cancel"),
                    itemId: 'cancelBt',
                    icon: '/static/images/icons/cancel.png',
                    handler: this.close,
                    scope: this,
                },
            ],
            listeners: {
                show: function(){
                    this.down('#email').focus(true, 100);
                },
                scope: this,
            },
        });
 
        this.callParent(arguments);
    },
    
    changeEmail: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        var values = form.getValues();
        if (Sp.app.getUsername() == values.email){
            Sp.ui.misc.warnMsg(TR("The email address you entered is the same as your current one"), TR("Email not changed"));
            return;
        }
        this.down('#changeBt').disable();
        this.down('#cancelBt').disable();
        this.body.mask(TR("Please wait"));
        this.new_email = values.email;
        s = new SRP(null, {
            current_email: Sp.app.getUsername(),
            email: values.email,
            password: this.p,
            change_email: true,
            csrf: Ext.util.Cookies.get('csrftoken'), 
            callback: Ext.bind(this.onEmailChanged, this),
        });
        s.register();
    },
    
    onEmailChanged: function(success, msg){
        if (success){
            delete this.p;
            this.close();
            if (Sp.app.additional_data.confirm_email){
                Sp.ui.misc.okMsg(TR("Please check your new address inbox, you will have received an email containing the link to confirm the change."), 
                                TR("Email change accepted"));
            } else {
                this.currentEmail.setValue(this.new_email);
                Sp.ui.misc.okMsg(TR("Your email address has been changed"));
            }
        } else {
            this.down('#changeBt').enable();
            this.down('#cancelBt').enable();
            this.body.unmask();
            Sp.ui.misc.errMsg(TR(msg));
        }
    },
    
});
