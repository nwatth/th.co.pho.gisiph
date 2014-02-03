App.Events = (function(lng, app, undefined) {

	lng.dom('section#login article button').tap(function(event) {
		event.preventDefault();
		// code here
		lng.Resource.load("static/asides/features.html");
		lng.Router.section('account');
	});

	lng.dom('section#account article button').tap(function(event) {
		event.preventDefault();
		lng.Notification.confirm({
			icon: 'signout',
			title: 'Logout',
			description: 'Are you sure you want to logout ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					lng.Router.section('unsign');
					lng.dom('aside#features').remove();
				}
			},
			cancel: {
				label: 'Cancel'
			}
		});
	});

	lng.dom('[data-change-section]').tap(function(event) {
		event.preventDefault();
		var target = this.getAttribute('data-change-section');
		lng.Router.section(target);
	});

	lng.dom('section').on('load', function() {
		lng.dom('aside#features li.active').removeClass('active');
		lng.dom('aside#features li[data-change-section="'+this.getAttribute('id')+'"]').addClass('active');
	});

	return {

	};

})(Lungo, App);