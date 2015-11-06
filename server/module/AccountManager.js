/**
 * Created by stevezhang on 2015-08-23.
 */
//var crypto 	= require('crypto');
var mysql   = require('mysql');
//var moment  = require('moment');
var bcrypt  = require('bcrypt');

var Model   = require('./model');


/*  test mysql connection
 var express = require("express");
 var app = new express();
 app.set('port',5051);
 */


/*  Manually test on mysql
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
                        callback(err);
                    }else {
                        var signUpUser = new Model.User({user_name:newData.user,PASSWORD:hash});
                        var uid = 0;
                        signUpUser.save()
                            .then(function(savedUser){
                                uid = savedUser.get("id");
                                console.log(savedUser.toJSON());
                                //create user info and then save
                                if (uid != 0){
                                    //create new userInfo obj in db
                                    var signupUinfo = new Model.UserInfo({
                                        user_id           :uid,
                                        name         :newData.name,
                                        email        :newData.email,
                                        ADDRESS      :newData.address,
                                        phone        :newData.phone,
                                        gender       :newData.gender,
                                        dateofbirth  :newData.dateofbirth
                                    });
                                    //I have a feeling that it might be due to the fact that since you're specifying a primary key,
                                    //it's trying to run an UPDATE rather than an INSERT, which you'd work around
                                    // by specifying {method: 'insert'} in the options hash
                                    signupUinfo.save(null,{method:'insert'}).then(function(newmodel){
                                        console.log(newmodel.toJSON());
                                        callback();
                                    }).catch(function(err){//save err
                                        console.log("Unable to create&save userProfile "+err);
                                        callback(err);
                                    });
                                }
                                else{
                                    callback("uid-error");
                                }
                            }).catch(function(err){
                                console.log("Unable to save userAccount " +err);
                                callback(err);
                            });
                    }
                });
            });
        }
    });

    // hash the password and store
}

exports.pwdreset = function(newData,callback){
    var uid = -1;
    //var emailPromise = new Model.UserInfo({email:newData.email}).fetch({required: true});
    //!!!fail on fetch
    new Model.UserInfo({email:newData.email}).fetch().then(function(ResModel){
        if (ResModel) {
            uid = ResModel.get("user_id");
            console.log('uid: ' + uid + typeof uid);
            new Model.User({id: uid})// update operation do not need fetch, so user name remain unknown!
                .save({resetPwdToken:newData.token,resetPwdExpire:newData.expiration},{patch:true,method:"update"})
                .then(function(result){
                    //user = result.attributes.user_name;
                    //console.log("user forget pwd:"+user);
                    callback(null,{uid:uid});
                })
                .catch(function(err){
                    console.log(err.stack);
                    callback({message:"Unable to save new token and expiration"},null);
                });
        }
        else{
            callback({message:"No account with given email exists"},null);
        }
    }).catch(function(err){
        console.log(err.stack);
        callback({message:"No account with given email exists"},null);
    });
    //save token and expiration into User model;
}

exports.getProfile = function(uid,callback){
    if (uid < 1){
        callback("Invalid uid");
    }
    var retModel = Model.UserInfo.where({user_id:uid}).fetch({required: true});
    return retModel.then(function(model){
        //Promised obj has 4 attr, isFulfilled/isRejected/fulfillmentValue/rejectonReason
        if(model) { //if found user
            var tes = model.attributes;
            callback(null, tes);
        }
        else {
            callback(null, "User Not Exist");
        }
    }).catch(Model.UserInfo.NotFoundError,function(){
        callback(err='user profile cannot be found',null);
    }).catch(function(err){
        console.log(err.stack);
    });
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