App.Service = (function(lng, app, undefined) {

	var login = function(data) {
			lng.Notification.show();
			data.callback = '?';
			var hostanme = app.Data.auth({hostname: data.hostname}).hostname,
				url = 'http://' + hostanme + '/dist/php/apis/login.php',
				success = function(response) {
					if (response.prop == 'success') {
						app.Data.auth(response.data.user);
						app.Data.districts(response.data.districts);
						app.Data.Sql.init();
						App.Service.Map.init();
						//lng.Router.article('account', 'about');
						lng.Router.article('sync', 'import');
						lng.Notification.hide();
					} else if (response.prop == 'fail') {
						lng.Notification.error('Access denied', 'Please check your username or password again.', 'lock');
					} else {
						lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
					};
				},
				request = $$.post(url, data, success)
			;
		},
		sync_import = function(data) {
			lng.Notification.show();
			data.callback = '?';
			var hostanme = app.Data.auth().hostname,
				url = 'http://' + hostanme + '/dist/php/apis/sync_import.php',
				success = function(response) {
					if (response.prop == 'success') {
						var dist = app.Data.districts(),
							i = 0,
							len = dist.length
						;

						for (; i < len; i++) {
							if (data.villcodes.indexOf(dist[i].value) !== -1) {
								dist[i].checked = 'checked';
								dist[i].disabled = 'disabled';
							};
						};

						lng.Notification.html(lng.dom('#tmpl_util_progress').html());
						app.Data.stored(response.data, function() {
							app.Data.districts(dist);
							app.View.sync_import();
						});
					} else if (response.prop == 'fail') {
						lng.Notification.error('Empty data', 'Please check your list and sync again.', 'warning-sign');
					} else {
						lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
					};
				},
				request = $$.post(url, data, success)
			;
		},
		sync_export = function(data) {
			var in_case = (function(p) {
					var _return = '';
					for (var i = p.length - 1; i >= 0; i--) {
						_return += '?' + (i === 0 ? '': ', ');
					};
					return _return;
				})(data.villcodes),

				on_success = function() {
					lng.Notification.success(
						"Success",				//Title
						"Successful exports",	//Description
						"check",				//Icon
						3,						//Time on screen
						function() {
							var districts = app.Data.districts(),
								dist = (function(d) {
									var i = 0,
										l = d.length,
										j = 0,
										r = []
									;

									for (; i < l; i++) {
										if (d[i].checked === 'checked') {
											r[j++] = d[i].value;
										};
									};

									return r;
								})(lng.dom('#sync_export input[name="districts"]')),
								villcodes = [],
								l = 0
							;

							for (var i = 0, len = districts.length; i < len; i++) {
								if (districts[i].checked && dist.indexOf(districts[i].value) === -1) {
									districts[i].checked = '';
									districts[i].disabled = '';
									lng.dom('#sync_export input[value="'+districts[i].value+'"]').parent().remove();
								};
							};

							app.Data.districts(districts);

							app.View.sync_import();
							app.View.sync_export();
						}
					);
				},

				gisiph_gps_house = function() {
					app.Data.Sql.query(
						'SELECT gisiph_gps_house.* FROM houses JOIN gisiph_gps_house ON houses.house_id = gisiph_gps_house.house_id WHERE houses.villcode IN ('+in_case+')',
						data.villcodes,
						function(tx, rs) {
							var data = {},
								rows = [],
								row = {}
							;

							for (var i = 0, len = rs.rows.length; i < len; i++) {
								row = rs.rows.item(i);
								rows.push(row);
							};

							data.callback = '?';
							data.request = 'gisiph_gps_house';
							data.update = JSON.stringify(rows);
							var hostanme = app.Data.auth().hostname,
								url = 'http://' + hostanme + '/dist/php/apis/sync_export.php',
								success = function(response) {
									if (response.prop == 'success') {
										app.Data.Sql.query(
											'DELETE FROM gisiph_gps_house WHERE gisiph_gps_house.house_id IN ('+response.format+')',
											response.data,
											function(tx, rs) {
												on_success();
											}
										);
									} else if (response.prop == 'fail') {
										lng.Notification.error('Empty data', 'Please check your list and sync again.', 'warning-sign');
									} else {
										lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
									};
								},
								request = $$.post(url, data, success)
							;
						}
					)
				},

				gisiph_photo_house = function() {
					app.Data.Sql.query(
						'SELECT gisiph_photo_house.* FROM houses JOIN gisiph_photo_house ON houses.house_id = gisiph_photo_house.house_id WHERE houses.villcode IN ('+in_case+')',
						data.villcodes,
						function(tx, rs) {
							var data = {},
								rows = [],
								row = {}
							;

							for (var i = 0, len = rs.rows.length; i < len; i++) {
								row = rs.rows.item(i);
								rows.push(row);
							};

							data.callback = '?';
							data.request = 'gisiph_photo_house';
							data.update = JSON.stringify(rows);
							var hostanme = app.Data.auth().hostname,
								url = 'http://' + hostanme + '/dist/php/apis/sync_export.php',
								success = function(response) {
									if (response.prop == 'success') {
										app.Data.Sql.query(
											'DELETE FROM gisiph_photo_house WHERE gisiph_photo_house.photo_id IN ('+response.format+')',
											response.data,
											function(tx, rs) {
												gisiph_gps_house();
											}
										);
									} else if (response.prop == 'fail') {
										lng.Notification.error('Empty data', 'Please check your list and sync again.', 'warning-sign');
									} else {
										lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
									};
								},
								request = $$.post(url, data, success)
							;
						}
					)
				},

				gisiph_photo_pchronic = function() {
					app.Data.Sql.query(
						'SELECT gisiph_photo_pchronic.* FROM houses JOIN persons ON houses.house_id = persons.house_id JOIN gisiph_photo_pchronic ON persons.person_id = gisiph_photo_pchronic.person_id WHERE houses.villcode IN ('+in_case+')',
						data.villcodes,
						function(tx, rs) {
							var data = {},
								rows = [],
								row = {}
							;

							for (var i = 0, len = rs.rows.length; i < len; i++) {
								row = rs.rows.item(i);
								rows.push(row);
							};

							data.callback = '?';
							data.request = 'gisiph_photo_pchronic';
							data.update = JSON.stringify(rows);
							var hostanme = app.Data.auth().hostname,
								url = 'http://' + hostanme + '/dist/php/apis/sync_export.php',
								success = function(response) {
									if (response.prop == 'success') {
										app.Data.Sql.query(
											'DELETE FROM gisiph_photo_pchronic WHERE gisiph_photo_pchronic.photo_id IN ('+response.format+')',
											response.data,
											function(tx, rs) {
												gisiph_photo_house();
											}
										);
									} else if (response.prop == 'fail') {
										lng.Notification.error('Empty data', 'Please check your list and sync again.', 'warning-sign');
									} else {
										lng.Notification.error('Server not found', 'Please check your hostname again.', 'hdd');
									};
								},
								request = $$.post(url, data, success)
							;
						}
					)
				}
			;

			lng.Notification.show();
			gisiph_photo_pchronic();
		}
	;




	return {
		login: login,
		sync_import: sync_import,
		sync_export: sync_export
	};

})(Lungo, App);




App.Service.Map = (function(lng, app, undefined) {

	var map_location = null,

		options = {
			center: null,
			zoom: 15
		},

		onnlineChecker = function(callback) {
			if (navigator.onLine) {
				callback();
			} else {
				if (!map_location) {
					lng.dom('#map_view .wrapper')
						.addClass('empty')
						.html(
							'<span class="icon warning-sign"></span>' + 
							'<strong>No Internet Connection</strong>' + 
							'<small>Please re-connect and try again.</small>'
						)
					;
				}

				setTimeout(function() {
					app.Service.Map.create();
				}, 3000);
			};
		},

		init = function() {
			delete window['map_init'];
			window['map_init'] = function() {
				App.Service.Map.create();
				delete window['map_init'];
			};

			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=map_init';
			document.body.appendChild(script);
		},

		create = function() {
			onnlineChecker(function() {
				if (typeof google === 'object' && typeof google.maps === 'object') {
					var mapOptions = {
						zoom: 15,
						center: new google.maps.LatLng(13.997928, 101.310393),
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};

					map_location = new google.maps.Map(document.getElementById('map_location'), mapOptions);

					if (options.center === null) {
						options.center = map_location.getCenter();
					};

					google.maps.event.addDomListener(map_location, 'resize', function() {
						options.center = map_location.getCenter();
					});

					google.maps.event.addDomListener(map_location, 'center_changed', function() {
						options.center = map_location.getCenter();
					});

					google.maps.event.addDomListener(map_location, 'zoom_changed', function() {
						options.zoom = map_location.getZoom();
					});
				} else {
					app.Service.Map.init()
				};
			});
		},

		setMarker = function(m) {
			onnlineChecker(function() {
				var marker = null,
					infowindow= null
				;

				for (var i = 0, len = m.length; i < len; i++) {
					marker = new google.maps.Marker({
						position: new google.maps.LatLng(m[i].latitude, m[i].longitude),
						index: i,
						house_id: m[i].house_id,
						title: m[i].address,
						icon: 'static/images/' + m[i].color_class + '.png'
					});

					marker.setMap(map_location);

					google.maps.event.addListener(marker, 'click', function() {
						app.View.house_detail(this.house_id);
						lng.Router.section('house');
					});
				};
			});
		},

		render = function() {
			onnlineChecker(function() {
				map_location.panTo(options.center);
				map_location.setZoom(options.zoom);
			});
		}
	;




	return {
		init: init,
		create: create,
		setMarker: setMarker,
		render: render
	};

})(Lungo, App);




App.Service.Visualization = (function(lng, app, undefined) {

	var data_table = null,

		chart_visualization = null,

		options = {},

		onnlineChecker = function(callback) {
			if (navigator.onLine) {
				callback();
			} else {
				if (!analysis_chart) {
					lng.dom('#<div id="map_location"></div> .wrapper')
						.addClass('empty')
						.html(
							'<span class="icon warning-sign"></span>' + 
							'<strong>No Internet Connection</strong>' + 
							'<small>Please re-connect and try adain.</small>'
						)
					;
				}

				setTimeout(function() {
					app.Service.Visualization.create();
				}, 3000);
			};
		},

		init = function() {
			window['chart_init'] = function() {
				setTimeout(function() { 
					google.load('visualization', '1',{
						'packages':['corechart'],
						'callback': App.Service.Visualization.create
					});
				}, 1);
				delete window['chart_init'];
			};

			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://www.google.com/jsapi?callback=chart_init';

			document.body.appendChild(script);
		},

		create = function() {
			onnlineChecker(function() {
				if (typeof google === 'object' && typeof google.visualization === 'object') {
					data_table = new google.visualization.DataTable();
				} else {
					app.Service.Visualization.init();
				};
			});
		},

		getValues = function(v) {
			var rows = [],
				row = []
			;
			for(var a in v) {
				for(var b in a) {
					row.push(b);
				}
				rows.push(row);
			}
			return rows;
		},

		setDataTable = function(columns, rows, option) {console.log(columns);
			onnlineChecker(function() {
				for (var i = 0; i < columns.length; i++) {
					if (typeof columns[i][0] !== 'string')
						data_table.addColumn(columns[i][0]);
					else
						data_table.addColumn(columns[i][0], columns[i][1]);
				};

				data_table.addRows(rows);

				options = option;
			});
		},

		render = function(chart) {
			onnlineChecker(function() {
				chart_visualization = new google.visualization[chart](document.getElementById('chart_visualization'));
				chart_visualization.draw(data_table, options);
			});
		}
	;




	return {
		init: init,
		create: create,
		setDataTable: setDataTable,
		render: render
	};

})(Lungo, App);