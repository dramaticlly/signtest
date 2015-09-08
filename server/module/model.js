/**
 * Created by stevezhang on 2015-09-05.
 */
var DB = require('./db').DB;

var User = DB.Model.extend({
    tableName:  'User',
    idAttribute:'ID'
});

var UserInfo = DB.Model.extend({
    tableName:  'UserInfo',
    idAttribute:'ID'
});

module.exports = {
    User: User,
    UserInfo: UserInfo
};