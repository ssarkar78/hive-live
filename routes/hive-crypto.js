/**
 * Created by ssarkar on 15-04-2016.
 */
var crypto = require('crypto');

exports.encryptPassword = function(salt,key){
    var hash = crypto.createHmac('sha256', key).update(salt).digest('hex');
    return hash;
}