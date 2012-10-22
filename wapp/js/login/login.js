
$(document).ready(function(){
                
    //* boxes animation
    form_wrapper = $('.login_box');
    function boxHeight() {
        form_wrapper.animate({ marginTop : ( - ( form_wrapper.height() / 2) - 24) },400);   
    };
    
    form_wrapper.css({ marginTop : ( - ( form_wrapper.height() / 2) - 24) });
    $('#login').find('#email').select();
    
    if (typeof(reCAPTCHA_PK) == 'undefined' || !reCAPTCHA_PK){
        $('#register').find('#captcha').hide();    
    }
    
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
                    'height': '',
                });
                if (target == '#login'){
                    $('#login').find('#email').select();
                } else if (target == '#register'){
                    if (typeof(reCAPTCHA_PK) != 'undefined' && reCAPTCHA_PK){
                        Recaptcha.create(reCAPTCHA_PK, "captcha", {
                            theme: 'white',
                        });    
                    }
                    $('#register').find('#r_fullname').select();
                } else if (target == '#reset_password'){
                    $('#reset_password').find('#s_email').select();
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
            r_password: { required: true, minlength: 6 },
            confirm_password: { required: true, minlength: 6, equalTo: "#r_password" },
            recaptcha_response_field: { required: true },
        },
        messages: {
            r_fullname: "Please enter your name",
            r_email: "Please enter your email address",
            r_password: {
                required: "Please provide a password",
                minlength: "Password must be at least 6 characters long"
            },
            confirm_password: {
                required: "Please enter the password confirmation",
                minlength: "Password must be at least 6 characters long",
                equalTo: "The passwords you entered are different"
            },
            recaptcha_response_field: {
                required: null,
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
    
    $('#reset_pwd').validate({
        onkeyup: false,
        errorClass: 'error',
        validClass: 'valid',
        rules: {
            password: { required: true, minlength: 6 },
            confirm_password: { required: true, minlength: 6, equalTo: "#password" },
        },
        messages: {
            password: {
                required: "Please provide a password",
                minlength: "Password must be at least 6 characters long"
            },
            confirm_password: {
                required: "Please enter the password confirmation",
                minlength: "Password must be at least 6 characters long",
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
});


function disableSubmitButton(fields) {
    fields = fields || [];
    var form = form_wrapper.find('form:visible');
    var submit_bt = form.find(':submit');
    submit_bt.attr("disabled", true);
    submit_bt.css('cursor', 'wait');
    $('body').css('cursor', 'wait');
    for (var i=0,f ; f=fields[i] ; i++){
        f = form.find(f);
        if (f){
            f.attr("disabled", true);
            f.css('cursor', 'wait');
        }
    }    
}

function login() {
    // form validation
    if (!$('#login').valid()){
        return false;
    }
    // login
    var srp = new SRP();
    srp.setBusy(true);
    srp.identify();
    return false;
}

function register() {
    // form validation
    if (!$('#register').valid()){
        return false;
    }
    // register
    var srp = new SRP(true);
    srp.setBusy(true);
    srp.register();
    return false;
}



function doRegister(srp){
    xhr = srp.getxhr();
    if(xhr.readyState == 4 && xhr.status == 200) {
        if (xhr.responseText.length == 0){
            srp.register();
        } else {
            Recaptcha.reload();
            srp.setBusy(false);
        }
    }
}

function reset_pwd() {
    // form validation
    if (!$('#reset_pwd').valid()){
        return false;
    }
    disableSubmitButton(['#password', '#confirm_password']);
    var srp = new SRP(null, {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        change_password: true, 
        callback: function(success){
            window.location = success === true ? '/password-reset-succeeded/' : '/';
        },
    });
    srp.register();
    return false;
}
