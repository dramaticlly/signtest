var express 	  = require("express");
var expressValidator = require("express-validator");
var bodyParser 	  = require('body-parser');
var bcrypt        = require('bcrypt');
var session 	  = require('express-session');
var cookieParser  = require('cookie-parser');
var mysql		  = require('mysql');
var flash 		  = require('express-flash');//express built on top of connect flash
//var ejs 		  = require('ejs');
var exphbs  	  = require('express-handlebars');
var path 		  = require('path');
var MongoStore 	  = require('connect-mongo')(session);
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
	//query the current user from database
	new Model.User({user_name: username}).fetch().then(function(user) {
		done(null, user);
	});
});


/* app configuration */
app.set('port',5050);
// When you add public to those URLs, it will be looking in /public for a folder called public, which it won't find.
app.use(express.static(__dirname+'/public'));

// Create `ExpressHandlebars` instance with a default layout.
var exphbs = exphbs.create({
	defaultLayout: 'main',
	//helpers      : helpers,

	// Uses multiple partials dirs, templates in "shared/templates/" are shared
	// with the client-side of the app (see below).
	partialsDir: [
	//	'shared/templates/',
		'views/partials/'
	]
	//, helperDir: 'views/helpers'

});
app.engine('handlebars',exphbs.engine);
app.set('view engine','handlebars');

//app.set('views', path.join(__dirname, '/server/public'));
//app.set('view engine', 'ejs');

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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./server/route')(app);


app.listen(app.get('port'),function(){
console.log("The server is opened at port 5050. It is deployed on Steve's server");
});
