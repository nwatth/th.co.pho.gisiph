App.Events = (function(lng, app, undefined) {

	lng.dom('section#login article button').tap(function(event) {
		event.preventDefault();
		
		var username = lng.dom('#login [placeholder="Username"]').val(),
			password = lng.dom('#login [placeholder="Password"]').val(),
			hostname = lng.dom('#login [placeholder="Hostname"]').val()
		;
		app.Services.login({username: username, password: password, hostname: hostname});
	});

	lng.dom('section#account article button').tap(function(event) {
		event.preventDefault();
		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'signout',
			title: 'Logout',
			description: 'Are you sure you want to logout ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					lng.Router.section('unsign');
					lng.dom('aside#features').remove();
					window.localStorage.removeItem('gisiph_auth')
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function(){}
			}
		});
	});

	lng.dom('aside#features li[data-change-section]').tap(function(event) {
		event.preventDefault();
		var target = this.getAttribute('data-change-section');

		lng.Router.section(target);
	});

	lng.dom('section').on('load', function() {
		lng.dom('aside#features li.active').removeClass('active');
		lng.dom('aside#features li[data-change-section="'+this.getAttribute('id')+'"]').addClass('active');
	});

	lng.dom('section#login').on('load', function() {
		lng.dom('#login [placeholder="Username"]').val(app.Data.auth({}).username);
		lng.dom('#login [placeholder="Password"]').val('');
		lng.dom('#login [placeholder="Hostname"]').val(app.Data.auth({}).hostname);
	});




	return {

	};

})(Lungo, App);