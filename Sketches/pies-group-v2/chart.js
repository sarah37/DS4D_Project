var w = window.innerWidth;
var h = window.innerHeight;

d3.select("#hideBaseGroup").on("change", function() {
  if (hideBaseGroup) {
    hideBaseGroup = false;
  }
  else {
    hideBaseGroup = true;
  }
})

var tau = 2 * Math.PI;

var f = d3.format(".2f");

// var svg = d3.select("#svgDiv")
// 	.append("svg")
// 	.attr("width", w)
// 	.attr("height", h);

var tooltip = d3.select('#chart') // select element in the DOM with id 'chart'
	.append('div') // append a div element to the element we've selected                                    
	.attr('class', 'tooltip');

grid = []
for (var i = 0; i < 5; i++) {
	for (var j=0; j < 3; j++) {
		grid.push([i*250+125,j*250+125])
	}
}

var circleScale = d3.scalePow()
	.exponent([0.5])
	.domain([0, 3])
	.range([0, 150])

var colourScale = d3.scaleLinear()
                .domain([0, 1, 1.7])
                .range(['#d73027', '#e5e2db', '#1a9850'])//#fee08b
                .interpolate(d3.interpolateHcl);
// d3.scaleLinear()
//         .domain([0, 2])
//         .range(['#C6DBEF', '#518ede'])
//         .interpolate(d3.interpolateHcl); 
// define outer arc
var arc = d3.arc()
	.innerRadius(0)
	.outerRadius(function (d) {
		return (circleScale(d.data.mean)); 
  	})
	//.padAngle(0.001*tau)

var characteristics = ['Gender', 'Ethnicity', 'Religion', 'Sexual orientation',
       'Deprivation (SIMD)', 'Urban-Rural', 'Work Status', 'Carers',
       'Health status', 'Limitation of day-to-day activities',
       'Interpretation, translation or other communication support needs',
       'Long-term condition', 'GP Practice Size',
       'Frequency of contact with GP Practice']

d3.csv('data_with_population.csv')
	.then(function(data) {
		data.forEach(function(d){
			d['odds_ratio'] = +d['odds_ratio'];
			d['conf_lower'] = +d['conf_lower'];
			d['conf_upper'] = +d['conf_upper'];
			d['population_perc'] = +d['population_perc'];
			d['base_perc'] = +d['base_perc']; 
		});   

		// draw one chart for each characteristic
		for (var i=0; i < characteristics.length; i++) {

			div = d3.select('#chart').append('div').classed('piediv', true)
			title = div.append('div').html(characteristics[i])
			g = div.append('svg')
				.attr('width', 250)
				.attr('height', 250)
				.append('g')
				.attr("transform", "translate(125,125)")

			datanow = data.filter(function(d) {return d.characteristic==characteristics[i]})

			var nested = d3.nest()
				.key(function(d) { return d.group; })
				.entries(datanow);

			oddsratios = [{'group': nested[0].values[0].base_group,
					'population_perc': nested[0].values[0].base_perc,
					'mean': 1}]
			nested.forEach(function(d) {
				var mn = d3.mean(d.values, function(da) {return da.odds_ratio})
				oddsratios.push({'group': d.key, 
						'population_perc': d.values[0].population_perc, 
						'mean': mn})
			})

    			var pie = d3.pie()
			    .sort(null)
			    .value(function(d) {
			    	return d.population_perc
			    })

			var pienow = pie(oddsratios)

			console.log(pienow)

			var piepic = g.selectAll(".seg")
				.data(pienow)
				.enter()
				.append("path")
				.classed("seg", true)
				.style("fill", function(d,i) {return colourScale(d.data.mean)})
				.attr("d", arc)


			piepic.on('mouseover', function(d) {  // when mouse enters div      
				var tooltip_txt = d.data.group + ": " + f(d.data.mean)
				tooltip.html(tooltip_txt); // set current label
				tooltip.style('display', 'block'); // set display
			});                                                           

			piepic.on('mouseout', function() { // when mouse leaves div                        
  				tooltip.style('display', 'none'); // hide tooltip for that element
			});

			piepic.on('mousemove', function(d) { // when mouse moves                  
				tooltip.style('top', (d3.event.layerY + 10) + 'px') // always 10px below the cursor
					.style('left', (d3.event.layerX + 10) + 'px'); // always 10px to the right of the mouse
			});

			var circ = g.append('circle')
				.style('fill', 'none')
				.style('stroke', '#ccc')
				.style('stroke-width', '2px')
				.style('stroke-dasharray', '10,5')
				.attr('cx', 0)
				.attr('cy', 0)
				.attr('r', circleScale(1))



  		}
  	})