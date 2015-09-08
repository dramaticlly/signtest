/**
 * Created by stevezhang on 2015-09-04.
 */

var config = {
    client    : 'mysql',
    connection: {
        host: '104.131.60.15',
        user: 'zhang464',
        password: 'Zhy-0211',
        database: 'webtest',
        charset: 'utf8'
    }
};

var knex = require('knex')(config);
var bookshelf = require('bookshelf')(knex);

module.exports.DB = bookshelf;