/**
 * Created by stevezhang on 2015-09-05.
 */
var DB = require('./config/db').DB;

var User = DB.Model.extend({
    tableName:  'User',
    idAttribute:'id',
    userinfo:function(){
        return this.hasOne(UserInfo);
    }
});

var UserInfo = DB.Model.extend({
    tableName:  'UserInfo',
    idAttribute:'user_id',
    user:function(){
        return this.belongsTo(User,'id');
    }

});

module.exports = {
    User: User,
    UserInfo: UserInfo
};