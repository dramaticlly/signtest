var express 	  = require("express");
var expressValidator = require("express-validator");
var bodyParser 	  = require('body-parser');
var session 	  = require('express-session');
var cookieParser  = require('cookie-parser');
var mysql		  = require('mysql');
var ejs 		  = require('ejs');
var path 		  = require('path');
var MongoStore 	  = require('connect-mongo')(session);
var bcrypt        = require('bcrypt');
var passport      = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Model = require('./server/module/model');
//need to write seperate route.js for route get/post request

var app = new express();

// passport login authentication
passport.use(new LocalStrategy(function (username,password,done) {
	new Model.User({user_name:username}).fetch().then(function(model){
		if (model === null) {
			return done(null, false, {message: 'Invalid username or password'});
		}else{
			var user = model.toJSON();
			//syncronized compare
			if(!bcrypt.compareSync(password,user.PASSWORD)){
				return done(null, false, {message: 'Invalid username or password'});
			}else{
				// if add message over here, will display on passport.authenticated.info
				return done(null,user);
			}
		}
	});
}));

passport.serializeUser(function(user, done) {
	done(null, user.user_name);
});

passport.deserializeUser(function(username, done) {
	new Model.User({user_name: username}).fetch().then(function(user) {
		done(null, user);
	});
});


/* app configuration */
app.set('port',5050);
app.use(express.static(__dirname+'/server/public'));
app.set('views', path.join(__dirname, '/server/public'));
app.set('view engine', 'ejs');

// session part

app.use(bodyParser.json());
app.use(expressValidator());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	secret:'keyboard_sidsdakdsk12234sdgafasmndadq',
	//cookie:{ secure: true,maxAge: 3600000},
	resave: true,
	saveUninitialized:true,
	store: new MongoStore({ host: '104.131.60.15', port: 27017, db: 'healthWesess'})
}));
app.use(passport.initialize());
app.use(passport.session());

require('./server/route')(app);


app.listen(app.get('port'),function(){
console.log("The server is opened at port 5050. It is deployed on Steve's server");
});
