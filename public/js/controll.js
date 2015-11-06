/**
 * Created by stevezhang on 2015-09-27.
 */


function checkBOD(field){
    var allowBlank = true;
    var minYear    = 1902;
    var maxYear    = (new Date()).getFullYear();
    var errorMsg   = "";

    // Original JavaScript code by Chirp Internet: www.chirp.com.au
    // Please acknowledge use of this code by including this header.

    console.log("max year: "+maxYear);

    re = /^(\d{4})\-(\d{1,2})\-(\d{1,2})$/;
    if (field.value != ''){
        if(regs = field.value.match(re)) {
            if (regs[3] < 1 || regs[3] > 31) {
                errorMsg = "请输入正确格式的日期 1-31: " + regs[3];
            }else if(regs[2] < 1 || regs[2] > 12) {
                errorMsg = "请输入正确格式的月份 1-12: " + regs[2];
            }else if(regs[1] < minYear || regs[1] > maxYear) {
                errorMsg = "请输入真实出身年份: " + regs[1] + " - 下限 " + minYear + " 上限 " + maxYear;
            }
        } else {
            errorMsg = "请输入正确的年月日格式: " + field.value;
        }
    } else if(!allowBlank) {
        errorMsg = "出身日期必须填写";
    }

    if(errorMsg != "") {
        alert(errorMsg);
        field.focus();
        return false;
    }
    return true;
}

$("#signupForm").submit(function(event){
    event.preventDefault();
    // Get some values from elements on the page:
    var $form = $( this ),
        name        = $("#sign-up__name").val(),
        username    = $("#sign-up__username").val(),
        email       = $("#sign-up__email").val(),
        password    = $("#sign-up__password").val(),
        passwordR   = $("#sign-up__password_repeat").val(),
        address     = $("#sign-up__address").val(),
        phone       = $("#sign-up__phone").val(),
        gender      = $form.find( "input[name='gender']:checked" ).val(),
    // TODO : CHECK BIRTHDATE RANGE..otherwise will not be stored into mysql
        bod         = $("#sign-up__bod").val(),
        url         = $form.attr( "action" );
    // Send the data using post
    console.log("Gender: "+gender);
    console.log("bod"+bod);

    $.post( url, {
        name    :name,
        username:username,
        email   :email,
        password:password,
        passwordR:passwordR,
        address :address,
        bod     :bod,
        gender  :gender,
        phone   :phone })
        // Put the results in a div
        .done(function( data ) {
            console.log('Done'+data);
            $('#body_wrapper').html(data);
        })
        .fail(function(xhr,desc,err){
            console.log(xhr);
            console.log(desc);
            console.log(err);
        });
});

$("#sidebar_signinForm").submit(function(event){
    event.preventDefault();
    // Get some values from elements on the page:
    var $form = $( this ),
        username = $form.find( "input[name='username']" ).val(),
        password = $form.find( "input[name='password']").val(),
        url = $form.attr( "action" );

    // Send the data using post
    $.post( url, {username:username,password:password } )
        // Put the results in a div
        .done(function( data ) {
            console.log('Done'+data);
            $('#body_wrapper').html(data);
            //location.replace("/");
        })
        .fail(function(xhr,desc,err){
            console.log(xhr);
            console.log(desc);
            console.log(err);
        });
});

$("#signinForm").submit(function(event){
    event.preventDefault();
    // Get some values from elements on the page:
    var $form = $( this ),
        username = $form.find( "input[name='username']" ).val(),
        password = $form.find( "input[name='password']").val(),
        url = $form.attr( "action" );

    // Send the data using post
    $.post( url, {username:username,password:password } )
        // Put the results in a div
        .done(function( data ) {
            console.log('Done'+data);
            $('#body_wrapper').html(data);
            //location.replace("/");
        })
        .fail(function(xhr,desc,err){
            console.log(xhr);
            console.log(desc);
            console.log(err);
        });
});

$("#forgetForm").submit(function(event){
    event.preventDefault();
    // Get some values from elements on the page:
    var $form = $( this ),
        email = $form.find( "input[name='email']" ).val(),
        url = $form.attr( "action" );

    console.log("The email address is: "+email);
    // Send the data using post

    $.post( url, {email:email} )
        // Put the results in a div
        .done(function( data ) {
            console.log('Done'+data);
            $('#body_wrapper').html(data);
            //location.replace(data);
            //$('#flash-messages').html(data);
            // location.replace("/");
        })
        .fail(function(xhr,desc,err){
            console.log(xhr);
            console.log(desc);
            console.log(err);
            //$('#body_wrapper').html(err);
        });

});