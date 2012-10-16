from django.conf.urls import patterns, include, url
import srp.views
from utils import auth

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    # admin
    (r'^admin/', include(admin.site.urls)),

    # wapp
    (r'^$', 'ui.views.login'),
    (r'^prod/$', 'ui.views.prod'), # prod test
    (r'^rpc/(?P<rpc_path>.*$)', 'rpc.__dispatcher__.dispatch'), # rpc dispatcher
    (r'^data/(?P<data_path>.*$)', 'data.__dispatcher__.dispatch'), # data dispatcher
    
    # SRP urls
    (r'^handshake/$', srp.views.handshake),
    (r'^authenticate/$', srp.views.verify),
    (r'^register/validate/$', 'ui.views.validate_registration'),
    (r'^register/salt/$', srp.views.register_salt),
    (r'^register/user/$', srp.views.register_user),
    (r'^alter/salt/$', srp.views.alter_salt),
    (r'^alter/user/$', srp.views.alter_user),
    
    # post registration confirmation message
    (r'^registration-succeeded/$', 'ui.views.registration_succeeded'),
    
    
    # post registration confirmation message
    (r'^password-reset-succeeded/$', 'ui.views.password_reset_succeeded'),
    
    # validate email link
    (r'^validate/email/(?P<validation_link>.*$)', 'ui.views.validate_email'), 
    
    # reset pwd, POST: reset form ; GET: new password form
    (r'^reset/password/(?P<reset_link>.*$)', 'ui.views.reset_password'),
    
    # logout url
    (r'^logout/$', 'ui.views.logout'),
    
    # session id validation url (internal: used only by comet server)
    (r'^session/(?P<session_id>.*$)', auth.validate_session_id),
    
    # cron jobs
    (r'^weather-update/$', 'ui.views.weather_update'),
)
