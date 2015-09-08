/**
 * Created by stevezhang on 2015-08-23.
 */
var util          = require('util');
var passport      = require('passport');

var AM            = require('./module/AccountManager');
module.exports = function(app) {

    // app routing
    app.get('/',function(req,res){
        console.log(req.body);
        if(req.isAuthenticated()){
            var user = req.user;
            //console.log(user);
            if(user) {
                user = user.toJSON();
            }
            console.log('your username is: ' + user.user_name + ". ");
            res.render('test',{title:'home',user:user});

        }
        else{
            // in this case, index.html is sign-in html
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
       /* TODO.Temporary cookie test, disable for now
        if (typeof req.cookie['connect.sid'] !== 'underfined'){
            console.log(req.cookie['connect.sid']);
        }
        */
        var sess = req.session;
        sess.suname = req.body.suname;
        sess.usrname = req.body.usrname;
        sess.email = req.body.email;
        sess.pwd = req.body.pwd;
        sess.pwd_repeat = req.body.pwd_repeat;
        //console.log("secret:"+req.body);
        console.log("secret2:"+req.body.key);
        console.log("name: "+sess.suname);
        console.log("user name: "+sess.usrname);
        console.log("email: "+sess.email);
        console.log("pwd: "+sess.pwd);
        console.log("pwd_repeat: "+sess.pwd_repeat);

        /* validation errors */

        req.checkBody('email','请输入有效的邮箱').notEmpty().isEmail();
        req.checkBody('pwd','密码必须在6-20位之间').len(6,20);
        if (sess.pwd_repeat) {
            req.checkBody('pwd', '两次输入的密码必须一致').equals(sess.pwd_repeat);
        }
        var errors = req.validationErrors(true);
        if (errors){
            // if validation erros, send 400, bad request
            res.status(400).send('There have been validation errors: '+util.inspect(errors));
            return;
        }
        /* update errors */
        // up till here, confirm 2 pwd are the same. so no need to pass in to addNewAccount function
        AM.addNewAccount({
            name    :req.body.suname,
            user    :req.body.usrname,
            email   :req.body.email,
            pass    :req.body.pwd
        },function(err,out){
        if (err) {
            res.status(400).send('error-updating-account');
        }
        else{
            res.redirect('/sign-in');
            res.status(200).send('ok');
            /* old approach for handle user session myself
            req.session.user = out;
                // update the user's login cookies if they exists //
                // if successful,put into session variable
            if (req.cookies.user != undefined && req.cookies.pass != undefined){
                    res.cookie('user', out.user, { maxAge: 900000 });
                    res.cookie('pass', out.pass, { maxAge: 900000 });
                }

             */
            }
        });
        sess.auth = true;
    });



    app.get('/logout',function(req,res,next){
        if(!req.isAuthenticated()) {
            notFound404(req, res, next);
        } else {
            req.logout();
            res.redirect('/sign-in');
        }
    });

//set custom 404 page
    app.use(function(req, res, next){
        res.type('text/plain');
        res.status(404);
        res.send("404 - Not found");
    });

};
