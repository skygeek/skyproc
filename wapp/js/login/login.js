
$(document).ready(function(){
                
    //* boxes animation
    form_wrapper = $('.login_box');
    function boxHeight() {
        form_wrapper.animate({ marginTop : ( - ( form_wrapper.height() / 2) - 24) },400);   
    };
    form_wrapper.css({ marginTop : ( - ( form_wrapper.height() / 2) - 24) });
    $('.linkform a,.link_reg a').on('click',function(e){
        var target  = $(this).attr('href'),
            target_height = $(target).actual('height');
        $(form_wrapper).css({
            'height'        : form_wrapper.height()
        }); 
        $(form_wrapper.find('form:visible')).fadeOut(400,function(){
            form_wrapper.stop().animate({
                height   : target_height,
                marginTop: ( - (target_height/2) - 24)
            },500,function(){
                $(target).fadeIn(400);
                $('.links_btm .linkform').toggle();
                $(form_wrapper).css({
                    'height'        : ''
                }); 
                if (target == '#register'){                               
                   Recaptcha.create("6LeUg9cSAAAAAGY1_FuDoKgtUAXWUoY2do5sqTAa", "captcha", {
                       theme: 'white',
                   });
                }
            });
        });
        e.preventDefault();
    });
    
    //* validation
    $('#login').validate({
        onkeyup: false,
        errorClass: 'error',
        validClass: 'valid',
        rules: {
            email: { required: true, email: true },
            password: { required: true },
        },
        messages: {
            email: "Please enter your email address",
            password: "Please enter your password",
        },
        highlight: function(element) {
            $(element).closest('div').addClass("f_error");
            setTimeout(function() {
                boxHeight()
            }, 200)
        },
        unhighlight: function(element) {
            $(element).closest('div').removeClass("f_error");
            setTimeout(function() {
                boxHeight()
            }, 200)
        },
        errorPlacement: function(error, element) {
            $(element).closest('div').append(error);
        }
    });
    
    $('#register').validate({
        onkeyup: false,
        errorClass: 'error',
        validClass: 'valid',
        rules: {
            r_fullname: { required: true },
            r_email: { required: true, email: true },
            r_password: { required: true, minlength: 5 },
            confirm_password: { required: true, minlength: 5, equalTo: "#r_password" },
        },
        messages: {
            r_fullname: "Please enter your name",
            r_email: "Please enter your email address",
            r_password: {
                required: "Please provide a password",
                minlength: "Password must be at least 5 characters long"
            },
            confirm_password: {
                required: "Please enter the password confirmation",
                minlength: "Password must be at least 5 characters long",
                equalTo: "The passwords you entered are different"
            },
        },
        highlight: function(element) {
            $(element).closest('div').addClass("f_error");
            setTimeout(function() {
                boxHeight()
            }, 200)
        },
        unhighlight: function(element) {
            $(element).closest('div').removeClass("f_error");
            setTimeout(function() {
                boxHeight()
            }, 200)
        },
        errorPlacement: function(error, element) {
            $(element).closest('div').append(error);
        }
    });
    
    $('#reset_password').validate({
        onkeyup: false,
        errorClass: 'error',
        validClass: 'valid',
        rules: {
            s_email: { required: true, email: true },
        },
        messages: {
            s_email: "Please enter your email address",
        },
        highlight: function(element) {
            $(element).closest('div').addClass("f_error");
            setTimeout(function() {
                boxHeight()
            }, 200)
        },
        unhighlight: function(element) {
            $(element).closest('div').removeClass("f_error");
            setTimeout(function() {
                boxHeight()
            }, 200)
        },
        errorPlacement: function(error, element) {
            $(element).closest('div').append(error);
        }
    });
});

function login() {
    // form validation
    if (!$('#login').valid()){
        return;
    }
    // login
    srp = new SRP();
    srp.identify();
    return false;
}

function register() {
    // form validation
    if (!$('#register').valid()){
        return;
    }
    var srp = new SRP(true);
    // registration validation
    var params = '';
    params += "email="+encodeURIComponent(document.getElementById("r_email").value);
    params += "&challenge="+encodeURIComponent(Recaptcha.get_challenge());
    params += "&response="+encodeURIComponent(Recaptcha.get_response());
    srp.ajaxRequest("/register/validate/", params, doRegister.bind(this, srp));
    return false;
}

function doRegister(srp){
    xhr = srp.getxhr();
    if(xhr.readyState == 4 && xhr.status == 200) {
        if (xhr.responseText.length == 0){
            srp.register();
        // FIXME: complete error handling: duplicate email and err msg display
        } else {
            Recaptcha.reload();
        }
    }
}
