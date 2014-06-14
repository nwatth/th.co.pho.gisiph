App.Data = (function(lng, app, undefined) {

	var refresh = true,

		clean = function() {
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

		stored = function(data, callback) {
			refresh = true;
			var percent = 0,
				complete = (function(dt) {
					var cp = 0;
					for (var val in dt) {
						cp += dt[val].length;
					}
					return cp;
				})(data),
				calc_perc = function() {
					lng.Element.progress('.notification #import_progress', (percent * 100 / complete), true);
					percent++;
					if (percent >= complete) {
						lng.Notification.hide();
						if (callback !== 'undefined') { callback(); };
					};
				}
			;

			for (var i = data.villages.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO villages (villcode, villname) VALUES (?, ?)',
					[data.villages[i].villcode, data.villages[i].villname],
					calc_perc
				);
			};
			for (var i = data.houses.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO houses (house_id, villcode, address, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
					[data.houses[i].house_id, data.houses[i].villcode, data.houses[i].address, data.houses[i].latitude, data.houses[i].longitude],
					calc_perc
				);
			};
			for (var i = data.photos_house.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO photos_house (photo_id, house_id, src, uedit, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
					[data.photos_house[i].photo_id, data.photos_house[i].house_id, data.photos_house[i].src, data.photos_house[i].uedit, data.photos_house[i].status, data.photos_house[i].timestamp],
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
			for (var i = data.photos_chronic.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO photos_chronic (photo_id, person_id, chroniccode, src, uedit, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
					[data.photos_chronic[i].photo_id, data.photos_chronic[i].person_id, data.photos_chronic[i].chroniccode, data.photos_chronic[i].src, data.photos_chronic[i].uedit, data.photos_chronic[i].status, data.photos_chronic[i].timestamp],
					calc_perc
				);
			};
			for (var i = data.visited.length - 1; i >= 0; i--) {
				app.Data.Sql.query(
					'INSERT OR IGNORE INTO visited (person_id, last_pressure, last_sugarblood, incurrent) VALUES (?, ?, ?, ? NOT NULL)',
					[data.visited[i].person_id, data.visited[i].last_pressure, data.visited[i].last_sugarblood, data.visited[i].incurrent],
					calc_perc
				);
			};
		},

		house_gps_change = function(house_id, coords, status, callback) {
			app.Data.Sql.query(
				'INSERT OR REPLACE INTO gisiph_gps_house (house_id, latitude, longitude, uedit, status) VALUES (?, ?, ?, ?, ?)',
				[house_id, coords.latitude, coords.longitude, app.Data.auth().username, status],
				callback
			);
		},

		house_gps_remove = function(house_id, callback) {
			app.Data.Sql.query(
				'INSERT OR REPLACE INTO gisiph_gps_house (house_id, latitude, longitude, uedit, status) SELECT houses.house_id, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.latitude WHEN \'UPDATE\' THEN gisiph_gps_house.latitude ELSE houses.latitude END) AS latitude, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.longitude WHEN \'UPDATE\' THEN gisiph_gps_house.longitude ELSE houses.longitude END) AS longitude, ?, ? FROM houses LEFT JOIN gisiph_gps_house ON houses.house_id = gisiph_gps_house.house_id WHERE houses.house_id = ?',
				[app.Data.auth().username, 'DELETE', house_id],
				callback
			);
		},

		house_photo_add = function(house_id, src, callback) {
			app.Data.Sql.query(
				'INSERT INTO gisiph_photo_house (house_id, src, uedit, status) VALUES (?, ?, ?, ?)',
				[house_id, src, app.Data.auth().username, 'INSERT'],
				callback
			);
		},

		house_photo_remove = function(photo_id, capture, callback) {console.log(photo_id, capture);
			var old_photo = 'INSERT INTO gisiph_photo_house (house_id, ref_id, src, uedit, status) SELECT photos_house.house_id, photos_house.photo_id AS ref_id, photos_house.src, ? AS uedit, \'DELETE\' AS status FROM photos_house WHERE photos_house.photo_id = ?',
				new_photo = 'UPDATE gisiph_photo_house SET status = \'DELETE\', uedit = ? WHERE photo_id = ?'
			;
			app.Data.Sql.query(
				capture ? new_photo : old_photo,
				[app.Data.auth().username, photo_id],
				callback
			);
		},

		chronic_photo_add = function(person_id, chroniccode, src, callback) {
			app.Data.Sql.query(
				'INSERT INTO gisiph_photo_pchronic (person_id, chroniccode, src, uedit, status) VALUES (?, ?, ?, ?, ?)',
				[person_id, chroniccode, src, app.Data.auth().username, 'INSERT'],
				callback
			);
		},

		chronic_photo_remove = function(photo_id, capture, callback) {console.log(photo_id, capture);
			var old_photo = 'INSERT INTO gisiph_photo_pchronic (person_id, chroniccode, ref_id, src, uedit, status) SELECT photos_chronic.person_id, photos_chronic.chroniccode, photos_chronic.photo_id AS ref_id, photos_chronic.src, ? AS uedit, \'DELETE\' AS status FROM photos_chronic WHERE photos_chronic.photo_id = ?',
				new_photo = 'UPDATE gisiph_photo_pchronic SET status = \'DELETE\', uedit = ? WHERE photo_id = ?'
			;
			app.Data.Sql.query(
				capture ? new_photo : old_photo,
				[app.Data.auth().username, photo_id],
				callback
			);
		}
	;




	return {
		clean: clean,
		auth: auth,
		districts: districts,
		stored: stored,
		house_gps_change: house_gps_change,
		house_gps_remove: house_gps_remove,
		house_photo_add: house_photo_add,
		house_photo_remove: house_photo_remove,
		chronic_photo_add: chronic_photo_add,
		chronic_photo_remove: chronic_photo_remove
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
				var gbs = {
					villages: 'DROP TABLE IF EXISTS villages',
					houses: 'DROP TABLE IF EXISTS houses',
					photos_house: 'DROP TABLE IF EXISTS photos_house',
					persons: 'DROP TABLE IF EXISTS persons',
					chronics: 'DROP TABLE IF EXISTS chronics',
					photos_chronic: 'DROP TABLE IF EXISTS photos_chronic',
					visited: 'DROP TABLE IF EXISTS visited',
					gisiph_gps_house: 'DROP TABLE IF EXISTS gisiph_gps_house',
					gisiph_photo_house: 'DROP TABLE IF EXISTS gisiph_photo_house',
					gisiph_photo_pchronic: 'DROP TABLE IF EXISTS gisiph_photo_pchronic'
				};

				for (gb in gbs) {
					tx.executeSql(gbs[gb], [], nullHandler, onDbError);
				}
				/*tx.executeSql(villages, [], nullHandler, onDbError);
				tx.executeSql(houses, [], nullHandler, onDbError);
				tx.executeSql(photos_house, [], nullHandler, onDbError);
				tx.executeSql(persons, [], nullHandler, onDbError);
				tx.executeSql(chronics, [], nullHandler, onDbError);
				tx.executeSql(photos_chronic, [], nullHandler, onDbError);
				tx.executeSql(visited, [], nullHandler, onDbError);
				tx.executeSql(gisiph_gps_house, [], nullHandler, onDbError);
				tx.executeSql(gisiph_photo_house, [], nullHandler, onDbError);
				tx.executeSql(gisiph_photo_pchronic, [], nullHandler, onDbError);*/
			});
		},

		init = function() {
			var dbSize = 1024 * 1024 * 20, // 20MB
				
				createDb = function() {
					gisiph.transaction(function(tx) {
						var villages = 'CREATE TABLE IF NOT EXISTS villages (villcode INTEGER PRIMARY KEY, villname TEXT)',
							houses = 'CREATE TABLE IF NOT EXISTS houses (house_id INTEGER PRIMARY KEY, villcode INTEGER, address TEXT, latitude DOUBLE, longitude DOUBLE)',
							photos_house = 'CREATE TABLE IF NOT EXISTS photos_house (photo_id INTEGER PRIMARY KEY, house_id INTEGER, src TEXT, uedit VARCHAR(20), status VARCHAR(10), timestamp TIMESTAMP)',
							persons = 'CREATE TABLE IF NOT EXISTS persons (person_id INTEGER PRIMARY KEY, house_id INTEGER, fullname TEXT, age INTEGER, birth TEXT, sex TEXT, idcard TEXT, educate TEXT, occupa TEXT, nation TEXT, origin TEXT)',
							chronics = 'CREATE TABLE IF NOT EXISTS chronics (person_id INTEGER, disease TEXT, detail TEXT, chroniccode TEXT, datefirstdiag TEXT, PRIMARY KEY ( person_id, chroniccode))',
							photos_chronic = 'CREATE TABLE IF NOT EXISTS photos_chronic (photo_id INTEGER PRIMARY KEY, person_id INTEGER, chroniccode TEXT, src TEXT, uedit VARCHAR(20), status VARCHAR(10), timestamp TIMESTAMP)',
							visited = 'CREATE TABLE IF NOT EXISTS visited (person_id INTEGER PRIMARY KEY, last_pressure TEXT, last_sugarblood TEXT, incurrent BOOLEAN)',
							gisiph_gps_house = 'CREATE TABLE IF NOT EXISTS gisiph_gps_house (house_id INTEGER PRIMARY KEY, latitude DOUBLE, longitude DOUBLE, uedit VARCHAR(20), status VARCHAR(10), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
							gisiph_photo_house = 'CREATE TABLE IF NOT EXISTS gisiph_photo_house (photo_id INTEGER PRIMARY KEY AUTOINCREMENT, house_id INTEGER, ref_id INTEGER, src TEXT, uedit VARCHAR(20), status VARCHAR(10), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
							gisiph_photo_pchronic = 'CREATE TABLE IF NOT EXISTS gisiph_photo_pchronic (photo_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, chroniccode TEXT, ref_id INTEGER, src TEXT, uedit VARCHAR(20), status VARCHAR(10), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
						;

						tx.executeSql(villages, [], nullHandler, onDbError);
						tx.executeSql(houses, [], nullHandler, onDbError);
						tx.executeSql(photos_house, [], nullHandler, onDbError);
						tx.executeSql(persons, [], nullHandler, onDbError);
						tx.executeSql(chronics, [], nullHandler, onDbError);
						tx.executeSql(photos_chronic, [], nullHandler, onDbError);
						tx.executeSql(visited, [], nullHandler, onDbError);
						tx.executeSql(gisiph_gps_house, [], nullHandler, onDbError);
						//tx.executeSql('DROP TABLE IF EXISTS gisiph_photo_house', [], nullHandler, onDbError);
						tx.executeSql(gisiph_photo_house, [], nullHandler, onDbError);
						tx.executeSql(gisiph_photo_pchronic, [], nullHandler, onDbError);
					});
				}
			;

			try {
				gisiph = window.openDatabase('gisiph', '1.0', 'GISIPH Application on Android Devices', dbSize);
				gisiph.readTransaction(function(tx) {
					tx.executeSql('SELECT 1 FROM villages NATURAL JOIN houses NATURAL JOIN photos_house NATURAL JOIN persons NATURAL JOIN chronics NATURAL JOIN photos_chronic NATURAL JOIN visited NATURAL JOIN gisiph_gps_house NATURAL JOIN gisiph_photo_house NATURAL JOIN gisiph_photo_pchronic', [], nullHandler, createDb);
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