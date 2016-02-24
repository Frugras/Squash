angular.module('app.controllers', [])

.controller('loginCtrl', function($scope) {

})

.controller('signupCtrl', function($scope) {

})

.controller('myProfileCtrl', function($scope) {

})

.controller('newMatchCtrl', function($scope) {

	$("#tabs").hide();

	google.charts.load('current', {
		packages: ['corechart']
	});
	google.charts.setOnLoadCallback(drawChart);

	$scope.onTap = function() {
		$("#msg").empty();
		$("#tabs").hide();
		load();
	}


	function readmatch(match) {
		if (match.leaguetypeid) {
			return ["League", match.opponent, match.games_score, match.level_before, match.level_after];
		} else {
			if (match.matchtypeid) {
				return ["Match", match.opponent, match.games_score, match.level_before, match.level_after];
			} else {
				// something went wrong
				return ["error", "", "", "", ""];
			}
		}
	}

	function drawChart(chartdata) {
		try {
			var data = new google.visualization.DataTable();
			data.addColumn('date', 'date');
			data.addColumn('number', 'level');

			for (var i = 0; i < chartdata.length; i++) {
				data.addRow([formatDate(chartdata[i][0]), chartdata[i][1]]);
			}
			var options = {
				title: 'Level History',
				colors: ['red'],
				hAxis: {
					format: 'd MMM yy',
					slantedText: true,
					slantedTextAngle: 60,
					//  showTextEver:,
					//  ticks:, 
					textStyle: {
						fontSize: 8
					}
				},
				vAxis: {
					baseline: 0
				}
			};
			var chart = new google.visualization.LineChart(document.getElementById('line_chart'));
			chart.draw(data, options);
		} catch (err) {
			console.log("err: Empty chart_data");
		}
	}

	function chartData(match) {
		if (match.dateint) {
			return [match.dateint, match.level_after];
		} else {
			return ["error", "", "", "", ""];
		}
	}


	/**
	 * TODO: remove; change formatting to inside drawChart method
	 */
	function formatDate(dateint) {
		var date = new Date(dateint * 1000);
		// var monthNames = [
		// "Jan", "Feb", "Mar", "Apr", "May",
		// "Jun", "Jul", "Aug", "Sep", "Oct",
		// "Nov", "Dec"
		// ];
		// var day = date.getDate();
		// var month = date.getMonth();
		// var year = date.getFullYear();

		// var formatted_date = new Date(String(day) + " " + monthNames[month] + " " + String(year));
		return date;
	}

	function display(data) {
		var data = $.parseJSON(data);
		if (data.status == "good") {
			var id = data.data.summary.playerid;
			var name = data.data.summary.player;

			$("#tab-main").html("Player: " + name);

			var s = data.data.statistics;
			$("#p_matches").html("Matches: " + s.matches +
				" won " + s.matches_won +
				" lost " + s.matches_lost);
			// $("#matchesbar").progressbar({value: 100 * s.matches_win_ratio});
			$("#p_games").html("Games: " + (s.games_won + s.games_lost) +
				" won " + s.games_won +
				" lost " + s.games_lost);
			// $("#gamesbar").progressbar({value: 100 * s.games_win_ratio});
			$("#p_points").html("Points: " + (s.points_won + s.points_lost) +
				" won " + s.points_won +
				" lost " + s.points_lost);
			// $("#pointsbar").progressbar({value: 100 * s.points_win_ratio});

			var matches = data.data.matches;
			var matchdata = [];
			var chartdata = [];
			for (var i = 0; i < matches.length; i++) {
				var t = readmatch(matches[i]);
				var c = chartData(matches[i]);
				matchdata.push(t);
				chartdata.push(c);
			}
			

			// $("#tabs").tabs();
			$("#tab-main").html(drawChart(chartdata));
			$("#tabs").show();
			// $("#msg").html("Success, loaded data for player " + id);
		} else {
			$("#msg").html("Error - " + data.user_message);
		}
	}

	function load() {
		// $("#tabs").hide();
		var id = $("#playerid").val();
		// let's make sure it's a number
		if (/^[0-9]+$/.test(id)) {
			var data = $.ajax({
					url: "http://www.badsquash.co.uk/player_detail.php?player=" + id + "&format=json",
				}).done(display)
				.fail(function() {
					$("#msg").html("Error in AJAX request.");
				});
		} else {
			$("#msg").html("Error - id must be a number");
		}
	}

})

.controller('pastMatchesCtrl', function($scope) {

	google.charts.load('current', {
		packages: ['table']
	});
	google.charts.setOnLoadCallback(loadRanking);

	//Load button
	$scope.onTap = function() {
		console.log("works")
		$("#msg").empty();
		// $("#foo").append("bar");
		changeHiddenInput();
	}

	//Displays the ranking as a table 
	function displayR(rank) {
		console.log("test");
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Position');
		data.addColumn('string', 'Player');
		data.addColumn('string', 'Club');
		data.addColumn('string', 'Last match');
		data.addColumn('string', 'Level');

		var rank = $.parseJSON(rank);

		if (rank.status == "good") {

			var rankData = rank.data;
			var rows = [];
			for (var i = 0; i < rankData.length; i++) {
				console.log(rankData[i]);
				var row = readRank(rankData[i]);
				console.log(row);
				rows.push(row);
			}
			data.addRows(rows);

			var table = new google.visualization.Table(document.getElementById('table_div'));

			table.draw(data, {
				showRowNumber: true,
				width: '100%',
				height: '100%'
			});

		} else {
			$("#msg").html("Error - displayR");
		}
	}
	//Reads input from the drop-down list
	var select;
	$scope.onload = function() {
		select = document.getElementById('dropdown');
		console.log(select);
		$("#dtable").dataTable({
			data: matchdata,
			columns: [{
				title: "Type"
			}, {
				title: "Opponent"
			}, {
				title: "Score"
			}, {
				title: "Level before"
			}, {
				title: "Level after"
			}]
		});
	}

	var county = "";
	var show = "";
	var agegroup = "";
	var gender = "";

	function changeHiddenInput() {
		county = $("#county").val();
		show = $('#show').val();
		agegroup = $('#agegroup').val();
		gender = $('#gender').val();
		matchtype = $('#matchtype').val();
		events = $('#events').val();
		clubs = $('#clubs').val();
		country = $("#country").val();


		console.log("county = " + county);
		console.log("since when= " + show);
		console.log("agegroup= " + agegroup);
		console.log("matchtype= " + matchtype);
		console.log("events= " + events);
		console.log("clubs= " + clubs);
		console.log("country = " + country);
		loadRanking();
		//county.setValue(a);
		//result.innerHTML = a || "";
	}
	//Checkbox -- Not working yet
	/*	$('#check').change(function() {

		var $check = $(this),
			$div = $check.parent();

		if ($check.prop('checked')) {

			$div.addClass('test');

		} else {

			$div.removeClass('test');

		}

	});*/
	//This loads the data for desplaying rankings (renames it to loadRanking from loadteam-- there's another function called that)
	function loadRanking() {
		var rank = $.ajax({
				url: "http://squashlevels.com/players.php?check=1&limit_confidence=1&club=" + clubs + "&county=" + county + "&country=" + country + "&show=" + show + "&events=" + events + "&matchtype=" + matchtype + "&playercat=" + agegroup + "&playertype=" + gender + "&search=Search+name&format=json"

			}).done(displayR)
			.fail(function() {
				$("#msg").html("Error in AJAX request for rank");
			});
	}

	//Reads the rank of the current player 
	function readRank(rank) {

		if (rank.position) {
			date = new Date(rank.lastmatch_date * 1000).toLocaleDateString();
			return ["" + rank.position, rank.player, rank.club, date, "" + rank.level];
		} else {
			// something went wrong
			return ["error", "", "", "", ""];
		}
	}


})

.controller('teamsCtrl', function($scope) {

	function format_date(date) {
		var monthNames = [
			"Jan", "Feb", "Mar", "Apr", "May",
			"Jun", "Jul", "Aug", "Sep", "Oct",
			"Nov", "Dec"
		];
		var day = date.getDate();
		var month = date.getMonth();
		var year = date.getFullYear();

		var formatted_date = String(day) + " " + monthNames[month] + " " + String(year);
		return formatted_date;

	}

	function read_team_match(match) {
		var seconds = match.dateint;
		var date = new Date(seconds * 1000);
		var formatted_date = format_date(date);

		//var attendance; 
		if (match.withdrawn == "false") {
			var attendance = 'Yes';
		} else {
			var attendance = 'No';
		}

		return [match.other_team.name, formatted_date, attendance];
	}



	function displayteam(teamdata) {
		var data = $.parseJSON(teamdata);
		if (data.status == "good") {
			var name = data.data.captain;
			var contact = data.data.contact;
			$("#team_name").html("Captain: " + name + "<br>Contact Number: " + contact);

			var team_matches = data.data.matches;
			var team_matchdata = [];
			for (var i = 0; i < team_matches.length; i++) {
				var t = read_team_match(team_matches[i]);
				team_matchdata.push(t);
			}
			$("#dteamtable").DataTable({
				data: team_matchdata,
				columns: [{
					title: "Opponent"
				}, {
					title: "Date"
				}, {
					title: "Availible"
				}, ]
			});

			$("#team").show();
			// $("#form").hide();

		}

	}


	function loadteam() {
		$("#team").hide();
		var teamid = $("#teamid").val();
		if (/^[0-9]+$/.test(teamid)) {
			var teamdata = $.ajax({
					url: "http://www.badsquash.co.uk/team.php?team=" + teamid + "&format=json",
				}).done(displayteam)
				.fail(function() {
					$("#msg").html("Error in AJAX equest.");
				});
		} else {
			$("#msg").html("Error - id must be a number");
		}
	}


	$scope.onTap = function() {
		console.log("works")
		loadteam();
		console.log("poop")
	}


	function main() {
		$("#team").hide();


	}

	/* launch when page ready */
	$(main);

})

.controller('playersCtrl', function($scope) {

	load();

	function load() {
		var data = $.ajax({
				url: "http://www.badsquash.co.uk/players.php?leaguetype=1&format=json",
			}).done(display)
			.fail(function() {
				$("#msg").html("Error in AJAX request.");
			});
	}

	function display(data) {
		console.log("it fuckin works")
		var data = $.parseJSON(data);
		console.log(data);
		$scope.items = []
		for (var i = 0; i < data.data.length; i++) {
			$scope.items.push(data.data[i].level + " - " + data.data[i].player)
		}
		$scope.$apply()
	}


			// $('#ranklist').html("<li> " + data.data[i].level + " <p> " + data.data[i].player + "</p></li>");


})

.controller('settingsCtrl', function($scope) {

})