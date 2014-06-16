App.View = (function(lng, app, undefined) {

	var account_about = function() {
		var data = [app.Data.auth()];
			app.Template.create('#tmpl_account_about');
			app.Template.render('#account_about', data);
		},

		manage_houses = function() {
			lng.dom('#manage_houses').empty();

			// manage_houses
			app.Data.Sql.query(
				'SELECT houses.house_id, houses.address, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.latitude WHEN \'UPDATE\' THEN gisiph_gps_house.latitude ELSE houses.latitude END) AS latitude, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.longitude WHEN \'UPDATE\' THEN gisiph_gps_house.longitude ELSE houses.longitude END) AS longitude, visited.last_pressure, visited.last_sugarblood, visited.incurrent, disease NOT NULL AS is_disease FROM houses LEFT JOIN gisiph_gps_house ON houses.house_id = gisiph_gps_house.house_id JOIN persons ON houses.house_id = persons.house_id LEFT JOIN visited ON persons.person_id = visited.person_id LEFT JOIN chronics ON visited.person_id = chronics.person_id',
				[],
				function(tx, rs) {
					var houses = [],
						row = {},
						prev_row = {
							house_id: -1,
							address: '',
							latitude: 'null',
							longitude: 'null',
							color_class: ''
						}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						
						var pressure_high = (row.last_pressure || '0/0').split('/')[0],
							pressure_low = (row.last_pressure || '0/0').split('/')[1],
							color_class = ''
						;

						if (prev_row.house_id !== row.house_id && i !== 0) {
							houses.push(prev_row);
							prev_row = {
								house_id: -1,
								address: '',
								latitude: 'null',
								longitude: 'null',
								color_class: ''
							}
						}

						if (row.is_disease && row.incurrent) {
							color_class = 'level_6';
						} else if(row.is_disease && (pressure_high > 179 || pressure_low > 109 || row.last_sugarblood > 182)) {
							color_class = 'level_5';
						} else if(row.is_disease && (pressure_high > 159 || pressure_low > 99 || row.last_sugarblood > 154)) {
							color_class = 'level_4';
						} else if(row.is_disease && (pressure_high > 139 || pressure_low > 89 || row.last_sugarblood > 125)) {
							color_class = 'level_3';
						} else if(row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_2';
						} else if(!row.is_disease && (pressure_high > 119 || pressure_low > 79 || row.last_sugarblood > 100)) {
							color_class = 'level_1';
						} else if(!row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_0';
						} else {
							color_class = 'unseen';
						};

						prev_row = {
							house_id: row.house_id,
							address: row.address.split(' ต.')[0],
							latitude: row.latitude ? row.latitude : 'null',
							longitude: row.longitude ? row.longitude : 'null',
							color_class: (color_class === 'unseen' ? '_unseen' : color_class) > (prev_row.color_class === 'unseen' ? '_unseen' : prev_row.color_class) ? color_class : prev_row.color_class
						}

						if (i === len - 1) {
							houses.push(prev_row);
						}
					};

					app.Template.create('#tmpl_manage_houses');
					app.Template.render('#manage_houses', houses);

					var houses_filter = document.getElementById('houses_filter');
					houses_filter.onkeyup.call(houses_filter);
				}
			);
		},

		house_detail = function(house_id) {
			lng.dom('#house_detail').empty();
			lng.dom('#house_photos_view').empty();
			lng.dom('#house_persons').empty();

			// house_detail
			app.Data.Sql.query(
				'SELECT houses.house_id, houses.address, \
				(CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.latitude \
					WHEN \'UPDATE\' THEN gisiph_gps_house.latitude ELSE houses.latitude END) AS latitude, \
				(CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.longitude \
					WHEN \'UPDATE\' THEN gisiph_gps_house.longitude ELSE houses.longitude END) AS longitude, \
				houses.uedit, houses.timestamp, \
				gisiph_gps_house.uedit AS gps_uedit, strftime(\'%d/%m/%Y %H:%M:%S\', gisiph_gps_house.timestamp, \'localtime\', \'+543 year\') AS gps_timestamp \
					FROM houses LEFT JOIN gisiph_gps_house ON houses.house_id = gisiph_gps_house.house_id WHERE houses.house_id = ?',
				[house_id],
				function(tx, rs) {
					var houses = [],
						row = {},
						ortn = window.innerHeight > window.innerWidth ? 'land' : 'port',
						width = ortn === 'land' ? 300 : lng.dom('#house_detail').width()
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						houses.push({
							house_id: house_id,
							address: row.address,
							latitude: row.latitude ? row.latitude : 'null',
							longitude: row.longitude ? row.longitude : 'null',
							uedit: row.gps_uedit ? row.gps_uedit : row.uedit,
							timestamp: row.gps_timestamp ? row. gps_timestamp : row.timestamp,
							width: Math.round(lng.dom('#house_detail').width()) - 16,
							height: 300
						});
					};

					lng.dom('#house_detail').empty();
					app.Template.create('#tmpl_house_detail');
					app.Template.render('#house_detail', houses);
					lng.dom('#house_detail').prepend('<ul class="list"><li class="anchor contrast">รายละเอียดที่พักอาศัย</li></ul>');
					if (navigator.offLine) {
						lng.dom('#house_detail img').attr('src', 'static/images/connection_fail.png');
						lng.dom('#house_detail button').addClass('disabled');
					};
					if ((houses[0].latitude === 'null' && houses[0].longitude === 'null')) {
						lng.dom('#house_detail img').hide();
						lng.dom('#house_detail button').text('เพิ่มพิกัด').addClass('accept');
					};
				}
			);

			// house_photos
			app.Data.Sql.query(
				'SELECT * \
				FROM ( \
					SELECT photos_house.photo_id, photos_house.house_id, photos_house.src, \'false\' AS capture, \
					(CASE gisiph_photo_house.status WHEN \'DELETE\' THEN \'DELETE\' ELSE \'INSERT\' END) AS status, \
					photos_house.uedit, photos_house.timestamp \
					FROM photos_house LEFT JOIN gisiph_photo_house ON photos_house.photo_id = gisiph_photo_house.ref_id \
					UNION \
					SELECT photo_id, house_id, src, \'true\' AS capture, gisiph_photo_house.status, \
					gisiph_photo_house.uedit, strftime(\'%d/%m/%Y %H:%M:%S\', gisiph_photo_house.timestamp, \'localtime\', \'+543 year\') AS timestamp \
					FROM gisiph_photo_house WHERE gisiph_photo_house.ref_id ISNULL \
					) AS photos WHERE photos.status <> \'DELETE\' AND photos.house_id = ?',
				[house_id],
				function(tx, rs) {
					var photos = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);console.log(row);
						photos.push(row);
					};

					lng.dom('#house_photos_view').hide();
					lng.dom('#house_photos button').data('house-id', house_id);
					lng.dom('#house_photos_count').val(photos.length + ' รูป');
					lng.dom('#house_photos_uedit').val(photos.length ? photos[0].uedit : 'null');
					lng.dom('#house_photos_timestamp').val(photos.length ? photos[0].timestamp : 'null');
					if (photos.length > 0) {
						lng.dom('#house_photos_view').show();
						app.Template.create('#tmpl_house_photos');
						app.Template.render('#house_photos_view', photos);
					};
				}
			);

			// house_persons
			app.Data.Sql.query(
				'SELECT persons.person_id, persons.fullname, persons.age, persons.occupa, visited.last_pressure, visited.last_sugarblood, visited.incurrent, disease NOT NULL AS is_disease FROM persons LEFT JOIN visited ON persons.person_id = visited.person_id LEFT JOIN chronics ON visited.person_id = chronics.person_id WHERE persons.house_id = ? GROUP BY persons.person_id',
				[house_id],
				function(tx, rs) {
					var persons = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);

						var pressure_high = (row.last_pressure || '0/0').split('/')[0],
							pressure_low = (row.last_pressure || '0/0').split('/')[1],
							color_class = ''
						;

						if (row.is_disease && row.incurrent) {
							color_class = 'level_6';
						} else if(row.is_disease && (pressure_high > 179 || pressure_low > 109 || row.last_sugarblood > 182)) {
							color_class = 'level_5';
						} else if(row.is_disease && (pressure_high > 159 || pressure_low > 99 || row.last_sugarblood > 154)) {
							color_class = 'level_4';
						} else if(row.is_disease && (pressure_high > 139 || pressure_low > 89 || row.last_sugarblood > 125)) {
							color_class = 'level_3';
						} else if(row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_2';
						} else if(!row.is_disease && (pressure_high > 119 || pressure_low > 79 || row.last_sugarblood > 100)) {
							color_class = 'level_1';
						} else if(!row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_0';
						} else {
							color_class = 'unseen';
						};

						persons.push($$.mix(row, {color_class: color_class}));
					};

					app.Template.create('#tmpl_manage_persons');
					app.Template.render('#house_persons', persons);
					lng.dom('#house_persons').prepend('<li class="anchor contrast">รายละเอียดผู้พักอาศัย</li>');
				}
			);
		},

		manage_persons = function() {
			lng.dom('#manage_persons').empty();

			// manage_persons
			app.Data.Sql.query(
				'SELECT persons.person_id, persons.fullname, persons.age, persons.occupa, visited.last_pressure, visited.last_sugarblood, visited.incurrent, disease NOT NULL AS is_disease FROM persons LEFT JOIN visited ON persons.person_id = visited.person_id LEFT JOIN chronics ON visited.person_id = chronics.person_id GROUP BY persons.person_id',
				[],
				function(tx, rs) {
					var persons = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);

						var pressure_high = (row.last_pressure || '0/0').split('/')[0],
							pressure_low = (row.last_pressure || '0/0').split('/')[1],
							color_class = ''
						;

						if (row.is_disease && row.incurrent) {
							color_class = 'level_6';
						} else if(row.is_disease && (pressure_high > 179 || pressure_low > 109 || row.last_sugarblood > 182)) {
							color_class = 'level_5';
						} else if(row.is_disease && (pressure_high > 159 || pressure_low > 99 || row.last_sugarblood > 154)) {
							color_class = 'level_4';
						} else if(row.is_disease && (pressure_high > 139 || pressure_low > 89 || row.last_sugarblood > 125)) {
							color_class = 'level_3';
						} else if(row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_2';
						} else if(!row.is_disease && (pressure_high > 119 || pressure_low > 79 || row.last_sugarblood > 100)) {
							color_class = 'level_1';
						} else if(!row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_0';
						} else {
							color_class = 'unseen';
						};

						persons.push($$.mix(row, {color_class: color_class}));
					};

					app.Template.create('#tmpl_manage_persons');
					app.Template.render('#manage_persons', persons);

					var persons_filter = document.getElementById('persons_filter');
					persons_filter.onkeyup.call(persons_filter);
				}
			);
		},

		person_detail = function(person_id) {
			lng.dom('#person_detail').empty();
			lng.dom('#person_visited').empty();
			lng.dom('#person_disease').empty();

			// person_detail
			app.Data.Sql.query(
				'SELECT * FROM persons WHERE person_id = ?',
				[person_id],
				function(tx, rs) {
					var person = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						person.push(row);
					};

					app.Template.create('#tmpl_person_detail');
					app.Template.render('#person_detail', person);
					lng.dom('#person_detail').prepend('<ul class="list"><li class="anchor contrast">รายละเอียดบุคคล</li></ul>');
				}
			);

			// person_visited
			app.Data.Sql.query(
				'SELECT persons.person_id, persons.fullname, persons.age, persons.occupa, visited.last_pressure, visited.last_sugarblood, visited.incurrent, disease NOT NULL AS is_disease FROM persons LEFT JOIN visited ON persons.person_id = visited.person_id LEFT JOIN chronics ON visited.person_id = chronics.person_id WHERE persons.person_id = ? GROUP BY persons.person_id',
				[person_id],
				function(tx, rs) {
					var visited = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);

						var pressure_high = (row.last_pressure || '0/0').split('/')[0],
							pressure_low = (row.last_pressure || '0/0').split('/')[1],
							color_hypertension = -1,
							color_diabetes = -1,
							case_value = {
								'6': 'กลุ่มผู้ป่วยที่มีภาวะแทรกซ้อน',
								'5': 'กลุ่มผู้ป่วยอาการระดับ 3',
								'4': 'กลุ่มผู้ป่วยอาการระดับ 2',
								'3': 'กลุ่มผู้ป่วยอาการระดับ 1',
								'2': 'กลุ่มผู้ป่วยอาการระดับ 0',
								'1': 'กลุ่มเสี่ยง',
								'0': 'กลุ่มปกติ',
								'-1': 'กลุ่มที่ยังไม่ได้รับการตรวจ'
							},
							color_case = '',
							color_from = ''
						;

						// hypertension
						if (row.is_disease && row.incurrent) {
							color_hypertension = 6;
						} else if(row.is_disease && (pressure_high > 179 || pressure_low > 109)) {
							color_hypertension = 5;
						} else if(row.is_disease && (pressure_high > 159 || pressure_low > 99)) {
							color_hypertension = 4;
						} else if(row.is_disease && (pressure_high > 139 || pressure_low > 89)) {
							color_hypertension = 3;
						} else if(row.is_disease && (pressure_high > 0 || pressure_low > 0)) {
							color_hypertension = 2;
						} else if(!row.is_disease && (pressure_high > 119 || pressure_low > 79)) {
							color_hypertension = 1;
						} else if(!row.is_disease && (pressure_high > 0 || pressure_low > 0)) {
							color_hypertension = 0;
						} else {
							color_hypertension = -1;
						};

						// diabetes
						if (row.is_disease && row.incurrent) {
							color_diabetes = 6;
						} else if(row.is_disease && row.last_sugarblood > 182) {
							color_diabetes = 5;
						} else if(row.is_disease && row.last_sugarblood > 154) {
							color_diabetes = 4;
						} else if(row.is_disease && row.last_sugarblood > 125) {
							color_diabetes = 3;
						} else if(row.is_disease && row.last_sugarblood > 0) {
							color_diabetes = 2;
						} else if(!row.is_disease && row.last_sugarblood > 100) {
							color_diabetes = 1;
						} else if(!row.is_disease && row.last_sugarblood > 0) {
							color_diabetes = 0;
						} else {
							color_diabetes = -1;
						};


						// condition color
						if (color_hypertension > color_diabetes) {
							color_case = case_value[color_hypertension];
							color_from = 'โรคความดันโลหิตสูง';
						} else if (color_hypertension <= color_diabetes) {
							color_case = case_value[color_diabetes];
							color_from = 'โรคเบาหวาน';
						};
						if (color_hypertension == color_diabetes) {
							color_from = 'โรคเบาหวานและความดันโลหิตสูง';
						};

						visited.push($$.mix(row, {color_case: color_case, color_from: color_from}));
					};

					app.Template.create('#tmpl_person_visited');
					app.Template.render('#person_visited', visited);
					if (visited.length > 0) {
						lng.dom('#person_visited').prepend('<ul class="list"><li class="anchor contrast">รายละเอียดการตรวจครั้งล่าสุด</li></ul>');
						if (visited[0].last_pressure === null) {
							lng.dom('#person_visited #last_pressure').hide();
						};
						if (visited[0].last_sugarblood === null) {
							lng.dom('#person_visited #last_sugarblood').hide();
						};
					};
				}
			);

			// person_chronics
			app.Data.Sql.query(
				'SELECT person_id, detail, chroniccode, datefirstdiag FROM chronics WHERE person_id = ? ORDER BY datefirstdiag DESC, chroniccode',
				[person_id],
				function(tx, rs) {
					var chronics = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						chronics.push(row);
					};

					lng.dom('#person_chronics').html('');

					app.Template.create('#tmpl_person_chronics');
					app.Template.render('#person_chronics', chronics);
					if (chronics.length > 0) {
						lng.dom('#person_chronics').prepend('<li class="anchor contrast">รายละเอียดโรคเรื้อยัง</li>');
					};
				}
			);
		},

		chronic_detail = function(person_id, chroniccode) {
			lng.dom('#chronic_detail').empty();
			lng.dom('#chronic_photos_view').empty();

			// chronic_detail
			app.Data.Sql.query(
				'SELECT person_id, (CASE disease WHEN \'hypertension\' THEN \'โรคความดันโลหิตสูง\' WHEN \'diabetes\' THEN \'โรคเบาหวาน\' END) AS disease, detail, chroniccode, datefirstdiag FROM chronics WHERE person_id = ? AND chroniccode = ?',
				[person_id, chroniccode],
				function(tx, rs) {
					var chronics = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						chronics.push(row);
					};

					app.Template.create('#tmpl_chronic_detail');
					app.Template.render('#chronic_detail', chronics);
					if (chronics.length > 0) {
						lng.dom('#chronic_detail').prepend('<ul class="list"><li class="anchor contrast">รายละเอียดโรคเรื้อรัง</li></ul>');
					};
				}
			);

			// chronic_photos
			app.Data.Sql.query(
				'SELECT * \
				FROM ( \
					SELECT photos_chronic.photo_id, photos_chronic.person_id, photos_chronic.chroniccode, photos_chronic.src, \'false\' AS capture, \
					(CASE gisiph_photo_pchronic.status WHEN \'DELETE\' THEN \'DELETE\' ELSE \'INSERT\' END) AS status, \
					photos_chronic.uedit, photos_chronic.timestamp \
					FROM photos_chronic LEFT JOIN gisiph_photo_pchronic ON photos_chronic.photo_id = gisiph_photo_pchronic.ref_id \
				UNION \
				SELECT photo_id, person_id, chroniccode, src, \'true\' AS capture, gisiph_photo_pchronic.status, \
					gisiph_photo_pchronic.uedit, strftime(\'%d/%m/%Y %H:%M:%S\', gisiph_photo_pchronic.timestamp, \'localtime\', \'+543 year\') AS timestamp \
					FROM gisiph_photo_pchronic WHERE gisiph_photo_pchronic.ref_id ISNULL ) AS photos \
					WHERE photos.status <> \'DELETE\' AND photos.person_id = ? AND photos.chroniccode = ?',
				[person_id, chroniccode],
				function(tx, rs) {
					var photos = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						photos.push(row);
					};

					lng.dom('#chronic_photos_view').hide();
					lng.dom('#chronic_photos button').data('person-id', person_id);
					lng.dom('#chronic_photos button').data('chroniccode', chroniccode);
					lng.dom('#chronic_photos_count').val(photos.length + ' รูป');
					lng.dom('#chronic_photos_uedit').val(photos.length ? photos[0].uedit : 'null');
					lng.dom('#chronic_photos_timestamp').val(photos.length ? photos[0].timestamp : 'null');
					if (photos.length > 0) {
						lng.dom('#chronic_photos_view').show();
						app.Template.create('#tmpl_chronic_photos');
						app.Template.render('#chronic_photos_view', photos);
					};
				}
			);
		},

		locations_view = function() {

			var filter = {
					map_chronics: [],
					map_colors: []
				},
				map_chronics = lng.dom('#map_setting #map_chronics input[name=map_chronics]'),
				map_colors = lng.dom('#map_setting #map_colors input[name=map_colors]')
			;

			for (var i = 0; i < map_chronics.length; i++) {
				if (map_chronics[i].checked) {
					filter.map_chronics.push(map_chronics[i].value);
				};
			};

			for (var i = 0; i < map_colors.length; i++) {
				if (map_colors[i].checked) {
					filter.map_colors.push(map_colors[i].value);
				};
			};

			var in_case = (function(p) {
				var _return = '';
				for (var i = p.length - 1; i >= 0; i--) {
					_return += '?' + (i === 0 ? '': ', ');
				};
				return _return;
			})(filter.map_chronics);

			app.Data.Sql.query(
				'SELECT houses.house_id, houses.address, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.latitude WHEN \'UPDATE\' THEN gisiph_gps_house.latitude ELSE houses.latitude END) AS latitude, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.longitude WHEN \'UPDATE\' THEN gisiph_gps_house.longitude ELSE houses.longitude END) AS longitude, visited.last_pressure, visited.last_sugarblood, visited.incurrent, chronics.disease NOT NULL AS is_disease FROM houses LEFT JOIN gisiph_gps_house ON houses.house_id = gisiph_gps_house.house_id JOIN persons ON houses.house_id = persons.house_id LEFT JOIN visited ON persons.person_id = visited.person_id LEFT JOIN chronics ON visited.person_id = chronics.person_id AND chronics.disease IN (' + in_case + ')',
				filter.map_chronics,
				function(tx, rs) {
					var houses = [],
						row = {},
						prev_row = {
							house_id: -1,
							address: '',
							latitude: 'null',
							longitude: 'null',
							color_class: ''
						}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);

						var pressure_high = (row.last_pressure || '0/0').split('/')[0],
							pressure_low = (row.last_pressure || '0/0').split('/')[1],
							color_class = ''
						;

						if (prev_row.house_id !== row.house_id && i !== 0) {
							if(filter.map_colors.indexOf(prev_row.color_class) !== -1) {
								houses.push(prev_row);
								prev_row = {
									house_id: -1,
									address: '',
									latitude: 'null',
									longitude: 'null',
									color_class: ''
								}
							}
						}

						if (row.is_disease && row.incurrent) {
							color_class = 'level_6';
						} else if(row.is_disease && (pressure_high > 179 || pressure_low > 109 || row.last_sugarblood > 182)) {
							color_class = 'level_5';
						} else if(row.is_disease && (pressure_high > 159 || pressure_low > 99 || row.last_sugarblood > 154)) {
							color_class = 'level_4';
						} else if(row.is_disease && (pressure_high > 139 || pressure_low > 89 || row.last_sugarblood > 125)) {
							color_class = 'level_3';
						} else if(row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_2';
						} else if(!row.is_disease && (pressure_high > 119 || pressure_low > 79 || row.last_sugarblood > 100)) {
							color_class = 'level_1';
						} else if(!row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_class = 'level_0';
						} else {
							color_class = 'unseen';
						};

						prev_row = {
							house_id: row.house_id,
							address: row.address.split(' ต.')[0],
							latitude: row.latitude ? row.latitude : 'null',
							longitude: row.longitude ? row.longitude : 'null',
							color_class: (color_class === 'unseen' ? '_unseen' : color_class) > (prev_row.color_class === 'unseen' ? '_unseen' : prev_row.color_class) ? color_class : prev_row.color_class
						}

						if (i === len - 1) {
							if(filter.map_colors.indexOf(prev_row.color_class) !== -1) {
								houses.push(prev_row);
							}
						}
					};

					app.Service.Map.setMarker(houses);
					app.Service.Map.render();
				}
			);
		},

		chart_view = function(villcode) {
			lng.dom('#chart_visualization').empty();
			lng.dom('#chart_detail').empty();

			var chart_selected = document.getElementById('chart_selected'),
				chart_call = chart_selected.options[chart_selected.selectedIndex].value,
				chart_view = {
					// ผู้ป่วยโรคเรื้อรัง
					percent_district_chronics: function() {
						app.Data.Sql.query(
							'SELECT chronics.person_id, chronics.disease, datefirstdiag FROM chronics GROUP BY chronics.person_id, chronics.disease',
							[],
							function(tx, rs) {
								var colors = ['#8e44ad', '#27ae60', '#2980b9', '#d35400', '#2ecc71'],
									chronics_name = {
										both: 'ผู้ป่วยทั้งสองโรค',
										hypertension: 'ผู้ป่วยโรคความดันโลหิตสูง',
										diabetes: 'ผู้ป่วยโรคเบาหวาน'
									},
									columns = [
										['string', 'โรค'], ['number', 'จำนวน']
									],
									rows = [],
									row = {},
									option = {
										pieStartAngle: 270,
										colors: colors,
										legend: {
											position: 'bottom',
											alignment: 'center',
											textStyle: {
												fontName: 'Open Sans',
												fontSize: 16/1.25
											}
										},
										vAxis: {minValue:0}
									},
									detail = [],
									fill = {},
									datefirstdiag = '01/01/0001'
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

									if ((new Date(row.datefirstdiag)) - (new Date(datefirstdiag)) > 0) {
										datefirstdiag = row.datefirstdiag;
									};

									if (typeof fill[row.person_id] !== 'object')
										fill[row.person_id] = [];
									fill[row.person_id].push(row.disease);
								};

								fill = (function(obj) {
									var tmp = {both: 0, diabetes: 0, hypertension:0};
									for (i in obj) {
										var d = 0, h = 0;
										for (j in obj[i]) {
											if (obj[i][j] == 'diabetes') d++;
											else if (obj[i][j] == 'hypertension') h++;
										};
										if (d > 0 && h > 0) tmp['both']++;
										else if (d > 0) tmp['diabetes']++;
										else if (h > 0) tmp['hypertension']++;
									};
									return tmp;
								}) (fill);

								var i = 0;
								for (k in fill) {
									rows.push([chronics_name[k], fill[k]]);

									detail.push({
										color_column: colors[i++],
										column: chronics_name[k],
										value: 'จำนวน: ' + fill[k] + ' คน'
									});
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('PieChart');

								lng.dom('#modify').val(datefirstdiag);

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					}, // end of percent_district_chronics

					percent_village_chronics: function() { /* ผู้ป่วยโรคเรื้อรังในแต่ละหมู่บ้าน */
						app.Data.Sql.query(
							'SELECT villages.villname, chronics.person_id, chronics.disease, datefirstdiag FROM chronics JOIN persons ON chronics.person_id = persons.person_id JOIN houses ON persons.house_id = houses.house_id JOIN villages ON houses.villcode = villages.villcode GROUP BY chronics.person_id, chronics.disease',
							[],
							function(tx, rs) {
								var colors = ['#8e44ad', '#27ae60', '#2980b9', '#d35400', '#2ecc71'],
									columns = [
										['string', 'หมู่บ้าน'], ['number', 'ผู้ป่วยทั้งสองโรค'], ['number', 'ผู้ป่วยโรคเบาหวาน'], ['number', 'ผู้ป่วยโรคความดันโลหิตสูง']
									],
									rows = [],
									row = {},
									option = {
										colors: colors,
										legend: {
											position: 'bottom',
											alignment: 'center',
											textStyle: {
												fontName: 'Open Sans',
												fontSize: 16/1.25
											}
										},
										vAxis: {
											title: 'จำนวนผู้ป่วย (คน)',
											minValue:0,
											titleTextStyle: {
												fontName: 'Open Sans',
												fontSize: 14/1.25
											}
										}
									},
									detail = [],
									fill = {},
									disease = {
										diabetes: 0,
										hypertension: 0
									},
									datefirstdiag = '01/01/0001'
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

									if ((new Date(row.datefirstdiag)) - (new Date(datefirstdiag)) > 0) {
										datefirstdiag = row.datefirstdiag;
									};

									if (typeof fill[row.villname] !== 'object')
										fill[row.villname] = [];
									fill[row.villname].push({person_id: row.person_id, disease: row.disease});
								};

								for (k in fill) {
									var both = [], diabetes = [], hypertension = [];
									for (var i = 0; i < fill[k].length; i++) {
										if (fill[k][i].disease === 'diabetes' && diabetes.indexOf(fill[k][i].person_id) === -1)
											diabetes.push(fill[k][i].person_id);
										else if (fill[k][i].disease === 'hypertension' && hypertension.indexOf(fill[k][i].person_id) === -1)
											hypertension.push(fill[k][i].person_id);
									};
									both = diabetes.filter(function(n) {
										return hypertension.indexOf(n) > -1;
									});
									var i = 0, idx = -1;
									do {
										idx = diabetes.indexOf(both[i]);
										if (idx > -1) diabetes.splice(idx, 1);
										idx = hypertension.indexOf(both[i]);
										if (idx > -1) hypertension.splice(idx, 1);
									} while(++i < both.length);

									rows.push([k, both.length, diabetes.length, hypertension.length]);
									disease.diabetes += row.diabetes;
									disease.hypertension += row.hypertension;

									detail[0] = $$.mix(row, {
										color_column: colors[0],
										column: 'ผู้ป่วยทั้งสองโรค <em>(' + both.length + ' คน)</em>',
										value: (detail[0] ? detail[0].value : '') + '<p>' + k + ': ' + both.length + ' คน</p>'
									});

									detail[1] = $$.mix(row, {
										color_column: colors[1],
										column: 'ผู้ป่วยโรคเบาหวาน <em>(' + diabetes.length + ' คน)</em>',
										value: (detail[1] ? detail[1].value : '') + '<p>' + k + ': ' + diabetes.length + ' คน</p>'
									});

									detail[2] = $$.mix(row, {
										color_column: colors[2],
										column: 'ผู้ป่วยโรคความดันโลหิตสูง <em>(' + hypertension.length + ' คน)</em>',
										value: (detail[2] ? detail[2].value : '') + '<p>' + k + ': ' + hypertension.length + ' คน</p>'
									});
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('ColumnChart');

								lng.dom('#modify').val(datefirstdiag);

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					},  // end of percent_village_chronics

					percent_year_chronics: function() { /* ผู้ป่วยโรคเรื้อรังในแต่ละปี */
						app.Data.Sql.query(
							'SELECT chronics.person_id, chronics.disease, substr(chronics.datefirstdiag,7,4) AS yearfirstdiag, datefirstdiag FROM chronics GROUP BY chronics.person_id, chronics.disease',
							[],
							function(tx, rs) {
								var colors = ['#27ae60', '#2980b9', '#d35400', '#2ecc71'],
									columns = [
										['string', 'หมู่บ้าน'], ['number', 'ผู้ป่วยโรคเบาหวาน'], ['number', 'ผู้ป่วยโรคความดันโลหิตสูง']
									],
									rows = [],
									row = {},
									option = {
										colors: colors,
										legend: {
											position: 'bottom',
											alignment: 'center',
											textStyle: {
												fontName: 'Open Sans',
												fontSize: 16/1.25
											}
										},
										vAxis: {
											title: 'จำนวนผู้ป่วย (คน)',
											minValue:0,
											titleTextStyle: {
												fontName: 'Open Sans',
												fontSize: 14/1.25
											}
										}
									},
									detail = [],
									fill = {},
									disease = {
										diabetes: 0,
										hypertension: 0
									},
									datefirstdiag = '01/01/0001'
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);
									
									if ((new Date(row.datefirstdiag)) - (new Date(datefirstdiag)) > 0) {
										datefirstdiag = row.datefirstdiag;
									};

									if (typeof fill[row.yearfirstdiag] !== 'object')
										fill[row.yearfirstdiag] = [];
									fill[row.yearfirstdiag].push({person_id: row.person_id, disease: row.disease});
								};

								var sum = [0, 0];
								for (k in fill) {
									var both = [], diabetes = [], hypertension = [];
									for (var i = 0; i < fill[k].length; i++) {
										if (fill[k][i].disease === 'diabetes' && diabetes.indexOf(fill[k][i].person_id) === -1)
											diabetes.push(fill[k][i].person_id);
										else if (fill[k][i].disease === 'hypertension' && hypertension.indexOf(fill[k][i].person_id) === -1)
											hypertension.push(fill[k][i].person_id);
									};

									rows.push([k, diabetes.length, hypertension.length]);
									disease.diabetes += row.diabetes;
									disease.hypertension += row.hypertension;

									sum[0] = sum[0] + diabetes.length;
									sum[1] = sum[1] + hypertension.length;

									detail[0] = $$.mix(row, {
										color_column: colors[0],
										column: 'โรคเบาหวาน <em>(จำนวน: ' + sum[0] + ' คน)</em>',
										value: (detail[0] ? detail[0].value : '') + '<p>' + k + ': ' + diabetes.length + ' คน</p>'
									});

									detail[1] = $$.mix(row, {
										color_column: colors[1],
										column: 'โรคความดันโลหิตสูง <em>(จำนวน: ' + sum[1] + ' คน)</em>',
										value: (detail[1] ? detail[1].value : '') + '<p>' + k + ': ' + hypertension.length + ' คน</p>'
									});
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('LineChart');

								lng.dom('#modify').val(datefirstdiag);

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					}, // end of percent_year_chronics

					hypertension_chart: function(villcode) { /* แผนภูมิผู้ป่วยโรคความดันโลหิตสูง */
						app.Data.Sql.query(
							'SELECT persons.person_id, chronics.disease IS NOT NULL AS is_disease, visited.last_pressure, visited.incurrent, visitdate FROM persons LEFT JOIN chronics ON persons.person_id = chronics.person_id JOIN visited ON persons.person_id = visited.person_id JOIN houses ON persons.house_id = houses.house_id JOIN villages ON houses.villcode = villages.villcode WHERE (chronics.disease = \'hypertension\' OR chronics.disease ISNULL) AND villages.villcode = ? GROUP BY persons.person_id',
							[villcode],
							function(tx, rs) {
								var colors = ['#FFFFFF', '#00FF00', '#007700', '#FFFF00', '#FF7F00', '#FF0000', '#000000'],
									columns = [
										['string', 'ระดับความรุนแรง'], ['number', 'จำนวน'], [{type: 'string', role: 'style'}]
									],
									rows = [
										['ปกติ', 0, 'color: '+colors[0]+'; stroke-color: #000; stroke-width: .5;'],
										['เสี่ยง', 0, 'color: '+colors[1]+';'],
										['ผู้ป่วยระดับ 0', 0, 'color: '+colors[2]+';'],
										['ผู้ป่วยระดับ 1', 0, 'color: '+colors[3]+';'],
										['ผู้ป่วยระดับ 2', 0, 'color: '+colors[4]+';'],
										['ผู้ป่วยระดับ 3', 0, 'color: '+colors[5]+';'],
										['ผู้ป่วยมีโรคแทรกซ้อน', 0, 'color: '+colors[6]+';']
									],
									row = {},
									option = {
										colors: colors,
										legend: {
											position: 'none',
											alignment: 'center',
											textStyle: {
												fontName: 'Open Sans',
												fontSize: 16/1.25
											}
										},
										vAxis: {
											title: 'จำนวนผู้ป่วย (คน)',
											minValue:0,
											titleTextStyle: {
												fontName: 'Open Sans',
												fontSize: 14/1.25
											}
										}
									},
									detail = [],
									fill = {},
									visitdate = '01/01/0001'
								;

								var pres, top, bot;
								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

									if ((new Date(row.visitdate)) - (new Date(visitdate)) > 0) {
										visitdate = row.visitdate;
									};

									pres = (row.last_pressure || '-1/-1');
									top = parseInt(pres.substring(0, pres.indexOf('/')));
									bot = parseInt(pres.substring(pres.indexOf('/')+1, pres.length));

									if (typeof fill[row.person_id] !== 'object')
										fill[row.person_id] = {};
									fill[row.person_id] = {is_disease: row.is_disease, top_pressure: top, down_pressure: bot, incurrent: row.incurrent || 0};
								};

								for (k in fill) {
									if (fill[k].incurrent == true && 
										fill[k].is_disease == true) rows[6][1]++;
									else if ((fill[k].top_pressure >= 180  || fill[k].down_pressure >= 110)
											&& fill[k].is_disease == true) rows[5][1]++;
									else if ((fill[k].top_pressure >= 160 || fill[k].down_pressure >= 100)
											&& fill[k].is_disease == true) rows[4][1]++;
									else if ((fill[k].top_pressure >= 140 || fill[k].down_pressure >= 90)
											&& fill[k].is_disease == true) rows[3][1]++;
									else if (fill[k].is_disease == true) rows[2][1]++;
									else if ((fill[k].top_pressure >= 120  || fill[k].down_pressure >= 80)
											&& fill[k].is_disease == false) rows[1][1]++;
									else if (fill[k].is_disease == false) rows[0][1]++;
								};

								for (var i = 0, len = rows.length; i < len; i++) {
									detail[i] = {
										css: (i !== 0) ? '' : 'text-shadow: -1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray;',
										color_column: colors[i],
										column: 'กลุ่ม' + rows[i][0],
										value: rows[i][1]
									};
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('ColumnChart');

								lng.dom('#modify').val(visitdate);

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					}, // end of hypertension_chart

					diabetes_chart: function() { /* แผนภูมิผู้ป่วยโรคความดันโลหิตสูง */
						app.Data.Sql.query(
							'SELECT persons.person_id, chronics.disease IS NOT NULL AS is_disease, visited.last_sugarblood, visited.incurrent, visitdate FROM persons LEFT JOIN chronics ON persons.person_id = chronics.person_id JOIN visited ON persons.person_id = visited.person_id JOIN houses ON persons.house_id = houses.house_id JOIN villages ON houses.villcode = villages.villcode WHERE (chronics.disease = \'diabetes\' OR chronics.disease ISNULL) AND villages.villcode = ? GROUP BY persons.person_id',
							[villcode],
							function(tx, rs) {
								var colors = ['#FFFFFF', '#00FF00', '#007700', '#FFFF00', '#FF7F00', '#FF0000', '#000000'],
									columns = [
										['string', 'ระดับความรุนแรง'], ['number', 'จำนวน'], [{type: 'string', role: 'style'}]
									],
									rows = [
										['ปกติ', 0, 'color: '+colors[0]+'; stroke-color: #000; stroke-width: .5;'],
										['เสี่ยง', 0, 'color: '+colors[1]+';'],
										['ผู้ป่วยระดับ 0', 0, 'color: '+colors[2]+';'],
										['ผู้ป่วยระดับ 1', 0, 'color: '+colors[3]+';'],
										['ผู้ป่วยระดับ 2', 0, 'color: '+colors[4]+';'],
										['ผู้ป่วยระดับ 3', 0, 'color: '+colors[5]+';'],
										['ผู้ป่วยมีโรคแทรกซ้อน', 0, 'color: '+colors[6]+';']
									],
									row = {},
									option = {
										colors: colors,
										legend: {
											position: 'none',
											alignment: 'center',
											textStyle: {
												fontName: 'Open Sans',
												fontSize: 16/1.25
											}
										},
										vAxis: {
											title: 'จำนวนผู้ป่วย (คน)',
											minValue:0,
											titleTextStyle: {
												fontName: 'Open Sans',
												fontSize: 14/1.25
											}
										}
									},
									detail = [],
									fill = {},
									visitdate = '01/01/0001'
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

									if ((new Date(row.visitdate)) - (new Date(visitdate)) > 0) {
										visitdate = row.visitdate;
									};

									if (typeof fill[row.person_id] !== 'object')
										fill[row.person_id] = {};
									fill[row.person_id] = {is_disease: row.is_disease, last_sugarblood: parseInt(row.last_sugarblood), incurrent: row.incurrent || 0};
								};

								for (k in fill) {
									if (fill[k].incurrent == true && 
										fill[k].is_disease == true) rows[6][1]++;
									else if (fill[k].last_sugarblood >= 183 && fill[k].is_disease == true)
										rows[5][1]++;
									else if (fill[k].last_sugarblood >= 155 && fill[k].is_disease == true)
										rows[4][1]++;
									else if (fill[k].last_sugarblood >= 126 && fill[k].is_disease == true)
										rows[3][1]++;
									else if (fill[k].is_disease == true) rows[2][1]++;
									else if (fill[k].last_sugarblood >= 100 && fill[k].is_disease == false)
										rows[1][1]++;
									else if (fill[k].is_disease == false) rows[0][1]++;
								};

								for (var i = 0, len = rows.length; i < len; i++) {
									detail[i] = {
										css: (i !== 0) ? '' : 'text-shadow: -1px 0 gray, 0 1px gray, 1px 0 gray, 0 -1px gray;',
										color_column: colors[i],
										column: 'กลุ่ม' + rows[i][0],
										value: rows[i][1]
									};
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('ColumnChart');

								lng.dom('#modify').val(visitdate);

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					} // end of diabetes_chart
				}
				
			;

			chart_view[chart_call](villcode);
		},

		sync_import = function() {
			var data = app.Data.districts();
			app.Template.create('#tmpl_sync_import');
			app.Template.render('#sync_import', data);
			lng.dom('#sync_import').prepend('<ul class="list"><li class="anchor contrast">รายชื่อหมู่บ้าน</li></ul>');
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
			if (data.length > 0) {
				lng.dom('#sync_export').prepend('<ul class="list"><li class="anchor contrast">รายชื่อหมู่บ้าน</li></ul>');
			};
		}
	;




	return {
		account_about: account_about,
		manage_houses: manage_houses,
		house_detail: house_detail,
		manage_persons: manage_persons,
		person_detail: person_detail,
		chronic_detail: chronic_detail,
		locations_view: locations_view,
		chart_view: chart_view,
		sync_import: sync_import,
		sync_export: sync_export
	};

})(Lungo, App);