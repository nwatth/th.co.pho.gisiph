App.View = (function(lng, app, undefined) {

	var account_about = function(data) {
		var data = [app.Data.auth()];
			app.Template.create('#tmpl_account_about');
			app.Template.render('#account_about', data);
		},

		manage_houses = function() {
			/*var data = app.Data.districts();
			app.Template.create('#tmpl_sync_import');
			app.Template.render('#sync_import', data);*/
		},

		sync_import = function() {
			var data = app.Data.districts();
			app.Template.create('#tmpl_sync_import');
			app.Template.render('#sync_import', data);
		},

		sync_export = function() {
			var data = (function(d) {
					var i = 0,
						l = d.length,
						j = 0,
						r = []
					;

					for (; i < l; i++) {
						if (d[i].checked === 'checked') {
							r[j++] = d[i];
						};
					};

					return r;
				})(app.Data.districts())
			;

			app.Template.create('#tmpl_sync_export');
			app.Template.render('#sync_export', data);
		}
	;




	return {
		account_about: account_about,
		manage_houses: manage_houses,
		sync_import: sync_import,
		sync_export: sync_export
	};

})(Lungo, App);