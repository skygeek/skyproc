import hashlib
import string
import random
import datetime
from django.db import models
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate
from django.contrib import auth
from srp.models import SRPUser

import utils.auth
from recaptcha.client import captcha


###
### General methods
###

# We need randomly generated salts. This is about 100 bits of entropy.
def generate_salt():   
    randomgen = random.SystemRandom()
    salt_chars = "./" + string.ascii_letters + string.digits
    return "".join([randomgen.choice(salt_chars) for i in range(0,16)])

# We want to avoid information leakage. For users that don't exist, we need salts to be consistent.
# These "fake" salts are seeded with the username and the django secret_key. They're not as random
# as true salts should be, but they should be indistinguishable to a hacker who isn't sure whether
# or not an account exists.
def generate_fake_salt(I):
    random.seed("%s:%s" % (I, settings.SECRET_KEY))
    salt_chars = "./" + string.ascii_letters + string.digits    
    salt = "".join([random.choice(salt_chars) for i in range(0,16)])
    return salt, int(hashlib.sha256("%s:%s" % (salt, settings.SECRET_KEY)).hexdigest(), 16)

def generate_verifier(salt, username, password):
    x = int(hashlib.sha256(salt + hashlib.sha256("%s:%s" % (username, password)).hexdigest()).hexdigest(), 16)
    return hex(pow(2, x, 125617018995153554710546479714086468244499594888726646874671447258204721048803))[2:-1]

###
### User Registration
###

# FIXME: alter_salt can leak information about user existance !
# FIXME: alter_salt must no respond to any request (authentificated and coming from tmp link only)
# FIXME: register_user and alter_user must be called only after successfull call to register_salt/alter_salt

# Step 1. A client submits a username. If the username is available, we generate a salt, store it, and return it.
# Otherwise, we return an error.
def register_salt(request):
    if hasattr(settings, 'ALLOW_SELF_REGISTERING') and not settings.ALLOW_SELF_REGISTERING:
        raise Http404
    if hasattr(settings, 'CAPTCHA_KEY') and settings.CAPTCHA_KEY:
        try:
            result = captcha.submit(request.POST["C"], request.POST["R"], settings.CAPTCHA_KEY, request.META['REMOTE_ADDR'])
            if not result.is_valid: raise Exception
        except:
            return HttpResponse("<error>Invalid captcha</error>", mimetype="text/xml")
    if User.objects.filter(username=request.POST["I"]).count() > 0:
        if hasattr(settings, 'REQUIRE_EMAIL') and settings.REQUIRE_EMAIL:
            error = "This email address is already in use"
        else: error = "This login name is already in use"
        return HttpResponse("<error>%s</error>" % error, mimetype="text/xml")
    request.session["srp_name"] = request.POST["I"]
    request.session["srp_salt"] = generate_salt()
    request.session["srp_phase2"] = True
    return HttpResponse("<salt>%s</salt>" % request.session["srp_salt"], mimetype="text/xml")

def alter_salt(request):
    if hasattr(settings, 'ALLOW_SELF_REGISTERING') and not settings.ALLOW_SELF_REGISTERING:
        raise Http404
    try: srp_phase2 = request.session["srp_phase2"] == True
    except: srp_phase2 = False
    valid = utils.auth.validate_request(request)
    if valid is not True and not srp_phase2:
        raise Http404
    try: User.objects.get(username=request.POST["I"])
    except ObjectDoesNotExist: raise Http404
    request.session["srp_name"] = request.POST["I"]
    request.session["srp_salt"] = generate_salt()
    return HttpResponse("<salt>%s</salt>" % request.session["srp_salt"], mimetype="text/xml")

# Step 2. The client creates the password verifier and sends it to the server, along with a username.
def register_user(request):
    if hasattr(settings, 'ALLOW_SELF_REGISTERING') and not settings.ALLOW_SELF_REGISTERING:
        raise Http404
    try: srp_phase2 = request.session["srp_phase2"] == True
    except: srp_phase2 = False
    if not srp_phase2:
        raise Http404
    u = SRPUser(salt=request.session["srp_salt"], username=request.session["srp_name"], verifier=request.POST["v"])
    u.save()
    utils.auth.register_sp_user(request, u)
    del request.session["srp_salt"]
    del request.session["srp_name"]
    del request.session["srp_phase2"]
    return HttpResponse("<ok/>", mimetype="text/xml")

# alter user password
def alter_user(request):
    if hasattr(settings, 'ALLOW_SELF_REGISTERING') and not settings.ALLOW_SELF_REGISTERING:
        raise Http404
    try: srp_phase2 = request.session["srp_phase2"] == True
    except: srp_phase2 = False
    valid = utils.auth.validate_request(request)
    if valid is not True and not srp_phase2:
        raise Http404
    try: u = SRPUser.objects.get(username=request.session["srp_name"])
    except ObjectDoesNotExist: raise Http404
    u.salt = request.session["srp_salt"]
    u.verifier = request.POST["v"]
    u.save()
    utils.auth.cancel_pwd_reset_request(u)
    # authentificate the user here so he can login right away after password reset
    user = authenticate(username=u.username, M=(None, None))
    login(request, user)
    del request.session["srp_salt"]
    del request.session["srp_name"]
    try: del request.session["srp_phase2"]
    except KeyError: pass
    return HttpResponse("<ok/>", mimetype="text/xml")

# alter user email (when emails are used as usernames)
def alter_email(request):
    if hasattr(settings, 'ALLOW_SELF_REGISTERING') and not settings.ALLOW_SELF_REGISTERING:
        raise Http404
    valid = utils.auth.validate_request(request)
    if valid is not True:
        return valid
    try: u = SRPUser.objects.get(username=request.session["srp_name"])
    except ObjectDoesNotExist: raise Http404
    if User.objects.filter(username=request.POST["I"]).count() > 0:
        return HttpResponse("<error>This email address is already in use</error>", mimetype="text/xml")
    if hasattr(settings, 'CONFIRM_EMAIL') and settings.CONFIRM_EMAIL:
        confirm_data = {}
        confirm_data['person'] = models.get_model(settings.DATA_APP, 'Person').objects.getOwn(u)
        confirm_data['email'] = request.POST["I"]
        confirm_data['srp_salt'] = request.session["srp_salt"]
        confirm_data['srp_verifier'] = request.POST["v"]
        utils.auth.send_confirmation_email(confirm_data)
    else:
        u.username = request.POST["I"]
        u.salt = request.session["srp_salt"]
        u.verifier = request.POST["v"]
        u.save()
        p = models.get_model(settings.DATA_APP, 'Person').objects.getOwn(u)
        p.email = request.POST["I"]
        p.save()
    del request.session["srp_salt"]
    del request.session["srp_name"]
    return HttpResponse("<ok/>", mimetype="text/xml")

# Step 3: The client initiates the login process.

###
### User Login
###

# Step 1: The user sends an identifier and public ephemeral key, A
# The server responds with the salt and public ephemeral key, B
def handshake(request):
    randomgen = random.SystemRandom()
    request.session["srp_I"] = request.POST["I"]
    A = int(request.POST["A"], 16)
    request.session["srp_A"] = request.POST["A"]
    g = 2
    N = 125617018995153554710546479714086468244499594888726646874671447258204721048803
    k = 88846390364205216646376352624313659232912717719075174937149043299744712465496
    if A % N == 0:
        return HttpResponse("<error>Authentication error</error>", mimetype="text/xml")

    try:
        user = User.objects.get(username=request.session["srp_I"]) 
        salt = user.srpuser.salt
        v = int(user.srpuser.verifier, 16)
    # We don't want to leak that the username doesn't exist. Make up a fake salt and verifier.
    except ObjectDoesNotExist:
        salt, x = generate_fake_salt(request.POST["I"])            
        v = pow(g, x, N)
    # Ensure that B%N != 0
    while True:
        b = randomgen.getrandbits(32)
        B = k*v + pow(g,b,N)
        u =  int(hashlib.sha256("%s%s" % (hex(A)[2:-1],hex(B)[2:-1])).hexdigest(), 16)
        if B % N != 0 and u % N != 0: break

    # Ideally, we could return this response and then calculate M concurrently with the user
    # Unfortunately, django isn't designed to do computations after responding.
    # Maybe someone will find a way.
    S = pow(A*pow(v,u,N), b, N)
    request.session["srp_S"] = hex(S)[2:-1]
    Mstr = "%s%s%s" % (hex(A)[2:-1],hex(B)[2:-1],hex(S)[2:-1])
    request.session["srp_M"] = hashlib.sha256(Mstr).hexdigest()
    response = "<r s='%s' B='%s'/>" % (salt, hex(B)[2:-1])
    return HttpResponse(response, mimetype="text/xml")

# Step 2: The client sends its proof of S. The server confirms, and sends its proof of S.    
def verify(request):
    user = authenticate(username=request.session["srp_I"], M=(request.POST["M"], request.session["srp_M"]))
    if user:
        if utils.auth.is_email_verified(user):
            response = "<M>%s</M>" % hashlib.sha256("%s%s%s" % (request.session["srp_A"], request.session["srp_M"], request.session["srp_S"])).hexdigest()
            login(request, user)
            # remember user login (if requested) for 10 days
            if request.POST.has_key('r') and request.POST['r'] == '1':
                request.session.set_expiry(datetime.timedelta(days=10))
            # unlock session
            try: del request.session["locked"]
            except KeyError: pass
        else:
            response = "<error>Email not verified</error>"
    else:
        if hasattr(settings, 'REQUIRE_EMAIL') and settings.REQUIRE_EMAIL:
            response = "<error>Incorrect password or email address</error>"
        else: response = "<error>Incorrect password or login name</error>"
        
    try:
        del request.session["srp_I"]
        del request.session["srp_M"]
        del request.session["srp_S"]
        del request.session["srp_A"]
    except KeyError:
        pass
    return HttpResponse(response, mimetype="text/xml")
