import { append_dots_errobars } from './chart_coordinates'
import { draw_legend } from "./legend";;
import { compute_classification } from "./classification";


export function createChart (data,divid, classification_type, metric_x, metric_y, metrics_names, better, axis_limits){

  let margin = {top: Math.round($(window).height()* 0.0318), right:  Math.round($(window).width()* 0.0261), bottom: compute_chart_height(data), left:  Math.round($(window).width()* 0.0373)},
    width = Math.round($(window).width()* 0.6818) - margin.left - margin.right,
    height = Math.round($(window).height()* 0.87) - margin.top - margin.bottom;

  let min_x = d3.min(data, function(d) { return d.x; });
  let max_x = d3.max(data, function(d) { return d.x; });
  let min_y = d3.min(data, function(d) { return d.y; });
  let max_y = d3.max(data, function(d) { return d.y; });

  //the x axis domain is calculated based in the difference between the max and min, and the average stderr (BETA)
  var proportion = get_max_stderr(data, "x")/(max_x-min_x);

  // set the axis limits depending on zoom
  let auto_x_start = min_x - proportion*(max_x-min_x);
  var x_limit = (axis_limits == "auto") ? auto_x_start : 0;

  let xScale = d3.scaleLinear()
    .range([0, width])
    .domain([x_limit, max_x + proportion*(max_x-min_x)]).nice();

  //the y axis domain is calculated based in the difference between the max and min, and the average stderr (BETA)
  proportion = get_max_stderr(data, "y")/(max_y-min_y);
  let auto_y_start = min_y - proportion*(max_y-min_y);
  var y_limit = (axis_limits  == "auto") ? auto_y_start : 0;

  let yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([y_limit, max_y + proportion*(max_y-min_y)]).nice();

  let xAxis = d3.axisBottom(xScale).ticks(12),
      yAxis = d3.axisLeft(yScale).ticks(12 * height / width);

  let line = d3.line()
    .x(function(d) {
      return xScale(d.x);
    })
    .y(function(d) {
      return yScale(d.y);
    });

  // Define the div for the tooltip

  let div = d3.select('body').append("div").attr("class", "benchmark_tooltip").style("opacity", 0);


  // add div which will hold the svg
  d3.select('#'+divid + "flex-container").append("div")
  .attr("id", divid + "_svg_container")
  // append the svg element
  let svg = d3.select('#'+divid + "_svg_container").append("svg")
    .attr("class", "benchmarkingSVG")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr('id','svg_'+divid)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", divid +"_g_svg")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  svg.append("g").append("rect").attr("width", width).attr("height", height).attr("class", "plot-bg").attr("fill", "#F8F8F8").attr("stroke", "black");

  // Add Axis numbers
  svg.append("g").attr("class", "axis axis--x")
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(xAxis);

  svg.append("g").attr("class", "axis axis--y").call(yAxis);

  // add axis labels
  if (metric_x.startsWith("OEBM") == true){
    var txt_x = metrics_names[metric_x];
  } else if ( metric_x in metrics_names) {
    var txt_x = metrics_names[metric_x];
  } else {
    var txt_x = metric_x;
  };
  if (metric_y.startsWith("OEBM") == true){
    var txt_y = metrics_names[metric_y];
  } else if ( metric_y in metrics_names) {
    var txt_y = metrics_names[metric_y];
  } else {
    var txt_y = metric_y;
  };
  svg.append("text")             
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height + margin.top + (Math.round($(window).height()* 0.0347))) + ")")
  .style("text-anchor", "middle")
  .style("font-weight", "bold")
  .style("font-size", ".95vw")
  .text(txt_x);

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", ".95vw")
      .text(txt_y ); 
  
  // add pareto legend

  svg.append("line")
  .attr("x1", 0)
  .attr("y1", height + margin.top + (Math.round($(window).height()* 0.0347)) )
  .attr("x2", Math.round($(window).width()* 0.02083))
  .attr("y2", height + margin.top + (Math.round($(window).height()* 0.0347)) )

  .attr("stroke", "grey")
  .attr("stroke-width",2)
  .style("stroke-dasharray", ("15, 5"))
  .style("opacity", 0.7)  
  
  svg.append("text")             
  .attr("transform",
        "translate(" + (Math.round($(window).width()* 0.05208)) + " ," + 
                       (height + margin.top + (Math.round($(window).height()* 0.0347)) + 5) + ")")
  .style("text-anchor", "middle")
  // .style("font-weight", "bold")
  .style("font-size", ".75vw")
  .text("Pareto frontier");


  // add X and Y Gridlines
  var gridlines_x = d3.axisBottom()
                    .ticks(12)
                    .tickFormat("")
                    .tickSize(height)
                    .scale(xScale);

  var gridlines_y = d3.axisLeft()
                    .ticks(12 * height / width)
                    .tickFormat("")
                    .tickSize(-width)
                    .scale(yScale);

  svg.append("g")
     .attr("class", "bench_grid")
     .attr("stroke-opacity", 0.1)
     .attr("stroke-dasharray", 7,5)
     .call(gridlines_x);
  
     svg.append("g")
     .attr("class", "bench_grid")
     .attr("stroke-opacity", 0.1)
     .attr("stroke-dasharray", 7,5)
     .call(gridlines_y);
  
     
  // add OpenEBench Credits
  if (window.location.href.toLocaleLowerCase().includes("openebench") == false ){
    add_oeb_credits(divid, svg, margin);
  }
  

  let removed_tools = []; // this array stores the tools when the user clicks on them

   // setup fill color
  let cValue_func = function(d) {
    return d.toolname;
  },
  color_func = d3.scaleOrdinal(d3.schemeSet1.concat(d3.schemeSet3).concat(d3.schemeSet2));

    // get object with tools and colors:
    var legend_color_palette = {};
    data.forEach(function(element) {
      legend_color_palette[element.toolname] = color_func(element.toolname);
    });


  append_dots_errobars (svg, data, xScale, yScale, div, cValue_func, color_func,divid, metric_x, metric_y, metrics_names);

  draw_legend (data, svg, xScale, yScale, div, width, height, removed_tools, color_func, color_func.domain(), divid,classification_type, legend_color_palette);

  compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools,divid, classification_type, legend_color_palette, better[divid]);

  };

  export function compute_chart_height(data){

    if (data.length%5 == 0){
      return (165 + (20 * (Math.trunc(data.length/5))));
    } else if (data.lenght%5 != 0) {
      return (165 + (20 * (Math.trunc(data.length/5)+1)));
    } 
    
  };

  function get_max_stderr(data, axis){

    var max = 0;

    data.forEach(function(element) {
      if (axis == "y"){
        if (max < element.e_y) {
          max = element.e_y
        }
      } else if (axis == "x"){
        if (max < element.e_x) {
          max = element.e_x
        }
      }
    });
  
    return max
  
  }

  export function add_oeb_credits(divid, svg, margin){

    let logo_uri = "data:image/png;base64,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"
   
    svg.append("a")
    .attr("id", divid + "_logo_container")
    .attr("xlink:href", "https://openebench.bsc.es")
    .attr("target", "_blank")
    .append("rect")  
    .attr("transform",
          "translate(" + (Math.round($(window).width()* 0.6)) + " ," + 
          ( margin.top - (Math.round($(window).height()* 0.057))) + ")")
    .attr("height", Math.round($(window).height()* 0.0235))
    .attr("width", Math.round($(window).width()* 0.03))
    .style("fill", "white")
    .attr("rx", 10)
    .attr("ry", 10);
  
  
    svg.append("image")
    .attr("id", divid + "_logo")
    .attr("transform",
          "translate(" + (Math.round($(window).width()* 0.6)) + " ," + 
          ( margin.top - (Math.round($(window).height()* 0.063))) + ")")
  .attr('width', Math.round($(window).width()* 0.029))
  .attr('height', Math.round($(window).height()* 0.026))
  .attr("xlink:href", logo_uri)
  .style("pointer-events", "none");
// svg.append("text") 
    // .attr("class", "OEB_text_link")   
    // .style("pointer-events", "none")         
    // // .attr("transform",
    // //       "translate(" + (Math.round($(window).width()* 0.55)) + " ," + 
    // //       (height + margin.top + (Math.round($(window).height()* 0.0347)) + 5) + ")")
    // .attr("transform",
    //       "translate(" + (Math.round($(window).width()* 0.55)) + " ," + 
    //       ( margin.top - (Math.round($(window).height()* 0.04))) + ")")
    // .style("text-anchor", "middle")
    // .style("font-style", "italic")
    // .style("font-size", ".75vw")
    // .text("Powered by OpenEBench");

  }
