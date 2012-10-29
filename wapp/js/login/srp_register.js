function SRP_REGISTER()
{
    var that;

    // Initiate the registration process
    SRP.prototype.register = function()
    {
        that = this;
        var operation = this.getOperation();
        var params = "I="+this.getI();
        var path = (operation && operation.change_password) ? 'alter/salt/' : 'register/salt/';
        if (path == 'register/salt/' && typeof(reCAPTCHA_PK) != 'undefined' && reCAPTCHA_PK){
            params += "&C="+encodeURIComponent(Recaptcha.get_challenge());
            params += "&R="+encodeURIComponent(Recaptcha.get_response());
        }
        this.ajaxRequest(this.geturl() + path, params, this.register_receive_salt);
    };
    
    // Receive the salt for registration
    SRP.prototype.register_receive_salt = function()
    {
        var xhr = that.getxhr();
        if(xhr.readyState == 4 && xhr.status == 200) {
            if(xhr.responseXML.getElementsByTagName("salt").length > 0)
            {
                var s = that.innerxml(xhr.responseXML.getElementsByTagName("salt")[0]);
                var x = that.calcX(s);
                var v = that.getg().modPow(x, that.getN());
                that.register_send_verifier(v.toString(16));
            }
            else if(xhr.responseXML.getElementsByTagName("error").length > 0)
            {
                that.error_message(that.innerxml(xhr.responseXML.getElementsByTagName("error")[0]));
            }
        }
    };
        // Send the verifier to the server
    SRP.prototype.register_send_verifier = function(v)
    {
        var operation = that.getOperation();
        var params = "v="+v;
        try {
            params += "&fullname=" + encodeURIComponent(document.getElementById("r_fullname").value);
        } catch(e){}
        var path = (operation && operation.change_password) ? 'alter/user/' : 'register/user/';
        that.ajaxRequest(that.geturl() + path, params, that.register_user);
    };

    // The user has been registered successfully, now login
    SRP.prototype.register_user = function()
    {
        var xhr = that.getxhr();
        if(xhr.readyState == 4 && xhr.status == 200) {
	        if(xhr.responseXML.getElementsByTagName("ok").length > 0)
	        {
	            var operation = that.getOperation();
	            if (operation && operation.change_password){
	                operation.callback(true);
	            } else {
	                var auto_login = false;
	                try {
	                    var auto_login = document.getElementById("auto_login").value == 1;
	                } catch(e){}
	                if (auto_login){
	                    var s = new SRP(null, {
                            email: document.getElementById("r_email").value,
                            password: document.getElementById("r_password").value, 
                        });
                        s.identify();
	                } else {
	                    window.location = '/registration-succeeded/';
	                }
	            }
            }
            else if(xhr.responseXML.getElementsByTagName("error").length > 0)
            {
                that.error_message(that.innerxml(xhr.responseXML.getElementsByTagName("error")[0]));
            }
        }
    };  
};
SRP_REGISTER();
