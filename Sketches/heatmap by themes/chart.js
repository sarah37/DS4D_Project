  var itemSize = 80;
  var cellSize = itemSize - 1;

var margin = {top: 160,right: 20, bottom: 20, left: 200},
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;
            

var colourScale = d3.scaleLinear()
                .domain([0, 1, 1.7])
                .range(['#f55f21', '#ccc', '#77a1e5'])//#fee08b #1a9850
                .interpolate(d3.interpolateHcl);

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var characteristic = 'Gender';

d3.csv('data_with_population.csv')
	.then(function(data) {
		data.forEach(function(d){
			d['odds_ratio'] = +d['odds_ratio'];
			d['conf_lower'] = +d['conf_lower'];
			d['conf_upper'] = +d['conf_upper'];
			d['population_perc'] = +d['population_perc'];
			d['base_perc'] = +d['base_perc']; 
		});   

		datanow = data.filter(function(d) {return d.characteristic==characteristic})



		var x_Group = d3.set(datanow, function(d){
			return d.group;
		}).values();

		var y_Theme = d3.set(datanow, function(d){
			return d.theme;
		}).values();


		var oddsratios = [];
		var basegroup = d3.set(datanow, function(d){
			return d.base_group;
		}).values();

		for(var i=0; i<y_Theme.length;i++){
			oddsratios.push({'group': basegroup[0], 
						'theme': y_Theme[i], 
						'or_mean': 1});
		}

		for(var i=0; i< x_Group.length; i++){
			for (var j=0; j<y_Theme.length;j++){
				dataset = datanow.filter(function(d) {return (d.theme==y_Theme[j]&&d.group==x_Group[i])})
				m = d3.mean(dataset, function(da) {return da.odds_ratio})
				oddsratios.push({'group': x_Group[i], 
						'theme': y_Theme[j], 
						'or_mean': m});
			}
		}

		console.log(oddsratios);


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
	})