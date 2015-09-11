/**
 * Created by stevezhang on 2015-08-23.
 */
var util          = require('util');
var passport      = require('passport');

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
            }
            console.log('your username is: ' + user.user_name + ". ");
            res.render('test',{title:'home',user:user});

        }
        else{
            res.render('index');
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
        console.log("You are in sigin get");
        if(req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('sign-in');
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
                return res.render('sign-in',{errorMessage: err.message});
            }
            if (!user) {
                return res.render('sign-in',{errorMessage: info.message});
            }
            return req.logIn(user, function (err) {
                if (err) {
                    console.log(err);
                    return res.render('sign-in',{errorMessage: err.message});
                } else {
                    console.log('User has login');
                    return res.redirect('/');
                }
            });
          })(req,res,next);
        //TODO, send keyofsessionid back, so can keep track of userprofile
        //res.send('Done');
    });

    app.get('/sign-up',function(req,res){
        if(req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('sign-up');
        }
    });

    app.post('/sign-up',function(req,res,next){

        /* validation errors */
        var addProfile = false;
        req.checkBody('email','请输入有效的邮箱').isEmail();
        req.checkBody('password','密码必须在6-20位之间').len(6,20);
        req.checkBody('password', '两次输入的密码必须一致').equals(req.body.passwordR);

        var errors = req.validationErrors(true);
        if (errors){
            // if validation erros, send 400, bad request
            res.status(400).send('There have been validation errors: '+util.inspect(errors));
            return;
        }
        /* update errors */
        // up till here, confirm 2 pwd are the same. so no need to pass in to addNewAccount function
        AM.addNewAccount({
            user    :req.body.username,
            email   :req.body.email,
            pass    :req.body.password
        },function(err,out){
        if (err) {
            res.status(400).send('error-updating-account: '+err);
        }
        else{
            res.redirect('/sign-in');
            addProfile = true;
            }
        });
        if (addProfile) {
            AM.addNewProfile({
                name    :req.body.name,
                user    :req.body.username,
                email   :req.body.email

            },function(err,out){
              if(err){
                  res.status(400).send('error-updating-profile');
              }
                else{
                  res.redirect('/sign-in');
              }
            });
        }
    });



    app.get('/logout',function(req,res,next){
        if(!req.isAuthenticated()) {
            notFound404(req, res, next);
        } else {
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
