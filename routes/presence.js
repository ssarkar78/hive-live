exports.presence = (function(){
	var onlineUserList ={};

	return {
		getOnlineList:function(){
			//Hide the mobile no. before sending to all users
			return Object.keys(onlineUserList).map(function(e){onlineUserList[e].mobile="";return onlineUserList[e]});
		},
		isOnline:function(user){

		},
		addUser:function(socket,user){
			//query.taglist = JSON.parse(query.taglist);
			onlineUserList[socket.id] = user;
			console.log("added "+socket.id+" "+user._id);
		},
		removeUser:function(socket){
			console.log("delete "+socket.id);
			delete onlineUserList[socket.id];
		},
		getOnlineTagUsers:function(tagArr){
			//return Object.keys(onlineUserList).map(function(e){onlineUserList[e].mobile="";return onlineUserList[e]});
		},
		getUser:function(socket){
			return onlineUserList[socket.id];
		}
	}
	
})();