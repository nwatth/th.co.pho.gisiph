App.Service = (function(lng, app, undefined) {

	var login = function(data) {
			lng.Notification.show();
			data.callback = '?';
			var hostanme = app.Data.auth({hostname: data.hostname}).hostname,
				url = 'http://' + hostanme + '/dist/php/apis/login.php',
				success = function(response) {
					if (response.prop == 'success') {
						app.Data.auth(response.data.user);
						app.Data.districts(response.data.districts);
						app.Data.Sql.init();
						lng.Router.article('account', 'about');
						lng.Notification.hide();
					} else if (response.prop == 'fail') {
						lng.Notification.error('Access denied', 'Please check your username or password again.', 'lock');
					} else {
						lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
					};
				},
				request = $$.post(url, data, success)
			;
		},
		sync_import = function(data) {console.log('data', data);
			lng.Notification.show();
			data.callback = '?';
			var hostanme = app.Data.auth().hostname,
				url = 'http://' + hostanme + '/dist/php/apis/sync_import.php',
				success = function(response) {console.log('response', response);
					if (response.prop == 'success') {
						var dist = app.Data.districts(),
							i = 0,
							len = dist.length
						;

						for (; i < len; i++) {
							if (data.villcodes.indexOf(dist[i].value) !== -1) {
								dist[i].checked = 'checked';
								dist[i].disabled = 'disabled';
							};
						};

						lng.Notification.html(lng.dom('#tmpl_util_progress').html());
						app.Data.build_tables(response.data, function() {
							app.Data.districts(dist);
							app.View.sync_import();
						});
					} else if (response.prop == 'fail') {
						lng.Notification.error('Empty data', 'Please check your list and sync again.', 'warning-sign');
					} else {
						lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
					};
				},
				request = $$.post(url, data, success)
			;
		}
	;




	return {
		login: login,
		sync_import: sync_import
	};

})(Lungo, App);