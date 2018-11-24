function getParam(param) {
	var url_string = window.location.href;
	var url = new URL(url_string);
	var value = url.searchParams.get(param);
	return value;
}

function heatQuestion(characteristic, theme) {
	var itemSize = 25;
		cellSize = itemSize - 1;

	var margin = {top: 200,right: 20, bottom: 20, left: 650},
	    width = window.innerWidth;
	    height = window.innerHeight;
	            

	var colourScale = d3.scaleLinear()
	                .domain([0, 1, 3.75])
	                .range(['#EC9374', '#EEE', '#90C4DD'])
	                .interpolate(d3.interpolateHcl);

	var svg = d3.select("#chart").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  	.append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv('data_with_population.csv')
		.then(function(data) {
			data.forEach(function(d){
				d['odds_ratio'] = +d['odds_ratio'];
				d['conf_lower'] = +d['conf_lower'];
				d['conf_upper'] = +d['conf_upper'];
				d['population_perc'] = +d['population_perc'];
				d['base_perc'] = +d['base_perc']; 
			});   

			//filter based on given parameter
			datanow = data.filter(function(d) {
				return d.characteristic==characteristic && d.theme==theme
			})


			var xData = d3.set(datanow, function(d){
				return d.group;
			}).values();

			var yData = d3.set(datanow, function(d){
				return d.question;
			}).values();


			var oddsratios = [];
			var basegroup = d3.set(datanow, function(d){
				return d.base_group;
			}).values();

			for(var i=0; i<yData.length;i++){
				oddsratios.push({'group': basegroup[0], 
							'question': yData[i], 
							'or_mean': 1});
			}

			for(var i=0; i< xData.length; i++){
				for (var j=0; j<yData.length;j++){
					dataset = datanow.filter(function(d) {return (d.question==yData[j]&&d.group==xData[i])})
					m = d3.mean(dataset, function(da) {return da.odds_ratio})
					oddsratios.push({'group': xData[i], 
							'question': yData[j], 
							'or_mean': m});
				}
			}

			console.log(oddsratios);

			var xScale = d3.scaleBand()
		        .range([0,(xData.length+1) * itemSize])
		        .round(0.2);
		    xScale.domain(oddsratios.map(function(d){return d.group;}));

		    var xAxis = d3.axisTop(xScale)
		        .tickFormat(function (d) {
		            return d;
		        });

		    var yScale = d3.scaleBand()
		        .range([0, yData.length * itemSize])
		        .round(0.2);
		     yScale.domain(oddsratios.map(function(d){return d.question;}));

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
			        .attr('y', function(d) { return yScale(d.question); })
			        .attr('x', function(d) { return xScale(d.group); })
			        .attr('fill', function(d) { return colourScale(+d.or_mean); })
			        .append("title")
	          		.text(function(d) {
	            		return "Odd ratio: " + d.or_mean ;
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
}