App.Events = (function(lng, app, undefined) {

	/*
	 *	[SECTIONS]
	 *	
	 *	Any section loaded event.
	 */
	lng.dom('section').on('load', function(event) {
		var sec = lng.dom(this).attr('id'),
			dom = lng.dom('aside#features ul')
		;

		dom.find('.active').removeClass('active');
		dom.find('[data-change-section="' + sec + '"]').addClass('active');
	});




	/*
	 *	[FEATURES]
	 *	
	 *	Menu on aside tapped event.
	 */
	lng.dom('aside#features li[data-change-section]').tap(function(event) {
		var target = lng.dom(this).attr('data-change-section');

/**/		lng.Router.section(target);
	});




	/*
	 *	[ACCOUNT]
	 *		
	 *	Account section loaded event.
	 */
	lng.dom('section#account').on('load', function(event) {
		app.View.account_about();
	});




	/*
	 *	[ACCOUNT]
	 *	
	 *	Logout button tapped event.
	 */
	lng.dom('section#account article#about button').tap(function(event) {
		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'signout',
			title: 'Logout',
			description: 'Are you sure you want to logout ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.clean();
/**/					lng.Router.section('unsign');
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[LOGIN]
	 *	
	 *	Login section loaded event.
	 */
	lng.dom('section#login').on('load', function(event) {
		lng.dom('#login [placeholder="Username"]').val(app.Data.auth().username);
		lng.dom('#login [placeholder="Password"]').val('');
		lng.dom('#login [placeholder="Hostname"]').val(app.Data.auth().hostname);
	});




	/*
	 *	[LOGIN]
	 *	
	 *	Login button tapped event.
	 */
/**/	lng.dom('section#login article button').tap(function(event) {
		
		var username = lng.dom('#login [placeholder="Username"]').val(),
			password = lng.dom('#login [placeholder="Password"]').val(),
			hostname = lng.dom('#login [placeholder="Hostname"]').val()
		;
/**/		app.Service.login({username: username, password: password, hostname: hostname});
	});




	/*
	 *	[MANAGEMENT]
	 *	
	 *	Management section loaded event.
	 */
	lng.dom('section#management').on('load', function(event) {
		app.View.manage_houses();
		app.View.manage_persons();
	});




	/*
	 *	[MANAGEMENT]
	 *	
	 *	House in list tapped event.
	 */
	lng.dom('section#management article#houses ul#manage_houses li[data-house-id]').tap(function(event) {
		var house_id = lng.dom(this).data('house-id');

		app.View.house_detail(house_id);
		lng.Router.section('house');
	});




	/*
	 *	[MANAGEMENT]
	 *	
	 *	Fillter houses in list event.
	 */
	document.getElementById('houses_filter').onkeyup = function(event) {
		var filter = this.value.toUpperCase(),
			list = document.getElementById('manage_houses').getElementsByTagName('li'),
			address = ''
		;

		for (var i = 0, len = list.length; i < len; i++) {
			address = list[i].getElementsByTagName('strong')[0].innerHTML;
			if (address.toUpperCase().indexOf(filter) !== -1) {
				list[i].style.display = 'list-item';
			} else {
				list[i].style.display = 'none';
			};
		};
	};




	/*
	 *	[MANAGEMENT]
	 *	
	 *	Fillter persons in list event.
	 */
	document.getElementById('persons_filter').onkeyup = function(event) {
		var filter = this.value.toUpperCase(),
			list = document.getElementById('manage_persons').getElementsByTagName('li'),
			fullname = ''
		;

		for (var i = 0, len = list.length; i < len; i++) {
			fullname = list[i].getElementsByTagName('strong')[0].innerHTML;
			if (fullname.toUpperCase().indexOf(filter) !== -1) {
				list[i].style.display = 'list-item';
			} else {
				list[i].style.display = 'none';
			};
		};
	};




	/*
	 *	[MANAGEMENT]
	 *	
	 *	Person in list tapped event.
	 */
	lng.dom('section#management article#persons ul#manage_persons li[data-person-id]').tap(function(event) {
		var person_id = lng.dom(this).data('person-id');

		app.View.person_detail(person_id);
		lng.Router.section('person');
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Person in list tapped event.
	 */
	lng.dom('section#house article#detail ul#house_persons li[data-person-id]').tap(function(event) {
		var person_id = lng.dom(this).data('person-id');

		app.View.person_detail(person_id);
		lng.Router.section('person');
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Location add or edit button tapped event.
	 */
	lng.dom('section#house article#detail div#house_detail button').tap(function(event) {
		var action = lng.dom(this).hasClass('accept') ? 'INSERT' : 'UPDATE',
			house_id = lng.dom(this).data('house-id')
		;

		lng.Notification.show();	
		lng.Notification.confirm({
			icon: 'map-marker',
			title: action === 'INSERT' ? 'Add Location' : 'Update Location',
			description: 'Are your sure ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(function(position) {
							app.Data.house_gps_change(house_id, position.coords, action, function(tx, rs) {
								app.View.house_detail(house_id);
							});
						});
					} else {
						setTimeout(function() {
							lng.Notification.show();
							lng.Notification.error('Not Support', 'Sorry, device does not support.', 'warning-sign');
						}, 400);
					};
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Edit latitude event.
	 */
	lng.dom('section#house article#detail div#house_detail #lat_edit').tap(function(event) {
		var lat = lng.dom('#latitude').val(),
			lon = lng.dom(this).data('lon'),
			house_id = lng.dom(this).data('house-id')
		;

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'edit',
			title: 'New Latitude',
			description: 'Are you sure you want to edit this location ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.house_gps_change(house_id, {latitude: lat, longitude: lon}, 'UPDATE', function(tx, rs) {
						app.View.house_detail(house_id);
					});
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Edit longitude event.
	 */
	lng.dom('section#house article#detail div#house_detail #lon_edit').tap(function(event) {
		var lat = lng.dom(this).data('lat'),
			lon = lng.dom('#longitude').val(),
			house_id = lng.dom(this).data('house-id')
		;

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'edit',
			title: 'New Longitude',
			description: 'Are you sure you want to edit this location ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.house_gps_change(house_id, {latitude: lat, longitude: lon}, 'UPDATE', function(tx, rs) {
						app.View.house_detail(house_id);
					});
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Location remove map holded event.
	 */
	lng.dom('section#house article#detail div#house_detail div#house_location img').hold(function(event) {
		var house_id = lng.dom(this).data('house-id');

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'trash',
			title: 'Remove Location',
			description: 'Are you sure you want to remove this location ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.house_gps_remove(house_id, function(tx, rs) {
						app.View.house_detail(house_id);
					});
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Photo add button tapped event.
	 */
	lng.dom('section#house article#detail div#house_photos button').tap(function(event) {
		var house_id = lng.dom(this).data('house-id');

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'camera',
			title: 'Add Photo',
			description: 'Are you sure you want to add this photo ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					if (navigator.camera) {
						navigator.camera.getPicture(
							function(imageData) {
								var src = 'data: image/jpeg;base64,' + imageData;
								app.Data.house_photo_add(house_id, src, function(tx, rs) {
									app.View.house_detail(house_id);
								});
							},
							function(message) {
								lng.Notification.error('Take picture fail', message);
							},
							{
								quality: 50,
								targetHeight: 300,
								destinationType: Camera.DestinationType.DATA_URL,
								correctOrientation: true
							}
						);
					} else {
						setTimeout(function() {
							lng.Notification.show();
							lng.Notification.error('Not Support', 'Sorry, device does not support.', 'warning-sign');
						}, 400);
					};
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[HOUSE]
	 *	
	 *	Photo remove button holdded event.
	 */
	lng.dom('section#house article#detail ul#house_photos_view img').hold(function(event) {
		if (this.src.indexOf('static/images/connection_fail.png') !== -1) { console.log('return!!!'); return false; };
		var house_id = lng.dom(this).data('house-id'),
			photo_id = lng.dom(this).data('photo-id'),
			capture = lng.dom(this).data('capture') == 'true' ? true : false
		;

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'trash',
			title: 'Remove Photo',
			description: 'Are you sure you want to remove this photo ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.house_photo_remove(photo_id, capture, function(tx, rs) {
						app.View.house_detail(house_id);
					});
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[PERSON]
	 *	
	 *	Chronic in list tapped event.
	 */
	lng.dom('section#person article#detail ul#person_chronics li[data-person-id][data-chroniccode]').tap(function(event) {
		var person_id = lng.dom(this).data('person-id'),
			chroniccode = lng.dom(this).data('chroniccode')
		;

		app.View.chronic_detail(person_id, chroniccode);
		lng.Router.section('chronic');
	});




	/*
	 *	[CHRONIC]
	 *	
	 *	Photo add button tapped event.
	 */
	lng.dom('section#chronic article#detail div#chronic_photos button').tap(function(event) {
		var person_id = lng.dom(this).data('person-id'),
			chroniccode = lng.dom(this).data('chroniccode')
		;

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'camera',
			title: 'Add Photo',
			description: 'Are you sure you want to add this photo ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){console.log(person_id);
					if (navigator.camera) {
						navigator.camera.getPicture(
							function(imageData) {
								var src = 'data: image/jpeg;base64,' + imageData;
								app.Data.chronic_photo_add(person_id, chroniccode, src, function(tx, rs) {
									app.View.chronic_detail(person_id, chroniccode);
								});
							},
							function(message) {
								lng.Notification.error('Take picture fail', message);
							},
							{
								quality: 50,
								targetHeight: 300,
								destinationType: Camera.DestinationType.DATA_URL,
								correctOrientation: true
							}
						);
					} else {
						setTimeout(function() {
							lng.Notification.show();
							lng.Notification.error('Not Support', 'Sorry, device does not support.', 'warning-sign');
						}, 400);
					};
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[CHRONIC]
	 *	
	 *	Photo remove button holdded event.
	 */
	lng.dom('section#chronic article#detail ul#chronic_photos_view img').hold(function(event) {console.log(typeof lng.dom(this).data('photo-id'), lng.dom(this).data('photo-id'));
		if (this.src.indexOf('static/images/connection_fail.png') !== -1) { console.log('return!!!'); return false; };
		var person_id = lng.dom(this).data('person-id'),
			chroniccode = lng.dom(this).data('chroniccode'),
			photo_id = lng.dom(this).data('photo-id'),
			capture = lng.dom(this).data('capture') === 'true' ? true : false
		;

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'trash',
			title: 'Remove Photo',
			description: 'Are you sure you want to remove this photo ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					app.Data.chronic_photo_remove(photo_id, capture, function(tx, rs) {
						app.View.chronic_detail(person_id, chroniccode);
					});
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[CHARTS]
	 *	
	 *	Chart section loaded event.
	 */
	lng.dom('section#charts').on('load', function(event) {
		app.Data.Sql.query(
			'SELECT villcode, villname FROM villages',
			[],
			function(tx, rs) {
				for (var i = 0, len = rs.rows.length; i < len; i++) {
					row = rs.rows.item(i);
					lng.dom('.hypertension_chart')
							.append('<option value="hypertension_chart" data-villcode="'+row.villcode+'">'+
									row.villname+'</option>');
					lng.dom('.diabetes_chart')
							.append('<option value="diabetes_chart" data-villcode="'+row.villcode+'">'+
									row.villname+'</option>');
				};
			}
		);
		app.Service.Visualization.create();
		app.View.chart_view();
	});




	/*
	 *	[CHARTS]
	 *	
	 *	Selected chart in options event.
	 */
	document.getElementById('chart_selected').onchange = function(event) {
		var chart_selected = document.getElementById('chart_selected'),
			villcode = chart_selected.options[chart_selected.selectedIndex].dataset.villcode
		;

		lng.dom('#chart_head').text(this.options[this.selectedIndex].parentNode.getAttribute('label'));

		app.Service.Visualization.create();
		app.View.chart_view(villcode);
	};




	/*
	 *	[LOCATIONS]
	 *	
	 *	Locations section loaded event.
	 */
	lng.dom('section#locations').on('load', function(event) {
		app.Service.Map.create();
		app.View.locations_view();
	});




	/*
	 *	[SYNC]
	 *	
	 *	Sync section loaded event.
	 */
	lng.dom('section#sync').on('load', function(event) {
		app.View.sync_import();
		app.View.sync_export();
	});




	/*
	 *	[SYNC]
	 *	
	 *	Import button tapped event.
	 */
	lng.dom('section#sync article#import button').tap(function(event) {
		var districts = lng.dom('#sync_import input[name="districts"]'),
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
			})(app.Data.districts()),
			villcodes = [],
			l = 0
		;

		for (var i = 0, len = districts.length; i < len; i++) {
			if (districts[i].checked && dist.indexOf(districts[i].value) === -1) {
				villcodes[l++] = districts[i].value;
			};
		};

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'download',
			title: 'Import',
			description: 'Are you sure you want to import ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function() {
					setTimeout(function() {
						app.Service.sync_import({villcodes: villcodes});
					}, 203);
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	/*
	 *	[SYNC]
	 *	
	 *	Export button tapped event.
	 */
	lng.dom('section#sync article#export button').tap(function(event) {
		var districts = lng.dom('#sync_export input[name="districts"]'),
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
			})(districts),
			villcodes = [],
			l = 0
		;

		for (var i = 0, len = districts.length; i < len; i++) {
			if (districts[i].checked && dist.indexOf(districts[i].value) === -1) {
				villcodes[l++] = districts[i].value;
			};
		};

		lng.Notification.show();
		lng.Notification.confirm({
			icon: 'upload',
			title: 'Export',
			description: 'Are you sure you want to export ?',
			accept: {
				label: 'Yes, I\'m sure.',
				callback: function(){
					setTimeout(function() {
						app.Service.sync_export({villcodes: villcodes});
					}, 203);
				}
			},
			cancel: {
				label: 'Cancel',
				callback: function() {}
			}
		});
	});




	return {

	};

})(Lungo, App);