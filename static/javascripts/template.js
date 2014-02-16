App.Template = (function(lng, app, undefined) {

	var tmpl = '',

		render = function(container, data) {
			var ctnr = lng.dom(container),
				i = 0,
				len = data.length,
				fragment = ''
			;

			function loading(obj) {
				var t, key, reg;

				for (key in obj) {
					reg = new RegExp('{{' + key + '}}', 'ig');
					t = (t || tmpl).replace(reg, obj[key]);
				}

				return t;
			};

			for (; i < len; i++) {
				fragment += loading(data[i]);
			};

			ctnr.html(fragment || ctnr.html());
		},

		create = function(id) {
			tmpl = lng.dom(id).html() || id;
		}
	;




	return {
		create: create,
		render: render
	};

})(Lungo, App);