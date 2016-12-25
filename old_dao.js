// // exports.tagDB = (function () {
//     mongoclient.open(function (err, mongoclien) {
//         var db = mongoclient.db("TAG");
//         if (!err) {
//             db.collection('TAG', { strict: true }, function (err, collection) {
//                 if (err) {
//                     console.log("Creating it with default tag");
//                     populateDB();
//                 }
//             });
//         }
//     });
//     var populateDB = function () {

//         var tag = [
//             {
//                 tag_name: "#bangalore",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             },
//             {
//                 tag_name: "#nodejs",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             }
//             , {
//                 tag_name: "#dota2",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             }, {
//                 tag_name: "#code",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             }, {
//                 tag_name: "#health",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             }, {
//                 tag_name: "#candycrush",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             }, {
//                 tag_name: "#food",
//                 tag_img: "tag_bangalore.jpg",
//                 tag_type: 2,
//             }];

//         db.collection('TAG', function (err, collection) {
//             collection.insert(tag, { safe: true }, function (err, result) {
//             });
//         });

//     };
//     return {
//         getAllTags: function (fn) {
//             console.log("TRYING TO GET TAGS");
//             db.collection('TAG', function (err, collection) {
//                 collection.find().toArray(function (err, items) {
//                     fn(items);
//                 });
//             });
//         },
//         addTag: function (tag) {
//             db.collection('TAG', function (err, collection) {
//                 console.log(tag.tag_name);
//                 collection.update({ 'tag_name': tag.tag_name }, tag, { upsert: true });
//             });
//         },
//         deleteData: function () {
//             db.collection('TAG', function (err, collection) {
//                 collection.remove({});
//             });

//         }
//     }





// // // var mongo = require('mongodb');
// // // var Server = mongo.Server,
// // //     Db = mongo.Db,
// // //     BSON = require('bson').BSONPure;
// // // var server = new Server('localhost', 27017, {auto_reconnect: true});


// // var Db = require('mongodb').Db,
// //     MongoClient = require('mongodb').MongoClient,
// //     Server = require('mongodb').Server,
// //     ReplSetServers = require('mongodb').ReplSetServers,
// //     ObjectID = require('mongodb').ObjectID,
// //     Binary = require('mongodb').Binary,
// //     GridStore = require('mongodb').GridStore,
// //     Grid = require('mongodb').Grid,
// //     Code = require('mongodb').Code,
// //     BSON = require('bson').BSONPure,
// //     assert = require('assert');

// //   // Set up the connection to the local db
// //  var server = new Server('localhost', 27017, {auto_reconnect: true});
// //  var mongoclient = new MongoClient(server, {native_parser: true});


// // exports.userDB = (function () {
// //     var db = new Db('USER', server);
// //     db.open(function (err, db) {
// //         if (!err) {
// //             db.collection('USER', {strict: true}, function (err, collection) {
// //                 if (err) {
// //                     console.log("Creating it with default admin user");
// //                     populateDB();
// //                 }
// //             });
// //         }
// //     });
// //     var populateDB = function () {

// //         var user = [
// //             {
// //                 u_name: "Suvajit Sarkar",
// //                 u_img: "1443031115953.jpg",
// //                 u_phone: "918095397926",
// //                 u_loc: "bangalore",
// //                 u_tags: {'#bangalore': 1, '#nodejs': 1, '#dota2': 1, '#code': 1},
// //                 u_status: "Founder Hive Labs",
// //                 u_pass: "ba9c54c8269780dae38325a723761e3a489406f1256745b00e09efe5755b20e2"
// //             },
// //             {
// //                 u_name: "Pranami Bordoloi",
// //                 u_img: "1443031115952.jpg",
// //                 u_phone: "918880510284",
// //                 u_loc: "bangalore",
// //                 u_tags: {'#bangalore': 1, '#food': 1, '#candycrush': 1, '#health': 1},
// //                 u_status: "Dentist Veydehi",
// //                 u_pass: "26842da89049f02d89ec9cccec2f745420a20db2a756aa49ec3ef715973616ec"
// //             }];

// //         db.collection('USER', function (err, collection) {
// //             collection.insert(user, {safe: true}, function (err, result) {
// //             });
// //         });

// //     };
// //     return {
// //         searchUser: function (searchQuery, fn) {
// //             db.collection('USER', function (err, collection) {
// //                 if (searchQuery.length > 0) {
// //                     collection.find({$text: {$search: searchQuery}}).toArray(function (err, items) {
// //                         fn(items);
// //                     });
// //                 }
// //                 else {
// //                     collection.find({}).toArray(function (err, items) {
// //                         fn(items);
// //                     });
// //                 }
// //             });
// //         },
// //         getAllUser: function (redis, fn) {
// //             redis.get('user', function (err, reply) {
// //                 if (err) fn(null);
// //                 else if (!reply) { //Book exists in cache
// //                     console.log('from cache');
// //                     fn(JSON.parse(reply));
// //                 }
// //                 else {
// //                     db.collection('USER', function (err, collection) {
// //                         collection.find().toArray(function (err, items) {
// //                             var doc = {};
// //                             var usernameMapper = {};
// //                             items.forEach(function (e) {
// //                                 var phone = e.u_phone;
// //                                 doc[phone] = e;
// //                                 e.u_phone = '';
// //                                 e.u_pass = '';
// //                             });
// //                             redis.set('user', JSON.stringify(doc), function () {
// //                                 fn(doc);
// //                             });
// //                         });
// //                     });
// //                 }
// //             });
// //         },
// //         getUserByPhone: function (phone, pass, fn) {
// //             console.log("TRYING TO GET THE USER DETAILS Of " + phone);
// //             db.collection('USER', function (err, collection) {
// //                 if (err) {
// //                     throw err;
// //                 }
// //                 else {
// //                     collection.findOne({$and: [{'u_phone': String(phone)}, {u_pass: pass}]}, function (err, item) {
// //                         fn(item);
// //                     });
// //                 }
// //             });
// //         },
// //         addUser: function (user, fn) {
// //             db.collection('USER', function (err, collection) {
// //                 collection.update({'u_phone': user.u_phone}, user, {upsert: true}, function (error, res) {
// //                     fn(res);
// //                 });
// //             });
// //         },
// //         deleteData: function () {
// //             db.collection('USER', function (err, collection) {
// //                 collection.remove({});
// //             });

// //         },
// //         addRemoveTagFollow: function(tagObj,userPhone){
// //             db.collection('USER', function (err, collection) {
// //                 console.log(tagObj);
// //                 collection.update({'u_phone': userPhone}, {$set:tagObj}, function (err, res) {
// //                 });
// //             });
// //         },
// //         addSubscribedTag: function (tag, user, fn) {
// //             db.collection('USER', function (err, collection) {
// //                 collection.update({'u_phone': user.u_phone}, {$push: {u_tags: tag._id}}, function (err, res) {
// //                     fn(res);
// //                 });
// //             });
// //         },
// //         removeSubscribedTag: function (tag, user, fn) {
// //             console.log(user);
// //             db.collection('USER', function (err, collection) {
// //                 collection.update({'u_phone': user.u_phone}, {$pull: {u_tags: tag._id}}, function (err, res) {
// //                     console.log(err);
// //                     fn(res);
// //                 });
// //             });
// //         },
// //         tagUserCount: function (tagArray, fn) {
// //             var query = {};
// //             var expression = [];
// //             for (var i = 0; i < tagArray.length; i++) {
// //                 var exp = {};
// //                 exp['u_tags.' + tagArray[i]] = 1;
// //                 expression.push(exp);
// //             }
// //             query.$or = expression;
// //             console.log(query);
// //             db.collection('USER', function (err, collection) {
// //                 collection.find(query).toArray(function (err, items) {
// //                     fn(items.length);
// //                 });
// //             });

// //         }

// //     }

// // })();
// // exports.tagDB = (function () {
// //     mongoclient.open(function (err, mongoclien) {
// //         var db = mongoclient.db("TAG");
// //         if (!err) {
// //             db.collection('TAG', {strict: true}, function (err, collection) {
// //                 if (err) {
// //                     console.log("Creating it with default tag");
// //                     populateDB();
// //                 }
// //             });
// //         }
// //     });
// //     var populateDB = function () {

// //         var tag = [
// //             {
// //                 tag_name: "#bangalore",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             },
// //             {
// //                 tag_name: "#nodejs",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             }
// //             , {
// //                 tag_name: "#dota2",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             }, {
// //                 tag_name: "#code",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             }, {
// //                 tag_name: "#health",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             }, {
// //                 tag_name: "#candycrush",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             }, {
// //                 tag_name: "#food",
// //                 tag_img: "tag_bangalore.jpg",
// //                 tag_type: 2,
// //             }];

// //         db.collection('TAG', function (err, collection) {
// //             collection.insert(tag, {safe: true}, function (err, result) {
// //             });
// //         });

// //     };
// //     return {
// //         getAllTags: function (fn) {
// //             console.log("TRYING TO GET TAGS");
// //             db.collection('TAG', function (err, collection) {
// //                 collection.find().toArray(function (err, items) {
// //                     fn(items);
// //                 });
// //             });
// //         },
// //         addTag: function (tag) {
// //             db.collection('TAG', function (err, collection) {
// //                 console.log(tag.tag_name);
// //                 collection.update({'tag_name': tag.tag_name}, tag, {upsert: true});
// //             });
// //         },
// //         deleteData: function () {
// //             db.collection('TAG', function (err, collection) {
// //                 collection.remove({});
// //             });

// //         }
// //     }

// // })();
// // // exports.userRipple = (function () {
// // //     var db = new Db('RIPPLE', server);
// // //     db.open(function (err, db) {
// // //         if (!err) {
// // //             db.collection('RIPPLE', {strict: true}, function (err, collection) {
// // //                 if (err) {
// // //                     console.log("Creating it with default admin user");
// // //                     populateDB();
// // //                 }
// // //             });
// // //         }
// // //     });
// // //     var populateDB = function () {
// // //         var post = [
// // //             {
// // //                 p_name: "Where can i find the best biriyani in #bangalore #food",
// // //                 p_tags: ['#bangalore', '#food'],
// // //                 p_user_no: '918095397926',
// // //                 p_user_name: 'Suvajit Sarkar',
// // //                 p_time:"1457086551",
// // //                 p_isPosted:true
// // //             }, {
// // //                 p_name: "Tu tu hai vohi dil ne jisse apna kaha Tu hai jahan main hoon vahan Ab to yeh jeena tere bin hai saza O mil jaaye is tarah, do lehre jis tarah Phir ho na judaa, haan yeh vaada raha",
// // //                 p_tags: [],
// // //                 p_user_no: '918095397926',
// // //                 p_user_name: 'Suvajit Sarkar',
// // //                 p_time:"1457086551",
// // //                 p_isPosted:true
// // //             }, {
// // //                 p_name: "Zaiotoon get the best arabic style BBQ in #bangalore #food",
// // //                 p_tags: ['#bangalore', '#food'],
// // //                 p_user_no: '918977198191',
// // //                 p_user_name: 'Manojit Sarkar',
// // //                 p_time:"1457086551",
// // //                 p_isPosted:true
// // //             }];

// // //         db.collection('RIPPLE', function (err, collection) {
// // //             collection.insert(post, {safe: true}, function (err, result) {
// // //             });
// // //         });
// // //     };
// // //     return {
// // //         getAllRipples: function (fn) {
// // //             db.collection('RIPPLE', function (err, collection) {
// // //                 collection.find().toArray(function (err, items) {
// // //                     fn(items);
// // //                 });
// // //             });
// // //         },
// // //         getRipple: function (searchQuery, fn) {
// // //             db.collection('RIPPLE', function (err, collection) {
// // //                 if (searchQuery.length > 0) {
// // //                     var re = new RegExp(searchQuery,"i");
// // //                     console.log(re);
// // //                     var q = {$or:[{p_name:re},{p_tags:re},{p_user_name:re},{p_user_no:re}]};
// // //                     console.log(q);
// // //                     collection.find(q).toArray(function (err, items) {
// // //                         fn(items);
// // //                     });
// // //                 }
// // //                 else {
// // //                     collection.find({}).toArray(function (err, items) {
// // //                         fn(items);
// // //                     });
// // //                 }
// // //             });
// // //         },
// // //         addPost: function (ripple,fn) {
// // //             db.collection('RIPPLE', function (err, collection) {
// // //                 collection.insert(ripple, {safe: true}, function (err, result) {
// // //                     fn(result);
// // //                 });
// // //             });
// // //         },
// // //         deleteData: function () {
// // //             db.collection('RIPPLE', function (err, collection) {
// // //                 //collection.remove({});
// // //             });

// // //         }
// // //     }

// // // })();
// // // exports.rippleChatDB = (function () {
// // //     var db = new Db('RIPPLE_CHAT', server);
// // //     db.open(function (err, db) {
// // //         if (!err) {
// // //             db.collection('RIPPLE_CHAT', {strict: true}, function (err, collection) {
// // //                 if (err) {
// // //                     console.log("Creating it with default admin user");
// // //                     populateDB();
// // //                 }
// // //             });
// // //         }
// // //     });
// // //     var populateDB = function () {
// // //         var rc = [
// // //             {
// // //                 rc_phone: '918880510284',
// // //                 rc_name: "Try biriyani zone at kundanahalli gate whitefield",
// // //                 rc_rid: "571ce14f9233e19020e78453",
// // //                 rc_time: "1457086551"
// // //             },
// // //             {
// // //                 rc_phone: '918880510284',
// // //                 rc_name: "Or you can try Zaitoon",
// // //                 rc_rid: "571ce14f9233e19020e78453",
// // //                 rc_time: "1457086551"
// // //             }, {
// // //                 rc_phone: '918880510284',
// // //                 rc_name: "Lol nice song..",
// // //                 rc_rid: "570bc98bf9d7d59804cf3625",
// // //                 rc_time: 1457086551
// // //             }];

// // //         db.collection('RIPPLE_CHAT', function (err, collection) {
// // //             collection.insert(rc, {safe: true}, function (err, result) {
// // //             });
// // //         });

// // //     };
// // //     return {
// // //         getAllChat: function (data, fn) {
// // //             db.collection('RIPPLE_CHAT', function (err, collection) {
// // //                 collection.find({'rc_rid': data._id, 'rc_time': {$gt: data.lm}}).toArray(function (err, items) {
// // //                     fn(items);
// // //                 });
// // //             });
// // //         },
// // //         addChat: function (chat, fn) {
// // //             db.collection('RIPPLE_CHAT', function (err, collection) {
// // //                 collection.insert(chat, {safe: true}, function (err, result) {
// // //                     fn(result)
// // //                 });
// // //             });
// // //         },
// // //         deleteData: function () {
// // //             db.collection('RIPPLE_CHAT', function (err, collection) {
// // //                 //collection.remove({});
// // //             });

// // //         }
// // //     }

// // // })();
// // // exports.tagChatDB = (function () {
// // //     var db = new Db('TAG_CHAT', server);
// // //     db.open(function (err, db) {
// // //         if (!err) {
// // //             db.collection('TAG_CHAT', {strict: true}, function (err, collection) {
// // //                 if (err) {
// // //                     console.log("Creating it with default tag chat");
// // //                     populateDB();
// // //                 }
// // //             });
// // //         }
// // //     });
// // //     var populateDB = function () {
// // //         var tc = [
// // //             {
// // //                 tc_phone: '918880510284',
// // //                 tc_name: "Namma Bengaluru",
// // //                 tc_tname: "#bangalore",
// // //                 tc_time: "1457086551"
// // //             },
// // //             {
// // //                 tc_phone: '918880510284',
// // //                 tc_name: "Welcome all to #hive; Live Targeted information network platform",
// // //                 tc_tname: "#hive",
// // //                 tc_time: "1457086551"
// // //             }];

// // //         db.collection('TAG_CHAT', function (err, collection) {
// // //             collection.insert(tc, {safe: true}, function (err, result) {
// // //             });
// // //         });

// // //     };
// // //     return {
// // //         getAllChat: function (data, fn) {
// // //             db.collection('TAG_CHAT', function (err, collection) {
// // //                 collection.find({'tc_tname': data.tagName, 'tc_time': {$gt: data.lm}}).toArray(function (err, items) {
// // //                     fn(items);
// // //                 });
// // //             });
// // //         },
// // //         addChat: function (chat, fn) {
// // //             db.collection('TAG_CHAT', function (err, collection) {
// // //                 collection.insert(chat, {safe: true}, function (err, result) {
// // //                     fn(result)
// // //                 });
// // //             });
// // //         },
// // //         deleteData: function () {
// // //             db.collection('TAG_CHAT', function (err, collection) {
// // //                 //collection.remove({});
// // //             });

// // //         }
// // //     }

// // // })();
// // // exports.userChatDB = (function () {
// // //     var db = new Db('USER_CHAT', server);
// // //     db.open(function (err, db) {
// // //         if (!err) {
// // //             db.collection('USER_CHAT', {strict: true}, function (err, collection) {
// // //                 if (err) {
// // //                     console.log("Creating it with default admin user");
// // //                     populateDB();
// // //                 }
// // //             });
// // //         }
// // //     });
// // //     var populateDB = function () {
// // //         var uc = [
// // //             {
// // //                 uc_id_creator: '571c785c9b730dc9f4e4d878',
// // //                 uc_id_receiver: '571c7bc89b730dc9f4e4d87a',
// // //                 uc_phone_creator:'918095397926',
// // //                 uc_name: "Hello",
// // //                 uc_time: "1457086551"
// // //             }];

// // //         db.collection('USER_CHAT', function (err, collection) {
// // //             collection.insert(uc, {safe: true}, function (err, result) {
// // //             });
// // //         });

// // //     };
// // //     return {
// // //         getAllChat: function (data, fn) {
// // //             db.collection('USER_CHAT', function (err, collection) {
// // //                 collection.find({$or:[{'uc_id_creator': data.me,'uc_id_receiver': data.other, 'uc_time': {$gt: data.lm}},
// // //                     {'uc_id_creator': data.other,'uc_id_receiver': data.me, 'uc_time': {$gt: data.lm}}]}).toArray(function (err, items) {
// // //                     fn(items);
// // //                 });
// // //             });
// // //         },
// // //         addChat: function (chat, fn) {
// // //             db.collection('USER_CHAT', function (err, collection) {
// // //                 collection.insert(chat, {safe: true}, function (err, result) {
// // //                     fn(result)
// // //                 });
// // //             });
// // //         },
// // //         deleteData: function () {
// // //             db.collection('USER_CHAT', function (err, collection) {
// // //                 //collection.remove({});
// // //             });

// // //         }
// // //     }

// // // })();