# -*- coding: utf-8 -*-

from django.db import models
import base
from choices import *

class Notification(base.Model):
    show_created = True
    
    type = models.CharField(max_length=32)
    text = models.CharField(max_length=200)
    text2 = models.CharField(max_length=200, blank=True, null=True)
    text3 = models.CharField(max_length=200, blank=True, null=True)
    picture = models.TextField(blank=True, null=True)
    new = models.BooleanField(default=True)
    
    class Meta:
        ordering = ["-created"]
