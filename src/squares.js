import { remove_hidden_tools} from "./remove_tools";
import { fill_in_table, set_cell_colors } from "./table"

export function get_square_quartiles(data, svg, xScale, yScale, div, removed_tools,better, divid, transform_to_table, legend_color_palette) {

    let tools_not_hidden = remove_hidden_tools(data, removed_tools);
  
    // compute the quartiles over the new seet of data
    let x_values = tools_not_hidden.map(a => a.x).sort(function(a, b){return a - b});
    let y_values = tools_not_hidden.map(a => a.y).sort(function(a, b){return a - b});
  
    let quantile_x = d3.quantile(x_values, 0.5);
    let quantile_y = d3.quantile(y_values, 0.5);
  
    let x_axis = xScale.domain();
    let y_axis = yScale.domain();
  
    let formatComma = d3.format(",");
  
    svg.append("line")
      .attr("x1", xScale(quantile_x))
      .attr("y1", yScale(y_axis[0]))
      .attr("x2", xScale(quantile_x))
      .attr("y2", yScale(y_axis[1]))
      .attr("id", function (d) { return divid+"___x_quartile";})
      .attr("stroke", "#0A58A2")
      .attr("stroke-width",2)
      .style("stroke-dasharray", ("20, 5"))
      .style("opacity", 0.4)
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
      .attr("id", function (d) { return divid+"___y_quartile";})
      .attr("stroke", "#0A58A2")
      .attr("stroke-width",2)
      .style("stroke-dasharray", ("20, 5"))
      .style("opacity", 0.4)
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
  
      //the tranformation to tabular format is done only if there are any table elements in the html file
      if (transform_to_table == true) {
        transform_sqr_classif_to_table(better, tools_not_hidden, quantile_x, quantile_y, divid, legend_color_palette, data, removed_tools);
      };
      
  };
  
  function transform_sqr_classif_to_table(better, data, quantile_x, quantile_y, divid, legend_color_palette, all_participants, removed_tools){
    if (better == "bottom-right"){
      data.forEach(function(element) {
          if (element['x'] >= quantile_x && element['y'] <= quantile_y){
                element['quartile'] = 1;
          }else if (element['x'] >= quantile_x && element['y'] > quantile_y){
                element['quartile'] = 3;
          }else if (element['x'] < quantile_x && element['y'] > quantile_y){
                element['quartile'] = 4;
          }else if (element['x'] < quantile_x && element['y'] <= quantile_y){
                element['quartile'] = 2;
          }
      });
    } else if (better == "top-right"){
        data.forEach(function(element) {
          if (element['x'] >= quantile_x && element['y'] < quantile_y){
                element['quartile'] = 3;
          }else if (element['x'] >= quantile_x && element['y'] >= quantile_y){
                element['quartile'] = 1;
          }else if (element['x'] < quantile_x && element['y'] >= quantile_y){
                element['quartile'] = 2;
          }else if (element['x'] < quantile_x && element['y'] < quantile_y){
                element['quartile'] = 4;
          }
        });
    };
  
    fill_in_table (divid, data, all_participants, removed_tools);
    set_cell_colors(divid, legend_color_palette, removed_tools);
  
  };
  
  
  export function append_quartile_numbers_to_plot (svg, xScale, yScale, better,divid){
  
    let x_axis = xScale.domain();
    let y_axis = yScale.domain();
  
    let num_bottom_right,num_bottom_left,num_top_right,num_top_left;
    // append quartile numbers to plot
    if (better == "bottom-right"){
       num_bottom_right = "1";
       num_bottom_left = "2";
       num_top_right = "3";
       num_top_left = "4";
    } 
    else if (better == "top-right"){
       num_bottom_right = "3";
       num_bottom_left = "4";
       num_top_right = "1";
       num_top_left = "2";
    };
  
    
    svg.append("text")
    .attr("id", function (d) { return divid+"___num_bottom_right";})
    .attr("x", xScale(x_axis[1]-(0.05*(x_axis[1]-x_axis[0]))))
    .attr("y", yScale(y_axis[1]-(0.97*(y_axis[1]-y_axis[0]))))
    .style("opacity", 0.4)
    .style("font-size", "2vw")
    .style("fill", "#0A58A2")
    .text(num_bottom_right);
  
    svg.append("text")
    .attr("id", function (d) { return divid+"___num_bottom_left";})
    .attr("x", xScale(x_axis[1]-(0.98*(x_axis[1]-x_axis[0]))))
    .attr("y", yScale(y_axis[1]-(0.97*(y_axis[1]-y_axis[0]))))
    .style("opacity", 0.4)
    .style("font-size", "2vw")
    .style("fill", "#0A58A2")
    .text(num_bottom_left);
  
    svg.append("text")
    .attr("id", function (d) { return divid+"___num_top_right";})
    .attr("x", xScale(x_axis[1]-(0.05*(x_axis[1]-x_axis[0]))))
    .attr("y", yScale(y_axis[1]-(0.1*(y_axis[1]-y_axis[0]))))
    .style("opacity", 0.4)
    .style("font-size", "2vw")
    .style("fill", "#0A58A2")
    .text(num_top_right);
  
    svg.append("text")
    .attr("id", function (d) { return divid+"___num_top_left";})
    .attr("x", xScale(x_axis[1]-(0.98*(x_axis[1]-x_axis[0]))))
    .attr("y", yScale(y_axis[1]-(0.1*(y_axis[1]-y_axis[0]))))
    .style("opacity", 0.4)
    .style("font-size", "2vw")
    .style("fill", "#0A58A2")
    .text(num_top_left);
  
  }