/**
 * Created by ssarkar on 10-04-2016.
 */
$(function () {
    var phone, pass;
    /* INIT CALLS */
    //$('#recentRippleFeeds-container').perfectScrollbar();
    //$('#ripple-chat-container').perfectScrollbar();
    $('#textarea2').trigger('autoresize');

    initUserSetup();
    initRippleRequest();
    initTagLoad();
    /* INIT CALLS */

    /******** PRIVATE FUNCTIONS  ************/
    function initUserSetup() {
        var userName = getCookie('userName');
        var userImg = getCookie('userImg');
        var userStatus = getCookie('userStatus');
        var userToken = getCookie('userToken');
        var userPhone = getCookie('userPhone');
        var userStatus = getCookie('userStatus');
        var userId = getCookie('userId');
        var isLogged = (userToken && userId && userName) ? true : false;
        if (isLogged) {
            $.get("/api/userDetails?token=" + userToken, function (data) {
                if (data) {
                    setCookie('userName', data.u_name, 10);
                    setCookie('userImg', data.u_img, 10);
                    setCookie('userStatus', data.u_status, 10);

                    var userData = {'token':userToken};
                    hiveSocket.connectUser(userData);

                    loginModule.setUserDetails(userId, data.u_name, data.u_status, userPhone, data.u_img, '', isLogged);
                    loginModule.setMyChannels(data.u_tags);
                }
            });
        }
        loginModule.setUserDetails(userId, userName, userStatus, userPhone, userImg, '', isLogged);
    }

    function searchUser() {
        var searchQuery = $('#hive-search').val();
        if (true) {
            var currentRequest = $.ajax({
                type: 'GET',
                beforeSend: function () {
                    if (currentRequest != null) {
                        currentRequest.abort();
                    }
                },
                url: '/api/user?query=' + encodeURIComponent(searchQuery),
                success: function (data) {
                    console.log(data);
                    userFeeds.loadUserRender(data);
                },
                error: function (e) {
                    // Error
                }
            });
        }
    }

    function searchFeeds() {
        showRippleContainer()
        searchRipple();
        searchUser();
    }

    function searchRipple(customSectionQuery) {
        var searchQuery = customSectionQuery || $('#hive-search').val();
        if (true) {
            //Empty ripple feeds container
            $('#recentRippleFeeds-container').html('');
            var currentRequest = $.ajax({
                type: 'GET',
                beforeSend: function () {
                    if (currentRequest != null) {
                        currentRequest.abort();
                    }
                },
                url: '/api/ripple?query=' + encodeURIComponent(searchQuery),
                success: function (data) {
                    recentRippleFeeds.loadRippleRender(data);
                },
                error: function (e) {
                    // Error
                }
            });
        }
    }

    function showRippleContainer() {
        $('#create-ripple-container').hide();
        $('#recent-feeds-container').show();
    }

    function toggleRippleCreate() {
        $('#create-ripple-container').toggle();
        $('#recent-feeds-container').toggle();
    }

    function initRippleRequest() {
        var e = document.getElementById('search-icon');
        e.onclick = searchFeeds;
        searchFeeds();
    }

    function initTagLoad() {
        var tagTitle = "#hive";//Get user default tag;
        $('#home-head-title').html("<a class='tag-link tag-anchor' href='" + tagTitle + "'>" + tagTitle + "</a>");
        var tag = tagModule.loadTag(tagTitle);
        tag.loadTagChat();
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    /******** PRIVATE FUNCTIONS ends  ************/

    $('#hive-search').on('keyup', function (event) {
        if (event.which == 13) {
            searchFeeds();
        }
    })

    $('#recentRippleFeed-container-footer').on('click', '.rippleTab', function () {
        $('.rippleTab').css('color', 'black');
        $(this).css('color', '#4caf50');
        switch ($(this).data('fld')) {
            case 1:
                searchRipple(getCookie('userPhone'));
                break;
            case 2:
                searchRipple(' ');
                break;
            case 3:
        }
    })

    $('#logged-user-container').on('click', '#not-logged-user-panel', function () {
        $('#modal2').openModal();//Open login panel
    });

    $('#pin-gen').on('click', function (e) {
        e.preventDefault();
        var phone = $("#telephone").val();
        var pass = $("#password").val();
        var pin = $('#pin').val();
        console.log(pin);
        if (pin && pin != '') {
            $.post("/sign-up", {phone: phone, pass: pass, pin: pin}, function (data) {
                if (data.success) {
                    setCookie('userPhone', data.phone, 10);
                    setCookie('userToken', data.token, 10);
                    $('#token-dummy').val(data.token);
                    console.log(data.token);
                    $('#modal1').openModal();
                }
                else {

                }
            });
        }
        else {
            $.post("/pin-gen", {phone: phone}, function (data) {
                $('#token-field').show();
                $('#pin-gen').val('Enter');
            });
        }

    });

    $("#submit").click(function (e) {
        e.preventDefault();
        var phone = $("#telephone").val();
        var pass = $("#password").val();
        if (phone == '' || pass == '') {
            if (phone == '')
                $("#telephone").focus();
            else
                $("#password").focus();
            return;
        }
        $.post("/api/userAuth", {phone: phone, pass: pass}, function (data) {
            if (data.success) {
                setCookie('userName', data.response.u_name, 10);
                setCookie('userImg', data.response.u_img, 10);
                setCookie('userStatus', data.response.u_status, 10);
                setCookie('userToken', data.token, 10);
                setCookie('userPhone', data.response.u_phone, 10);
                setCookie('userId', data.response._id, 10);
                loginModule.setUserDetails(data.response._id, data.response.u_name,
                    data.response.u_status, data.response.u_phone, data.response.u_img, '', true);
                loginModule.setMyChannels(data.response.u_tags);
                $('#modal2').closeModal();
            }
            else {
                console.log(data);
                $('#row-signup').show();
            }
        }).error(function (res) {
            console.log(res)
        });
    });

    $('#ripple-chat-bottom-toolbar').on('click', '.ripple-chat-btn', function () {
        var rippleId = $(this).data('value');
        var chat = $('#tarea' + rippleId).val();
        $('#tarea' + rippleId).val('')
        $('#tarea' + rippleId).trigger('autoresize');
        var data = {chat: chat, _id: rippleId};
        if (chat.trim().length > 0) {
            var rmEle = rippleModule.getRipple(rippleId);
            rmEle.postRippleChat(data, getCookie("userToken"));
        }
    });

    $('#ripple-chat-bottom-toolbar').on('click', '.tag-chat-btn', function () {
        var tagName = $(this).data('value');
        var chatArea = $(document.getElementById('tarea' + tagName));
        var chat = chatArea.val();
        chatArea.val('')
        chatArea.trigger('autoresize');
        var data = {chat: chat, tagName: tagName};
        if (chat.trim().length > 0) {
            var tmEle = tagModule.getTag(tagName);
            tmEle.postTagChat(data, getCookie("userToken"));
        }
    });

    $('#ripple-chat-bottom-toolbar').on('click', '.user-chat-btn', function () {
        var userId = $(this).data('value');
        var chat = $('#tarea' + userId).val();
        $('#tarea' + userId).val('')
        $('#tarea' + userId).trigger('autoresize');
        var data = {chat: chat, _id: userId};
        if (chat.trim().length > 0) {
            var rmEle = userModule.getUser(userId);
            rmEle.postUserChat(data, getCookie("userToken"));
        }
    });

    $('#recentRippleFeeds-container').on('click', '.ripple-feeds-element', function (e) {
        if (!$(e.toElement).hasClass('tag-anchor') && !$(e.toElement).hasClass('user-link')) {
            var rippleTitle = $(this).data('value');
            $('#home-head-title').html(rippleTitle);
            var ripple = rippleModule.loadRipple($(this).attr('id'), rippleTitle, '')
            ripple.loadRippleChat();
        }
    });

    $(document).on("click", ".tag-anchor", function () {
        console.log($(this).text());
        var tagTitle = $(this).text();
        $('#home-head-title').html("<a class='tag-link tag-anchor' href='" + tagTitle + "'>" + tagTitle + "</a>");
        var tag = tagModule.loadTag(tagTitle);
        tag.loadTagChat();
    });

    $(document).on("click", ".user-link", function () {
        console.log($(this).text());
        var userName = $(this).text();
        var userId = $(this).data('id');
        $('#home-head-title').html('<a class="user-link"'
        + 'href="#' + userName + '_' + userId + '"data-id="'+userId+'">' + userName + '</a>');
        var user = userModule.loadUser(userId,userName);
        user.loadUserChat(getCookie('userToken'));
        user.selfChatListener();
    });

    $('#open-create-ripple').on('click', function () {
        toggleRippleCreate();
    })

    $('#ripple-post').on('click', function () {
        var ripple = $('#ripple-input-area').val();
        if (ripple.length > 0) {
            $('#ripple-input-area').val('');
            $('#uploading-ripple').show();
            $(this).prop("disabled", true);
            var that = this;
            $.ajax({
                type: 'POST',
                data: {ripple: ripple, u_name: getCookie('userName')},
                url: 'api/ripple?token=' + getCookie("userToken"),
                success: function (data) {
                    $(that).prop("disabled", false);
                    $('#uploading-ripple').hide();
                    toggleRippleCreate();
                    searchRipple(getCookie('userName'))
                },
                error: function (e) {
                    // Error
                }
            });
        }
    });
    //Fetching user location
    $('#location-field').on('click', function (e) {
        $('#location-field>span').text("Working on it...");
        getLocation();
    });
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        } else {
            x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    function showPosition(position) {
        var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + position.coords.latitude + "," + position.coords.longitude + "&key=AIzaSyDBFEhEVdOSHaREtACt4CPXb3xllQsJmE0";
        $.get(url, function (res) {
            $('#location-field>span').text(res.results[1]['formatted_address']);
            $('#location-field>input#location-dummy').val(res.results[1]['formatted_address']);
        })

    }

    // END FETCHING USER LOCATION
    //Clear cookies on logout:
    $(document).on('click', '#logout-link', function () {
        setCookie('userPhone', '', 0);
        setCookie('userId', '', 0);
        setCookie('userToken', null, 0);
        setCookie('userName', null, 0);
    })

})