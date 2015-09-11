/**
 * Created by stevezhang on 2015-08-23.
 */
//var crypto 	= require('crypto');
var mysql   = require('mysql');
//var moment  = require('moment');
var bcrypt  = require('bcrypt');

var Model   = require('./model');



// var encrypt = require('bcrypt-nodejs');
// var bookshelf = require('booksheldjs'); //object relational mapping tool for nodejs

/*  test mysql connection
var express = require("express");
var app = new express();
app.set('port',5051);
*/


/*  Manually test on mysql
// TODO, put configuratin aside, exclude from version control
// TODO, production server has to be switched to pool connection
var connection = mysql.createConnection({
   host     : '104.131.60.15',
   user     : 'zhang464',
   password : 'Zhy-0211',
   database : 'webtest'
});

// establish database connection
connection.connect(function(err){
    if (err) {
        console.log(err);
    }	else{
        console.log('connected to database');
    }
});

// TODO, avoid SQL injection, escape data from user input before using inside SQL query
// mysql.escape(userLandVariable)

// select
var query1 = connection.query("SELECT * FROM User",function(err,res){
    if (err){
        console.log(err);
    } else{
        console.log(query1.sql);
        for (var i = 0; i< res.length; i++)
        {
            console.log(res[i].name);
        }
        //console.log(res);
    }
});

// insert
var post = {id:4,user_name:'szhang',password:'qwer'};
var query2 = connection.query('INSERT INTO User SET ?',post,function(err,res){
   if (err){
       console.log(err);
   } else{
       console.log(query2.sql);
       console.log("inserted " + res.affectedRows + " rows");
   }
});

//  update
var query3 = connection.query('UPDATE User SET USERNAME = ? WHERE ID = ?', ["jbond",5],function(err,res){
        if (err) {
            console.log(err);
        }
        else{
            console.log("updated " + res.changedRows + "rows");
        }
});

// delete
var query4 = connection.query('DELETE FROM User WHERE ID = ?', [4], function(err,res){
   if (err){
       console.log(err);
   } else{
       console.log("deleted "+ res.affectedRows + " rows");
   }

});

connection.end();
*/

/* test mysql connection
app.listen(app.get('port'),function(){
    console.log("The server is opened at port 5051. It is deployed on Steve's server");
});
*/




//var accounts = db.collection('accounts');


/*
// some function to be used outside this file.
exports.manualLogin = function(user, pass, callback)
{
    accounts.findOne({user:user}, function(e, o) {
        if (o == null){
            callback('user-not-found');
        }	else{
            validatePassword(pass, o.pass, function(err, res) {
                if (res){
                    callback(null, o);
                }	else{
                    callback('invalid-password');
                }
            });
        }
    });
}
*/
exports.addNewProfile = function(newData,callback){
    var uid = -1;
    new Model.User({user_name:newData.user}).fetch().then(function(ResModel){
        uid = ResModel.get('id');
        console.log(uid);
    }).catch(function(err){
        if (err){
            console.error(err);
        }
    }).exec(callback);
}

exports.addNewAccount = function (newData,callback) {
    // check if user already exist
    var useramePromise = new Model.User({user_name:newData.user}).fetch();
    var emailPromise =null;
    new Model.UserInfo({email:newData.email}).fetch().then(function(ResModel){
        emailPromise=ResModel;
    });
    return useramePromise.then(function (model) {
        if(model){
            callback('username-taken');
        }
        else if(emailPromise){
            callback('email-taken');
        }else{
            var pwd = newData.pass;
            //var hash = bcrypt.hashSync(pwd);
            bcrypt.genSalt(10,function(err,salt){
               bcrypt.hash(pwd,salt,function(err,hash){
                   if (err){
                       console.log(err);
                   }else {
                       console.log('pwd' + pwd + ' hash' + hash);
                       var signUpUser = new Model.User({user_name:newData.user,PASSWORD:hash});
                       signUpUser.save().catch(function(err){
                           console.error(err);
                       }).exec(callback);
                   }
               });
            });
        }
    })

    // hash the password and store
}


/*
// some private function, mostly security concerns

var generateSalt = function()
{
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 7; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var saltAndHash = function(pass, callback)
{
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
}

var md5 = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var validatePassword = function(plainPass, hashedPass, callback)
{
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
}

// some mongoDB auxiliary methods

var getObjectId = function(id)
{
    return new require('mongodb').ObjectID(id);
}
*/