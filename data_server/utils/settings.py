
from django import forms
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.core import context_processors
from django.conf import settings

class SettingsForm(forms.Form):
    home_url = forms.CharField(max_length=64, required=True, label="Home URL", widget=forms.TextInput(attrs={'size':'50'}))
    gmap_api_key = forms.CharField(max_length=128, required=False, label="Google MAPS API Key", widget=forms.TextInput(attrs={'size':'40'}))
    geonames_user = forms.CharField(max_length=64, required=False, label="GeoNames User", widget=forms.TextInput(attrs={'size':'46'}))
    captcha_pubkey = forms.CharField(max_length=128, required=False, label="CAPTCHA Public Key", widget=forms.TextInput(attrs={'size':'41'}))
    captcha_prikey = forms.CharField(max_length=128, required=False, label="CAPTCHA Private Key", widget=forms.TextInput(attrs={'size':'40'}))
    allow_self_reg = forms.BooleanField(required=False, label="Allow self registration")
    require_email = forms.BooleanField(required=False, label="Require emails for login")
    confirm_email = forms.BooleanField(required=False, label="Validate emails")
    email_host = forms.CharField(max_length=64, required=False, label="SMTP Host", widget=forms.TextInput(attrs={'size':'41'}))
    email_port = forms.CharField(max_length=5, required=False, label="SMTP Port", widget=forms.TextInput(attrs={'size':'5'}))
    email_use_tls = forms.BooleanField(required=False, label="Use TLS Connection")
    email_user = forms.CharField(max_length=128, required=False, label="SMTP User", widget=forms.TextInput(attrs={'size':'41'}))
    email_passwd = forms.CharField(max_length=128, required=False, label="SMTP Password", widget=forms.TextInput(attrs={'size':'37'}))
    email_sender = forms.CharField(max_length=128, required=False, label="Email Sender", widget=forms.TextInput(attrs={'size':'40'}))
    admin_passwd = forms.CharField(max_length=64, required=False, label="Admin Password", widget=forms.PasswordInput(attrs={'size':'17'}))
    confirm_passwd = forms.CharField(max_length=64, required=False, label="Confirm Password", widget=forms.PasswordInput(attrs={'size':'16'}))

def render_form(req):
    if req.method == 'POST':
        form = SettingsForm(req.POST)
        if form.is_valid():
            return HttpResponse('OK')
    else:
        initial = {}
        initial['home_url'] = settings.SP_HOME_URL
        try: initial['gmap_api_key'] = settings.GOOGLE_MAPS_API_KEY
        except: pass
        try: initial['geonames_user'] = settings.GEONAMES_USER
        except: pass
        try: initial['captcha_pubkey'] = settings.CAPTCHA_KEY
        except: pass
        try: initial['captcha_prikey'] = 'N/A'
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
    