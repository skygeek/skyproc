from django.conf.urls import patterns, include, url
import srp.views
from utils import auth

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    # admin
    url(r'^admin/', include(admin.site.urls)),

    # wapp
    url(r'^$', 'ui.views.home'),
    url(r'^prod/$', 'ui.views.prod'), # prod test
    url(r'^rpc/(?P<rpc_path>.*$)', 'rpc.__dispatcher__.dispatch'), # rpc dispatcher
    url(r'^data/(?P<data_path>.*$)', 'data.__dispatcher__.dispatch'), # data dispatcher
    
    # mapp
    url(r'^mobile/$', 'ui.views.mobile'),
    
    # SRP urls
    (r'^register/salt/$', srp.views.register_salt),
    (r'^register/user/$', srp.views.register_user),
    (r'^handshake/$', srp.views.handshake),
    (r'^authenticate/$', srp.views.verify),
    
    # logout url
    (r'^logout/$', 'ui.views.logout'),
    
    # session id validation url (internal: used only by comet server)
    url(r'^session/(?P<session_id>.*$)', auth.validate_session_id),
    
)
