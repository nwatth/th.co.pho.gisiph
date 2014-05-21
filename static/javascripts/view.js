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
				'SELECT houses.house_id, houses.address, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.latitude WHEN \'UPDATE\' THEN gisiph_gps_house.latitude ELSE houses.latitude END) AS latitude, (CASE gisiph_gps_house.status WHEN \'DELETE\' THEN 0 WHEN \'INSERT\' THEN gisiph_gps_house.longitude WHEN \'UPDATE\' THEN gisiph_gps_house.longitude ELSE houses.longitude END) AS longitude FROM houses LEFT JOIN gisiph_gps_house ON houses.house_id = gisiph_gps_house.house_id WHERE houses.house_id = ?',
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
				'SELECT * FROM ( SELECT photos_house.photo_id, photos_house.house_id, photos_house.src, \'false\' AS capture, (CASE gisiph_photo_house.status WHEN \'DELETE\' THEN \'DELETE\' ELSE \'INSERT\' END) AS status FROM photos_house LEFT JOIN gisiph_photo_house ON photos_house.photo_id = gisiph_photo_house.ref_id UNION SELECT photo_id, house_id, src, \'ture\' AS capture, gisiph_photo_house.status FROM gisiph_photo_house WHERE gisiph_photo_house.ref_id ISNULL ) AS photos WHERE photos.status <> \'DELETE\' AND photos.house_id = ?',
				[house_id],
				function(tx, rs) {
					var photos = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						photos.push(row);
					};

					lng.dom('#house_photos_view').hide();
					lng.dom('#house_photos button').data('house-id', house_id);
					lng.dom('#house_photos_count').val(photos.length + ' รูป');
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
							color_case = ''
						;

						if (row.is_disease && row.incurrent) {
							color_case = 'กลุ่มผู้ป่วยที่มีภาวะแทรกซ้อน';
						} else if(row.is_disease && (pressure_high > 179 || pressure_low > 109 || row.last_sugarblood > 182)) {
							color_case = 'กลุ่มผู้ป่วยอาการระดับ 3';
						} else if(row.is_disease && (pressure_high > 159 || pressure_low > 99 || row.last_sugarblood > 154)) {
							color_case = 'กลุ่มผู้ป่วยอาการระดับ 2';
						} else if(row.is_disease && (pressure_high > 139 || pressure_low > 89 || row.last_sugarblood > 125)) {
							color_case = 'กลุ่มผู้ป่วยอาการระดับ 1';
						} else if(row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_case = 'กลุ่มผู้ป่วยอาการระดับ 0';
						} else if(!row.is_disease && (pressure_high > 119 || pressure_low > 79 || row.last_sugarblood > 100)) {
							color_case = 'กลุ่มเสี่ยง';
						} else if(!row.is_disease && (pressure_high > 0 || pressure_low > 0 || row.last_sugarblood > 0)) {
							color_case = 'กลุ่มปกติ';
						} else {
							color_case = 'กลุ่มที่ยังไม่ได้รับการตรวจ';
						};

						visited.push($$.mix(row, {color_case: color_case}));
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
				'SELECT person_id, detail, chroniccode, strftime(\'%d/%m/%Y\', datefirstdiag) AS datefirstdiag FROM chronics WHERE person_id = ? ORDER BY datefirstdiag DESC, chroniccode',
				[person_id],
				function(tx, rs) {
					var chronics = [],
						row = {}
					;

					for (var i = 0, len = rs.rows.length; i < len; i++) {
						row = rs.rows.item(i);
						chronics.push(row);
					};

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
				'SELECT person_id, (CASE disease WHEN \'hypertension\' THEN \'โรคความดันโลหิตสูง\' WHEN \'diabetes\' THEN \'โรคเบาหวาน\' END) AS disease, detail, chroniccode, strftime(\'%d/%m/%Y\', datefirstdiag) AS datefirstdiag FROM chronics WHERE person_id = ? AND chroniccode = ?',
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
				'SELECT * FROM ( SELECT photos_chronic.photo_id, photos_chronic.person_id, photos_chronic.chroniccode, photos_chronic.src, \'false\' AS capture, (CASE gisiph_photo_pchronic.status WHEN \'DELETE\' THEN \'DELETE\' ELSE \'INSERT\' END) AS status FROM photos_chronic LEFT JOIN gisiph_photo_pchronic ON photos_chronic.photo_id = gisiph_photo_pchronic.ref_id UNION SELECT ref_id, person_id, chroniccode, src, \'ture\' AS capture, gisiph_photo_pchronic.status FROM gisiph_photo_pchronic WHERE gisiph_photo_pchronic.ref_id ISNULL ) AS photos WHERE photos.status <> \'DELETE\' AND photos.person_id = ? AND photos.chroniccode = ?',
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

		chart_view = function() {
			lng.dom('#chart_visualization').empty();
			lng.dom('#chart_detail').empty();

			var chart_selected = document.getElementById('chart_selected'),
				chart_call = chart_selected.options[chart_selected.selectedIndex].value,
				chart_view = {
					// ผู้ป่วยโรคเรื้อรัง
					percent_district_chronics: function() {
						app.Data.Sql.query(
							'SELECT chronics.person_id, chronics.disease FROM chronics GROUP BY chronics.person_id, chronics.disease',
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
									fill = {}
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

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

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					}, // end of percent_district_chronics

					percent_village_chronics: function() { /* ผู้ป่วยโรคเรื้อรังในแต่ละหมู่บ้าน */
						app.Data.Sql.query(
							'SELECT villages.villname, chronics.person_id, chronics.disease FROM chronics JOIN persons ON chronics.person_id = persons.person_id JOIN houses ON persons.house_id = houses.house_id JOIN villages ON houses.villcode = villages.villcode',
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
									}
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

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
										column: 'โรคเบาหวาน <em>(จำนวน: ' + diabetes.length + ' คน)</em>',
										value: (detail[0] ? detail[0].value : '') + '<p>' + k + ': ' + diabetes.length + ' คน</p>'
									});

									detail[1] = $$.mix(row, {
										color_column: colors[1],
										column: 'โรคเบาหวาน <em>(จำนวน: ' + diabetes.length + ' คน)</em>',
										value: (detail[1] ? detail[1].value : '') + '<p>' + k + ': ' + diabetes.length + ' คน</p>'
									});

									detail[2] = $$.mix(row, {
										color_column: colors[2],
										column: 'โรคความดันโลหิตสูง <em>(จำนวน: ' + hypertension.length + ' คน)</em>',
										value: (detail[2] ? detail[2].value : '') + '<p>' + k + ': ' + hypertension.length + ' คน</p>'
									});
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('ColumnChart');

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					},  // end of percent_village_chronics

					percent_year_chronics: function() { /* ผู้ป่วยโรคเรื้อรังในแต่ละปี */
						app.Data.Sql.query(
							'SELECT vill.villname, COUNT(CASE vill.disease WHEN \'diabetes\' THEN 1 END) AS diabetes, COUNT(CASE vill.disease WHEN \'hypertension\' THEN 1 END) AS hypertension FROM (SELECT persons.person_id, houses.villcode, villages.villname, chronics.disease FROM houses JOIN villages ON houses.villcode = villages.villcode JOIN persons ON houses.house_id = persons.house_id JOIN chronics ON persons.person_id = chronics.person_id GROUP BY houses.villcode, persons.person_id, chronics.disease) AS vill GROUP BY vill.villcode',
							[],
							function(tx, rs) {
								var colors = ['#8e44ad', '#27ae60', '#2980b9', '#d35400', '#2ecc71'],
									columns = [
										['string', 'หมู่บ้าน'], ['number', 'โรคเบาหวาน'], ['number', 'โรคความดันโลหิตสูง']
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
									disease = {
										diabetes: 0,
										hypertension: 0
									}
								;

								for (var i = 0, len = rs.rows.length; i < len; i++) {
									row = rs.rows.item(i);

									rows.push([row.villname, row.diabetes, row.hypertension]);

									disease.diabetes += row.diabetes;
									disease.hypertension += row.hypertension;

									detail[0] = $$.mix(row, {
										color_column: colors[0],
										column: 'โรคเบาหวาน <em>(จำนวน: ' + disease.diabetes + ' คน)</em>',
										value: (detail[0] ? detail[0].value : '') + '<p>' + row.villname + ': ' + row.diabetes + ' คน</p>'
									});

									detail[1] = $$.mix(row, {
										color_column: colors[1],
										column: 'โรคความดันโลหิตสูง <em>(จำนวน: ' + disease.hypertension + ' คน)</em>',
										value: (detail[1] ? detail[1].value : '') + '<p>' + row.villname + ': ' + row.hypertension + ' คน</p>'
									});
								};

								app.Service.Visualization.setDataTable(columns, rows, option);
								app.Service.Visualization.render('LineChart');

								app.Template.create('#tmpl_charts_detail');
								app.Template.render('#chart_detail', detail);
							}
						);
					} // end of percent_year_chronics
				}
				
			;

			chart_view[chart_call]();
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