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

Ext.define('Sp.views.settings.ChangePassword', {
    extend: 'Ext.window.Window',
    
    initComponent: function() {
                
        Ext.apply(this, {
            width: 320,
            height: 130,
            modal: true,
            resizable: false,
            disableWhatsThis: true,
            title: TR("Set a new password"),
            icon: '/static/images/icons/password.png',
            layout: 'fit',
            items: [
                {
                    xtype: 'form',
                    itemId: 'form',
                    border: 0,
                    margin: Sp.core.Globals.WINDOW_MARGIN,
                    defaults: {
                        xtype: 'textfield',
                        anchor: '100%',
                        inputType: 'password',
                        allowBlank: false,
                        minLength: 6,
                    },
                    items: [
                        {
                            name: 'passwd',
                            itemId: 'passwd',
                            fieldLabel: TR("New password"),
                        },
                        {
                            name: 'confirm',
                            itemId: 'confirm',
                            fieldLabel: TR("Confirmation"),
                            validator: Ext.bind(function(val){
                                if (!val){
                                    return true;
                                }
                                if (val == this.down('#passwd').getValue()){
                                    return true;
                                } else {
                                    return TR("The passwords you entered are different");
                                }
                            }, this),
                        }
                    ],
                }
            ],
            
            buttons: [
                {
                    text: TR("Change password"),
                    itemId: 'changeBt',
                    icon: '/static/images/icons/save.png',
                    handler: this.changePassword,
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
        });
 
        this.callParent(arguments);
    },
        
    changePassword: function(){
        var form = this.down('#form').form;
        if (!form.isValid()){
            return;
        }
        var values = form.getValues();
        if (this.c == values.passwd){
            Sp.ui.misc.warnMsg(TR("The new password you entered is the same as your current password"), TR("Password not changed"));
            return;
        }
        this.down('#changeBt').disable();
        this.down('#cancelBt').disable();
        this.body.mask(TR("Please wait"));
        s = new SRP(null, {
            email: Sp.app.getUsername(),
            password: values.passwd,
            change_password: true,
            csrf: Ext.util.Cookies.get('csrftoken'), 
            callback: Ext.bind(this.onPasswordChanged, this),
        });
        s.register();
    },
    
    onPasswordChanged: function(success, msg){
        if (success){
            delete this.c;
            this.close();
            Sp.ui.misc.okMsg(TR("Your password has been changed"));
        } else {
            this.down('#changeBt').enable();
            this.down('#cancelBt').enable();
            this.body.unmask();
            Sp.ui.misc.errMsg(TR(msg));
        }
    },
    
});
