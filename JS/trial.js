
loadurl = function (){

  $.getJSON("sample_data.json", function(result){
      data = result;
      console.log(data);
      createChart(data)
      
  });

};

createChart = function (data){
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var margin = {top: 20, right: 200, bottom: 30, left: 40};
  // let data = randomPoints(10);

  var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })]).nice();
        
  var yScale = d3.scaleLinear()
  .range([height, 0])
  .domain([d3.min(data, function(d) { return d.y; }), d3.max(data, function(d) { return d.y + 0.01; })]).nice();

  console.log(xScale)
  var xAxis = d3.axisBottom(xScale).ticks(12),
  yAxis = d3.axisLeft(yScale).ticks(12 * height / width);

  let line = d3.line()
  .x(function(d) {
    return xScale(d.x);
  })
  .y(function(d) {
    return yScale(d.y);
  });

    // Define the div for the tooltip
  var div = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);

  var formatComma = d3.format(",");
  var formatDecimal = d3.format(".4f");

  var svg = d3.select("#plot").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
  svg.append("g").append("rect").attr("width", width).attr("height", height).attr("class", "plot-bg");

  // Add Axis labels
  svg.append("g").attr("class", "axis axis--x")
  .attr("transform", "translate(" + 0 + "," + height + ")")
  .call(xAxis);

  svg.append("g").attr("class", "axis axis--y").call(yAxis);

  // Add Error Line
  svg.append("g").selectAll("line")
  .data(data).enter()
  .append("line")
  .attr("class", "error-line")
  .attr("x1", function(d) {
    return xScale(d.x);
  })
  .attr("y1", function(d) {
    return yScale(d.y + d.e);
  })
  .attr("x2", function(d) {
    return xScale(d.x);
  })
  .attr("y2", function(d) {
    return yScale(d.y - d.e);
  });

  // Add Error Top Cap
  svg.append("g").selectAll("line")
  .data(data).enter()
  .append("line")
  .attr("class", "error-cap")
  .attr("x1", function(d) {
    return xScale(d.x) - 4;
  })
  .attr("y1", function(d) {
    return yScale(d.y + d.e);
  })
  .attr("x2", function(d) {
    return xScale(d.x) + 4;
  })
  .attr("y2", function(d) {
    return yScale(d.y + d.e);
  });

  // Add Error Bottom Cap
  svg.append("g").selectAll("line")
  .data(data).enter()
  .append("line")
  .attr("class", "error-cap")
  .attr("x1", function(d) {
    return xScale(d.x) - 4;
  })
  .attr("y1", function(d) {
    return yScale(d.y - d.e);
  })
  .attr("x2", function(d) {
    return xScale(d.x) + 4;
  })
  .attr("y2", function(d) {
    return yScale(d.y - d.e);
  });

      
  // // Add Scatter Points
  // svg.append("g").attr("class", "scatter")
  // .selectAll("circle")
  // .data(data).enter()
  // .append('circle')
  // .attr("cx", function(d) {
  // return xScale(d.x);
  // })
  // .attr("cy", function(d) {
  // return yScale(d.y);
  // })
  // .attr("r", 5)
  
  // .on("mouseover", function(d) {		
  //   div.transition()		
  //       .duration(200)		
  //       .style("opacity", .9);		
  //   div	.html(formatComma(d.x) + "<br/>"  + formatDecimal(d.y))	
  //       .style("left", (d3.event.pageX+10) + "px")		
  //       .style("top", (d3.event.pageY-10) + "px");	
  //   })					
  // .on("mouseout", function(d) {		
  //     div.transition()		
  //         .duration(500)		
  //         .style("opacity", 0);	
  // });

  var symbol = d3.symbol();
  // var symbols_types = [d3.symbolSquare]

    // setup fill color
  var cValue = function(d) {
    return d.toolname;
  },
  color = d3.scaleOrdinal(d3.schemeCategory20);

  // console.log(color);
  var dots =svg.selectAll(".dots")
    .data(data)
    .enter()
    .append("path");
  
  dots.attr("d", symbol.type(function(){return d3.symbolSquare}))
  .attr("id", function (d) { return d.toolname.replace(/[\. ()/-]/g, "_");})
  .attr('transform',function(d){ return "translate("+xScale(d.x)+","+yScale(d.y)+")"; })
  .attr("r", 6)
  // .style("fill", function (d){return "#" + Math.random().toString(16).slice(2, 8)})
  .style("fill", function(d) {
    return color(cValue(d));
  })
  .on("mouseover", function(d) {	
    div.transition()		
        .duration(100)		
        .style("opacity", .9);		
    div	.html(d.toolname + "<br/>"  + formatComma(d.x) + "<br/>"  + formatDecimal(d.y))	
        .style("left", (d3.event.pageX+10) + "px")		
        .style("top", (d3.event.pageY-25) + "px");
    })					
  .on("mouseout", function(d) {		
      div.transition()		
          .duration(1000)		
          .style("opacity", 0);	
  });

  quantile_x = get_square_quartiles(data);
  console.log(quantile_x);
  svg.append("line")
        .attr("x1", quantile_x)
        .attr("y1", 0.04)
        .attr("x2", quantile_x)
        .attr("y2", 0.09)
        .attr("stroke-width", 2)
        .attr("stroke", "black");
        
   // --------------------------------------- 
 //									LEGENDE
 // ---------------------------------------
  
  // draw legend
  var legend = svg.selectAll(".legend")
  .data(color.domain())
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", function(d, i) {
    // return "translate(" + i * 50 + "," + i * 0 + ")";
    return "translate(0," + i * 20 + ")";
  });

  // draw legend colored rectangles
  legend.append("rect")
  .attr("x", width + 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color)
  .on('mouseover', function(d) {
    //console.log("dots",dots)
    dot = d3.select("path#" +d.replace(/[\. ()/-]/g, "_"))
    dot_data = dot._groups[0][0]
    console.log("dot_data",dot_data)
    // console.log("prueba", d3.mouse(dot_data))
    coordinates = dot_data.attributes.transform.nodeValue.match(/translate\((.*),(.*)\)/)
    //coordinates = d3.mouse(dot.node())
    console.log("coord",coordinates) 
    console.log("prueba", dot.node()) 
    div.transition()		
    .duration(100)		
    .style("opacity", .9);		
    div.html(dot_data.__data__.toolname + "<br/>"  + formatComma(dot_data.__data__.x) + "<br/>"  + formatDecimal(dot_data.__data__.y))	
    .style("left", coordinates[0] + "px")     
    .style("top", coordinates[1] + "px");
  })
  .on("mouseout", function(d) {		
    div.transition()		
        .duration(1000)		
        .style("opacity", 0);	
});


  // draw legend text
  legend.append("text")
  .attr("x", width + 40)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style("text-anchor", "start")
  .text(function(d) {
    return d;
  });
 

};



function get_square_quartiles(data) {
  var x_values = data.map(a => a.x);
  var y_values = data.map(a => a.y);
  var quantile_x = d3.quantile(x_values, 0.5);
  var quantile_y = d3.quantile(y_values, 0.5);
  return quantile_x;
};

loadurl ();


