

loadurl = function (){
    var benchmarking_event = "QfO4_STD_Eukaryota";
    // var benchmarking_event = "QfO4_STD_Fungi";
    // var benchmarking_event = "QfO4_ECtest";
    // var benchmarking_event = "QfO4_GOtest";
    // var benchmarking_event = "QfO4_TreeFam-A";    
    var url = "https://dev-openebench.bsc.es/api/scientific/Dataset/?query=" + benchmarking_event + "&fmt=json";
    get_data(url);
  
       
};



function get_data(url){

  fetchUrl(url).then(results => {
    join_all_json(results.Dataset);
  })

};

async function fetchUrl(url) {
  try {

    let request = await fetch(url);
    let result = await request.text();
      return JSON.parse(result);
    }
    catch (err) {
      console.log(`Invalid Url Error: ${err.stack} `);
    }

}

function join_all_json(array){

  let full_json  = [];
  for (var i = 0; i < array.length; i++) {
      let jo = {};
      jo['toolname'] = array[i].name.split('.')[0];
      jo['x'] = array[i].metrics[0].result.value;
      jo['y'] = array[i].metrics[1].result.value;
      jo['e'] = array[i].metrics[2].result.value;
      full_json.push(jo);    
  }
  
  var jo = {};
  jo['toolname'] = "prueba1";
  jo['x'] = 11000;
  jo['y'] = 0.06;
  jo['e'] = 0.004;
  full_json.push(jo); 
  var jo2 = {}; 
  jo2['toolname'] = "prueba2";
  jo2['x'] = 13000;
  jo2['y'] = 0.08;
  jo2['e'] = 0.004;
  full_json.push(jo2);
  var jo3 = {};
  jo3['toolname'] = "prueba3";
  jo3['x'] = 11000;
  jo3['y'] = 0.06;
  jo3['e'] = 0.004;
  full_json.push(jo3); 
  var jo4 = {}; 
  jo4['toolname'] = "prueba4";
  jo4['x'] = 15000;
  jo4['y'] = 0.08;
  jo4['e'] = 0.004;
  full_json.push(jo4);
  var jo5 = {};
  jo5['toolname'] = "prueba5";
  jo5['x'] = 11000;
  jo5['y'] = 0.06;
  jo5['e'] = 0.004;
  full_json.push(jo5); 
  var jo6 = {};
  jo6['toolname'] = "prueba6";
  jo6['x'] = 4500;
  jo6['y'] = 0.06;
  jo6['e'] = 0.004;
  full_json.push(jo6);



  maindata = full_json;
  createChart(full_json);
    
}

function compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools) {

  if (document.getElementById("id1").checked == true) {

    get_square_quartiles(data, svg, xScale, yScale, div, removed_tools);
    append_quartile_numbers_to_plot (svg, xScale, yScale, better);
  }  
  else if (document.getElementById("id2").checked == true) {

    get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools, better);
  } 
  
}

function compute_chart_height(data){

  if (data.length%5 == 0){
    return (40 + (20 * (Math.trunc(data.length/5))));
  } else if (data.lenght%5 != 0) {
    return (40 + (20 * (Math.trunc(data.length/5)+1)));
  } 
  
};

createChart = function (data){

  var margin = {top: 20, right: 40, bottom: compute_chart_height(data), left: 40},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


  var xScale = d3.scaleLinear()
    .range([0, width])
    .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })]).nice();

  var min_y = d3.min(data, function(d) { return d.y; });
  var max_y = d3.max(data, function(d) { return d.y; });
  var yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([min_y - 0.3*(max_y-min_y), max_y + 0.3*(max_y-min_y)]).nice();

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
    
  // append the svg element
  d3.select("svg").remove();

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

  let removed_tools = []; // this array stores the tools when the user clicks on them

   // setup fill color
  var cValue_func = function(d) {
    return d.toolname;
  },
  color_func = d3.scaleOrdinal(d3.schemeCategory20);

  append_dots_errobars (svg, data, xScale, yScale, div, cValue_func, color_func);

  draw_legend (data, svg, xScale, yScale, div, width, height, removed_tools, color_func, color_func.domain(), margin);

  compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools);

};

function append_dots_errobars (svg, data, xScale, yScale, div, cValue, color){

  // Add Error Line
  svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("class", "error-line")
      .attr("id", function (d) { return "line"+d.toolname.replace(/[\. ()/-]/g, "_");})
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
      .attr("id", function (d) { return "top"+d.toolname.replace(/[\. ()/-]/g, "_");})
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
      .attr("id", function (d) { return "bottom"+d.toolname.replace(/[\. ()/-]/g, "_");})
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

  // add dots
  var symbol = d3.symbol();

  var formatComma = d3.format(",");
  var formatDecimal = d3.format(".4f");

  var dots =svg.selectAll(".dots")
    .data(data)
    .enter()
    .append("path");
    
  dots.attr("d", symbol.type(function(){return d3.symbolSquare}))
      .attr("id", function (d) {  return d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("class","line")
      .attr('transform',function(d){ return "translate("+xScale(d.x)+","+yScale(d.y)+")"; })
      .attr("r", 6)
      .style("fill", function(d) {
        return color(cValue(d));
      })
      .on("mouseover", function(d) {
        // show tooltip only if the tool is visible
        var ID = d.toolname.replace(/[\. ()/-]/g, "_");
        if (d3.select("#"+ID).style("opacity") == 1) {
          div.transition()		
              .duration(100)		
              .style("opacity", .9);		
          div.html(d.toolname + "<br/>"  + formatComma(d.x) + "<br/>"  + formatDecimal(d.y))	
              .style("left", (d3.event.pageX) + "px")		
              .style("top", (d3.event.pageY) + "px");
        }
      })					
      .on("mouseout", function(d) {		
        div.transition()		
          .duration(1500)		
          .style("opacity", 0);	
      });
    
};

function draw_legend (data, svg, xScale, yScale, div, width, height, removed_tools, color, color_domain, margin) {

  //set number of elements per legend row
  var n = 5;

  var legend = svg.selectAll(".legend")
    .data(color_domain)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (-width+i%n*200) + "," + (height + 40 + Math.floor(i/n) * 20) + ")"; });
  
  // draw legend colored rectangles
  legend.append("rect")
        .attr("x", width + 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .on('click', function(d) {
          // remove the existing number and classification lines from plot (if any)
          svg.selectAll("#x_quartile").remove();
          svg.selectAll("#y_quartile").remove();
          svg.selectAll("#diag_quartile_0").remove();
          svg.selectAll("#diag_quartile_1").remove();
          svg.selectAll("#diag_quartile_2").remove();
          svg.selectAll("#num_bottom_right").remove();
          svg.selectAll("#num_top_right").remove();
          svg.selectAll("#num_bottom_left").remove();
          svg.selectAll("#num_top_left").remove();

          dot = d3.select("text#" +d.replace(/[\. ()/-]/g, "_"))
          var ID = dot._groups[0][0].id

          var blockopacity = d3.select("#"+ID).style("opacity");
          var topopacity = d3.select("#top"+ID).style("opacity");
          var bottomopacity = d3.select("#bottom"+ID).style("opacity");
          var lineopacity =  d3.select("#line"+ID).style("opacity");
          
          // change the opacity to 0 or 1 depending on the current state
          if (blockopacity == 0) {
            d3.select("#"+ID).style("opacity", 1);
            d3.select("#top"+ID).style("opacity", 1);
            d3.select("#bottom"+ID).style("opacity", 1);
            d3.select("#line"+ID).style("opacity", 1);
            // recalculate the quartiles after removing the tools
            let index = $.inArray(ID, removed_tools);
            removed_tools.splice(index, 1);
            compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools);
            //change the legend opacity to keep track of hidden tools
            d3.select(this).style("opacity", 1);
            d3.select("text#" +d.replace(/[\. ()/-]/g, "_")).style("opacity", 1);

          } else {
            d3.select("#"+ID).style("opacity", 0);
            d3.select("#top"+ID).style("opacity", 0);
            d3.select("#bottom"+ID).style("opacity", 0);
            d3.select("#line"+ID).style("opacity", 0);
            removed_tools.push(ID.replace(/_/g, "-"));
            compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools);
            //change the legend opacity to keep track of hidden tools
            d3.select(this).style("opacity", 0.2);
            d3.select("text#" +d.replace(/[\. ()/-]/g, "_")).style("opacity", 0.2);
          }
            
        });



  // draw legend text
  legend.append("text")
        .attr("x", width + 40)
        .attr("y", 9)
        .attr("id", function (d) { return d.replace(/[\. ()/-]/g, "_");})
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) {
          return d;
        });

};

function get_square_quartiles(data, svg, xScale, yScale, div, removed_tools) {
  
  var tools_not_hidden = remove_hidden_tools(data, removed_tools);

  // compute the quartiles over the new seet of data
  var x_values = tools_not_hidden.map(a => a.x).sort(function(a, b){return a - b});
  var y_values = tools_not_hidden.map(a => a.y).sort(function(a, b){return a - b});

  var quantile_x = d3.quantile(x_values, 0.5);
  var quantile_y = d3.quantile(y_values, 0.5);

  var x_axis = xScale.domain();
  var y_axis = yScale.domain();

  var formatComma = d3.format(",");

  svg.append("line")
    .attr("x1", xScale(quantile_x))
    .attr("y1", yScale(y_axis[0]))
    .attr("x2", xScale(quantile_x))
    .attr("y2", yScale(y_axis[1]))
    .attr("id", function (d) { return "x_quartile";})
    .attr("stroke", "black")
    .style("stroke-dasharray", ("10, 5"))
    .style("opacity", 0.5)
    .on("mouseover", function(d) {	
      div.transition()		
         .duration(100)		
         .style("opacity", .9);		
      div.html("X quartile = " + formatComma( quantile_x) )	
         .style("left", (d3.event.pageX) + "px")		
         .style("top", (d3.event.pageY) + "px");
    })					
    .on("mouseout", function(d) {		
      div.transition()		
         .duration(1000)		
         .style("opacity", 0);	
    });

  svg.append("line")
    .attr("x1", xScale(x_axis[0]))
    .attr("y1", yScale(quantile_y))
    .attr("x2", xScale(x_axis[1]))
    .attr("y2", yScale(quantile_y))
    .attr("id", function (d) { return "y_quartile";})
    .attr("stroke", "black")
    .style("stroke-dasharray", ("10, 5"))
    .style("opacity", 0.5)
    .on("mouseover", function(d) {	
      div.transition()		
         .duration(100)		
         .style("opacity", .9);		
      div	.html("Y quartile = " + formatComma(quantile_y) )	
          .style("left", (d3.event.pageX) + "px")		
          .style("top", (d3.event.pageY) + "px");
    })					
    .on("mouseout", function(d) {		
      div.transition()		
         .duration(1500)		
         .style("opacity", 0);	
    });

};

function append_quartile_numbers_to_plot (svg, xScale, yScale, better){

  var x_axis = xScale.domain();
  var y_axis = yScale.domain();

  // append quartile numbers to plot
  if (better == "bottom-right"){
    var num_bottom_right = "1";
    var num_bottom_left = "2";
    var num_top_right = "3";
    var num_top_left = "4";
  } 
  else if (better == "top-right"){
    var num_bottom_right = "3";
    var num_bottom_left = "4";
    var num_top_right = "1";
    var num_top_left = "2";
  };

  svg.append("text")
  .attr("id", function (d) { return "num_bottom_right";})
  .attr("x", xScale(x_axis[1]-(0.05*(x_axis[1]-x_axis[0]))))
  .attr("y", yScale(y_axis[1]-(0.95*(y_axis[1]-y_axis[0]))))
  .style("opacity", 0.2)
  .style("font-size", "40px")
  .text(num_bottom_right);

  svg.append("text")
  .attr("id", function (d) { return "num_bottom_left";})
  .attr("x", xScale(x_axis[1]-(0.95*(x_axis[1]-x_axis[0]))))
  .attr("y", yScale(y_axis[1]-(0.95*(y_axis[1]-y_axis[0]))))
  .style("opacity", 0.2)
  .style("font-size", "40px")
  .text(num_bottom_left);

  svg.append("text")
  .attr("id", function (d) { return "num_top_right";})
  .attr("x", xScale(x_axis[1]-(0.05*(x_axis[1]-x_axis[0]))))
  .attr("y", yScale(y_axis[1]-(0.05*(y_axis[1]-y_axis[0]))))
  .style("opacity", 0.2)
  .style("font-size", "40px")
  .text(num_top_right);

  svg.append("text")
  .attr("id", function (d) { return "num_top_left";})
  .attr("x", xScale(x_axis[1]-(0.95*(x_axis[1]-x_axis[0]))))
  .attr("y", yScale(y_axis[1]-(0.05*(y_axis[1]-y_axis[0]))))
  .style("opacity", 0.2)
  .style("font-size", "40px")
  .text(num_top_left);

}
function get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools, better) {

  var tools_not_hidden = remove_hidden_tools(data, removed_tools);

  var x_values = tools_not_hidden.map(a => a.x);
  var y_values = tools_not_hidden.map(a => a.y);

  // get distance to lowest score corner

  // normalize data to 0-1 range
  var normalized_values = normalize_data(x_values, y_values);
  var [x_norm, y_norm] = [normalized_values[0], normalized_values[1]];
  
  var max_x = Math.max.apply(null, x_values);
  var max_y = Math.max.apply(null, y_values);

  // # compute the scores for each of the tool. based on their distance to the x and y axis
  var scores = []
  var scores_coords = {}; //this object will store the scores and the coordinates
  for (var i = 0; i < x_norm.length; i++) {

    if (better == "bottom-right"){
      scores.push(x_norm[i] + (1 - y_norm[i]));
      scores_coords[x_norm[i] + (1 - y_norm[i])] =  [x_values[i], y_values[i]];
    } 
    else if (better == "top-right"){
      scores.push(x_norm[i] + y_norm[i]);
      scores_coords[x_norm[i] + y_norm[i]] = [x_values[i], y_values[i]];
    };

  };

  // sort the scores and compute quartiles
  scores.sort(function(a, b){return b-a});

  var first_quartile = d3.quantile(scores, 0.25);
  var second_quartile = d3.quantile(scores, 0.5);
  var third_quartile = d3.quantile(scores, 0.75);

  // compute the diagonal line coords
  var coords = [get_diagonal_line(scores, scores_coords, first_quartile, better, max_x, max_y), 
                get_diagonal_line(scores, scores_coords, second_quartile, better, max_x, max_y), 
                get_diagonal_line(scores, scores_coords, third_quartile, better, max_x, max_y)
              ];
  
  // append the 3 lines to the svg
  var index = 0;

  coords.forEach(line => {
    var [x_coords, y_coords] = [line[0], line[1]];
    svg.append("line")
       .attr("clip-path","url(#clip)")
       .attr("x1", xScale(x_coords[0]))
       .attr("y1", yScale(y_coords[0]))
       .attr("x2", xScale(x_coords[1]))
       .attr("y2", yScale(y_coords[1]))  
       .attr("id", function (d) { return "diag_quartile_" + index;})
       .attr("stroke", "red")
       .style("stroke-dasharray", ("10, 5"))
       .style("opacity", 0.5);

    svg.append("clipPath")
       .attr("id", "clip")
       .append("rect")
       .attr("width", width)
       .attr("height", height);

    index += 1;
  });

};

function normalize_data(x_values, y_values){

  var maxX = Math.max.apply(null, x_values);
  var maxY = Math.max.apply(null, y_values);
  
  var x_norm = x_values.map(function(e) {  
    return e / maxX;
  });

  var y_norm = y_values.map(function(e) {  
    return e / maxY;
  });

  return [x_norm, y_norm];
};

function get_diagonal_line(scores, scores_coords, quartile, better, max_x, max_y){

  for (var i = 0; i < scores.length; i++) {
    // # find out which are the two points that contain the percentile value
    if (scores[i] <= quartile){

        var target = [[scores_coords[scores[i - 1]][0], scores_coords[scores[i - 1]][1]],
                  [scores_coords[scores[i]][0], scores_coords[scores[i]][1]]];
        break;
    };
  };
  // console.log(scores_coords);
  // # get the the mid point between the two, where the quartile line will pass
  var half_point = [(target[0][0] + target[1][0]) / 2, (target[0][1] + target[1][1]) / 2];

  // # draw the line depending on which is the optimal corner
  if (better == "bottom-right"){
      var x_coords = [half_point[0] - max_x, half_point[0] + max_x];
      var y_coords = [half_point[1] - max_y, half_point[1] + max_y];
  } else if (better == "top-right"){
      var x_coords = [half_point[0] + max_x, half_point[0] - max_x];
      var y_coords = [half_point[1] - max_y, half_point[1] + max_y];   
  };

  return [x_coords, y_coords];
};

function remove_hidden_tools(data, removed_tools){
  // remove from the data array the participants that the user has hidden (removed_tools)
  // create a new array where the tools that have not been hidden will be stored
  let tools_not_hidden = [];
  data.forEach(element => {
    let index = $.inArray(element.toolname, removed_tools);
    if (index == -1){
      tools_not_hidden.push(element);
    }
  });

  return tools_not_hidden;

};

function uncheck (){
  if (document.getElementById("id1").checked == true){
    $( "#id1" ).prop( "checked", false );
  }
};

var maindata;
var better = "bottom-right";

var input = $('<input onclick="createChart(maindata)" type="radio" id="id1" name="method" value="squares" checked>\
                <label for="id1">SQUARE QUARTILES</label>\
              <input onclick="createChart(maindata)" type="radio" id="id2" name="method" value="diagonal">\
                &#8195;&#8195;<label for="id2">DIAGONAL QUARTILES</label>\
              <input onclick="createChart(maindata)" type="radio" id="id3" name="method" value="none">\
                &#8195;&#8195;<label for="id3">NO CLASSIFICATION</label><br>' );
               
               
input.appendTo($("#plot"));
$( "#plot" ).css( "border", "3px solid black" );

loadurl ();





  
 