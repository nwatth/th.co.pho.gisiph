var App = (function(lng, undefined) {

    lng.init({
        name: 'th.co.pho.gisiph',
        version: '1.0',
        resources: [
            'static/sections/login.html',
            'static/sections/management.html',
            'static/sections/locations.html',
            'static/sections/charts.html',
            'static/sections/sync-data.html',
            'static/sections/account.html'
        ],
        history: false
    });

    var isAuth = function() {
        var auth = this.Data.auth({});
        if (!!auth.username && !!auth.hash && !!auth.timestamp && !!auth.hostname) {
            return auth;
        };
        return false;
    };

    return {
        isAuth: isAuth
    };

})(Lungo);

Lungo.ready(function() {
    var auth = App.isAuth();
    if (!!auth) {
        App.View.account_detail([auth]);
    };
});