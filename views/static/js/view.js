var tagChatModule = (function () {
    var tag_img_location = "twooshapi/dbstore/img/tags/";
    var chatContainerList = {};
    var ChatContainer = function (uniqueIdentifier, name, type, isSubscribed) {
        this._id = uniqueIdentifier;
        this.name = name;
        this.type = type;
        this.msg = [];
        this.isSubscribed = isSubscribed;
        this.html = '<div id="chat-container-wraper">'
            + '<h5>' + this.name + '</h5><a class="waves-effect waves-light btn subscribe-btn hidden sub-unsub-btn"><i class="material-icons left">loyalty</i>Subscribe</a>'
            + '<a class="waves-effect waves-light btn subscribed-btn hidden sub-unsub-btn"><i class="material-icons left">done</i>Subscribed</a>'
            + '<div id="chat-container-body"><div id="chat-container" tid="'+this._id+'" class="bg-white"></div>'
            + '<div id="reply-container" class="row"><form class="col s12"><div class="row"><div class="input-field col s12">'
            + '<textarea id="textarea2" class="materialize-textarea reply-textarea" autofocus></textarea><label style="margin-left:10px" for="textarea2">Comment</label>'
            + '<a class="waves-effect waves-light btn twoosh-btn"><i class="material-icons left">perm_media</i>Image</a>&nbsp;&nbsp;'
            + '<a class="waves-effect waves-light btn twoosh-btn">Smilies</a></div></div></form></div></div></div>';
        this.renderToDom = function () {
            var lastMessageTime = (this.msg[this.msg.length - 1]) ? this.msg[this.msg.length - 1].tc_time : 0;
            twooshSocket.loadChatMessage({'_id': this._id, 'lm': lastMessageTime}, messageCallback.bind(this));
            $('#chat-container-main').html(this.html);
            //Remove all event handlers
            $('#chat-container-main').off();
            //Attach handler on chat textarea
            _chatTextAreaEventRegister(this);
            _registerToIncomingMessages(this);
            if (this.isSubscribed)
                _subscribed(this);
            else
                _unSubscribed(this);
        };
        this.renderMessage = function () {
            this.msg.forEach(function (e) {
                var chatHtml = '<div class="chat-msg-element">'
                    + '<table style="padding:0px 0px 0px 0px">'
                    + '<tr><td rowspan="2" width="40px"><img src="twooshapi/uploads/' + e.tc_user.u_img + '"></td><td><b>' + e.tc_user.u_name + '</b></td></tr><tr>'
                    + '<td><p class="chat-msg-owner-status">' + e.tc_user.u_status + '</p></td></tr><tr><td></td><td>'
                    + '<p class="chat-msg-text">' + e.tc_name + '</p></td><tr></table></div>';
                $("#chat-container[tid="+ e.tc_tags+"]").append(chatHtml);
            });
            if($("#chat-container[tid="+this._id+"]")[0])
                $("#chat-container[tid="+this._id+"]")[0].lastChild.scrollIntoView();
        }
        function messageCallback(data) {
            var that = this;
            data.forEach(function (e) {
                that.msg.push(e);
            });
            this.renderMessage();
        }

        this.renderSingleMessage = function (chat) {
            var chatHtml = '<div class="chat-msg-element">'
                + '<table style="padding:0px 0px 0px 0px">'
                + '<tr><td rowspan="2" width="40px"><img src="twooshapi/uploads/' + chat.tc_user.u_img + '"></td><td><b>' + chat.tc_user.u_name + '</b></td></tr><tr>'
                + '<td><p class="chat-msg-owner-status">' + chat.tc_user.u_status + '</p></td></tr><tr><td></td><td>'
                + '<p class="chat-msg-text">' + htmlEncode(chat.tc_name) + '</p></td><tr></table></div>';
            $("#chat-container[tid="+ chat.tc_tags+"]").append(chatHtml);
            if($("#chat-container[tid="+ chat.tc_tags+"]")[0])
                $("#chat-container[tid="+ chat.tc_tags+"]")[0].lastChild.scrollIntoView();
        }

        function onChatEventHandler(event) {
            var chat = $('#textarea2').val();
            if (event.which == 13 && chat.length > 0 && !event.shiftKey) {
                event.preventDefault();
                var chatObj = {
                    tc_user: {
                        u_name: localStorage.username,
                        u_img: localStorage.userimg,
                        u_status: localStorage.userstatus
                    },
                    tc_name: chat,
                    tc_tags: this._id,
                    tc_time: Date.now()
                }
                this.renderSingleMessage(chatObj);
                $('#textarea2').val('');
                $('#textarea2').trigger('autoresize');
                var scope = this;
                twooshSocket.sendComment(chatObj, function (res) {
                    console.log(res);
                    scope.msg.push(chatObj);
                }, scope);
            }
        }

        function onClickUnSubscribe() {
            var tagName = this.name;
            $('.subscribed-btn').addClass('disabled');
            twooshSocket.removeSubscribedTag(twooshTags[tagName], removeCallback.bind(this));
        };
        function removeCallback(res) {
            $('.subscribed-btn').removeClass('disabled');
            _unSubscribed(this);
        }

        function onClickSubscribeCallback() {
            var tagName = this.name;
            console.log(tagName);
            $(".subscribe-btn").addClass('disabled');
            twooshSocket.addSubscribedTag(twooshTags[tagName], addCallback.bind(this));
        }

        function addCallback(res) {
            console.log("here");
            $(".subscribe-btn").removeClass('disabled');
            _subscribed(this);
        }

        function _subscribed(ref) {
            $("#chat-container-wraper>a.subscribe-btn").addClass('hidden');
            $("#chat-container-wraper>a.subscribed-btn").removeClass('hidden');
            $('#chat-container-main').on('click', '.subscribed-btn', onClickUnSubscribe.bind(ref));
        }

        function _unSubscribed(ref) {
            $("#chat-container-wraper>a.subscribed-btn").addClass('hidden');
            $("#chat-container-wraper>a.subscribe-btn").removeClass('hidden');
            $('#chat-container-main').on('click', '.subscribe-btn', onClickSubscribeCallback.bind(ref));
        }

        function _chatTextAreaEventRegister(ref) {
            console.log("attaching event");
            $('#chat-container-main').on('keypress', 'textarea#textarea2', onChatEventHandler.bind(ref));
        }

        function _registerToIncomingMessages(ref) {
            twooshSocket.onTagComment(ref._id, function (data) {
                ref.renderSingleMessage(data);
                ref.msg.push(data);
            });
            twooshSocket.addToTagRoom(ref._id,function(res){
                console.log(res);
            });
        }
    }
    return {
        createTagChatContainer: function (tag, isSubscribed) {
            return new ChatContainer(tag._id, tag.tag_name, "tag", isSubscribed);
        },
        addToChatContainerList: function (chatContainer) {
            chatContainerList[chatContainer.name] = chatContainer;
        },
        getContainerList: function () {
            return chatContainerList;
        }
    }
})();
var mySubscribedTagBoard = (function () {
    var baseAnchor = "#my-fav-channel-list"
    return {
        addTagToBoard: function (tag) {
            $(baseAnchor).append("<a href='" + tag.tag_name + "'class='my-fav-tag-list-item tag-anchor my-tag-link chip '>"
                + "" + tag.tag_name + "</a><br>");
        }
    }
})();

var peopleChatModule = (function () {
    var people_img_location = "twooshapi/uploads/";
    var chatContainerList = {};
    var ChatContainer = function (uniqueIdentifier, name, type, isSubscribed) {
        this._id = uniqueIdentifier;
        this.name = name;
        this.type = type;
        this.msg = [];
        this.isSubscribed = isSubscribed;
        this.html = '<div id="chat-container-wraper">'
            + '<h5>' + this.name + '</h5><a class="waves-effect waves-light btn subscribe-btn hidden sub-unsub-btn"><i class="material-icons left">loyalty</i>Follow</a>'
            + '<a class="waves-effect waves-light btn subscribed-btn hidden sub-unsub-btn"><i class="material-icons left">done</i>Followed</a>'
            + '<div id="chat-container-body"><div id="chat-container" tid="'+this._id+'" class="bg-white"></div>'
            + '<div id="reply-container" class="row"><form class="col s12"><div class="row"><div class="input-field col s12">'
            + '<textarea id="textarea2" class="materialize-textarea reply-textarea" autofocus></textarea><label style="margin-left:10px" for="textarea2">Comment</label>'
            + '<a class="waves-effect waves-light btn twoosh-btn"><i class="material-icons left">perm_media</i>Image</a>&nbsp;&nbsp;'
            + '<a class="waves-effect waves-light btn twoosh-btn">Smilies</a></div></div></form></div></div></div>';
        this.renderToDom = function () {
            var lastMessageTime = (this.msg[this.msg.length - 1]) ? this.msg[this.msg.length - 1].tc_time : 0;
            //twooshSocket.loadChatMessage({'_id': this._id, 'lm': lastMessageTime}, messageCallback.bind(this));
            $('#chat-container-main').html(this.html);
            //Remove all event handlers
            $('#chat-container-main').off();
            //Attach handler on chat textarea
            //_chatTextAreaEventRegister(this);
            //_registerToIncomingMessages(this);
            if (this.isSubscribed)
                _subscribed(this);
            else
                _unSubscribed(this);
        };
        this.renderMessage = function () {
            this.msg.forEach(function (e) {
                var chatHtml = '<div class="chat-msg-element">'
                    + '<table style="padding:0px 0px 0px 0px">'
                    + '<tr><td rowspan="2" width="40px"><img src="twooshapi/uploads/' + e.tc_user.u_img + '"></td><td><b>' + e.tc_user.u_name + '</b></td></tr><tr>'
                    + '<td><p class="chat-msg-owner-status">' + e.tc_user.u_status + '</p></td></tr><tr><td></td><td>'
                    + '<p class="chat-msg-text">' + e.tc_name + '</p></td><tr></table></div>';
                $("#chat-container[tid="+ e.tc_tags+"]").append(chatHtml);
            });
            if($("#chat-container[tid="+this._id+"]")[0])
                $("#chat-container[tid="+this._id+"]")[0].lastChild.scrollIntoView();
        }
        function messageCallback(data) {
            var that = this;
            data.forEach(function (e) {
                that.msg.push(e);
            });
            this.renderMessage();
        }

        this.renderSingleMessage = function (chat) {
            var chatHtml = '<div class="chat-msg-element">'
                + '<table style="padding:0px 0px 0px 0px">'
                + '<tr><td rowspan="2" width="40px"><img src="twooshapi/uploads/' + chat.tc_user.u_img + '"></td><td><b>' + chat.tc_user.u_name + '</b></td></tr><tr>'
                + '<td><p class="chat-msg-owner-status">' + chat.tc_user.u_status + '</p></td></tr><tr><td></td><td>'
                + '<p class="chat-msg-text">' + htmlEncode(chat.tc_name) + '</p></td><tr></table></div>';
            $("#chat-container[tid="+ chat.tc_tags+"]").append(chatHtml);
            if($("#chat-container[tid="+ chat.tc_tags+"]")[0])
                $("#chat-container[tid="+ chat.tc_tags+"]")[0].lastChild.scrollIntoView();
        }

        function onChatEventHandler(event) {
            var chat = $('#textarea2').val();
                if (event.which == 13 && chat.length > 0 && !event.shiftKey) {
                    event.preventDefault();
                var chatObj = {
                    tc_user: {
                        u_name: localStorage.username,
                        u_img: localStorage.userimg,
                        u_status: localStorage.userstatus
                    },
                    tc_name: chat,
                    tc_tags: this._id,
                    tc_time: Date.now()
                }
                this.renderSingleMessage(chatObj);
                $('#textarea2').val('');
                $('#textarea2').trigger('autoresize');
                var scope = this;
                twooshSocket.sendComment(chatObj, function (res) {
                    console.log(res);
                    scope.msg.push(chatObj);
                }, scope);
            }
        }

        function onClickUnSubscribe() {
            var tagName = this.name;
            $('.subscribed-btn').addClass('disabled');
            twooshSocket.removeSubscribedTag(twooshTags[tagName], removeCallback.bind(this));
        };
        function removeCallback(res) {
            $('.subscribed-btn').removeClass('disabled');
            _unSubscribed(this);
        }

        function onClickSubscribeCallback() {
            var tagName = this.name;
            console.log(tagName);
            $(".subscribe-btn").addClass('disabled');
            twooshSocket.addSubscribedTag(twooshTags[tagName], addCallback.bind(this));
        }

        function addCallback(res) {
            console.log("here");
            $(".subscribe-btn").removeClass('disabled');
            _subscribed(this);
        }

        function _subscribed(ref) {
            $("#chat-container-wraper>a.subscribe-btn").addClass('hidden');
            $("#chat-container-wraper>a.subscribed-btn").removeClass('hidden');
            $('#chat-container-main').on('click', '.subscribed-btn', onClickUnSubscribe.bind(ref));
        }

        function _unSubscribed(ref) {
            $("#chat-container-wraper>a.subscribed-btn").addClass('hidden');
            $("#chat-container-wraper>a.subscribe-btn").removeClass('hidden');
            $('#chat-container-main').on('click', '.subscribe-btn', onClickSubscribeCallback.bind(ref));
        }

        function _chatTextAreaEventRegister(ref) {
            console.log("attaching event");
            $('#chat-container-main').on('keypress', 'textarea#textarea2', onChatEventHandler.bind(ref));
        }

        function _registerToIncomingMessages(ref) {
            twooshSocket.onTagComment(ref._id, function (data) {
                ref.renderSingleMessage(data);
                ref.msg.push(data);
            });
            twooshSocket.addToTagRoom(ref._id,function(res){
                console.log(res);
            });
        }
    }
    return {
        createTagChatContainer: function (people, isFollowed) {
            return new ChatContainer(people._id, people.name, "people", isFollowed);
        },
        addToChatContainerList: function (chatContainer) {
            chatContainerList[chatContainer.name] = chatContainer;
        },
        getContainerList: function () {
            return chatContainerList;
        }
    }
})();

function renderMe(data) {
    var tag_img_location = "twooshapi/dbstore/img/tags/";
    //If post data has come
    //Clear the post section and render..
    if (data['post']) {
        $("#post-container-items").html("");
        var postList = data['post'];
        console.log(postList);
        postList.forEach(function (post) {
            //console.log(post.p_user);
            renderTwooshToBoard(post);
        });
        return;
    }
    //If user and tag details has come
    $("#post-form-head-img").attr("src", "twooshapi/uploads/" + data.user.u_img);
    $("#my-profile-card-img").attr("src", "twooshapi/uploads/" + data.user.u_img);
    $("#my-profile-card-name").text(data.user.u_name);
    localStorage.setItem("username", data.user.u_name);
    localStorage.setItem("userimg", data.user.u_img);
    localStorage.setItem("userstatus", data.user.u_status);
    localStorage.setItem("userid", data.user._id);
    //Empty the list before adding;
    $('#my-fav-channel-list').html("");
    window.twooshTags = {};
    data.tags.forEach(function (tag) {
        if ($.inArray(tag._id, data.user.u_tags) != -1) {
            mySubscribedTagBoard.addTagToBoard(tag);
            tagChatModule.addToChatContainerList(tagChatModule.createTagChatContainer(tag, true));
        }
        window.twooshTags[tag.tag_name] = tag;
        // $('#tag-list').append("<div class='chip my-fav-tag-list-item tag-anchor'>"
        //   +"<img src='"+tag_img_location+tag.tag_img+"' alt='"+tag.tag_name+"'>"+tag.tag_name+"</div>");
    });
    //Take the 1st tag and render it.
    //createDefaultChatContainer(data.tags[0]);
    if (tagChatModule.getContainerList()[data.tags[0].tag_name])
        tagChatModule.getContainerList()[data.tags[0].tag_name].renderToDom();
}
function addTwooshToBoard(twoosh) {
    var twoosh = htmlEncode(twoosh);
    twoosh.split(/[\r\n ,.]+/).filter(function (e) {
        return (e.trim()[0] == '#')
    }).forEach(function (e) {
        twoosh = twoosh.replace(e, "<a class='tag-link tag-anchor' href='" + e + "'>" + e + "</a>");
    });
    var tagHtml = "";
    var html = "<div class='twoosh-post-element'><table style='padding:0px 0px 0px 0px'>"
        + "<tr><td rowspan='2' width='40px'><img src='twooshapi/uploads/" + localStorage.userimg + "'></td><td><a pid='"+localStorage.userid+"' class='user-link' href='#" + localStorage.username + "_" + localStorage.userid + "'><b>" + localStorage.username + "</b></a></td></tr>"
        + "<tr><td><p class='twoosh-post-owner-status'>Developer @Twoosh</p></td></tr>"
        + "<tr><td></td><td><div class='twoosh-post-text z-depth-1 bg-white' style='padding:10px'><pre>" + twoosh + "</pre></div></td><tr></table></div>"
    $("#post-container-items").prepend(html);
}
function renderTwooshToBoard(twoosh) {
    var twooshMsgBody = htmlEncode(twoosh.p_name);
    twooshMsgBody.split(/[\r\n ,.]+/).filter(function (e) {
        return (e.trim()[0] == '#')
    }).forEach(function (e) {
        twooshMsgBody = twooshMsgBody.replace(e, "<a class='tag-link tag-anchor' href='" + e + "'>" + e + "</a>");
    });
    var tagHtml = ""
    var html = "<div class='twoosh-post-element'><table style='padding:0px 0px 0px 0px'>"
        + "<tr><td rowspan='2' width='40px'><img src='twooshapi/uploads/" + twoosh.p_user.u_img + "'></td><td><a class='user-link' href='#" + twoosh.p_user.u_name + "_" + twoosh.p_user._id + "'><b>" + twoosh.p_user.u_name + "</b></a></td></tr>"
        + "<tr><td><p class='twoosh-post-owner-status'>Developer @Twoosh</p></td></tr>"
        + "<tr><td></td><td><div class='twoosh-post-text z-depth-1 bg-white' style='padding:10px'><pre>" + twooshMsgBody + "</pre></div></td><tr></table></div>"
    $("#post-container-items").prepend(html);
}
function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}