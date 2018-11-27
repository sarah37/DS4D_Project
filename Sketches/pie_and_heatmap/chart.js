// GLOBAL VARIABLES

var scaleAngle = false;

// because tau is better than pi 
var tau = 2 * Math.PI;

// to format all numbers with 2 decimal places
var f = d3.format(".2f");

// tooltip which will be shown on hover
var tooltip = d3.select(".tooltip")

// colour scale blue - grey - orange
var colour_high = '#005bd4' //'#77a1e5'
var colour_med = '#f3f3f3'
var colour_low = '#f55f21'

var colourScale = d3.scaleLinear()
                .domain([0, 1, 3])
                .range([colour_low, colour_med, colour_high])
                .interpolate(d3.interpolateHcl);


var circleScale = d3.scalePow()
	.exponent([0.5])
	.domain([0, 3])
	.range([0, 150])


// this function adds start and end angle for the pie
var pie = d3.pie()
    .sort(function(a,b) {return +a.value.mean_odds_ratio - +b.value.mean_odds_ratio;})
    .value(function(d) {return (scaleAngle ? d.value.population_perc : 1)})


// this function computes the path for each pie segment
var arc = d3.arc()
	.innerRadius(0)
	.outerRadius(function (d) {
		return (circleScale(d.data.value.mean_odds_ratio));
  	})


// READ DATA

d3.csv('data_with_population.csv').then(function(data) {
	data.forEach(function(d){
		d['odds_ratio'] = +d['odds_ratio'];
		d['conf_lower'] = +d['conf_lower'];
		d['conf_upper'] = +d['conf_upper'];
		d['population_perc'] = +d['population_perc'];
		d['base_perc'] = +d['base_perc']; 
	});

	// prepare data for pie
	var data2 = d3.nest()
		.key(d => d.characteristic)
		.key(d => d.group)
		.rollup(function(leaves) { return {"population_perc": d3.mean(leaves, d => d.population_perc),
			"mean_odds_ratio": d3.mean(leaves, function(d) {return d.odds_ratio}),
			"base_perc": leaves[0].base_perc,
			"base_group": leaves[0].base_group
		} })
		.entries(data)

	data2.forEach(function(d, i) {
		this[i].values.push({key: d.values[0].value.base_group, value: {
			population_perc: d.values[0].value.base_perc,
			mean_odds_ratio: 1}
			})
	}, data2)

	// DRAW PIE CHARTS

	var div = d3.select('#chart1')

	var piediv = div.selectAll('.piediv')
		.data(data2)
		.enter()
		.append('div')
		.attr('class', 'piediv')

	var title = piediv.append('div').html(function(d) {return d.key})

	// append an svg and a g into which the pie will be drawn
	var g = piediv.append('svg')
		.attr('width', 300)
		.attr('height', 300)
		.append('g')
		.attr("transform", "translate(150,150)")

	// draw segments of the pie
	var piepic = g.datum(function(d) {return d.values})
		.selectAll(".seg")
		.data(pie)
		.enter()
		.append("path")
		.classed("seg", true)
		.style("fill", function(d,i) {return colourScale(d.data.value.mean_odds_ratio)})
		.attr("d", arc)

	// draw circle around pie to show the baseline
	var circ = g.append('circle')
		.style('fill', 'none')
		.style('stroke', colour_med)
		.style('stroke-width', '2px')
		.style('stroke-dasharray', '3,2')
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', circleScale(1))

	// show tooltip on mouseover and add text
	piepic.on('mouseover', function(d) {  // when mouse enters div      
		var tooltip_txt = d.data.key + ": " + f(d.data.value.mean_odds_ratio)
		tooltip.html(tooltip_txt); // set current label
		tooltip.style('display', 'block'); // set display
	});                                                           

	// hide tooltip on mouseout
	piepic.on('mouseout', function() { // when mouse leaves div                        
			tooltip.style('display', 'none'); // hide tooltip for that element
	});

	// move tooltip with the mouse
	piepic.on('mousemove', function(d) { // when mouse moves                  
		tooltip.style('top', (d3.event.layerY + 10) + 'px') // always 10px below the cursor
			.style('left', (d3.event.layerX + 10) + 'px'); // always 10px to the right of the mouse
	});

	// clicking on a pie will draw and show the heatmap for that characteristic
	piediv.on('click', function(d) {
		console.log('heatmap for', d.key)
		d3.select('#chart1').classed('hidden', true)
		d3.select('#chart2').classed('hidden', false)
		redrawHeatmap(data.filter(function(da) {return da.characteristic == d.key}))
	})

	d3.select("#scaleAngle").on("change", function() {
		// update the value of scaleAngle (true/false)
		scaleAngle = document.getElementById("scaleAngle").checked

		// redraw
		updatePies()
	})

	function updatePies() {
		piepic.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
		piepic = piepic.data(pie); // compute the new angles
	}

}) // end data


// link to go back from heatmap to pies
d3.select("#goback").on('click', function() {
	d3.select('#chart1').classed('hidden', false)
	d3.select('#chart2').classed('hidden', true)
})

function arcTween(a) {
	const i = d3.interpolate(this._current, a);
	this._current = i(1);
	return (t) => arc(i(t));
}