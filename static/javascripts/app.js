var App = (function(lng, undefined) {

	lng.init({
		name: 'th.co.pho.gisiph',
		version: '1.0',
		resources: [
			'static/asides/features.html',
			'static/sections/login.html',
			'static/sections/management.html',
			'static/sections/house.html',
			'static/sections/person.html',
			'static/sections/chronic.html',
			'static/sections/locations.html',
			'static/sections/charts.html',
			'static/sections/sync.html',
			'static/sections/account.html',
			'static/sections/util.html',
			'static/template/tmpl_manage_houses.tmpl',
			'static/template/tmpl_house_detail.tmpl',
			'static/template/tmpl_house_photos.tmpl',
			'static/template/tmpl_manage_persons.tmpl',
			'static/template/tmpl_person_detail.tmpl',
			'static/template/tmpl_person_visited.tmpl',
			'static/template/tmpl_person_chronics.tmpl',
			'static/template/tmpl_chronic_detail.tmpl',
			'static/template/tmpl_chronic_photos.tmpl',
			'static/template/tmpl_charts_detail.tmpl',
			'static/template/tmpl_sync_import.tmpl',
			'static/template/tmpl_sync_export.tmpl',
			'static/template/tmpl_account_about.tmpl',
			'static/template/tmpl_util_empty.tmpl',
			'static/template/tmpl_util_progress.tmpl'
		],
		history: false
	});

	lng.ready(function() {
		// screen.lockOrientation('portrait');
		var auth = App.isAuth();
		if (!!auth) {
			/*lng.Router.section('account');*/
			App.Data.Sql.init();
			App.Service.Map.init();
			App.Service.Visualization.init();
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