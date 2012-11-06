#!/usr/bin/env python

import os
import sys
import base64
import cPickle
import imp
import pprint
import hashlib

try: data = cPickle.loads(base64.b64decode(sys.argv[1]))
except: sys.exit(1)

settings_file = '/opt/skyproc/data_server/data_server/settings.py'
settings = imp.load_source('settings', settings_file)

try: settings.SP_HOME_URL = str(data['home_url'])
except: pass
try: settings.GOOGLE_MAPS_API_KEY = str(data['gmap_api_key'])
except: pass
try: settings.GEONAMES_USER = str(data['geonames_user'])
except: pass
try: settings.CAPTCHA_PUB_KEY = str(data['captcha_pubkey'])
except: pass
try: settings.CAPTCHA_KEY = str(data['captcha_prikey'])
except: pass
try: settings.ALLOW_SELF_REGISTERING = data['allow_self_reg']
except: pass
try: settings.REQUIRE_EMAIL = data['require_email']
except: pass
try: settings.CONFIRM_EMAIL = data['confirm_email']
except: pass
try: settings.EMAIL_HOST = str(data['email_host'])
except: pass
try: settings.EMAIL_PORT = int(data['email_port'])
except: pass
try: settings.EMAIL_USE_TLS = data['email_use_tls']
except: pass
try: settings.EMAIL_HOST_USER = str(data['email_user'])
except: pass
try: settings.EMAIL_HOST_PASSWORD = data['email_passwd']
except: pass
try: settings.SENDER_EMAIL = data['email_sender']
except: pass

f = open('/opt/skyproc/www/js/captcha.js', 'w')
if settings.CAPTCHA_PUB_KEY:
    f.write('reCAPTCHA_PK = "%s";' % settings.CAPTCHA_PUB_KEY)
else:
    f.write('//reCAPTCHA_PK = "";')
f.close()

if data['admin_passwd'] and data['confirm_passwd'] and data['admin_passwd'] == data['confirm_passwd']:
    f = open('/opt/skyproc/var/digest_pw', 'w')
    f.write("skyproc:SVA Admin:" + hashlib.md5("skyproc:SVA Admin:%s" % data['admin_passwd']).hexdigest())
    f.close()

# write file
params = []
for i in dir(settings):
    if not i.startswith('__'):
        params.append(i)
params.sort()
f = open(settings_file, 'w')
for i in params:
    f.write("%s = %s\n" % (i, pprint.pformat(getattr(settings, i))))
f.close()
os.system("rm -f %sc >/dev/null 2>&1" % settings_file)
# set perms
os.system("chown root.daemon %s" % settings_file)
os.system("chmod 640 %s" % settings_file)

# reload apache
os.system("/opt/bitnami/apache2/bin/apachectl -k restart")
