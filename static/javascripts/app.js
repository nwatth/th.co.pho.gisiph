var App = (function(lng, undefined) {

	lng.init({
		name: 'th.co.pho.gisiph',
		version: '1.0',
		resources: [
			'static/asides/features.html',
			'static/sections/login.html',
			'static/sections/management.html',
			'static/sections/locations.html',
			'static/sections/charts.html',
			'static/sections/sync.html',
			'static/sections/account.html',
			'static/template/tmpl_sync_import.tmpl',
			'static/template/tmpl_sync_export.tmpl',
			'static/template/tmpl_account_about.tmpl',
			'static/template/tmpl_util_empty.tmpl',
			'static/template/tmpl_util_progress.tmpl'
		],
		history: false
	});

	lng.ready(function() {
		var auth = App.isAuth();
		if (!!auth) {
			/*lng.Router.section('account');*/
			App.Data.Sql.init();
/**/			lng.Router.section('sync');
		};
	});

	var isAuth = function() {
		var auth = this.Data.auth();
		if (!!auth.username && !!auth.hash && !!auth.timestamp && !!auth.hostname) {
			return auth;
		};
		return false;
	};

	return {
		isAuth: isAuth
	};

})(Lungo);

console.log(Lungo);
console.log(App);