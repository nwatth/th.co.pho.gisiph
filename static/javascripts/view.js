App.View = (function(lng, app, undefined) {

	var account_detail = function(detail) {
		var tmpl = App.Template.create('account_detail');

		tmpl.render('#account ul', detail);
		
		lng.Resource.load("static/asides/features.html");
		lng.Router.section('account');
	};




	return {
		account_detail: account_detail
	};

})(Lungo, App);