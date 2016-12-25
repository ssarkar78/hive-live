/**
 * Created by ssarkar on 09-04-2016.
 */
var visibleModuleId = 0;
var rippleModule = (function () {
    var rippleList = {};
    var ripple = function (rippleId, rippleTitle, rippleUserId) {
        this.rippleId = rippleId;
        this.rippleReplies = [];
        this.rippleTitle = rippleTitle;
        this.rippleUserId = rippleUserId;
        this.rippleHits;
        this.currentRequest;
        this.mainContainerHtml = '<div id="chat' + rippleId + '"></div>';
        this.bottomToolbarHtml = '<div class="col s11"><div class="col s12" style="padding-bottom:5px;">' +
            '<div class="row"><div class="row valign-wrapper" style="padding: 8px; border-radius:5px;border: 1px solid #cccccc"> ' +
            '<div class="col s10">' +
            '<div class="col s12"> ' +
            '<textarea id="tarea'+rippleId+'" rows="1" class="materialize-textarea ripple-chat-bottom-toolbar" spellcheck="false" placeholder="Say Something.."></textarea></div></div> ' +
            '<div class="col s2"><a href="#" data-value="'+rippleId+'" id="ripple-chat-btn" class="btn ripple-chat-btn" style="float:right">REPLY</a> </div> </div></div> ' +
            '</div></div>';
        this.dummyChatAdd = function(e){
            var chat = htmlEncode(e.chat);
            var userDetails = loginModule.getUserDetails();
            var html = "<div class='ripple-chat-element' id=''>" +
                "<table style='padding:0px 0px 0px 0px'><tr><td rowspan='2' width='40px'><img src='../images/"+userDetails.userImg+"'></td>" +
                "<td><a data-id='" + userDetails.userId + "' class='user-link'" +
                "href='#" + userDetails.userName + "_" + userDetails.userId + "'>" + userDetails.userName + "</a></td>" +
                "</tr> <tr> <td><p class='ripple-chat-owner-status'>" + userDetails.userStatus + "</p></td> </tr>" +
                " <tr> <td></td> <td>" +
                "<div class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                "<pre>" + chat + "</pre>" +
                "</div> </td> <tr> </table> </div>";
            $('#chat' + this.rippleId).append(html);
            //$('#ripple-chat-container').perfectScrollbar('update');
        };
        this.postRippleChat = function (chat,token){
            var that = this;
            $.ajax({
                type: 'POST',
                data: chat,
                url: 'api/rippleChat?token='+token,
                success: function (data) {
                    var data = JSON.parse(data);
                    console.log(data);
                },
                error: function (e) {
                    // Error
                }
            });
            this.dummyChatAdd(chat);

        };
        this.loadRippleChat = function () {
            //Init calls
            $('#ripple-chat-container').html(this.mainContainerHtml);
            $('#ripple-chat-bottom-toolbar').html(this.bottomToolbarHtml);


            var lastMessageTime = (this.rippleReplies[this.rippleReplies.length - 1]) ? this.rippleReplies[this.rippleReplies.length - 1].rc_time : '0';
            var that = this;
            console.log(lastMessageTime);
            var data = {_id: this.rippleId, lm: lastMessageTime};
            var that = this;
            this.currentRequest = $.ajax({
                type: 'POST',
                data: data,
                url: '/getRippleChat',
                beforeSend: function () {
                    if (that.currentRequest != null) {
                        that.currentRequest.abort();
                    }
                },
                success: function (data) {
                    var data = JSON.parse(data);
                    console.log(data);
                    data.forEach(function (e) {
                        that.rippleReplies.push(e);
                    });
                    that.renderUI();
                },
                error: function (e) {
                    // Error
                }
            });
        }
        this.renderUI = function () {
            var that = this;
            $('#chat' + that.rippleId).html('');//HTML CLEAN
            var lTime = 0;
            this.rippleReplies.forEach(function (e) {
                var dateString = String(new Date(Number(e.rc_time))).substring(0,15);
                if(lTime!=dateString) {
                    var timeHtml = '<div style="border-bottom: 1px solid #e4e4e4;position: relative;padding-bottom:10px ">' +
                        '<div class="" style="padding:5px;position: absolute;left:45%;background: whitesmoke;z-index: 10"><b>'+dateString+'</b></div></div>';
                    $('#chat' + that.rippleId).append(timeHtml);
                    lTime = dateString;
                }
                var rChat = htmlEncode(e.rc_name);

                var html = "<div class='ripple-chat-element' id='" + e._id + "'>" +
                    "<table style='padding:0px 0px 0px 0px'><tr><td rowspan='2' width='40px'><img src='../images/"+ e.user.u_img+"'></td>" +
                    "<td><a data-id='" + e.user._id + "' class='user-link'" +
                    "href='#" + e.user.u_name + "_" + e.user._id + "'>" + e.user.u_name + "</a></td>" +
                    "</tr> <tr> <td><p class='ripple-chat-owner-status'>" + e.user.u_status + "</p></td> </tr>" +
                    " <tr> <td></td> <td>" +
                    "<div class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                    "<pre>" + rChat + "</pre>" +
                    "</div> </td> <tr> </table> </div>";
                $('#chat' + that.rippleId).append(html);
            });
            //$('#ripple-chat-container').perfectScrollbar('update');
        }
        function htmlEncode(value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        }
    }
    return {
        loadRipple: function (rippleId, rippleTitle, rippleUserId) {
            if (!rippleList[rippleId]) {
                var rippleObj = new ripple(rippleId, rippleTitle, rippleUserId);
                rippleList[rippleId] = rippleObj;
            }
            visibleModuleId = rippleId;
            return rippleList[rippleId];
        },
        getRipple: function (rippleId) {
            return rippleList[rippleId];
        }
    }

})();
var userFeeds = (function () {
    var userFeedsList = {};

    function renderUI() {
        $('#userFeeds-container').html('');
        Object.keys(userFeedsList).forEach(function (key) {
            var e = userFeedsList[""+key];
            var activityStatus = (e.u_online)?"Online": e.lActivity||"Offline";
            var colorCode = (e.u_online)?'00c853':'cccccc';
            var html = '<div class="ripple-feeds-element user-feed-element" id="user-feed-' + e._id + '" data-value="' + e.u_name   + '">'
                + '<table style="padding:0px 0px 0px 0px">'
                + '<tr><td rowspan="2" width="40px"><img src="../images/' + e.u_img + '"></td><td><a class="user-link"'
                + 'href="#' + e.u_name + '_' + e._id + '"data-id="'+ e._id+'"><b>' + e.u_name + '</b></a></td></tr><tr>'
                + '<td><p class="ripple-feeds-owner-status">' + e.u_status + '</p></td></tr><tr><td></td><td style="color: #'+colorCode+';font-weight: 500">'+activityStatus
                + '</td><tr></table></div>';
            $('#userFeeds-container').append(html);
        });
    }

    return {
        loadUserRender: function (userList) {
            userList.forEach(function (e) {
                userFeedsList[""+e._id] = e;
            })
            renderUI();
        },
        getUserList: function(){
            return userFeedsList;
        },
        renderUI: function () {
            renderUI();
        }
    }
})();
var recentRippleFeeds = (function () {
    var rippleList = [];

    function renderUI() {
        $('#recentRippleFeeds-container').html('');
        var rippleListReverse = rippleList.reverse();
        rippleListReverse.forEach(function (e) {
            var ripple = htmlEncode(e.p_name);
            ripple.split(/[\r\n ,.]+/).filter(function (e) {
                return (e.trim()[0] == '#')
            }).forEach(function (e) {
                ripple = ripple.replace(e, "<a class='tag-link tag-anchor' href='" + e + "'>" + e + "</a>");
            });
            var html = '<div class="ripple-feeds-element" id="' + e._id + '" data-value="' + ripple + '">'
                + '<table style="padding:0px 0px 0px 0px">'
                + '<tr><td rowspan="2" width="40px"><img src="../images/' + e.user.u_img + '"></td><td style="font-size: 12.5px"><a data-id="' + e.user._id + '" class="user-link"' +
                   "href='#" + e.user.u_name + "_" + e.user._id + "'>" + e.user.u_name + "</a></td></tr><tr>"
                + '<td><p class="ripple-feeds-owner-status">' + e.user.u_status + '</p></td></tr><tr><td></td><td>'
                + '<p class="ripple-feeds-element-text">' + ripple + '</p></td><tr></table></div>';
            $('#recentRippleFeeds-container').append(html);
        });
        //$('#recentRippleFeeds-container').perfectScrollbar('update');
    }

    function htmlEncode(value) {
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return $('<div/>').text(value).html();
    }

    function htmlDecode(value) {
        return $('<div/>').html(value).text();
    }

    return {
        loadRippleRender: function (ripple) {
            rippleList = ripple;
            renderUI();
        }
    }
})();
var loginModule = (function () {
    var isLogged;
    var lastLogged;
    var userId;
    var userName;
    var userStatus;
    var userPhone;
    var userTags;
    var userImg;
    var userGender;
    var userChannel;

    function generateHtml() {
        var html = ""
        if (!isLogged) {
            html = '<table id="not-logged-user-panel" border="1" style="color: black !important;" cellpadding="0px" cellspacing="0px"><tr>' +
                '<td  style="vertical-align: top;padding:0px;" rowspan="2"><img src="../images/image-placeholder.jpg" height="80px" width="80px"/>' +
                '</td> <td style="padding:0px;font-size: 14.5px !important; font-weight: bold">Anonymous</td> </tr> <tr>' +
                '<td style="padding: 0px;text-decoration: underline">Click to login or register</td></tr></table>';
        }
        else {
            html = '<div id="logged-user-' + userId + '">' +
                '<img src="../images/' + userImg + '" height="50px" width="50px"/>' +
                '<div style="padding:0px;font-size: 12.5px !important; font-weight: bold">' + userName + '</div>' +
                '<div style="padding: 0px;">' + userStatus + '</div><span style="text-decoration: underline"><a id="logout-link" href="/logout">Logout</a></span></div>';
        }
        return html;
    }

    function renderUI() {
        var html = generateHtml();
        $('#logged-user-container').html(html);
    }

    function renderMyChannelList() {
        $('#my-fav-channel-list').html = '';//clean html
        Object.keys(userChannel).forEach(function (e) {
            var html = "<a style='font-weight: 500;font-size: 13px' class='tag-link tag-anchor' href='" + e + "'>" + e + "</a></br>";
            if (userChannel[e] == 1)
                $('#my-fav-channel-list').append(html);
        });

    }

    return {
        getUserDetails: function () {
            return {
                userId: userId, userName: userName, userStatus: userStatus, userPhone: userPhone, userTags: userTags,
                userImg: userImg, userGender: userGender
            }
        },
        setUserDetails: function (a, b, c, d, e, f, g) {
            userGender = f;
            userName = b;
            userId = a;
            userImg = e;
            userStatus = c;
            userPhone = d;
            isLogged = g;
            renderUI();
        },
        setMyChannels: function (channelList) {
            userChannel = channelList;
            renderMyChannelList();
        }

    }

})();
var tagModule = (function () {
    var tagList = {};
    var tag = function (tagName) {
        this.tagName = tagName;
        this.tagMessages = [];
        this.tagHits;
        this.currentRequest;
        this.mainContainerHtml = '<div id="tag' + tagName + '"></div>';
        this.bottomToolbarHtml = '<div class="col s11"><div class="col s12" style="padding-bottom:5px;">' +
            '<div class="row"><div class="row valign-wrapper" style="padding: 8px; border-radius:5px;border: 1px solid #cccccc"> ' +
            '<div class="col s10">' +
            '<div class="col s12"> ' +
            '<textarea id="tarea'+tagName+'" rows="1" class="materialize-textarea ripple-chat-bottom-toolbar" spellcheck="false" placeholder="Say Something to '+tagName+' channel.."></textarea></div></div> ' +
            '<div class="col s2"><a href="#" data-value="'+tagName+'" class="btn tag-chat-btn" style="float:right">REPLY</a> </div> </div></div> ' +
            '</div></div>';
        this.dummyChatAdd = function(e){
            var chat = htmlEncode(e.chat);
            var userDetails = loginModule.getUserDetails();
            var html = "<div class='ripple-chat-element' id=''>" +
                "<table style='padding:0px 0px 0px 0px'><tr><td rowspan='2' width='40px'><img src='../images/"+userDetails.userImg+"'></td>" +
                "<td><a data-id='" + userDetails.userId + "' class='user-link'" +
                "href='#" + userDetails.userName + "_" + userDetails.userId + "'>" + userDetails.userName + "</a></td>" +
                "</tr> <tr> <td><p class='ripple-chat-owner-status'>" + userDetails.userStatus + "</p></td> </tr>" +
                " <tr> <td></td> <td>" +
                "<div class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                "<pre>" + chat + "</pre>" +
                "</div> </td> <tr> </table> </div>";
            $(document.getElementById('tag' + this.tagName)).append(html);
        };
        this.postTagChat = function (chat,token){
            var that = this;
            $.ajax({
                type: 'POST',
                data: chat,
                url: 'api/tagChat?token='+token,
                success: function (data) {
                    var data = JSON.parse(data);
                    console.log(data);
                },
                error: function (e) {
                    // Error
                }
            });
            this.dummyChatAdd(chat);

        };
        this.loadTagChat = function () {
            //Init calls
            $('#ripple-chat-container').html(this.mainContainerHtml);
            $('#ripple-chat-bottom-toolbar').html(this.bottomToolbarHtml);
            var lastMessageTime = (this.tagMessages[this.tagMessages.length - 1]) ? this.tagMessages[this.tagMessages.length - 1].tc_time : '0';
            var that = this;
            console.log(lastMessageTime);
            var data = {tagName: this.tagName, lm: lastMessageTime};
            var that = this;
            this.currentRequest = $.ajax({
                type: 'GET',
                data: data,
                url: 'api/tagChat',
                beforeSend: function () {
                    if (that.currentRequest != null) {
                        that.currentRequest.abort();
                    }
                },
                success: function (data) {
                    var data = JSON.parse(data);
                    console.log(data);
                    data.forEach(function (e) {
                        that.tagMessages.push(e);
                    });
                    that.renderUI();
                },
                error: function (e) {
                    // Error
                }
            });
        }
        this.renderUI = function () {
            var that = this;
            $(document.getElementById('tag' + that.tagName)).html('');//HTML CLEAN
            var lTime = 0;
            this.tagMessages.forEach(function (e) {
                var dateString = String(new Date(Number(e.tc_time))).substring(0,15);
                if(lTime!=dateString) {
                    var timeHtml = '<div style="border-bottom: 1px solid #e4e4e4;position: relative;padding-bottom:10px ">' +
                        '<div class="" style="padding:5px;position: absolute;left:45%;background: whitesmoke;z-index: 10"><b>'+dateString+'</b></div></div>';
                    $(document.getElementById('tag' + that.tagName)).append(timeHtml);
                    lTime = dateString;
                }
                var tChat = htmlEncode(e.tc_name);

                var html = "<div class='ripple-chat-element' id='tagChatElement" + e.tc_tname + "'>" +
                    "<table style='padding:0px 0px 0px 0px'><tr><td rowspan='2' width='40px'><img src='../images/"+ e.user.u_img+"'></td>" +
                    "<td><a data-id='" + e.user._id + "' class='user-link'" +
                    "href='#" + e.user.u_name + "_" + e.user._id + "'>" + e.user.u_name + "</a></td>" +
                    "</tr> <tr> <td><p class='ripple-chat-owner-status'>" + e.user.u_status + "</p></td> </tr>" +
                    " <tr> <td></td> <td>" +
                    "<div class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                    "<pre>" + tChat + "</pre>" +
                    "</div> </td> <tr> </table> </div>";
                $(document.getElementById('tag' + that.tagName)).append(html);
            });
        }
        function htmlEncode(value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        }
    }
    return {
        loadTag: function (tagName) {
            if (!tagList[tagName]) {
                var tagObj = new tag(tagName);
                tagList[tagName] = tagObj;
            }
            visibleModuleId = tagName;
            return tagList[tagName];
        },
        getTag: function (tagName) {
            return tagList[tagName];
        }
    }
})();
var userModule = (function () {
    var userList = {};
    var user = function (userId,userName) {
        this.userId = userId;
        this.userReplies = [];
        this.userName = userName;
        this.mainContainerHtml = '<div id="userChat' + userId + '"></div>';
        this.bottomToolbarHtml = '<div class="col s11"><div class="col s12" style="padding-bottom:5px;">' +
            '<div class="row"><div class="row valign-wrapper" style="padding: 8px; border-radius:5px;border: 1px solid #cccccc"> ' +
            '<div class="col s10">' +
            '<div class="col s12"> ' +
            '<textarea id="tarea'+userId+'" rows="1" class="materialize-textarea ripple-chat-bottom-toolbar" spellcheck="false" placeholder="Say Something '+userName+'"></textarea></div></div> ' +
            '<div class="col s2"><a href="#" data-value="'+userId+'" id="ripple-chat-btn" class="btn user-chat-btn" style="float:right">REPLY</a> </div> </div></div> ' +
            '</div></div>';
        this.dummyChatAdd = function(e){
            var chat = htmlEncode(e.chat);
            var userDetails = loginModule.getUserDetails();
            var html = "<div style='margin-right: 50px;text-align: right' class='ripple-chat-element' id=''>" +
                "<div style='text-align: left;max-width:70%;border-radius: 5px;display: inline-block;background-color: #e3f2fd;padding-left:25px;padding-right: 25px';display: inline-block' class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                "<pre>" + chat + "</pre>" +
                "</div></div>";
            $('#userChat' + this.userId).append(html);
            $('#userChat' + this.userId)[0].lastChild.scrollIntoView({
                behavior: "smooth", // or "auto" or "instant"
                block: "start" // or "end"
            });
            //$('#ripple-chat-container').perfectScrollbar('update');
        };
        this.newChatAdd = function(e){
            var rChat = htmlEncode(e.uc_name);
            var html = "<div style='margin-left: 50px' class='ripple-chat-element' id='" + e._id + "'>" +
                "<div style='max-width:70%;border-radius: 5px;display: inline-block;background-color: #e0f7fa;padding-left:25px;padding-right: 25px' class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                "<pre>" + rChat + "</pre>" +
                "</div></div>";
            $('#userChat' + this.userId).append(html);
            $('#userChat' + this.userId)[0].lastChild.scrollIntoView({
                behavior: "smooth", // or "auto" or "instant"
                block: "start" // or "end"
            });
            //$('#ripple-chat-container').perfectScrollbar('update');
        }
        this.postUserChat = function (chat,token){
            var that = this;
            $.ajax({
                type: 'POST',
                data: chat,
                url: 'api/userChat?token='+token,
                success: function (data) {
                    var data = JSON.parse(data);
                },
                error: function (e) {
                    // Error
                }
            });
            hiveSocket.sendPersonalMessage(chat,function(res){
                console.log(res);
            });
            this.dummyChatAdd(chat);

        };
        this.selfChatListener = function(){
            var that = this;
            hiveSocket.onSelfComment('pm-self', function (data) {
                var chat = {chat:data.uc_name};
                that.dummyChatAdd(chat);
            })
        }
        this.loadUserChat = function (token) {
            //Init calls
            $('#ripple-chat-container').html(this.mainContainerHtml);
            $('#ripple-chat-bottom-toolbar').html(this.bottomToolbarHtml);


            var lastMessageTime = (this.userReplies[this.userReplies.length - 1]) ? this.userReplies[this.userReplies.length - 1].uc_time : '0';
            var that = this;
            this.currentRequest = $.ajax({
                type: 'GET',
                url: 'api/userChat?lm='+lastMessageTime+'&otherId='+this.userId+'&token='+token,
                beforeSend: function () {
                    if (that.currentRequest != null) {
                        that.currentRequest.abort();
                    }
                },
                success: function (data) {
                    var data =  JSON.parse(data);
                    console.log(data);
                    data.forEach(function (e) {
                        that.userReplies.push(e);
                    });
                    that.renderUI();
                },
                error: function (e) {
                    // Error
                }
            });
        }
        this.renderUI = function () {
            var that = this;
            $('#userChat' + that.userId).html('');//HTML CLEAN
            var lTime = 0;
            this.userReplies.forEach(function (e) {
                var dateString = String(new Date(Number(e.uc_time))).substring(0,15);
                if(lTime!=dateString) {
                    var timeHtml = '<div style="border-bottom: 1px solid #e4e4e4;position: relative;padding-bottom:10px ">' +
                        '<div class="" style="padding:5px;position: absolute;left:45%;background: whitesmoke;z-index: 10"><b>'+dateString+'</b></div></div>';
                    $('#userChat' + that.userId).append(timeHtml);
                    lTime = dateString;
                }
                var rChat = htmlEncode(e.uc_name);
                if(e.user._id==that.userId) {
                    var html = "<div style='margin-left: 50px' class='ripple-chat-element' id='" + e._id + "'>" +
                        "<div style='max-width:70%;border-radius: 5px;display: inline-block;background-color: #e0f7fa;padding-left:25px;padding-right: 25px' class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                        "<pre>" + rChat + "</pre>" +
                        "</div></div>";
                }
                else{
                    var html = "<div style='margin-right: 50px;text-align: right' class='ripple-chat-element' id='" + e._id + "'>" +
                        "<div style='text-align: left;max-width:70%;border-radius: 5px;display: inline-block;background-color: #e3f2fd;padding-left:25px;padding-right: 25px';display: inline-block' class='ripple-chat-text z-depth-0' style='padding-top:0px'>" +
                        "<pre>" + rChat + "</pre>" +
                        "</div></div>"
                }
                $('#userChat' + that.userId).append(html);
            });
            $('#userChat' + that.userId)[0].lastChild.scrollIntoView({
                behavior: "smooth", // or "auto" or "instant"
                block: "start" // or "end"
            });
            //$('#ripple-chat-container').perfectScrollbar('update');
        }
        function htmlEncode(value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        }
    }
    return {
        loadUser: function (userId, userName) {
            if (!userList[userId]) {
                var userObj = new user(userId, userName);
                userList[userId] = userObj;
            }
            visibleModuleId = userId;
            return userList[userId];
        },
        getUser: function (userId) {
            return userList[userId];
        }
    }

})();