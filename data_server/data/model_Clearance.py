# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class Clearance(base.Model):
    ignore_unexistant_delete = True
    immediate_delete = True
    
    relations = 'Person'
    
    related_field = 'person'
    related_fields = '+all'
    related_relations = 'Location'
    
    location = models.ForeignKey('Location')
    person = models.ForeignKey('Person')
    
    approved = models.BooleanField(default=False)
    new_approval = models.BooleanField(default=True)
    
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    unit = models.CharField(max_length=1, choices=PERIOD_UNITS, default='d')

    class Meta:
        unique_together = ('location', 'person')
        ordering = ["created"]
        
    def save(self, *args, **kwargs):
        # receive clearance request
        if self.owner != self.location.owner:
            self.owner = self.location.owner
            self.approved = False
        super(Clearance, self).save(*args, **kwargs)
