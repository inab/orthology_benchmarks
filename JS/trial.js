
loadurl = function (){

    // var urls = ["https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_EggNOG_output.json", 
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_RSD_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_EnsemblCompara_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_Hieranoid2_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_InParanoid_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_MetaPhOrs_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_OMA-GETHOGs_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_OMA-Groups_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_OMA-Pairs_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_Orthoinspector_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_PANTHER-all_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_PANTHER-LDO_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_PhylomeDB_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_RBH-BBH_output.json",
    //             "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Fungi_InParanoidCore_output.json"
    //           ]
    
      var urls = ["https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_EggNOG_output.json", 
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_RSD_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_EnsemblCompara_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_Hieranoid2_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_InParanoid_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_MetaPhOrs_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_OMA-GETHOGs_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_OMA-Groups_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_OMA-Pairs_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_Orthoinspector_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_PANTHER-all_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_PANTHER-LDO_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_PhylomeDB_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_RBH-BBH_output.json",
              "https://dev-openebench.bsc.es/api/scientific/Dataset/QfO:QfO4_STD_Eukaryota_InParanoidCore_output.json"
            ]

    get_data(urls)
  
       
};
// var $input = $('<input type="button" value="new button" />');
// $input.appendTo($("#plot"));
// $( "#plot" ).css( "border", "3px solid red" );

function get_data(urls){
  Promise.all(urls.map(url =>
    fetch(url)
    .then(resp => resp.json())
  )).then(results => {
    join_all_json(results)
  })
 };
 
 function join_all_json(array){
  let full_json  = [];
  for (var i = 0; i < array.length; i++) {
      let jo = {};
      jo['toolname'] = array[i].name.split('.')[0];
      jo['x'] = array[i].metrics[0].result.value;
      jo['y'] = array[i].metrics[1].result.value;
      jo['e'] = array[i].metrics[2].result.value;
      full_json.push(jo)    
  }
  createChart(full_json);    
 }
  
createChart = function (data){
  var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("visibility", "hidden");

  var margin = {top: 20, right: 200, bottom: 30, left: 40},
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
  .attr("id", function (d) {  return d.toolname.replace(/[\. ()/-]/g, "_");})
  .attr("class","line")
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
        .style("left", (d3.event.pageX) + "px")		
        .style("top", (d3.event.pageY) + "px");
    })					
  .on("mouseout", function(d) {		
      div.transition()		
          .duration(1500)		
          .style("opacity", 0);	
  });
  get_square_quartiles(data, svg, xScale, yScale, div, []);
  get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, []);

        
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
  let removed_tools = []; // this array stores the tools when the user clicks on them
  legend.append("rect")
  .attr("x", width + 18)
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", color)
  .on('click', function(d) {

    svg.selectAll("#x_quartile").remove();
    svg.selectAll("#y_quartile").remove();
    svg.selectAll("#diag_quartile_0").remove();
    svg.selectAll("#diag_quartile_1").remove();
    svg.selectAll("#diag_quartile_2").remove();
    dot = d3.select("text#" +d.replace(/[\. ()/-]/g, "_"))
    var ID = dot._groups[0][0].id

    // hide or show the elements block
    //  var active   = ID.active ? false : true,
    //  newOpacity = active ? 0 : 1;
    var blockopacity = d3.select("#"+ID).style("opacity");
    var topopacity = d3.select("#top"+ID).style("opacity");
    var bottomopacity = d3.select("#bottom"+ID).style("opacity");
    var lineopacity =  d3.select("#line"+ID).style("opacity");

    if (blockopacity == 0) {
      d3.select("#"+ID).style("opacity", 1);
      d3.select("#top"+ID).style("opacity", 1);
      d3.select("#bottom"+ID).style("opacity", 1);
      d3.select("#line"+ID).style("opacity", 1);
      // recalculate the quartiles after removing the tools
      let index = $.inArray(ID, removed_tools);
      removed_tools.splice(index, 1);
      get_square_quartiles(data, svg, xScale, yScale, div, removed_tools);
      get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools);
      //change the legend opacity to keep track of hidden tools
      d3.select(this).style("opacity", 1);
      d3.select("text#" +d.replace(/[\. ()/-]/g, "_")).style("opacity", 1);

    } else {
      d3.select("#"+ID).style("opacity", 0);
      d3.select("#top"+ID).style("opacity", 0);
      d3.select("#bottom"+ID).style("opacity", 0);
      d3.select("#line"+ID).style("opacity", 0);
      removed_tools.push(ID.replace(/_/g, "-"));
      get_square_quartiles(data, svg, xScale, yScale, div, removed_tools);
      get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools);
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
  // remove from the data array the participants that the user has hidden (removed_tools)
  // create a new array where the tools that have not been hidden will be stored
  let tools_not_hidden = [];
  data.forEach(element => {
    let index = $.inArray(element.toolname, removed_tools);
    if (index == -1){
      tools_not_hidden.push(element);
    }
  });
  // console.log(tools_not_hidden, removed_tools);
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
          div	.html("X quartile = " + formatComma( quantile_x) )	
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

function get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools) {
  // remove from the data array the participants that the user has hidden (removed_tools)
  // create a new array where the tools that have not been hidden will be stored
  let tools_not_hidden = [];
  data.forEach(element => {
    let index = $.inArray(element.toolname, removed_tools);
    if (index == -1){
      tools_not_hidden.push(element);
    }
  });
  // console.log(tools_not_hidden, removed_tools);
  // compute the quartiles over the new seet of data
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
    var better = "bottom-right";
    // var scores_coords = []; //this object will store the scores and the coordinates
    // for (var i = 0; i < x_norm.length; i++) {
    //     if (better == "bottom-right"){
    //         scores.push(x_norm[i] + (1 - y_norm[i]));
    //         scores_coords.push([x_norm[i] + (1 - y_norm[i]), x_values[i], y_values[i]]);
    //     } else if (better == "top-right"){
    //         scores.push(x_norm[i] + y_norm[i]);
    //         scores_coords.push([x_norm[i] + y_norm[i], x_values[i], y_values[i]]);
    //     };
    // };
  
    var scores_coords = {}; //this object will store the scores and the coordinates
    for (var i = 0; i < x_norm.length; i++) {
        if (better == "bottom-right"){
            scores.push(x_norm[i] + (1 - y_norm[i]));
            scores_coords[x_norm[i] + (1 - y_norm[i])] =  [x_values[i], y_values[i]];
        } else if (better == "top-right"){
            scores.push(x_norm[i] + y_norm[i]);
            scores_coords[x_norm[i] + y_norm[i]] = [x_values[i], y_values[i]];
        };
    };

    // sort the scores together with coords

    // sort the scores and compute quartiles
  scores.sort(function(a, b){return b-a});
  var first_quartile = d3.quantile(scores, 0.25);
  var second_quartile = d3.quantile(scores, 0.5);
  var third_quartile = d3.quantile(scores, 0.75);
  
  // console.log (first_quartile, second_quartile, third_quartile, scores);
  // console.log(first_quartile, second_quartile, third_quartile);
  var coords = [get_diagonal_line(scores, scores_coords, first_quartile, better, max_x, max_y), 
    get_diagonal_line(scores, scores_coords, second_quartile, better, max_x, max_y), 
    get_diagonal_line(scores, scores_coords, third_quartile, better, max_x, max_y)];
  

  



  // var svg = d3.select(".plot-bg").append("line")

  var index = 0;
  var min_x = 4000;
  var min_y = 0.035;
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
  
loadurl ();

  
  
  
  