/**
 * Created by stevezhang on 2015-08-23.
 */
//var crypto 	= require('crypto');
var mysql   = require('mysql');
var bcrypt  = require('bcrypt');
var Model   = require('./model');

/* TODO, modulize check user id. Internal use, low priority
function validateuid (uid,callback){
    if (uid < 1){
        return callback("Invalid uid");
    }
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
    /*
     READ-WRITE
     Model: R:UserInfo W:User
     param: newData(email,token,expiration)
     query UserInfo model for 'email' = newData.email to get uid
     update the newData.token&expiration into User Table using uid
     callback with uid
     */
    var uid = -1;
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
};

exports.getProfile = function(uid,option,callback){
    /*
     READ-only
     Model: UserInfo
     param: uid,option
        option is name of single attribute needed to be returned
     query UserInfo model for 'user_id' = uid
     return 'user_name','name','email','gender','dateofbirth','phone','ADDRESS','subscription'
     */
    if (uid < 1){
        callback("Invalid uid");
    }
    console.log('AM.getProfile option:'+option);
    var retModel = Model.UserInfo.where({user_id:uid}).fetch({required: true});
    return retModel.then(function(model){
        //Promised obj has 4 attr, isFulfilled/isRejected/fulfillmentValue/rejectonReason
        if(model) { //if found user
            var tes = undefined;
            if (typeof option === "undefined"){
                console.log('return all attributes');
                 tes = model.attributes;
            }
            else{
                console.log("only return "+option+" attribute");
                tes = {option:model.attributes[option]};
                console.log(tes);
            }
            callback(null, tes);//successful
        }
        else{
            callback(new Model.UserInfo.NotFoundError('cannot find user profile'));
        }
    }).catch(function(err){
        console.log(err.stack);
    });
};

exports.getTransaction = function(uid,callback){
    /*
     READ-only
     Model: Transaction
     param: uid
     query Transaction model for 'customer_id' = uid
     return 'invoice_date','customer_name'
     */
    if (uid < 1){
        callback("Invalid uid");
    }
    var retModel = Model.Transaction.where({customer_id:uid}).fetch({required: true});
    return retModel.then(function(model){
        if(model) { //if found user
            var trans_attr = model.attributes;
            callback(null, trans_attr);
        }
        else {
            callback(new Model.Transaction.NotFoundError('cannot find user transaction record'));
        }
    }).catch(function(err){
        console.log(err.stack);
    });
};

exports.getMedHistry = function(uid,callback){
  /*
   READ-only
   Model: MedicalHistory
   param: uid
   query MedicalHistory model for 'customer_id' = uid
   return 'staff_name','customer_name','visit_date','symptom','resolution','additional_note'
  */
    var retModel = Model.MedicalHistory.where({customer_id:uid}).fetchAll({required: true});
    return retModel.then(function(model){

       if(model) {
           var history;
           if (model.attributes)//single record
           {
               history = model.attributes;
           }
           else if (model.models)//multiple records
           {
               history = [];
               var record;
               for (record in model.models){
                   history.push(model.models[record].attributes);
               }
           }
           /* sample
           sample model.attributes
            { history_id: 3,
            staff_id: 5,
            customer_id: 49,
            staff_name: 'john smith',
            customer_name: '宁波市',
            visit_date: Sat Nov 14 2015 05:51:46 GMT-0500 (EST),
            symptom: '神经病',
            resolution: '没得治',
            additional_note: '啦啦啦' }
            */
            //console.log(history);
            callback(null,history)
       }
        else{
           callback(new Model.MedicalHistory.NotFoundError('cannot find user appointment history record'));
       }
    }).catch(function(err){
        console.log(err.stack);
    });
};
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
*/