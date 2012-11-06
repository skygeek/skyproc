
from django import forms
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import context_processors
from django.conf import settings
import os
import base64
import cPickle

class SettingsForm(forms.Form):
    home_url = forms.CharField(max_length=64, required=True, label="Home URL", widget=forms.TextInput(attrs={'size':'52'}))
    gmap_api_key = forms.CharField(max_length=128, required=False, label="Google Maps API Key", widget=forms.TextInput(attrs={'size':'43'}))
    geonames_user = forms.CharField(max_length=64, required=False, label="GeoNames User", widget=forms.TextInput(attrs={'size':'48'}))
    captcha_pubkey = forms.CharField(max_length=128, required=False, label="reCAPTCHA Public Key", widget=forms.TextInput(attrs={'size':'41'}))
    captcha_prikey = forms.CharField(max_length=128, required=False, label="reCAPTCHA Private Key", widget=forms.TextInput(attrs={'size':'40'}))
    allow_self_reg = forms.BooleanField(required=False, label="Allow self registration")
    require_email = forms.BooleanField(required=False, label="Require emails for login")
    confirm_email = forms.BooleanField(required=False, label="Validate emails")
    email_host = forms.CharField(max_length=64, required=False, label="SMTP Host", widget=forms.TextInput(attrs={'size':'41'}))
    email_port = forms.CharField(max_length=5, required=False, label="SMTP Port", widget=forms.TextInput(attrs={'size':'7'}))
    email_use_tls = forms.BooleanField(required=False, label="Use TLS Connection")
    email_user = forms.CharField(max_length=128, required=False, label="SMTP User", widget=forms.TextInput(attrs={'size':'41'}))
    email_passwd = forms.CharField(max_length=128, required=False, label="SMTP Password", widget=forms.TextInput(attrs={'size':'37'}))
    email_sender = forms.CharField(max_length=128, required=False, label="Email Sender", widget=forms.TextInput(attrs={'size':'40'}))
    admin_passwd = forms.CharField(max_length=64, required=False, label="Admin Password", widget=forms.PasswordInput(attrs={'size':'17'}))
    confirm_passwd = forms.CharField(max_length=64, required=False, label="Confirm Password", widget=forms.PasswordInput(attrs={'size':'16'}))
    
    def clean(self):
        cleaned_data = super(SettingsForm, self).clean()
        admin_passwd = cleaned_data.get("admin_passwd")
        confirm_passwd = cleaned_data.get("confirm_passwd")
        if admin_passwd and confirm_passwd and admin_passwd != confirm_passwd:
            self._errors["confirm_passwd"] = self.error_class(["Password mismatch"])
            del cleaned_data["confirm_passwd"]
        return cleaned_data
    
def render_form(req):
    if req.method == 'POST':
        form = SettingsForm(req.POST)
        if form.is_valid():
            data = base64.b64encode(cPickle.dumps(form.cleaned_data))
            os.system('sudo /opt/skyproc/data_server/utils/apply_settings.py "%s" &' % data)
            return HttpResponse("<html><body><h2>Your settings has been saved.</h2></body></html>")
    else:
        initial = {}
        initial['home_url'] = settings.SP_HOME_URL
        try: initial['gmap_api_key'] = settings.GOOGLE_MAPS_API_KEY
        except: pass
        try: initial['geonames_user'] = settings.GEONAMES_USER
        except: pass
        try: initial['captcha_pubkey'] = settings.CAPTCHA_PUB_KEY
        except: pass
        try: initial['captcha_prikey'] = settings.CAPTCHA_KEY
        except: pass
        try: initial['allow_self_reg'] = settings.ALLOW_SELF_REGISTERING
        except: pass
        try: initial['require_email'] = settings.REQUIRE_EMAIL
        except: pass
        try: initial['confirm_email'] = settings.CONFIRM_EMAIL
        except: pass
        try: initial['email_host'] = settings.EMAIL_HOST
        except: pass
        try: initial['email_port'] = settings.EMAIL_PORT
        except: pass
        try: initial['email_use_tls'] = settings.EMAIL_USE_TLS
        except: pass
        try: initial['email_user'] = settings.EMAIL_HOST_USER
        except: pass
        try: initial['email_passwd'] = settings.EMAIL_HOST_PASSWORD
        except: pass
        try: initial['email_sender'] = settings.SENDER_EMAIL
        except: pass
        form = SettingsForm(initial=initial)

    c = context_processors.csrf(req)
    c['form'] = form
    return render_to_response('settings.html', c)
    