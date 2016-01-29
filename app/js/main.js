import Hello from './component.jsx';
require('../scss/main.scss');

var d3 = require('d3')
var React = require('react');
var ReactDOM = require('react-dom');
var ReactFauxDOM = require('react-faux-dom')

var initialQuery = {
  "sort": "+metric",
  "filter": {
    "rollup": "daily",
    "collapseHandles": false,
    "startTime": "2016-01-24T00Z",
    "endTime": "2016-01-24T23Z",
    "handles": ["ml1", "ml2","ml3","ml4","ml5","ml6","ml7","ml8","ml9","ml10","ml11","m12"],
    "metrics": ["sessions-by-country"],
    "dimensions": ["Austria","Belgium","Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lituania","Luxembourg","Malta","Netherlands","Poland", "Portugal","Romania","Slovakia","Slovenia","Spain","Sweden","United Kingdom"]
    }
};

// var newQuery = changeDate(initialQuery, dateInput);

// function changeDate(query, date){

// 	query.filter.startTime = '"' + date + '"';
// 	query.filter.endTime = '"' + date + '"';
// };


var Chart = React.createClass({

	propTypes: {
		data: React.PropTypes.object
	},

  render: function () {
	  var node = ReactFauxDOM.createElement('svg')

		var data = this.props.data,
				flattenedData =  classes(data);
				console.log(flattenedData);


		/*
		*  Pulling new data structure from api response
		*/

		function classes(data) {
			var dataNew = []
			function iterate(name, node) {
				for (var key in node){
					if(node.hasOwnProperty(key)){
						var handle = node[key];
						for(var i=0; i < handle.length; i++){
							for(var j=0; j < handle[i].metrics.length; j++){
								if(handle[i].metrics[j]){
									dataNew.push({"sessionsPerStation": [[handle[i].handle, handle[i].metrics[j].values[0].count]], "country": handle[i].metrics[j].dimensions[0]});
								}
							}
						}	
					}
				}
			}
			iterate(null, data);
		  return dataNew;
		}

		/*
		* Pre-sorting data in order to be grouped
		*/

		var dataSortedByCountry = flattenedData.sort(function(a,b){
			if(a.country < b.country) return -1;
			if(a.country > b.country) return 1;
			return 0;
		});

		/*
		*  Group all session count results by country
		*/
		var groupedByCountry = [];

		var arrayGrouping = dataSortedByCountry.reduce(function (a, b) {
			for(var i = 0; i < dataSortedByCountry.length; i++){
					var metricsToAdd = b.sessionsPerStation[0];
					if (a.country === b.country) {
						if(a.sessionsPerStation.indexOf(metricsToAdd) === -1){
          		a.sessionsPerStation.push(metricsToAdd);
						}
          	return a;
					} if(a.country !== b.country) {
					  groupedByCountry.push(a);
					  a = b;
				  }
			  }
			});

		//push the final data group that did not get pushed in the 2nd if
    groupedByCountry.push(arrayGrouping); 
		
	  var w = 1000, //width
	  		h = initialQuery.filter.dimensions.length*60, //height
	  		r_pad = 120, //right padding
	  		h_pad = 40;  //height padding

	  //Create the chart.  Could find some way to render the skeleton of the chart before the data loads.
		var svg = d3.select("#chart")
							.append("svg")
							.attr("width",w)
							.attr("height",h);

		var c = d3.scale.category20c(),
				//set up stations as x-axis
				xScale = d3.scale.ordinal().domain(initialQuery.filter.handles).rangeBands([0, w-r_pad]),
				xAxis = d3.svg.axis().scale(xScale).orient("top");

		svg.append("g")
				.attr("class","axis")
				.attr("transform" ,"translate(0,"+h_pad+")")
				.call(xAxis);

	  //Draw chart elements based on data
		for (var j = 0; j < groupedByCountry.length; j++) {
			var g = svg.append("g").attr("class","country");


			var text = g.selectAll("text")
				.data(groupedByCountry[j]['sessionsPerStation'])
				.enter()
				.append("text");

			var circles = g.selectAll("circle")
				.data(groupedByCountry[j]['sessionsPerStation'])
				.enter()
				.append("circle");

			var rScale = d3.scale.linear()
				.domain([0, 8900])
				.range([2, 50]);

			circles
				.attr("class","circle")
				.attr("cx", function(d, i) { return xScale(d[0])+35; })
				.attr("cy", j*60+h_pad*2)
				.attr("r", function(d) { return rScale(d[1]); })
				.style("fill", function(d) { return c(j); })
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			text
				.attr("y", j*60+h_pad*2+5)
				.attr("x",function(d, i) { return xScale(d[0])+25; })
				.attr("class","value")
				.text(function(d){ return d[1]; })
				.style("fill", function(d) { return c(j); })
				.style("opacity","0");

			g.append("text")
				.attr("y", j*60+h_pad*2+5)
				.attr("x",w-r_pad)
				.attr("class","label")
				.text(groupedByCountry[j]['country'])
				.style("fill", function(d) { return c(j); })
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			function mouseover(p) {
				var g = d3.select(this).node().parentNode;
				d3.select(g).selectAll("circle").style("opacity","0");
				d3.select(g).selectAll("text.value").style("opacity","1");
			}

			function mouseout(p) {
				var g = d3.select(this).node().parentNode;
				d3.select(g).selectAll("circle").style("opacity","1");
				d3.select(g).selectAll("text.value").style("opacity","0");
			}
		};

	  return node.toReactDOM(); //throws an error but doesn't work without this
	}
});


function render (data) {
  ReactDOM.render( 
  	React.createElement(Chart,{data: data}),
    document.getElementById('chart')
  );

}
// It seems React could be used to some advantage to do this request instead,
// passing in the url through the render in some intelligent way

d3.json('http://metrics.analytics.vadio.com/metrics?key=production_api_key') 
    .header("Content-Type", "application/json")
    .post(
        JSON.stringify(initialQuery),
        function(err, rawData){
            var data = rawData;
            console.log(data);
            render(data);
        }
    );
