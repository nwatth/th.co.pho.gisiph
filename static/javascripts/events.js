App.Events = (function(lng, app, undefined) {

	/*
	 *	[SECTIONS]
	 *	
	 *	Any section loaded event.
	 */
	lng.dom('section').on('load', function(event) {
		var sec = lng.dom(this).attr('id'),
			dom = lng.dom('aside#features ul')
		;
		dom.find('.active').removeClass('active');
		dom.find('[data-change-section="' + sec + '"]').addClass('active');
	});




	/*
	 *	[FEATURES]
	 *	
	 *	Menu on aside tapped event.
	 */
	lng.dom('aside#features li[data-change-section]').tap(function(event) {
		event.preventDefault();
		var target = lng.dom(this).attr('data-change-section');
/**/		lng.Router.section(target);
	});




	/*
	 *	[ACCOUNT]
	 *		
	 *	Account section loaded event.
	 */
	lng.dom('section#account').on('load', function(event) {
		app.View.account_about();
	});




	/*
	 *	[ACCOUNT]
	 *	
	 *	Logout button tapped event.
	 */
	lng.dom('section#account article#about button').tap(function(event) {
		event.preventDefault();
		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'signout',
			title: 'Logout',
			description: 'Are you sure you want to logout ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.clean();
/**/					lng.Router.section('unsign');
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function(){}
			}
		});
	});




	/*
	 *	[LOGIN]
	 *	
	 *	Login section loaded event.
	 */
	lng.dom('section#login').on('load', function(event) {
		lng.dom('#login [placeholder="Username"]').val(app.Data.auth().username);
		lng.dom('#login [placeholder="Password"]').val('');
		lng.dom('#login [placeholder="Hostname"]').val(app.Data.auth().hostname);
	});




	/*
	 *	[LOGIN]
	 *	
	 *	Login button tapped event.
	 */
/**/	lng.dom('section#login article button').tap(function(event) {
		event.preventDefault();
		
		var username = lng.dom('#login [placeholder="Username"]').val(),
			password = lng.dom('#login [placeholder="Password"]').val(),
			hostname = lng.dom('#login [placeholder="Hostname"]').val()
		;
/**/		app.Service.login({username: username, password: password, hostname: hostname});
	});




	/*
	 *	[MANAGEMENT]
	 *	
	 *	Management section loaded event.
	 */
	lng.dom('section#management').on('load', function(event) {
		/*app.View.sync_import();
		app.View.sync_export();*/
	});




	/*
	 *	[SYNC]
	 *	
	 *	Sync section loaded event.
	 */
	lng.dom('section#sync').on('load', function(event) {
		app.View.sync_import();
		app.View.sync_export();
	});




	/*
	 *	[SYNC]
	 *	
	 *	Import button tapped event.
	 */
	lng.dom('section#sync article#import button').tap(function(event) {
		event.preventDefault();

		var districts = lng.dom('input[name="districts"]'),
			dist = (function(d) {
				var i = 0,
					l = d.length,
					j = 0,
					r = []
				;

				for (; i < l; i++) {
					if (d[i].checked === 'checked') {
						r[j++] = d[i].value;
					};
				};

				return r;
			})(app.Data.districts()),
			villcodes = [],
			l = 0
		;

		for (var i = 0, len = districts.length; i < len; i++) {
			if (districts[i].checked && dist.indexOf(districts[i].value) === -1) {
				villcodes[l++] = districts[i].value;
			};
		};

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'download',
			title: 'Import',
			description: 'Are you sure you want to import ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					setTimeout(function() {
						app.Service.sync_import({villcodes: villcodes});
					}, 203);
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function(){}
			}
		});
	});




	return {

	};

})(Lungo, App);