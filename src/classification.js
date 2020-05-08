import { remove_hidden_tools} from "./remove_tools";
import * as pf from 'pareto-frontier';
import { get_square_quartiles, append_quartile_numbers_to_plot } from "./squares";
import { get_diagonal_quartiles } from "./diagonals";
import { get_clusters } from "./clusters";

export function compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools,divid, classification_type, legend_color_palette, better) {

  let transform_to_table; //this variable is set to true if there are table elements with the corresponden divid in the html file
  // every time a new classification is compute the previous results table is deleted (if it exists)
  if (document.getElementById(divid + "_table") != null) {
    document.getElementById(divid + "_table").innerHTML = '';
    transform_to_table = true;
  };

  // append optimization arrow
  add_arrow(divid, svg, xScale, yScale, better);

  if (classification_type == ( divid + "__squares")) {
    draw_pareto(data, svg, xScale, yScale, removed_tools,divid, better);
    get_square_quartiles(data, svg, xScale, yScale, div, removed_tools,better,divid, transform_to_table, legend_color_palette);
    append_quartile_numbers_to_plot (svg, xScale, yScale, better,divid);
  }  
  else if (classification_type == (divid + "__diagonals")) {
    draw_pareto(data, svg, xScale, yScale, removed_tools,divid, better);
    get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools, better,divid, transform_to_table, legend_color_palette);
  } 
  else if (classification_type == (divid + "__clusters")) {
    draw_pareto(data, svg, xScale, yScale, removed_tools,divid, better);
    get_clusters(data, svg, xScale, yScale, div, width, height, removed_tools, better,divid, transform_to_table, legend_color_palette);
  } else {
    draw_pareto(data, svg, xScale, yScale, removed_tools,divid, better);
  }
  
};

function add_arrow(divid, svg, xScale, yScale, better){

  // append optimization arrow
  
  svg.append("svg:defs").append("svg:marker")
  .attr("id", "opt_triangle")
  .attr("class", function (d) { return divid+"___better_annotation";})
  .attr("refX", 6)
  .attr("refY", 6)
  .attr("markerWidth", 30)
  .attr("markerHeight", 30)
  .attr("markerUnits","userSpaceOnUse")
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M 0 0 12 6 0 12 3 6")
  .style("fill", "black")
  .style("opacity", 0.7);

  let x_axis = xScale.domain();
  let y_axis = yScale.domain();

  // set coordinates depending on optimization
  let x1, y1, x2, y2;
  if (better == "bottom-right"){
    x1 = (x_axis[1]-(0.05*(x_axis[1]-x_axis[0])))
    y1 = (y_axis[1]-(0.9*(y_axis[1]-y_axis[0])))
    x2 = (x_axis[1]-(0.009*(x_axis[1]-x_axis[0]))) 
    y2 = (y_axis[1]-(0.97*(y_axis[1]-y_axis[0]))) 
 } 
 else if (better == "top-right"){
    x1 = (x_axis[1]-(0.05*(x_axis[1]-x_axis[0])))
    y1 = (y_axis[1]-(0.1*(y_axis[1]-y_axis[0])))
    x2 = (x_axis[1]-(0.009*(x_axis[1]-x_axis[0]))) 
    y2 = (y_axis[1]-(0.03*(y_axis[1]-y_axis[0]))) 
 };

  var line = svg.append("line")
  .attr("class", function (d) { return divid+"___better_annotation";})
  .attr("x1",xScale(x1))
  .attr("y1",yScale(y1))
  .attr("x2",xScale(x2)) 
  .attr("y2",yScale(y2))
  .attr("stroke","black")  
  .attr("stroke-width",2)  
  .attr("marker-end","url(#opt_triangle)")
  .style("opacity", 0.4);  

  svg.append("text")
  .attr("class", function (d) { return divid+"___better_annotation";})
  .attr("x", xScale(x1))
  .attr("y", yScale(y2))
  .style("opacity", 0.4)
  .style("font-size", ".7vw")
  .text("better");

};

function draw_pareto(data, svg, xScale, yScale, removed_tools,divid, better){

  const points = [];

  let tools_not_hidden = remove_hidden_tools(data, removed_tools);

  tools_not_hidden.forEach(function(element) {
    points.push([element['x'], element['y']])
  });

  let pf_coords;
  let x_axis = xScale.domain();
  let y_axis = yScale.domain();

  if (better == "bottom-right"){
    pf_coords = pf.getParetoFrontier(points, { optimize: 'bottomRight'});
    // append edges to pareto frontier
    pf_coords.unshift ([pf_coords[0][0], y_axis[1]]);
    pf_coords.push([x_axis[0], pf_coords[pf_coords.length -1 ][1]]);
  } else if (better == "top-right"){
    pf_coords = pf.getParetoFrontier(points, { optimize: 'topRight'});
    // append edges to pareto frontier
    pf_coords.unshift ([pf_coords[0][0], y_axis[0]]);
    pf_coords.push([x_axis[0], pf_coords[pf_coords.length -1 ][1]]);

  }
  
  for (var i = 0; i < (pf_coords.length-1); i++) {
    svg.append("line")
       .attr("clip-path","url(#clip)")
       .attr("x1", xScale(pf_coords[i][0]))
       .attr("y1", yScale(pf_coords[i][1]))
       .attr("x2", xScale(pf_coords[i+1][0]))
       .attr("y2", yScale(pf_coords[i+1][1]))  
       .attr("id", function (d) { return divid+"___pareto";})
       .attr("stroke", "grey")
       .attr("stroke-width",2)
       .style("stroke-dasharray", ("20, 5"))
       .style("opacity", 0.4)
  };


};