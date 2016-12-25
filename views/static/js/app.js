$(function(){
	loadCustomUI();
	var userData = {};
	//Load data friom sever
	localStorage.setItem('userLogged',1);
	//twooshSocket.connectUser(userData);
	var x = document.getElementById("demo");

	function loadCustomUI(){
		var number = Math.round((Math.random()*10)/2);
		$('body#entry-page').css("background","url(../images/background"+number+".jpg) no-repeat center center fixed");
	}
});

if (Notification.permission !== "granted")
{
	Notification.requestPermission();
}
var notificationSystem = (function () {
	function notifyBrowser(title,desc,url)
	{

		if (Notification.permission !== "granted")
		{
			Notification.requestPermission();
		}
		else
		{
			var notification = new Notification(title, {
				icon:"../images/"+url,
				body: desc,
			});

			/* Remove the notification from Notification Center when clicked.*/
			notification.onclick = function () {
			};

			/* Callback function when the notification is closed. */
			notification.onclose = function () {
				console.log('Notification closed');
			};

		}
	}
	return {
		notify:function(t,d,u){
			notifyBrowser(t,d,u);
		}
	}
})();