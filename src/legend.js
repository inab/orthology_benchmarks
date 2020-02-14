import { compute_classification } from "./classification";
import { better } from "./app"

export function draw_legend (data, svg, xScale, yScale, div, width, height, removed_tools, color, color_domain, divid,classification_type, legend_color_palette) {
  
    //set number of elements per legend row
    let n = 4;
  
    let legend = svg.selectAll(".legend")
      .data(color_domain)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (-width+i%n*(Math.round($(window).width()* 0.16))) + "," + (height + (Math.round($(window).height()* 0.0862962)) + Math.floor(i/n) * (Math.round($(window).height()* 0.0251481))) + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
          .attr("x", width + Math.round($(window).width()* 0.010227))
          .attr("width", Math.round($(window).width()* 0.010227))
          .attr("height", Math.round($(window).height()* 0.020833))
          .attr("id", function (d) { return divid+"___leg_rect"+d.replace(/[\. ()/-]/g, "_");})
          .attr("class", "benchmark_legend_rect")
          .style("fill", color)
          .on('click', function(d) {
            
            let dot = d3.select("text#" +divid+"___"+d.replace(/[\. ()/-]/g, "_"));
            let ID = dot._groups[0][0].id;
  
            if(data.length-removed_tools.length-1 >= 4){
  
              let legend_rect = this;
              show_or_hide_participant_in_plot (ID, data, svg, xScale, yScale, div, width, height, removed_tools,divid,classification_type, legend_rect, legend_color_palette);
  
            } else if (data.length-removed_tools.length-1 < 4 && (d3.select("#"+ID).style("opacity")) == 0){
  
              let legend_rect = this;
              show_or_hide_participant_in_plot (ID, data, svg, xScale, yScale, div, width, height, removed_tools,divid,classification_type, legend_rect, legend_color_palette);
  
            } else {
              
              $('.removal_alert').remove();
              var alert_msg = $('<div class="removal_alert">\
                                  <span class="closebtn" onclick="(this.parentNode.remove());">&times;</span>\
                                  At least four participants are required for the benchmark!!\
                                </div>');
              $("#" + divid).append(alert_msg);
  
              setTimeout(function(){
                if ($('.removal_alert').length > 0) {
                  $('.removal_alert').remove();
                }
              }, 5000)
  
            };
          })
          .on("mouseover", function (d) {
  
            let dot = d3.select("text#" +divid+"___"+d.replace(/[\. ()/-]/g, "_"));
            let ID = dot._groups[0][0].id;
            let tool_id =ID.split("___")[1];
  
            if (d3.select("#"+ID).style("opacity") == 0){
              d3.select(this).style("opacity", 1);
              d3.select("text#" +divid+"___"+tool_id).style("opacity", 1);
            } else {
              d3.select(this).style("opacity", 0.2);
              d3.select("text#" +divid+"___"+tool_id).style("opacity", 0.2);
            };
            
          }) 
          .on("mouseout", function (d) {
  
            let dot = d3.select("text#" +divid+"___"+d.replace(/[\. ()/-]/g, "_"));
            let ID = dot._groups[0][0].id;
            let tool_id =ID.split("___")[1];
  
            if (d3.select("#"+ID).style("opacity") == 0){
              d3.select(this).style("opacity", 0.2);
              d3.select("text#" +divid+"___"+tool_id).style("opacity", 0.2);
            } else {
              d3.select(this).style("opacity", 1);
              d3.select("text#" +divid+"___"+tool_id).style("opacity", 1);
            };
          });
  
    // draw legend text
    legend.append("text")
          .attr("x", width + Math.round($(window).width()* 0.022727))
          .attr("y", Math.round($(window).height()* 0.01041))
          .attr("id", function (d) { return divid+"___"+d.replace(/[\. ()/-]/g, "_");})
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .style("font-size", "1vw")
          .text(function(d) {
            return d;
          });
  
  };
  

function show_or_hide_participant_in_plot (ID, data, svg, xScale, yScale, div, width, height, removed_tools,divid,classification_type, legend_rect, legend_color_palette){

    let tool_id =ID.split("___")[1];
   // remove the existing number and classification lines from plot (if any)
   svg.selectAll("#"+divid+"___x_quartile").remove();
   svg.selectAll("#"+divid+"___y_quartile").remove();
   svg.selectAll("#"+divid+"___diag_quartile_0").remove();
   svg.selectAll("#"+divid+"___diag_quartile_1").remove();
   svg.selectAll("#"+divid+"___diag_quartile_2").remove();
   svg.selectAll("#"+divid+"___num_bottom_right").remove();
   svg.selectAll("#"+divid+"___num_top_right").remove();
   svg.selectAll("#"+divid+"___num_bottom_left").remove();
   svg.selectAll("#"+divid+"___num_top_left").remove();
   svg.selectAll("#"+divid+"___pareto" ).remove();
   svg.selectAll("."+divid+"___diag_num").remove();
   svg.selectAll("."+divid+"___cluster_num").remove();
   svg.selectAll("."+divid+"___clust_lines").remove();
   svg.selectAll("."+divid+"___clust_polygons").remove();
   svg.selectAll("."+divid+"___better_annotation").remove();
 
   let blockopacity = d3.select("#"+ID).style("opacity");
   
   // change the opacity to 0 or 1 depending on the current state
   if (blockopacity == 0) {
     d3.select("#"+ID).style("opacity", 1);
     d3.select("#"+divid+"___top"+tool_id).style("opacity", 1);
     d3.select("#"+divid+"___bottom"+tool_id).style("opacity", 1);
     d3.select("#"+divid+"___line"+tool_id).style("opacity", 1);
     d3.select("#"+divid+"___lineX"+tool_id).style("opacity", 1);
     d3.select("#"+divid+"___right"+tool_id).style("opacity", 1);
     d3.select("#"+divid+"___left"+tool_id).style("opacity", 1);
     // recalculate the quartiles after removing the tools
     let index = $.inArray(tool_id.replace(/_/g, "-"), removed_tools);
     removed_tools.splice(index, 1);
     compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools,divid,classification_type, legend_color_palette, better[divid]);
     //change the legend opacity to keep track of hidden tools
     d3.select(legend_rect).style("opacity", 1);
     d3.select("text#" +divid+"___"+tool_id).style("opacity", 1);
 
   } else {
     d3.select("#"+ID).style("opacity", 0);
     d3.select("#"+divid+"___top"+tool_id).style("opacity", 0);
     d3.select("#"+divid+"___bottom"+tool_id).style("opacity", 0);
     d3.select("#"+divid+"___line"+tool_id).style("opacity", 0);
     d3.select("#"+divid+"___lineX"+tool_id).style("opacity", 0);
     d3.select("#"+divid+"___right"+tool_id).style("opacity", 0);
     d3.select("#"+divid+"___left"+tool_id).style("opacity", 0);
     removed_tools.push(tool_id.replace(/_/g, "-"));
     compute_classification(data, svg, xScale, yScale, div, width, height, removed_tools,divid,classification_type, legend_color_palette, better[divid]);
     //change the legend opacity to keep track of hidden tools
     d3.select(legend_rect).style("opacity", 0.2);
     d3.select("text#" +divid+"___"+tool_id).style("opacity", 0.2);
   }
 
 };