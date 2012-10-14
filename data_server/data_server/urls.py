from django.conf.urls import patterns, include, url
import srp.views
from utils import auth

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    # admin
    url(r'^admin/', include(admin.site.urls)),

    # wapp
    url(r'^$', 'ui.views.login'),
    url(r'^prod/$', 'ui.views.prod'), # prod test
    url(r'^rpc/(?P<rpc_path>.*$)', 'rpc.__dispatcher__.dispatch'), # rpc dispatcher
    url(r'^data/(?P<data_path>.*$)', 'data.__dispatcher__.dispatch'), # data dispatcher
    
    # SRP urls
    (r'^register/validate/$', 'ui.views.validate_registration'),
    (r'^register/salt/$', srp.views.register_salt),
    (r'^register/user/$', srp.views.register_user),
    (r'^handshake/$', srp.views.handshake),
    (r'^authenticate/$', srp.views.verify),
    
    (r'^registration-succeeded/$', 'ui.views.registration_succeeded'),
    (r'^password-reset-succeeded/$', 'ui.views.password_reset_succeeded'),
    
    # logout url
    (r'^logout/$', 'ui.views.logout'),
    
    # session id validation url (internal: used only by comet server)
    url(r'^session/(?P<session_id>.*$)', auth.validate_session_id),
    
    # cron jobs
    (r'^weather-update/$', 'ui.views.weather_update'),
)
