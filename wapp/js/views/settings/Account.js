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

Ext.define('Sp.views.settings.Account', {
    extend: 'Sp.ui.SettingsForm',
        
    initComponent: function() {
        
        Ext.apply(this, {
            
            items: [
                {
                    xtype: 'label',
                    text: this.title,
                    cls: 'page-top-title',
                    
                },
                {
                    xtype:'fieldset',
                    title: Ext.String.format(TR("{0} user's profiles"), Sp.core.Globals.BRAND),
                    defaults: {
                        anchor: '100%'
                    },
                    items:[
                        {
                            name: 'is_consumer',
                            xtype: 'checkbox',
                            boxLabel: TR("I'm a fun skydiver"),
                        },
                        /*{
                            name: 'is_pro_jumper',
                            xtype: 'checkbox',
                            boxLabel: TR("I'm a professional skydiver"),
                            cls: 'disabled-text',
                        },*/
                        {
                            name: 'is_dz_operator',
                            xtype: 'checkbox',
                            boxLabel: TR("I'm operating a dropzone"),
                        },
                        /*{
                            name: 'is_tn_operator',
                            xtype: 'checkbox',
                            boxLabel: TR("I'm operating a wind tunnel"),
                            cls: 'disabled-text',
                        },*/
                    ],
                },
                {
                    xtype:'fieldset',
                    title: Sp.app.additional_data.require_email ? TR("Email & Password") : TR("Account password"),
                    defaults: {
                        anchor: '100%'
                    },
                    items:[
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: TR("Current email address"),
                            labelWidth: 145,
                            hideLabel: !Sp.app.additional_data.require_email,
                            layout: {
                                type: 'hbox',
                            },
                            items: [
                                {
                                    xtype: 'textfield',
                                    itemId: 'currentEmail',
                                    readOnly: true,
                                    width: 290,
                                    value: Sp.app.getUsername(),
                                    hidden: !Sp.app.additional_data.require_email,
                                },
                                {
                                    xtype: 'button',
                                    text: TR("Change email address"),
                                    icon: '/static/images/icons/mail.png',
                                    margin: '0 0 0 12',
                                    hidden: !Sp.app.additional_data.require_email,
                                    handler: function(){
                                        var currentEmail = this.down('#currentEmail');
                                        Sp.ui.misc.passwordAction(function(p){
                                            Ext.create('Sp.views.settings.ChangeEmail', {
                                                p: p,
                                                currentEmail: currentEmail,
                                            }).show();
                                        }, null, TR("Please type your current password"));
                                    },
                                    scope: this,
                                },
                                {
                                    xtype: 'button',
                                    text: TR("Change password"),
                                    icon: '/static/images/icons/password.png',
                                    margin: '0 0 0 8',
                                    handler: function(){
                                        Sp.ui.misc.passwordAction(function(c){
                                            Ext.create('Sp.views.settings.ChangePassword', {c:c}).show();
                                        }, null, TR("Please type your current password"));
                                    },
                                    scope: this,
                                },
                            ],
                        },
                    ],
                },
            ],
            
        });
        
        this.callParent(arguments);
        
        // load form
        this.form.loadRecord(Data.me);
        
    },
    
    save: function(){
        /*var profile_changed = (this.form.findField('is_consumer').getValue() != Sp.app.isCm() 
                                || this.form.findField('is_dz_operator').getValue() != Sp.app.isDzOp() 
                                || this.form.findField('is_tn_operator').getValue() != Sp.app.isTnOp());*/
        var profile_changed = (this.form.findField('is_consumer').getValue() != Sp.app.isCm() 
                                || this.form.findField('is_dz_operator').getValue() != Sp.app.isDzOp());
        if (profile_changed){
            this.callParent([false, true]);
            Ext.MessageBox.confirm(TR("Profile change"), 
                Ext.String.format(
                    TR("To apply the profile change, {0} must be reinitialized.<br/>Do you want to reinitialise now ?"), 
                    Sp.core.Globals.BRAND
                ),
                function(btn){
                    if (btn == 'yes'){
                        Sp.app.buildInterface(true);
                    }
                }
            );
        } else {
            this.callParent();
        }
    },
    
});
