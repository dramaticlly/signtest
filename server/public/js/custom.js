/*------------------------------------------------------------------
Project:        Landitt
Author:         Yevgeny Simzikov
URL:            http://simpleqode.com/
                https://twitter.com/YevSim
                https://www.facebook.com/simpleqode
Version:        1.0.0
Created:        27/05/2015
Last change:    27/05/2015
-------------------------------------------------------------------*/

/**
 * Navigation
 */

/* Auto close navbar on click (mobile menu) */

$(".navbar-nav > li > a").click(function() {
    $(".navbar-collapse").collapse('hide');
});


/* Change navbar class on scroll */

$(".wrapper").waypoint(function() {
    $(".navbar").toggleClass("js-navbar-top");
    $(".navbar.js-toggleClass").toggleClass("navbar-default navbar-inverse");
    return false;
}, { offset: "-20px" });


/* Change navbar class on collapse/uncollapse in its top position */

$('.wrapper .navbar-collapse').on('show.bs.collapse', function () {
    $(".navbar.js-navbar-top").toggleClass("navbar-default navbar-inverse");
    $(".navbar").toggleClass("js-toggleClass js-noToggleClass");
});

$('.wrapper .navbar-collapse').on('hide.bs.collapse', function () {
    $(".navbar.js-navbar-top").toggleClass("navbar-default navbar-inverse");
    $(".navbar").toggleClass("js-toggleClass js-noToggleClass");
});


/* Sidebar */

$(".js-toggle-sidebar").on('click', function() {
    $(".wrapper").toggleClass("js-wrapper-aside");
    $(".navbar").toggleClass("js-navbar-aside");
    $(".sidebar").toggleClass("js-sidebar-aside");
    return false;
});

function validateForm(name,username,email,pwd,pwd_repeat){
    if (pwd!=pwd_repeat){
        return false;
    }
    return true;
}

function checkEmpty(){
    var valueofclass = document.getElementsByClassName("form-control").value;
    if(!valueofclass){
        return false;
    }
}

/* submit the signin form */
$("#sign-up__submit").on('click',function(){
    console.log("i am in sign up submit");
    var suname, usrname, email, pwd, pwd_repeat;
    suname = $("#sign-up__name").val();
    usrname = $("#sign-up__username").val();
    email = $("#sign-up__email").val();
    pwd = $("#sign-up__password").val();
    pwd_repeat = $("#sign-up__password_repeat").val();
    $.ajax({
        url : "/sign-up",
        type: "post",
        timeout: 15000,
        data:{suname:suname,username:usrname,email:email,password:pwd,pwd_repeat:pwd_repeat},
        success: function(data){
            console.log('DOne');
            console.log(suname,usrname,email,pwd,pwd_repeat);
            location.replace("/sign-in");
          //  location.replace("/admin");
        },
        error: function(xhr,desc,err){
            if(xhr.status&&xhr.status==400){
                alert(xhr.responseText);
            }
            console.log(xhr);
            console.log(desc);
            console.log(err);
        }
    });
    console.log(suname,usrname,email,pwd,pwd_repeat);
  /*  if (validateForm(suname,usrname,email,pwd,pwd_repeat) == false){
        alert("您的设置密码和确认密码不一致,请重试");
        $("sign-up__password_repeat").focus();
    }
  */
    //event.stopPropagation();
});

/* submit the signup form */
$("#sign-in__submit").on('click',function(event){
    var usrname, pwd;
    usrname = $("#sign-in__username").val();
    pwd = $("#sign-in__password").val();
    console.log('username: '+usrname);
    $.ajax({
        url : "/sign-in",
        type: "post",
        timeout: 15000,
        data:{username:usrname,password:pwd},
        success: function(data){
            console.log('Done'+data);
            location.replace("/");
            },
        error: function(xhr,desc,err){
            console.log(xhr);
            console.log(desc);
            console.log(err);
            }
        });
    event.stopPropagation();
});

/**
 * Smooth scroll to anchor
 */

$(function() {
    $('a[href*=#]:not([href=#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: (target.offset().top - 70) // 70px offset for navbar menu
                }, 1000);
                return false;
            }
        }
    });
});


/**
 * Own carousel :: Testimonials
 */

$(document).ready(function() {
    var owl = $("#review__carousel");
    owl.owlCarousel({
     
        items:              2,
        itemsDesktop:       [1199,2],
        itemsDesktopSmall:  [991,2],
        itemsTablet:        [768,2],
        itemsTabletSmall:   false,
        itemsMobile:        [479,1],
        navigation : true,
        slideSpeed: 600,
        pagination: false,
        navigationText: ['<i class="oi oi-arrow-left"></i>','<i class="oi oi-arrow-right"></i>']

    });
});


/**
 * Doughnut charts :: Skills
 */

/* Base donut styles */

$.fn.peity.defaults.donut = {
    delimiter: null,
    fill: ["#F67280", "#eee"],
    height: null,
    innerRadius: 68,
    radius: 70,
    width: null
};

/* Animating donuts */

$(document).ready(function() {
    $(".js-skills__item_first").waypoint(function() {

        setTimeout(function () {
            $('.skills__item').css("visibility", "visible");
        }, 11);

        $('.skills-item__donut').each(function () {
            var $this = $(this);

            var updateChart = $this.peity('donut');
            var text = "";
            var i = 0;
            var str = $this.html();
            var arr = str.split("/");
            var value = arr[0];
            var maxValue = arr[1];
            var step = value/100;

            function myLoop() {
                setTimeout(function () {

                    text = i + "/" + maxValue;

                    updateChart.text(text)
                        .change()

                    i = i + step;

                    if (i <= value) myLoop();

                }, 10)
            }
            myLoop();
        });

        this.destroy();
        
    }, { offset: 'bottom-in-view' });
});


/**
 * Wow plugin bottom offset calculation
 */

$(".wow").each(function() {
    var wowHeight = $(this).height();
    $(this).attr("data-wow-offset", wowHeight);
});

new WOW().init();