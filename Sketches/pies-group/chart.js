var w = window.innerWidth;
var h = window.innerHeight;

var tau = 2 * Math.PI;

var svg = d3.select("#svgDiv")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

grid = []
for (var i = 0; i < 6; i++) {
	for (var j=0; j < 3; j++) {
		grid.push([i*250+125,j*250+125])
	}
}

console.log(grid)

var circleScale = d3.scalePow()
	.exponent([0.5])
	.domain([0, 3])
	.range([0, 150])

// define outer arc
var arc = d3.arc()
	.innerRadius(0)
	.outerRadius(function (d) {
		return (circleScale(d.data.odds_ratio)); 
  	})
	//.padAngle(0.001*tau)

var characteristics = ['Gender', 'Age', 'Ethnicity', 'Religion', 'Sexual orientation',
       'Deprivation (SIMD)', 'Urban-Rural', 'Work Status', 'Carers',
       'Health status', 'Limitation of day-to-day activities',
       'Interpretation, translation or other communication support needs',
       'Long-term condition', 'GP Practice Size',
       'Percentage of GP practice list in 15% of most deprived areas',
       'Frequency of contact with GP Practice',
       'First OOH service contacted',
       'First OOH service treated or advised by']

d3.csv('by_group.csv')
	.then(function(data) {
      // data is now whole data set
      // draw chart in here!

		for (var i=0; i < characteristics.length; i++) {

			g = svg.append("g").attr("transform", "translate(" + grid[i][0] + "," + grid[i][1] + ")")

			data_now = [{'odds_ratio': 1}]
			data_now.push(...data.filter(function(d) {return d.characteristic==characteristics[i]}))

    			var pie = d3.pie()
			    .sort(null)
			    .value(1)

			pienow = pie(data_now)
			// pienow.splice(0,1)

			console.log(pienow)

			var pie = g.selectAll(".seg")
				.data(pienow)
				.enter()
				.append("path")
				.classed("seg", true)
				.style("fill", function(d,i) {return ((i==0) ? '#ccc' : '#888') })
				.attr("d", arc)

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

// // add start and end angle to data
// var seg = tau / outer.length;
// outer.forEach(function(el, i, arr) {
// 	el.startAngle = i*seg;
// 	el.endAngle = (i+1)*seg
// })
