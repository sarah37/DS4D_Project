d3.select("#howtoreadbutton").on('click', function() {
	d3.select('.howtoread')
		.style('display', 'block')
})

d3.select(".howtoread").on('click', function() {
	d3.select('.howtoread')
		.style('display', 'none')
})

