var crypto = require('./routes/hive-crypto');
var presence = require('./routes/presence').presence;
var dao = require('./routes/dao');
var twooshRegister = require('./routes/register')
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require("fs");
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/static/images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});
var upload = multer({storage: storage});
var app = express();
var path = require("path");
var sess;
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');


app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('trust proxy', 1);
app.set('superSecret', 'mqaf389rCJ4nFONjgw3B');

app.use('/', express.static(__dirname + '/views/static')); // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

// var redis = require('redis');
// var client = redis.createClient();
// client.on('connect', function () {
//     console.log('connected to redis');
// });
function detectSource(request) {
    var ua = request.headers['user-agent'],
        $ = {};
    if (/mobile/i.test(ua))
        $.Mobile = true;

    if (/like Mac OS X/.test(ua)) {
        $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
        $.iPhone = /iPhone/.test(ua);
        $.iPad = /iPad/.test(ua);
    }

    if (/Android/.test(ua))
        $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

    if (/webOS\//.test(ua))
        $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

    if (/(Intel|PPC) Mac OS X/.test(ua))
        $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

    if (/Windows NT/.test(ua))
        $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];
    return $;
}

app.post('/getRippleChat', function (req, res) {
    var data = {'_id': req.body._id, 'lm': req.body.lm};
    console.log(data);
    dao.userDB.getAllUser(client, function (resp) {
        dao.rippleChatDB.getAllChat(data, function (items) {
            console.log(items);
            var result = items.map(function (e) {
                e.user = resp[e.rc_phone];
                e.rc_phone = '';
                return e;
            });
            console.log(result);
            res.end(JSON.stringify(result));
        });
    });
});
app.post('/postRippleChat', function (req, res) {
    sess = req.session;
    if (!sess.phone) {
        res.end(JSON.stringify({status: 'Unauthorized'}));
    }
    else {
        var chat = {rc_phone: sess.phone, rc_name: req.body.chat, rc_rid: req.body._id, rc_time: String(Date.now())};
        console.log(chat);
        dao.rippleChatDB.addChat(chat, function (items) {
            items['status'] = 'success';
            res.end(JSON.stringify(items));
        });
    }
});

app.post('/pin-gen', function (req, res) {
    var userPhone = req.body.phone;
    twooshRegister.verifyUserPhone.createPin(userPhone);
    res.json({success: true});
});
app.post('/sign-up', function (req, res) {
    var source = detectSource(req);
    var phone = req.body.phone;
    var pass = crypto.encryptPassword(phone, req.body.pass);
    var pin = req.body.pin;
    var user = {
        u_name: Date.now(),
        u_img: '',
        u_phone: phone,
        u_loc: '',
        u_tags: {},
        u_status: 'Hi..Im using #hive ',
        u_pass: pass
    }
    if (twooshRegister.verifyUserPhone.isPinCorrect(phone, pin)) {
        dao.userDB.addUser(user, function (result) {
            var token = jwt.sign({u_phone: phone, u_pass: pass, u_source: source}, app.get('superSecret'), {
                expiresIn: 604800 // expires in 1 week
            });
            client.set(phone + JSON.stringify(source), token);
            // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token..',
                token: token,
                response: result
            });
        });
    }
});
app.get('/logout', function (req, res) {

    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    });

});

app.get('/', function (req, res) {
    // dao.userDB.getAllUser(client, function (res) {
    // });
    res.render('index3.html', {
        resText: 'Welcome to #hive' ,
    });
});
app.get('/home', function (req, res) {
    var query = req.query.query;
    if (query) {
        res.render('home.html', {
            'query': query,
            'search': query,
            'rippleHit': 0
        });
    }
    else {
        res.render('home.html', {'query': "#hive", 'search': ""});
    }

});
app.get('/dock', function (req, res) {
    res.render('dock.html', {
        resText: 'Welcome to #hive' ,
    });
});
app.get('/message/:id', function(req, res) {
     res.render('dock1.html', {
        messageId: req.params.id ,
    });
})
// get an instance of the router for api routes
var apiRoutes = express.Router();
//Open api
apiRoutes.get('/ripple', function (req, resp) {
    var query = req.body.query || req.query.query;
    dao.userDB.getAllUser(client, function (res) {
        dao.userRipple.getRipple(query, function (item) {
            var result = [];
            if (item) {
                result = item.map(function (e) {
                    e.user = res[e.p_user_no];
                    e.p_user_no = ''
                    return e;
                });
            }
            resp.json(result);
        });
    })
});
apiRoutes.get('/user', function (req, resp) {
    console.log("here");
    var query = req.body.query || req.query.query;
    dao.userDB.searchUser(query, function (item) {
        var result = [];
        if (item) {
            console.log(item);
            result = item.map(function (e) {
                e.u_phone = ''
                e.u_pass = ''
                return e;
            });
        }
        if(result.length==0)
            resp.json(result);
        else {
            var count = 0;
            result.forEach(function (user, i) {
                client.sismember('online-user', "" + user._id, function (err, reply) {
                    count++;
                    result[i].u_online = reply;
                    if (count == result.length)
                        resp.json(result);
                });
            });
        }
    });
});
apiRoutes.post('/userAuth', function (req, res) {
    var source = detectSource(req);
    console.log(source);
    var userPhone = req.body.phone;
    var userPass = req.body.pass;
    var userSource = req.body.source;
    var passHash = crypto.encryptPassword(userPhone, userPass);
    dao.userDB.getUserByPhone(userPhone, passHash, function (user) {
        if (user) {
            var token = jwt.sign({
                u_phone: userPhone,
                u_pass: passHash,
                u_id: user._id,
                u_source: userSource
            }, app.get('superSecret'), {
                expiresIn: 604800 // expires in 1 week
            });
            var response = user;
            // return the information including token as JSON
            res.json({
                success: true,
                message: 'Enjoy your token..',
                token: token,
                response: response
            });
        }
        else {
            res.json({success: false, message: 'invalid phone or pass', token: null, response: null});
        }
    });
});
//get tagChats
apiRoutes.get('/tagChat', function (req, res) {
    var data = {'tagName': req.query.tagName, 'lm': req.query.lm};
    console.log(data);
    dao.userDB.getAllUser(client, function (resp) {
        dao.tagChatDB.getAllChat(data, function (items) {
            console.log(items);
            var result = items.map(function (e) {
                e.user = resp[e.tc_phone];
                e.rc_phone = '';
                return e;
            });
            console.log(result);
            res.end(JSON.stringify(result));
        });
    });
});
apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies['userToken'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                console.log(decoded);
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});
//Auth api
apiRoutes.get('/userDetails', function (req, res) {
    dao.userDB.getUserByPhone(req.decoded.u_phone, req.decoded.u_pass, function (user) {
        if (user) {
            res.json(user);
        }
    });
});
//Todo[this comes from the form submission need to fix this for ajax call form submission ]
apiRoutes.post('/profile-edit', upload.single('avatar'), function (req, res) {
    var phone = req.decoded.u_phone;
    var pass = req.decoded.u_pass;
    var name = req.body.name;
    var about = req.body.about;
    var loc = req.body.loc;
    var file = req.file.filename || '';
    var user = {
        u_name: name,
        u_img: file,
        u_phone: phone,
        u_loc: loc,
        u_tags: {},
        u_status: about,
        u_pass: pass
    }
    dao.userDB.addUser(user, function (result) {
        res.redirect('../home');
    });
});

apiRoutes.post('/ripple', function (req, res) {
    console.log('adding ripple');
    if (req.body.ripple && req.body.ripple.length) {
        var rippleText = req.body.ripple;
        var userTags = {};
        var rippleArray = rippleText.split(/[\r\n ,.]+/).filter(function (e) {
            if (e.trim()[0] == '#') {
                var tagNotificationChat = {
                    tc_phone: '918880510284',
                    tc_name: "New ripple added : " + rippleText,
                    tc_tname: e,
                    tc_time: String(Date.now())
                }
                dao.tagChatDB.addChat(tagNotificationChat, function (resp) {
                });
                userTags['u_tags.' + e] = 1;
                return true;
            }
        });
        if (rippleArray.length > 0)
            dao.userDB.addRemoveTagFollow(userTags, req.decoded.u_phone);
        var ripple = {
            p_name: rippleText,
            p_tags: rippleArray,
            p_user_no: req.decoded.u_phone,
            p_user_name: req.body.u_name,
            p_time: Date.now(),
            p_isPosted: true
        }
        dao.userRipple.addPost(ripple, function (items) {
            items['status'] = 'success';
            res.json(items);
        });
    }

});
apiRoutes.post('/rippleChat', function (req, res) {
    var chat = {
        rc_phone: req.decoded.u_phone,
        rc_name: req.body.chat,
        rc_rid: req.body._id,
        rc_time: String(Date.now())
    };
    dao.rippleChatDB.addChat(chat, function (items) {
        items['status'] = 'success';
        res.end(JSON.stringify(items));
    });
});
apiRoutes.post('/tagChat', function (req, res) {
    var tagChat = {
        tc_phone: req.decoded.u_phone,
        tc_name: req.body.chat,
        tc_tname: req.body.tagName,
        tc_time: String(Date.now())
    }
    dao.tagChatDB.addChat(tagChat, function (items) {
        items['status'] = 'success';
        res.end(JSON.stringify(items));
    });
});
apiRoutes.get('/userChat', function (req, res) {
    var data = {'me': req.decoded.u_id, 'other': req.query.otherId, 'lm': req.query.lm};
    dao.userDB.getAllUser(client, function (resp) {
        dao.userChatDB.getAllChat(data, function (items) {
            var result = items.map(function (e) {
                console.log(e);
                e.user = resp[e.uc_phone_creator];
                e.uc_phone_creator = "";
                return e;
            });
            res.end(JSON.stringify(result));
        });
    });

});
apiRoutes.post('/userChat', function (req, res) {
    var uc = {
        uc_id_creator: req.decoded.u_id,
        uc_id_receiver: req.body._id,
        uc_phone_creator: req.decoded.u_phone,
        uc_name: req.body.chat,
        uc_time: String(Date.now())
    }
    dao.userChatDB.addChat(uc,function(resp){
        resp['status'] = 'success';
        res.end(JSON.stringify(resp));
    });

});
apiRoutes.get('/', function (req, res) {
    res.json({message: 'Welcome to the coolest API on earth!'});
});
// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);
app.listen(8000);

/*<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< SOCKET IO PART >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
var socketPort = 8080;
var io = require('socket.io').listen(app.listen(socketPort));
var socketioJwt   = require("socketio-jwt");
io.use(socketioJwt.authorize({
    secret: app.get('superSecret'),
    handshake: true
}));

///////////////////////////////

io.on('connection', function (socket) {
    var u_phone = socket.decoded_token.u_phone;
    var u_id = socket.decoded_token.u_id;
    socket.join('user-room-'+u_id);
    console.log('Welcome '+u_id);
    client.sadd(['online-user',u_id], function(err, reply) {
        console.log(reply); // 3
    });

    //Broadcast to all about user status
    io.emit('im-connected',{u_id:u_id,message:'online'});

    socket.on('personal-message',function(data,callback) {
        var data = JSON.parse(data);
        var u_id = socket.decoded_token.u_id;
        var selfRoom = 'user-room-'+u_id;
        var otherRoom = 'user-room-'+data._id;
        var uc = {
            uc_id_creator: u_id,
            uc_id_receiver: data._id,
            uc_phone_creator: '',
            uc_name: data.chat,
            uc_time: String(Date.now())
        }
        dao.userDB.getAllUser(client, function (resp) {
            uc.user = resp[socket.decoded_token.u_phone];
            var jsonRes = JSON.stringify(uc);
            console.log(uc);
            console.log(socket.decoded_token.u_id);
            socket.broadcast.to(selfRoom).emit('pm-self',jsonRes);
            socket.broadcast.to(otherRoom).emit('pm-other', jsonRes);
            callback(JSON.stringify(uc));
        });
    });
    socket.on('disconnect', function() {
        console.log("disconnect "+socket.decoded_token.u_phone);
        if(!io.sockets.adapter.rooms['user-room-'+socket.decoded_token.u_id]){
            client.srem('online-user',socket.decoded_token.u_id);
            socket.broadcast.emit('im-connected',{u_id:u_id,message:'offline',lActive:String(Date.now())})
        };
        client.smembers('online-user', function(err, reply) {
            console.log(reply);
        });
        client.sismember(['online-user',socket.decoded_token.u_id],function(err,reply){
            console.log(reply);
        });
    });
})

var pokerSocketPort = 8888;
var pokerIo = require('socket.io').listen(app.listen(pokerSocketPort));

pokerIo.use(function (socket, next) {
    var query = socket.handshake.query;//[useto the check for authentic calls from the twoosh web server only,find other auth ways]
    next();
});

pokerIo.on('connection', function (socket) {
    console.log('connected to poker..');
    socket.on('joinTagRoom', function (data, fn) {
        var tag = JSON.parse(data);
        socket.join(tag);
        fn('joined');
    });

    socket.on('disconnect', function () {
        console.log("fire disconnect");
    });
});

