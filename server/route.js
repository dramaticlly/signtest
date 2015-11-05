/**
 * Created by stevezhang on 2015-08-23.
 */
var util          = require('util');
var passport      = require('passport');
var flash         = require('express-flash');
var crypto        = require('crypto');
var async         = require('async');
var nodemailer    = require('nodemailer');

// Use crypto for random token generalization & SHA1 hashes
// use bcrypto for hashing the password(computationally expensive hashing)

var secrets       = require('./module/config/sgcredential');
var AM            = require('./module/AccountManager');
module.exports = function(app) {

    // app routing
    app.get('/',function(req,res){
        //console.log(req.body);
        if(req.isAuthenticated()){
            //TODO, should use UID instead of username. can query username using UID
            var user = req.user;

            //console.log(user);
            if(user) {
                user = user.toJSON();
                console.log(user);
            }
            var uid = user.id;
            var PromisedUinfo = AM.getProfile(uid,function(err,out){
                if(err){
                    res.status(400).send('error-retriving-profile: '+err.stack);
                }
                if(out){
                    if(typeof out === "object"){
                        console.log(">>obj[out]: ");
                       // console.log(out.toJSON());
                         var theuser = {
                            username:user.user_name,
                            name    :out.name,
                            email   :out.email,
                            gender  :out.gender,
                            dob     :out.dateofbirth,
                            phone   :out.phone,
                            address :out.ADDRESS
                        };
                        console.log(">>The User");
                        //console.log(theuser.toJSON());
                        res.render('account',{title:'home',user:theuser,layout:false});
                    }
                    else {
                        console.log(out);
                        res.status(400).send("error found. process exit");
                    }
                }
            });
            console.log(">>Promised: "+PromisedUinfo.toJSON());
        }
        else{
            if(req.xhr){// if request from ajax call
                res.render('home',{title: '您的私人睡眠治疗专家',layout : false});
            }
            else {
                res.render('home', {title: '您的私人睡眠治疗专家'});
            }
        }
        console.log("You are in sign test");
    });

    app.get('/sample',function(req,res){
       res.render('chart',{title:'sample',canvasInNeed:true});
    });
    /*
     express.js use cookie to store a session id/sid in the client browser
     every time user get sign-in page, check for their cookie
     if (they do have cookie),
     use value of cookie as key in redis db to retrieve session info
     if(value match a uid)
     then session.auth = true
     query the user profile with uid
     else(value does not match a uid)
     render the sign-in.html
     ask for user authentication
     else (they do not have session-id),
     assign a new session-id to him,
     ask for authentication
     */
    app.get('/sign-in',function(req,res){
        //console.log("You are in sigin get");
        if(req.isAuthenticated()) {
            res.redirect('/');
        } else {
            console.log("Not Authenticated yet");
            if(req.xhr){// if request from ajax call
                res.render('sign-in',{title:'Login',layout:false});
            }
            else {
                res.render('sign-in',{title:'Login'});
            }
        }
    });

    app.post('/sign-in',function(req,res,next){
        var ua = req.headers['user-agent'].toLowerCase();
        var andr = /^.*android/i;
        var authenFail = -1;
        ///(android).|mobile|ip(hone|od)/i
        console.log('user-agent'+ua);
        if (andr.test(ua)){
            //var mobilesession = (req.body.session === undefined) ? true : req.body.session;
            // create object with properties in js
            // access by options["session"] or options.session
            console.log('request is from android application');
            passport.authenticate('local',function (err,user,info){
                if (err){
                    // error with databases
                    console.log(err);
                    return res.status(200).json({authenticated:authenFail,token:null});
                }
                if (!user){
                    // cannot find the user in db
                    console.log(info.message);
                    return res.status(200).json({authenticated:authenFail,token:null});
                }
                return req.logIn(user,function(err){
                   if (err){
                       console.log(err);
                       return res.status(200).json({authenticated:authenFail,token:null});
                   }
                   else{
                       //console.log(user.id);
                       console.log('user login through mobile site');
                       return res.status(200).json({authenticated:user.id,token:null});
                   }
                });
            })(req, res, next);
        }
        else { // if request from web browser agent
            console.log("You are in sigin post, web request");
            // if authentication fail, user will be set tp false
            // if exception occurred, err will be set
            passport.authenticate('local', {
                successRedirect: '/',
                failureRedirect: '/sign-in', failureFlash: true
            }, function (err, user, info) {
                //TODO: get all handler working
                if (err) {
                    //render sign-in Page
                    console.log(err);
                    req.flash('errors', err.message);
                    return res.redirect('/sign-in');
                }
                if (!user) {
                    console.log(info.message);
                    req.flash('errors', info.message);
                    return res.redirect('/sign-in');
                }
                return req.logIn(user, function (err) {
                    if (err) {
                        console.log("line111" + err);
                        req.flash('errors', err.message);
                        return res.redirect('/sign-in');
                        //res.render('sign-in',{title:'Login',message:{errors:"invalid user/password combination"}});
                    } else {
                        /* detect request from android applications*/


                        console.log('User has login');
                        return res.redirect('/');
                    }
                });
            })(req, res, next);
        }
    });

    app.post('/mobile-login',function(req,res){
        //extra work needed to attach the seesion for subsequent req from android app
        var ua = req.headers['user-agent'].toLowerCase();
        var andr = /^.*android/i;
        if (andr.test(ua)){
            var mobilesession = (req.body.session === undefined) ? true : req.body.session;
            var options = {session:req.body.session};
            var user = {id:req.body.id,user_name:req.body.username};
            return req.logIn(user,options,function(err){
               if (err){
                   console.log(err);
                   return res.status(200).json({sessionstored:false});
               }
                else{
                   console.log('User has been login by passport');
                   return res.status(200).json({sessionstored:true});
               }
            });
        }
        else{
            res.send("404 - Not found");
        }
    });

    app.get('/sign-up',function(req,res){
        if(req.isAuthenticated()) {
            res.redirect('/');
        } else {
            if (req.xhr){
                res.render('sign-up',{title:'Register',geolocationInNeed:true,layout: false});
            }
            else {
                res.render('sign-up',{title: 'Register', geolocationInNeed: true});
            }
        }
    });

    app.post('/sign-up',function(req,res,next){
        /* validation errors */
        req.checkBody('email','请输入有效的邮箱').isEmail();
        req.checkBody('password','密码必须在6-20位之间').len(6,20);
        //req.checkBody('phone','手机必须是数字').isInt();
        req.checkBody('password', '两次输入的密码必须一致').equals(req.body.passwordR);

        var errors = req.validationErrors(true);
        if (errors){
            // if validation erros, send 400, bad request
            // TODO, display form validation errors to user
            req.flash('errors',"There have been validation errors: "+util.inspect(errors));
            res.render('sign-up',{title:'Register',geolocationInNeed:true,layout:false});
            return;
            //res.status(400).send('There have been validation errors: '+util.inspect(errors));
            //return;
        }
        /* update errors */
        // up till here, confirm 2 pwd are the same. so no need to pass in to addNewAccount function
        AM.addNewAccount({
            user        :req.body.username.trim(),
            name        :req.body.name.trim(),
            email       :req.body.email.toLowerCase().trim(),
            pass        :req.body.password.trim(),
            address     :req.body.address.trim(),
            phone       :req.body.phone.trim(),
            gender      :req.body.gender,
            dateofbirth :req.body.bod.trim()
            //dateofbirth :"2008-7-04"
        },function(err,out){
        if (err) {
            console.log(err);
            req.flash('errors',errors);
            res.render('sign-up',{title:'Register',geolocationInNeed:true,layout:false});
            return;
            //res.status(400).send('error-updating-account: '+err);
        }
        else{
            res.redirect('/sign-in');
            }
        });
    });

    app.get('/reset/:token',function(req,res){
        // TODO: css/js load failure, debug later
        console.log("token: "+req.params.token);
        var rightnow = new Date();
        console.log("date/time:"+rightnow);
        //TODO, implement reset function and update pwd in db
        if(req.isAuthenticated()) {
            console.log("logined User reset password");
            res.redirect('/');
        } else {
            // req.flash('errors','Error');
            // req.flash('warning','warning');
            // req.flash('info','Info');
            // req.flash('success','Success');
            console.log("User reset password");
            if (req.xhr){
                res.render('reset',{title:'密码更新',layout:false});
            }
            else {
                res.render('reset',{title:'密码更新'});
            }
        }
    });

    app.get('/forget',function(req,res,next){
        if(req.isAuthenticated()) {
            console.log("logined User forgot password");
            res.redirect('/');
        } else {
           // req.flash('errors','Error');
           // req.flash('warning','warning');
           // req.flash('info','Info');
           // req.flash('success','Success');
            console.log("User forgot password");
            if (req.xhr){
                res.render('forget',{title:'密码重置',layout:false});
            }
            else {
                res.render('forget',{title:'密码重置'});
            }
        }
    });

    app.post('/forget',function(req,res,next){
        console.log("why you come to post");
        req.checkBody('email','请输入有效的邮箱').isEmail();
        var errors = req.validationErrors(true);
        if (errors){
            // if validation erros, send 400, bad request
            /*

            return req.redirect('/forget');
            */
            req.flash('errors',errors);
            //res.status(400).send('There have been validation errors: '+util.inspect(errors));
            res.render('forget',{layout:false});
            return;
        }
        // async.waterfall is same as promise
        var usermail = req.body.email.trim();
        async.waterfall([
            function(done){
                crypto.randomBytes(32,function(err,buf){
                    var token = buf.toString('hex');
                    console.log("my token: "+token);
                    done(err,token);
                });
            },
            function(token,done){
                console.log("fetching email:{"+usermail+"}");
                var d = new Date();
                d.setHours(d.getHours()+12);
                console.log("expiration time: "+d);
                AM.pwdreset({
                    email       :usermail,
                    token       :token,
                    expiration  :d //email expire in 12 hour
                },function(err,user){
                    if (err) {
                        console.log(err.message);
                        console.log('req.flash!');
                        req.flash('errors',err.message);
                        return res.redirect('/forget');
                    }
                    else if (user.uid){
                        console.log("user"+user.uid);
                        done(err,token,user)
                    }
                })//end of pwdreset function in
            },
            function(token,user,done){
                var transporter = nodemailer.createTransport({
                    service: 'SendGrid',
                    auth: {
                        user: secrets.sendgrid.user,
                        pass: secrets.sendgrid.password
                    }
                });
                //!TODO,remove change on useremail
                //usermail = usermail+"m";
                var mailOptions = {
                    to: usermail,
                    from: 'healthwee@gmail.com',
                    subject: 'Your healthwee password reset link',
                    text: 'Hello,\n\n' +
                    'This is the password reset link for your account ' + usermail + ' in healthWe.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'Please note that the above link will expire in 12 hours\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                transporter.sendMail(mailOptions, function(err) {
                    console.log('Your password reset link has been sent to your email:'+usermail);
                    req.flash('success', 'Success! Your password reset link has been sent to your email.');
                    done(err);
                });
                //console.log("email sent to"+usermail);
            }
            ],function(err){
            if(err) {
                req.flash('errors',err);
                return next(err);
            }
            res.render('forget',{layout:false});
            //res.render('forget',{title:'密码重置'});
            //res.render('forget_msg');
            //res.render('forget',{title:'密码重置'});
        });//end of async.waterfall
    });

    app.get('/calender',function(req,res){
        //console.log("request date/time: "+req);
        // better use request time?
        var today = new Date();
        var datelen = 7;
        var timeslotcount = 6;
        var today_json = today.toJSON();
        //better to functionize dates array
        var dateArray = [];
        var timeslots = [];
        var finaljson = [];

        // generate weekly date starts from request init date
        function generateDate(today) {
            for (i = 0; i < datelen; i++) {
                var newday = new Date(today.getFullYear(), today.getMonth(), today.getDate()+i);
                dateArray.push(newday);
            }
            return dateArray
        }

        console.log('test function');
        dateArray = generateDate(today)
        console.log(dateArray);

        // TODO, change doctor schedule with their preference, now it's randomly generated
        for (i = 0; i < timeslotcount; i++){
            //var even = ((i%2==0)?true:false);
            var even = (i%2==0);
            timeslots.push({id:i,booked:even});
        }

        for (i = 0; i < datelen; i++){
           finaljson.push({date:dateArray[i],timeslots:timeslots})
        }

        console.log("server date/time: "+today+" json:"+today_json);
        console.log('json:');
        console.log(JSON.stringify(finaljson));
        res.status(200).json(finaljson);
        // will stringify is needed
        //res.status(200).json(JSON.stringify(finaljson));
    });

    app.post('/calender',function(req,res,next){
        var maxtimeslot = 6;
        var verifiedUser = true ;
        var abletobook = true;
        var abletoconfrim;
        var datetobook;
        var did ;
        /* request parameter */
        var uid = req.body.uid;
        var datewanted = req.body.date;
        var slotid = req.body.timeslot_id;

        function verifyexist(inputparameter){
            return (typeof inputparameter !== 'undefined');
        }
        function verifyslot(slotid,maxtimeslot){
            return (slotid >= 0 && slotid <= maxtimeslot);
        }

        if(req.isAuthenticated()) {
            verifiedUser = true;
            console.log("calender: user has login");
        }
        else{
            verifiedUser = false;
            console.log('i dont know you');
        }

        if (typeof (datewanted) !== 'undefined'){
            datetobook = new Date(datewanted);
            console.log("Client ["+uid+"] wanted to book:"+datetobook+" at timeslot git"+slotid);
        }

        verifiedUser =  verifyexist(uid) && verifiedUser ;
        abletobook = verifyexist(slotid) && abletobook && verifyslot(slotid,maxtimeslot);
        abletoconfrim = verifiedUser && abletobook;
        did = ((abletoconfrim)?1:-1);
        res.status(200).json({booked:abletoconfrim,user:verifiedUser,timeslot:abletobook,doctorid:did});

    });

    app.get('/logout',function(req,res,next){
        if(!req.isAuthenticated()) {
            //TODO, help user navigate back to homepage
            res.status(404).send("Unable to find requested page");
        } else {
            console.log("User has log out");
            req.logout();
            res.redirect('/');
        }
    });

//set custom 404 page
    app.use(function(req, res, next){
        res.type('text/plain');
        res.status(404);
        res.send("404 - Not found");
    });

};
