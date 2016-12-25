/**
 * Created by ssarkar on 22-04-2016.
 */
var express = require("express");
var app = express();
var port = 8080;
var io = require('socket.io').listen(app.listen(port));

io.use(function (socket, next) {
    var query = socket.handshake.query;//[useto the check for authentic calls from the twoosh web server only,find other auth ways]
    next();
});

io.on('connection', function (socket) {
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