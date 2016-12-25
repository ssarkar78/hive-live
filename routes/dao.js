var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('bson').BSONPure,
    assert = require('assert');

  // Set up the connection to the local db
 var server = new Server('localhost', 27017, {auto_reconnect: true});
 var mongoclient = new MongoClient(server, {native_parser: true});


exports.userDB = (function () {
    var db = new Db('USER', server);
    db.open(function (err, db) {
        if (!err) {
            db.collection('USER', {strict: true}, function (err, collection) {
                if (err) {
                    console.log("Creating it with default admin user");
                    populateDB();
                }
            });
            db.collection('TAG', {strict: true}, function (err, collection) {
                if (err) {
                    console.log("Creating it with default TAG");
                    populateTag();
                }
            });
        }
    });
    var populateDB = function () {

        var user = [
            {
                u_name: "Suvajit Sarkar",
                u_img: "1443031115953.jpg",
                u_phone: "918095397926",
                u_loc: "bangalore",
                u_tags: {'#bangalore': 1, '#nodejs': 1, '#dota2': 1, '#code': 1},
                u_status: "Founder Hive Labs",
                u_pass: "ba9c54c8269780dae38325a723761e3a489406f1256745b00e09efe5755b20e2"
            },
            {
                u_name: "Pranami Bordoloi",
                u_img: "1443031115952.jpg",
                u_phone: "918880510284",
                u_loc: "bangalore",
                u_tags: {'#bangalore': 1, '#food': 1, '#candycrush': 1, '#health': 1},
                u_status: "Dentist Veydehi",
                u_pass: "26842da89049f02d89ec9cccec2f745420a20db2a756aa49ec3ef715973616ec"
            }];

        db.collection('USER', function (err, collection) {
            collection.insert(user, {safe: true}, function (err, result) {
            });
        });

    };
    var populateTag = function () {

        var tag = [
            {
                tag_name: "#bangalore",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            },
            {
                tag_name: "#nodejs",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            }
            , {
                tag_name: "#dota2",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            }, {
                tag_name: "#code",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            }, {
                tag_name: "#health",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            }, {
                tag_name: "#candycrush",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            }, {
                tag_name: "#food",
                tag_img: "tag_bangalore.jpg",
                tag_type: 2,
            }];

        db.collection('TAG', function (err, collection) {
            collection.insert(tag, {safe: true}, function (err, result) {
            });
        });

    };
    return {
        searchUser: function (searchQuery, fn) {
            db.collection('USER', function (err, collection) {
                if (searchQuery.length > 0) {
                    collection.find({$text: {$search: searchQuery}}).toArray(function (err, items) {
                        fn(items);
                    });
                }
                else {
                    collection.find({}).toArray(function (err, items) {
                        fn(items);
                    });
                }
            });
        },
        getAllUser: function (redis, fn) {
            redis.get('user', function (err, reply) {
                if (err) fn(null);
                else if (!reply) { //Book exists in cache
                    console.log('from cache');
                    fn(JSON.parse(reply));
                }
                else {
                    db.collection('USER', function (err, collection) {
                        collection.find().toArray(function (err, items) {
                            var doc = {};
                            var usernameMapper = {};
                            items.forEach(function (e) {
                                var phone = e.u_phone;
                                doc[phone] = e;
                                e.u_phone = '';
                                e.u_pass = '';
                            });
                            redis.set('user', JSON.stringify(doc), function () {
                                fn(doc);
                            });
                        });
                    });
                }
            });
        },
        getUserByPhone: function (phone, pass, fn) {
            console.log("TRYING TO GET THE USER DETAILS Of " + phone);
            db.collection('USER', function (err, collection) {
                if (err) {
                    throw err;
                }
                else {
                    collection.findOne({$and: [{'u_phone': String(phone)}, {u_pass: pass}]}, function (err, item) {
                        fn(item);
                    });
                }
            });
        },
        addUser: function (user, fn) {
            db.collection('USER', function (err, collection) {
                collection.update({'u_phone': user.u_phone}, user, {upsert: true}, function (error, res) {
                    fn(res);
                });
            });
        },
        deleteData: function () {
            db.collection('USER', function (err, collection) {
                collection.remove({});
            });

        },
        addRemoveTagFollow: function(tagObj,userPhone){
            db.collection('USER', function (err, collection) {
                console.log(tagObj);
                collection.update({'u_phone': userPhone}, {$set:tagObj}, function (err, res) {
                });
            });
        },
        addSubscribedTag: function (tag, user, fn) {
            db.collection('USER', function (err, collection) {
                collection.update({'u_phone': user.u_phone}, {$push: {u_tags: tag._id}}, function (err, res) {
                    fn(res);
                });
            });
        },
        removeSubscribedTag: function (tag, user, fn) {
            console.log(user);
            db.collection('USER', function (err, collection) {
                collection.update({'u_phone': user.u_phone}, {$pull: {u_tags: tag._id}}, function (err, res) {
                    console.log(err);
                    fn(res);
                });
            });
        },
        tagUserCount: function (tagArray, fn) {
            var query = {};
            var expression = [];
            for (var i = 0; i < tagArray.length; i++) {
                var exp = {};
                exp['u_tags.' + tagArray[i]] = 1;
                expression.push(exp);
            }
            query.$or = expression;
            console.log(query);
            db.collection('USER', function (err, collection) {
                collection.find(query).toArray(function (err, items) {
                    fn(items.length);
                });
            });

        }

    }

})();
