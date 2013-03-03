// Hides address bar on iOS devices
window.addEventListener("load", function() {

	// Set a timeout...
	setTimeout(function() {
		// Hide the address bar!
		window.scrollTo(0, 1);
	}, 0);

});

// Highcharts below this point
var chart_value = 0;
var chart;
$(function () {
    
    chart = new Highcharts.Chart({
    
        chart: {
            renderTo: 'container',
            type: 'gauge',
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false
        },
        
        title: {
            text: 'Opinion Swing'
        },
        
        pane: {
            startAngle: -150,
            endAngle: 150,
            background: [{
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#FFF'],
                        [1, '#333']
                    ]
                },
                borderWidth: 0,
                outerRadius: '109%'
            }, {
                backgroundColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, '#333'],
                        [1, '#FFF']
                    ]
                },
                borderWidth: 1,
                outerRadius: '107%'
            }, {
                // default background
            }, {
                backgroundColor: '#DDD',
                borderWidth: 0,
                outerRadius: '105%',
                innerRadius: '103%'
            }]
        },
           
        // the value axis
        yAxis: {
            min: -100,
            max: 100,
            
            minorTickInterval: 'auto',
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: 'inside',
            minorTickColor: '#666',
    
            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: 'inside',
            tickLength: 10,
            tickColor: '#666',
            labels: {
                step: 2,
                rotation: 'auto'
            },
            title: {
                text: ''
            },
            plotBands: [{
                from: -100,
                to: 0,
                color: '#DF5353' // red
            }, {
                from: 0,
                to: 100,
                color: '#55BF3B' // green
            }]        
        },
    
        series: [{
            name: 'Opinion Swing',
            data: [0]
        }]
    
    }, function (chart) {
        setInterval(function () {
            var point = chart.series[0].points[0];            
            point.update(chart_value);
        }, 1000);
    });

	// Place a div overlay over the chart, without this visitors cannot
	// scroll over chart area on touch devices
	var c = $(chart.container);
	$('#chartOverflow').css({
		top: c.offset().top,
		left: c.offset().left,
		width: c.width(),
		height: c.height()
	});
});

// Sock.js below this point
var sockjs_url = '/votes';
var sockjs = new SockJS(sockjs_url);

sockjs.onopen = function() {
    console.log('New Connection using ', sockjs.protocol);
};

sockjs.onmessage = function(e) {
    var split = e.data.split(":");
    
    switch (split[0]) {
		case "CANDIDATE_CHANGE":
        	$('#candidate_name').text("Candidate: " + split[1]);
        	$('#candidate_position').text("Position: " + split[2]);
        	break;
		case "DISABLE_VOTING":
			console.log("Received disable voting command");
			$('#candidate_info').hide();
			$('#no_candidate').show();
			$('#up_button').attr('disabled','disabled');
			$('#down_button').attr('disabled','disabled');
			break;
		case "ENABLE_VOTING":
			console.log("Received enable voting command");
			$('#candidate_info').show();
			$('#no_candidate').hide();
			$('#up_button').removeAttr('disabled');
			$('#down_button').removeAttr('disabled');
			break;
		case "VOTE_VALUE_UPDATE":
			chart_value = parseInt(split[1]);
    		break;
    	default:
    		console.log("Received message: " + e.data);
    		break;
	}
};

sockjs.onclose = function() {
    console.log('Closed connection');
 /*   $('#candidate_name').text("Lost Connection"));
    $('#candidate_position').text("Please refresh your browser page");
	$('#candidate_info').show();
	$('#no_candidate').hide();
	$('#up_button').attr('disabled','disabled');
	$('#down_button').attr('disabled','disabled');*/
};

jQuery('#up_button').tappable(function() {
    console.log('Sending UP vote');
    sockjs.send("UP");
});

jQuery('#down_button').tappable(function() {
    console.log('Sending DOWN vote');
    sockjs.send("DOWN");
});