App.Data = (function(lng, app, undefined) {

	var 

		auth = function(options) {
			var auth_default = {fullname:'',hash:'',hostname:'',timedisplay:'',timestamp:'',username:''},
				oldAuth = $$.mix(auth_default, JSON.parse(window.localStorage.getItem('gisiph_auth'))),
				newAuth = $$.mix(oldAuth, options)
			;

			if (typeof options !== 'undefined') {
				newAuth.hostname = hostname(newAuth.hostname);
				window.localStorage.setItem('gisiph_auth', JSON.stringify(newAuth));
			};

			return newAuth;
		},

		hostname = function(name) {
			var host = name.replace(RegExp('^https?://|\\s+|/*$', 'g'), '');

			return host;
		},

		timestamp = function() {

		}
	;




	return {
		auth: auth,
		hostname: hostname
	};

})(Lungo, App);