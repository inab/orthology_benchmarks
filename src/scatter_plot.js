import { append_dots_errobars } from './chart_coordinates'
import { draw_legend } from "./legend";;
import { compute_classification } from "./classification";


export function createChart (data,divid, classification_type, metric_x, metric_y, metrics_names, better){
  // console.log(data)
  let margin = {top: 20, right: 40, bottom: compute_chart_height(data), left: 60},
    width = Math.round($(window).width()* 0.6818) - margin.left - margin.right,
    height = Math.round($(window).height()* 0.5787037) - margin.top - margin.bottom;

  let xScale = d3.scaleLinear()
    .range([0, width])
    .domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; })]).nice();

  let min_y = d3.min(data, function(d) { return d.y; });
  let max_y = d3.max(data, function(d) { return d.y; });
  let yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([min_y - 0.3*(max_y-min_y), max_y + 0.3*(max_y-min_y)]).nice();

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

  let div = d3.select('#'+divid).append("div").attr("class", "benchmark_tooltip").style("opacity", 0);

  // append the svg element
  // d3.select("svg").remove()
    // console.log(d3.select("svg").remove());
  let svg = d3.select('#'+divid).append("svg")
    .attr("class", "benchmarkingSVG")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr('id','svg_'+divid)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  svg.append("g").append("rect").attr("width", width).attr("height", height).attr("class", "plot-bg");

  // Add Axis numbers
  svg.append("g").attr("class", "axis axis--x")
    .attr("transform", "translate(" + 0 + "," + height + ")")
    .call(xAxis);

  svg.append("g").attr("class", "axis axis--y").call(yAxis);

  // add axis labels
  svg.append("text")             
  .attr("transform",
        "translate(" + (width/2) + " ," + 
                       (height + margin.top + (Math.round($(window).height()* 0.0347))) + ")")
  .style("text-anchor", "middle")
  .style("font-weight", "bold")
  .style("font-size", ".75vw")
  .text(metrics_names[metric_x]);

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", ".75vw")
      .text(metrics_names[metric_y] ); 
  
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
     .call(gridlines_x);
  
     svg.append("g")
     .attr("class", "bench_grid")
     .call(gridlines_y);
         
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

  function compute_chart_height(data){

    if (data.length%5 == 0){
      return (90 + (20 * (Math.trunc(data.length/5))));
    } else if (data.lenght%5 != 0) {
      return (90 + (20 * (Math.trunc(data.length/5)+1)));
    } 
    
  };