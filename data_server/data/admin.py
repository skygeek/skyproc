import django.db.models
from django.contrib import admin
import models

map(admin.site.register, django.db.models.get_models(models))
