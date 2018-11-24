// GLOBAL VARIABLES

// because tau is better than pi 
var tau = 2 * Math.PI;

// to format all numbers with 2 decimal places
var f = d3.format(".2f");

// tooltip which will be shown on hover
var tooltip = d3.select(".tooltip")

// colour scale blue - grey - orange
var colourScale = d3.scaleLinear()
                .domain([0, 1, 2])
                .range(['#f55f21', '#ccc', '#77a1e5'])//#fee08b #1a9850
                .interpolate(d3.interpolateHcl);


var circleScale = d3.scalePow()
	.exponent([0.5])
	.domain([0, 3])
	.range([0, 150])


// this function adds start and end angle for the pie
var pie = d3.pie()
    .sort(null)
    .value(function(d) {return d.population_perc})
    // value will be added later

// this function computes the path for each pie segment
var arc = d3.arc()
	.innerRadius(0)
	.outerRadius(function (d) {
		return (circleScale(d.data.mean)); 
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

	// make a list of all unique characteristics
	var characteristics = data.map(function(d) {return d.characteristic}) // get all characteristics
		.filter(function(d,i,arr) {return arr.indexOf(d) === i;}) // filter for unique values

// DRAW PIE CHARTS

	// for each characteristic, add a div, title, svg, and g
	characteristics.forEach(function(characteristic_now, i, arr) {

		// append a div for this pie to the general chart div
		var div = d3.select('#chart1').append('div').classed('piediv', true)

		// add another div into it and write the title
		var title = div.append('div').html(characteristic_now)
		
		// append an svg and a g into which the pie will be drawn
		var g = div.append('svg')
			.attr('width', 300)
			.attr('height', 300)
			.append('g')
			.attr("transform", "translate(150,150)")
			// .attr('id', 'g_' + i)

		// filter out the data for this characteristic from the larger dataset
		var datanow = data.filter(function(d) {return d.characteristic==characteristic_now})

		// prepare data by nesting data by group
		var nested = d3.nest()
			.key(function(d) { return d.group; })
			.entries(datanow);

		// add the base group of the odds ratios as the first entry
		var oddsratios = [{'group': nested[0].values[0].base_group,
				'population_perc': nested[0].values[0].base_perc,
				'mean': 1}]

		// add the other entries by calculating the mean from the nested array
		nested.forEach(function(d) {
			var mn = d3.mean(d.values, function(da) {return da.odds_ratio})
			oddsratios.push({'group': d.key, 
					'population_perc': d.values[0].population_perc, 
					'mean': mn})
		})

		// draw segments of the pie
		var piepic = g.selectAll(".seg")
			.data(pie(oddsratios))
			.enter()
			.append("path")
			.classed("seg", true)
			.style("fill", function(d,i) {return colourScale(d.data.mean)})
			.attr("d", arc)

		// draw circle around pie to show the baseline
		var circ = g.append('circle')
			.style('fill', 'none')
			.style('stroke', '#ccc')
			.style('stroke-width', '2px')
			.style('stroke-dasharray', '10,5')
			.attr('cx', 0)
			.attr('cy', 0)
			.attr('r', circleScale(1))

		// show tooltip on mouseover and add text
		piepic.on('mouseover', function(d) {  // when mouse enters div      
			var tooltip_txt = d.data.group + ": " + f(d.data.mean)
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
		g.on('click', function() {
			d3.select('#chart1').classed('hidden', true)
			d3.select('#chart2').classed('hidden', false)
			console.log('Redrawing heatmap for', characteristic_now)
			redrawHeatmap(datanow)
		})
	})

}) // end data


// link to go back from heatmap to pies
 d3.select("#goback").on('click', function() {
	d3.select('#chart1').classed('hidden', false)
	d3.select('#chart2').classed('hidden', true)
 })

// function to draw/redraw pies
function drawPies(characteristics, data) {

	

}
