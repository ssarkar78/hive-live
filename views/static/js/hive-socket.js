hiveSocket = (function () {
    var addEvents = function () {
        _t().addOnListener('pm-other', function (data) {
            var data = JSON.parse(data);
            if(document.hidden || document.getElementById('userChat'+data.user._id)== null)
                notificationSystem.notify(data.user.u_name,data.uc_name,data.user.u_img);
            else {
                var user = userModule.getUser(data.user._id);
                user.newChatAdd(data);
            }
        });
        _t().addOnListener('im-connected', function (data) {
            if(true || data.u_id != loginModule.getUserDetails().userId){
                var userList = userFeeds.getUserList();
                if(data.message=='online')
                    userList[''+data.u_id].u_online = 1;
                else {
                    userList['' + data.u_id].u_online = 0;
                    userList['' + data.u_id].lActivity = new Date(data.lActive-0);
                }
                userFeeds.renderUI();
            }
        });
    }
    var emitCallback = function (msg) {
        console.log(msg);
    }
    var connectCallback = function (msg) {
        console.log(msg);
    }

    return {
        requestRipple: function (data,fn) {
            _t().emitterEmit("requestRipple",data,fn)
        },
        connectUser: function (data) {
            var queryData = {'sync disconnect on unload': true, query: data}
            _t().connect(queryData);
            addEvents();
        },
        connectUserToPoker: function (data) {
            var pokerHost = "http://localhost:8888/";
            var queryData = {'sync disconnect on unload': true, query: data}
            _t().connect(queryData,pokerHost);
        },
        sendPersonalMessage: function(data,fn){
            _t().emitterEmit("personal-message",data,fn);
        },
        enterUser: function(i,fn){
            _t().emitterEmit("enterUser",i,fn)
        },
        sendRipple: function (ripple) {
            _t().emitterEmit("sendRipple", ripple, emitCallback);

        },
        sendComment: function (comment, fn) {
            _t().emitterEmit("publishComment", comment, fn);
        },
        addSubscribedTag: function (data, callback) {
            console.log(data);
            _t().emitterEmit("addSubscribedTag", data, callback);
        },
        removeSubscribedTag: function (data, callback) {
            _t().emitterEmit("removeSubscribedTag", data, callback);
        },
        loadChatMessage: function (data, callback) {
            _t().emitterEmit("loadChatMessage", data, callback);
        },
        onSelfComment: function (lname,callback) {
            if(!(_t().socket.hasListeners(lname)))
                _t().addOnListener(lname,callback);
        },
        addToTagRoom: function (data,callback) {
            _t().emitterEmit('joinTagRoom',data,callback);
        }
    }

})(this);
