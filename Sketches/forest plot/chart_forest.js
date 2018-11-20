// var w = window.innerWidth;
// var h = window.innerHeight;

var margin = {top: 20, right: 20, bottom: 20, left: 200};
var width = 500-margin.left - margin.right,
    height = 250-margin.top - margin.bottom;

var widthScale = d3.scaleLinear()
                .range([margin.left, width + margin.left])
                .domain([0, 2]);
    
var heightScale = d3.scaleBand()
                .range([height+margin.top, margin.top])
                .round(0.2);

var xAxis = d3.axisBottom(widthScale)
              
var yAxis = d3.axisLeft(heightScale)
            .tickSizeInner([0]);


 // var svg = d3.select("#svgDiv")
 // 	.append("svg")
 // 	.attr("width", w)
 // 	.attr("height", h);

// grid = []
// for (var i = 0; i < 3; i++) {
// 	for (var j=0; j < 6; j++) {
// 		grid.push([i*500+250,j*250+125])
// 	}
// }


var characteristics = ['Gender',  'Ethnicity', 'Religion', 'Sexual orientation',
       'Deprivation (SIMD)', 'Urban-Rural', 'Work Status', 'Carers',
       'Health status', 'Limitation of day-to-day activities',
       'Interpretation, translation or other communication support needs',
       'Long-term condition', 'GP Practice Size',
       'Frequency of contact with GP Practice',
       'First OOH service contacted',
       'First OOH service treated or advised by']

d3.csv('by_group.csv')
	.then(function(data) {

		for (var i=0; i < characteristics.length; i++) {

			div = d3.select("#svgDiv").append('div').classed('chartdiv', true)
      title = div.append('div')
                .attr("class", "title")
                .html(characteristics[i]);
      svg = div.append('svg')
        .attr('width', 500)
        .attr('height', 250)

      // g = svg.append("g").attr("transform", "translate(" + grid[i][0] + "," + grid[i][1] + ")");

      data_now = data.filter(function(d) {return d.characteristic==characteristics[i]})

      heightScale.domain(data_now.map(function(d) { return d.group; } ));
      
      console.log(+data_now.odds_ratio);

      // black lines for confidence intervals
      var linesGrid = svg.selectAll("lines.grid")
          .data(data_now)
          .enter()
          .append("line");

        linesGrid.attr("class", "grid")
          .attr("x1", function(d) {
            return widthScale(+d.conf_lower);
          })
          .attr("y1", function(d) {
            return heightScale(d.group) + heightScale.bandwidth()/2;
          })
          .attr("x2", function(d) {
            return widthScale(+d.conf_upper);
          })
          .attr("y2", function(d) {
            return heightScale(d.group) + heightScale.bandwidth()/2;
          });


        // red line
        var linesBase = svg.selectAll("lines.grid")
          .data(data_now)
          .enter()
          .append("line")
          .style('stroke', '#f4424e')

        linesBase.attr("class", "grid")
          .attr("x1", function(d) {
            return widthScale(1.0);
          })
          .attr("y1", function(d) {
            return margin.top;
          })
          .attr("x2", function(d) {
            return widthScale(1.0);
          })
          .attr("y2", function(d) {
            return height+margin.top;
          });


      
      var dots = svg.selectAll("circle.odds_ratio")
            .data(data_now)
            .enter()
            .append("circle");

        dots.attr("class", "odds_ratio")
          .attr("cx", function(d) {
            return widthScale(+d.odds_ratio);
          })
          .attr("r", 3)
          .attr("cy", function(d) {
            return heightScale(d.group) + heightScale.bandwidth() / 2;
          })
          .append("title")
          .text(function(d) {
            return d.group + ": " + d.odds_ratio ;
          })

    		
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + 0 + "," + (+height + +margin.top) + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + margin.left + "," + 0 + ")")
          .call(yAxis);


  		}
  	})

// // add start and end angle to data
// var seg = tau / outer.length;
// outer.forEach(function(el, i, arr) {
// 	el.startAngle = i*seg;
// 	el.endAngle = (i+1)*seg
// })
