/**
 * Created by stevezhang on 2015-08-23.
 */
var util          = require('util');
var passport      = require('passport');
var flash         = require('express-flash');
var crypto        = require('crypto');
var async         = require('async');
var nodemailer    = require('nodemailer');
var secrets       = require('./module/config/sgcredential');

// Use crypto for random token generalization & SHA1 hashes
// use bcrypto for hashing the password(computationally expensive hashing)

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
                        res.render('account',{title:'home',user:theuser});
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
            res.render('home',{title: '您的私人睡眠治疗专家'});
        }
        console.log("You are in sign test");
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
            //req.flash('errors','Error');
            res.render('sign-in',{title:'Login'});
            //res.render('sign-in',{title:"HealthWe - Login", ***error: req.flash('error')***});
        }
    });

    app.post('/sign-in',function(req,res,next){
        console.log("You are in sigin post");
        // if authentication fail, user will be set tp false
        // if exception occurred, err will be set
        passport.authenticate('local',{successRedirect:'/',
            failureRedirect: '/sign-in',failureFlash: true},function(err,user,info) {
            //TODO: get all handler working
            if (err) {
                //render sign-in Page
                console.log(err);
                req.flash('errors',err.message);
                return res.redirect('/sign-in');
            }
            if (!user) {
                console.log(info.message);
                req.flash('errors',info.message);
                return res.redirect('/sign-in');
            }
            return req.logIn(user, function (err) {
                if (err) {
                    console.log("line111"+err);
                    req.flash('errors',err.message);
                    return res.redirect('/sign-in');
                    //res.render('sign-in',{title:'Login',message:{errors:"invalid user/password combination"}});
                } else {
                    console.log('User has login');
                    return res.redirect('/');
                }
            });
          })(req,res,next);
    });

    app.get('/sign-up',function(req,res){
        if(req.isAuthenticated()) {
            res.redirect('/');
        } else {
            //req.flash('warning','Warning');
            res.render('sign-up',{title:'Register',geolocationInNeed:true});
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
            res.render('sign-up',{title:'Register',geolocationInNeed:true});
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
            res.render('sign-up',{title:'Register',geolocationInNeed:true});
            return;
            //res.status(400).send('error-updating-account: '+err);
        }
        else{
            res.redirect('/sign-in');
            }
        });
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
            res.render('forget',{title:'密码重置'});
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
            res.render('forget')
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
                //req.flash('errors',err);
                return next(err);
            }
            res.render('forget');
            //res.render('forget',{title:'密码重置'});
            //res.render('forget_msg');
            //res.render('forget',{title:'密码重置'});
        });//end of async.waterfall
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
