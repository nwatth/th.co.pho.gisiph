App.Services = (function(lng, app, undefined) {

	var 

	login = function(log) {
		lng.Notification.show();
		var hostanme = app.Data.auth({hostname: log.hostname}).hostname,
			url = 'http://' + hostanme + '/dist/php/apis/login.php',
			data = {username: log.username, password: log.password, callback: '?'},
			success = function(response) {
				if (response.prop == 'success') {
					app.View.account_detail([app.Data.auth(response.data)]);
					lng.Notification.hide();
				} else if (response.prop == 'fail') {
					error('Access denied', 'Please check your username or password again.', 'lock');
				} else {
					error('Server not found', 'Please check your hostname again.', 'hdd');
				};
			},
			error = function(title, description, icon) {
				lng.Notification.error(title, description, icon, 0);
			},
			response = $$.post(url, data, success)
		;
	};




	return {
		login: login
	};

})(Lungo, App);