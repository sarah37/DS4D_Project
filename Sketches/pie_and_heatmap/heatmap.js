//set the size of each rectangle cell in the heatmap
var itemSize = 80;
var cellSize = itemSize - 1;

//set margin size for the labels of x and y axis
var margin = {top: 160,right: 20, bottom: 20, left: 200},
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

//set the position and size of the svg
var heatdiv = d3.select("#chart2")

var triangle_r = "&#9654;" // right-pointing black triangle
var triangle_d = "&#9660;" // down-pointing black triangle

function redrawHeatmap(datanow) {

	heatdiv.selectAll('div').remove()

	//find all groups
	var x_Group = d3.set(datanow, function(d){
		return d.group;
		}).values();

	//find all themes
	var y_Theme = d3.set(datanow, function(d){
		return d.theme;
		}).values();

	var oddsratios = [];

	//set the mean odds ratio of each theme for base group, (each is 1)
	var basegroup = d3.set(datanow, function(d){
		return d.base_group;
	}).values();
	for(var i=0; i<y_Theme.length;i++){
		oddsratios.push({'group': basegroup[0],
				'theme': y_Theme[i], 
				'or_mean': 1});
	}

	//calculate the mean odds ratio of each theme for disserent theme
	for(var i=0; i< x_Group.length; i++){
		for (var j=0; j<y_Theme.length;j++){
			dataset = datanow.filter(function(d) {return (d.theme==y_Theme[j]&&d.group==x_Group[i])})
			m = d3.mean(dataset, function(da) {return da.odds_ratio})
			oddsratios.push({'group': x_Group[i], 
					'theme': y_Theme[j], 
					'or_mean': m});
		}
	}

	var oddsratios2 = d3.nest()
			.key(function(d) { return d.theme; })
			.entries(oddsratios);



	// Define x and y scale and axis
	var xScale = d3.scaleBand()
		.range([200,(x_Group.length+1) * itemSize + 200])
		.domain(oddsratios.map(function(d){return d.group;}))
		.round(0.2);

	var xAxis = d3.axisTop(xScale)
		.tickFormat(function (d) {return d})
		.tickSize(0)
		.tickSizeOuter(0);

	// draw x labels first
	heatdiv.append("div")
		.append('svg')
		.attr('height', margin.top)
		.attr('width', width + margin.left + margin.right)
		.append('g')
		.attr("transform", "translate(0," + margin.top + ")")
		.attr("class", "x axis")
		.call(xAxis)
		.selectAll('text')
		.attr('font-weight', 'normal')
		.style("text-anchor", "start")
		.attr("dx", ".8em")
		.attr("dy", ".5em")
		.attr("transform", function (d) {
			return "rotate(-65)";
		});
			
	//draw each row into a separate div
	var rows = heatdiv.selectAll('.heatmap-row')
		.data(oddsratios2)
		.enter()
		.append('div')
		.attr('id', function(d,i) {return 'row_' + i})
		.classed('heatmap-row', true)
		.append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', itemSize)

	// add label on the left of every row
	rows.append('text')
		.attr('x', 35)
		.attr('y', itemSize/2)
		.attr('text-anchor', 'start')
		.attr('font-weight', 'bold')
		.attr('dominant-baseline', 'central')
		.html(function(d) {return d.key})
		.classed('ylabel', true)

	// add triangle to expand/collapse
	rows.append('text')
		.attr('x', 10)
		.attr('y', itemSize/2)
		.attr('text-anchor', 'start')
		.attr('font-weight', 'bold')
		.attr('dominant-baseline', 'central')
		.html(triangle_r)
		.classed('triangle', true)

	// draw rectangles
	rows.selectAll('rect')
		.data(function(d) {return d.values})
		.enter()
		.append('rect')
		.attr('class', 'cell')
		.attr('width', cellSize)
		.attr('height', cellSize)
		.attr('y', 0)
		.attr('x', function(d) {return xScale(d.group)})
		.attr('fill', function(d) {return colourScale(+d.or_mean)})
		.append("title")
		.text(function(d) {
			return d.group + ": " + d.or_mean ;
		});

	rows.on('click', function(d) {

		// select svg
		var svg = d3.select(this) // *this* is the svg of the current row

		// if it is already expanded, a click should collapse it again
		if (svg.attr('height') > itemSize) {
			svg.attr('height', itemSize)
			svg.select('.triangle').html(triangle_r)
			svg.selectAll('.questions-g').remove() // remove anything previously drawn into this
		}
		// if it is not expanded, expand and draw question heatmap
		else {	
			svg.select('.triangle').html(triangle_d)

			g = svg.append('g').attr('class', 'questions-g') // add a fresh g

			var theme = d.key

			var data = datanow.filter(function(d) {return d.theme == theme})

			// get number of questions
			var questions = d3.nest()
				.key(function(d) {return d.question})
				.entries(data)
			questions = questions.map(function(d) {return d.key})

			// extend svg to accommodate all questions
			svg.attr('height', (questions.length + 1) * itemSize)

			// xScale can be reused from the other heatmap

			// define y scale: starts below the theme row, ends at number of items * itemSize
			var yScaleQ = d3.scaleBand()
				.range([itemSize, questions.length * itemSize + itemSize])
				.domain(questions)
				.round(0.2);

			// define y axis generator
			var yAxisQ = d3.axisRight(yScaleQ)
				.tickFormat(function (d) {return d})
				.tickSize(0)

			// draw y axis
			g.append('g')
				.attr("transform", "translate(" + 10 + "," + 0 + ")")
				.attr("class", "y axis")
				.call(yAxisQ)
				.selectAll('.tick text')
		        	.attr('font-weight', 'normal')
				.call(wrap, margin.left-10);
      
			// draw rectangles for heatmap
			g.selectAll('.question-rect')
				.data(data)
				.enter()
				.append('rect')
				.attr('class', 'question-rect')
				.attr('width', cellSize)
				.attr('height', cellSize)
				.attr('x', function(d) {return xScale(d.group)})
				.attr('y', function(d) {return yScaleQ(d.question)})
				.attr('fill', function(d) {
					if (d.conf_lower > 1) {return colourScale(2)}
					else if (d.conf_upper < 1) {return colourScale(0.5)}
					else {return colourScale(1)}
				})
				.append("title")
				.text(function(d) {
					return d.group + ": " + d.odds_ratio;
				});

		} // end else

	}) // end on click (row)

} // end redrawHeatmap function


// from https://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = -0.3 * itemSize //text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan")
        	.attr("x", 0).attr("y", y)
        	.attr("dy", ++lineNumber * lineHeight + dy + "em")
        	.text(word);
      }
    }
  });
}