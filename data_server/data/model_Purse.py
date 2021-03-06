# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import F
from django.conf import settings
import base
from choices import *

class Account(base.Model):
    
    relations = 'AccountOperation'
    
    related_fields = '+all'
    
    membership = models.ForeignKey('LocationMembership')
    currency = models.ForeignKey('Currency')
    #balance = models.IntegerField(default=0)
    balance = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    def save(self, *args, **kwargs):
        if not hasattr(self, 'balance_update') or not self.balance_update:
            if kwargs.has_key('force_insert') and kwargs['force_insert']:
                self.balance = 0
            else:
                self.balance = F('balance')
        super(Account, self).save(*args, **kwargs)

class AccountOperation(base.Model):
    show_created = True
    
    account = models.ForeignKey('Account')
    type = models.CharField(max_length=1, choices=ACCOUNT_OPERATIONS)
    #amount = models.IntegerField()
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    note = models.CharField(max_length=200, blank=True, null=True)
    payment_type = models.CharField(max_length=1, choices=PAYMENT_TYPE, default='C')
    payment_id = models.CharField(max_length=200, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super(AccountOperation, self).save(*args, **kwargs) 
        if kwargs.has_key('force_insert') and kwargs['force_insert']:
            # balance update
            if self.type in ('D', 'C'):
                self.account.balance = F('balance') + self.amount
            elif self.type == 'B':
                self.account.balance = F('balance') - self.amount
            self.account.balance_update = True
            self.account.save()
            # person log
            log_data = {}
            log_data['owner'] = self.account.membership.person.uuid
            log_data['location'] = self.account.membership.location.uuid
            log_data['date'] = self.created
            log_data['type'] = self.type
            log_data['amount'] = self.amount
            log_data['currency'] = self.account.currency.code
            log_data['note'] = self.note
            models.get_model(settings.DATA_APP, 'AccountOperationLog').objects.create(**log_data)
            
class BuyedItem(base.Model):
    show_created = True
    
    relations = None
    
    membership = models.ForeignKey('LocationMembership')
    
    item = models.ForeignKey('LocationCatalogItem')
    price = models.ForeignKey('LocationCatalogPrice')
    
    consumed = models.BooleanField(default=False)
    consuming = models.BooleanField(default=False)
    usage_count = models.IntegerField(default=0)
    operation_note_append = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ["created"]

    def save(self, *args, **kwargs):
        super(BuyedItem, self).save(*args, **kwargs) 
        if (kwargs.has_key('force_insert') and kwargs['force_insert']) or self.deleted:
            account = Account.objects.get(membership=self.membership, currency=self.price.currency)
            action = 'Refund' if self.deleted else 'Buyed'
            note = "%s '%s'" % (action, self.item.name)
            if self.operation_note_append:
                note += self.operation_note_append
            AccountOperation.objects.create(owner=self.owner, account=account, 
                                            type='C' if self.deleted else 'B', amount=self.price.price,
                                            note=note)
