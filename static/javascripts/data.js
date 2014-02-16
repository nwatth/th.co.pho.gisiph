App.Data = (function(lng, app, undefined) {

	var clean = function() {
			app.Data.auth({hash: '', timestamp: '', fullname: ''});
			window.localStorage.removeItem('gisiph_districts');
			app.Data.Sql.garbage();
		},

		auth = function(data) {
			var auth_default = {fullname:'',hash:'',hostname:'',timedisplay:'',timestamp:'',username:''},
				oldAuth = $$.mix(auth_default, JSON.parse(window.localStorage.getItem('gisiph_auth'))),
				newAuth = $$.mix(oldAuth, data || {}),
				hostname = function(name) {
					return name.replace(RegExp('^https?://|\\s+|/*$', 'g'), '');
				}
			;

			if (typeof data !== 'undefined') {
				newAuth.hostname = hostname(newAuth.hostname);
				window.localStorage.setItem('gisiph_auth', JSON.stringify(newAuth));
			};

			return newAuth;
		},

		districts = function(data) {
			if (typeof data !== 'undefined') {
				window.localStorage.setItem('gisiph_districts', JSON.stringify(data));
			};

			return JSON.parse(localStorage.getItem('gisiph_districts'));
		},

		build_tables = function(data, callback) {
			var percent = 0,
				complete = (function(dt) {
					var cp = 0;
					for (var val in dt) {
						cp += dt[val].length;
					}
					return cp;
				})(data),
				calc_perc = function() {
					lng.Element.progress('.notification .progress', (percent * 100 / complete), true);
					percent++;console.log('percent', percent, '/', complete);
					if (percent >= complete) {
						lng.Notification.hide();
						if (callback !== 'undefined') { callback(); };
					};
				}
			;

			for (var i = data.houses.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO houses (house_id, address, latitude, longitude) VALUES (?, ?, ?, ?)',
					[data.houses[i].house_id, data.houses[i].address, data.houses[i].latitude, data.houses[i].longitude],
					calc_perc
				);
			};
			for (var i = data.persons.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO persons (person_id, house_id, fullname, age, birth, sex, idcard, educate, occupa, nation, origin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
					[data.persons[i].person_id, data.persons[i].house_id, data.persons[i].fullname, data.persons[i].age, data.persons[i].birth, data.persons[i].sex, data.persons[i].idcard, data.persons[i].educate, data.persons[i].occupa, data.persons[i].nation, data.persons[i].origin],
					calc_perc
				);
			};
			for (var i = data.chronics.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO chronics (person_id, disease, detail, chroniccode, datefirstdiag) VALUES (?, ?, ?, ?, ?)',
					[data.chronics[i].person_id, data.chronics[i].disease, data.chronics[i].detail, data.chronics[i].chroniccode, data.chronics[i].datefirstdiag],
					calc_perc
				);
			};
			for (var i = data.visited.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO visited (person_id, last_pressure, last_sugarblood, incurrent) VALUES (?, ?, ?, ?)',
					[data.visited[i].person_id, data.visited[i].last_pressure, data.visited[i].last_sugarblood, data.visited[i].incurrent],
					calc_perc
				);
			};
		}
	;




	return {
		clean: clean,
		auth: auth,
		districts: districts,
		build_tables: build_tables
	};

})(Lungo, App);




App.Data.Sql = (function(lng, app, undefined) {

	var gisiph = null,

		onDbError = function(tx, err) {
			console.log('Database error occurred: ' + err.code + '|' + err.message, err);
		},

		nullHandler = function(tx, r) {
			return;
		},

		garbage = function() {
			gisiph.transaction(function(tx) {
				var houses = 'DROP TABLE IF EXISTS houses',
					persons = 'DROP TABLE IF EXISTS persons',
					chronics = 'DROP TABLE IF EXISTS chronics',
					visited = 'DROP TABLE IF EXISTS visited'
				;
				tx.executeSql(houses, [], nullHandler, onDbError);
				tx.executeSql(persons, [], nullHandler, onDbError);
				tx.executeSql(chronics, [], nullHandler, onDbError);
				tx.executeSql(visited, [], nullHandler, onDbError);
			});
		},

		init = function() {console.log('initDb');
			var dbSize = 1024 * 1024 * 10, // 10MB
				
				createDb = function() {
					gisiph.transaction(function(tx) {
						var houses = 'CREATE TABLE IF NOT EXISTS houses (house_id INTEGER PRIMARY KEY, address TEXT, latitude DOUBLE, longitude DOUBLE)',
							persons = 'CREATE TABLE IF NOT EXISTS persons (person_id INTEGER PRIMARY KEY, house_id INTEGER, fullname TEXT, age INTEGER, birth TEXT, sex TEXT, idcard TEXT, educate TEXT, occupa TEXT, nation TEXT, origin TEXT)',
							chronics = 'CREATE TABLE IF NOT EXISTS chronics (table_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, disease TEXT, detail TEXT, chroniccode TEXT, datefirstdiag TEXT)',
							visited = 'CREATE TABLE IF NOT EXISTS visited (person_id INTEGER PRIMARY KEY, last_pressure TEXT, last_sugarblood TEXT, incurrent BOOLEAN)'
						;
						tx.executeSql(houses, [], nullHandler, onDbError);
						tx.executeSql(persons, [], nullHandler, onDbError);
						tx.executeSql(chronics, [], nullHandler, onDbError);
						tx.executeSql(visited, [], nullHandler, onDbError);
					});
				}
			;

			try {
				gisiph = window.openDatabase('gisiph', '1.0', 'GISIPH Application on Android Devices', dbSize);
				gisiph.readTransaction(function(tx) {
					tx.executeSql('SELECT 1 FROM houses NATURAL JOIN persons NATURAL JOIN chronics NATURAL JOIN visited', [], nullHandler, createDb);
				});
			} catch(err) {
				console.log('Error opening database: ' + err.code + ' - ' + err.message);
			};

			return gisiph;
		},

		query = function(sql, data, callback) {
			gisiph.transaction(function(tx) {
				tx.executeSql(sql, data, callback, onDbError);
			});
			return gisiph;
		}
	;




	return {
		init: init,
		garbage: garbage,
		query: query
	};

})(Lungo, App);