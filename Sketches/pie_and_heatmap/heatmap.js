//set the size of each rectangle cell in the heatmap
var itemSize = 80;
var cellSize = itemSize - 1;

//set margin size for the labels of x and y axis
var margin = {top: 160,right: 20, bottom: 20, left: 200},
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

//set the position and size of the svg
var svg = d3.select("#chart2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function redrawHeatmap(datanow) {

	svg.selectAll('*').remove()


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

	// console.log(oddsratios);



//set x and y axis scale and domain
	var xScale = d3.scaleBand()
		.range([0,(x_Group.length+1) * itemSize])
		.round(0.2);
	xScale.domain(oddsratios.map(function(d){return d.group;}));

	var xAxis = d3.axisTop(xScale)
		.tickFormat(function (d) {
	    		return d;
		});

	var yScale = d3.scaleBand()
	.range([0, y_Theme.length * itemSize])
	.round(0.2);
	yScale.domain(oddsratios.map(function(d){return d.theme;}));

	var yAxis = d3.axisLeft(yScale)
	.tickFormat(function (d) {
	    return d;
	});

			
	//draw each rectangle cell
			var cells = svg.selectAll('rect')
			        .data(oddsratios)
			        .enter().append('g').append('rect')
			        .attr('class', 'cell')
			        .attr('width', cellSize)
			        .attr('height', cellSize)
			        .attr('y', function(d) { return yScale(d.theme); })
			        .attr('x', function(d) { return xScale(d.group); })
			        .attr('fill', function(d) { return colourScale(+d.or_mean); })
			        .append("title")
	          		.text(function(d) {
	            		return d.group + ": " + d.or_mean ;
	          		});

	//draw x and y axis
			    svg.append("g")
			        .attr("class", "y axis")
			        .call(yAxis)
			        .selectAll('text')
			        .attr('font-weight', 'normal');

			    svg.append("g")
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

}


