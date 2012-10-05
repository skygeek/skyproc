# -*- coding: utf-8 -*-

from django.db import models
from django.db.models import F
import base
from choices import *

class Account(base.Model):
    
    relations = 'AccountOperation'
    
    membership = models.ForeignKey('LocationMembership')
    currency = models.ForeignKey('Currency')
    balance = models.IntegerField(default=0)
    
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
    amount = models.IntegerField()
    note = models.CharField(max_length=200, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        super(AccountOperation, self).save(*args, **kwargs) 
        if kwargs.has_key('force_insert') and kwargs['force_insert']:
            if self.type in ('D', 'C'):
                self.account.balance = F('balance') + self.amount
            elif self.type == 'B':
                self.account.balance = F('balance') - self.amount
            self.account.balance_update = True
            self.account.save()
        
class BuyedItem(base.Model):
    show_created = True
    
    relations = None
    
    membership = models.ForeignKey('LocationMembership')
    
    item = models.ForeignKey('LocationCatalogItem')
    price = models.ForeignKey('LocationCatalogPrice')
    
    consumed = models.BooleanField(default=False)
    consuming = models.BooleanField(default=False)
    usage_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ["created"]

    def save(self, *args, **kwargs):
        super(BuyedItem, self).save(*args, **kwargs) 
        if (kwargs.has_key('force_insert') and kwargs['force_insert']) or self.deleted:
            account = Account.objects.get(membership=self.membership, currency=self.price.currency)
            action = 'Refund' if self.deleted else 'Buyed'
            AccountOperation.objects.create(owner=self.owner, account=account, 
                                            type='C' if self.deleted else 'B', amount=self.price.price,
                                            note="%s '%s'" % (action, self.item.name))

