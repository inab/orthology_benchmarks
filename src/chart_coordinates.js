import * as d3 from 'd3';

export function append_dots_errobars (svg, data, xScale, yScale, div, cValue, color,divid, metric_x, metric_y, metrics_names){

  // Add Y Axis Error Line
  svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("class", "error-line")
      .attr("id", function (d) { return divid+"___line"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("x1", function(d) {
        return xScale(d.x);
      })
      .attr("y1", function(d) {
        return yScale(d.y + d.e_y);
      })
      .attr("x2", function(d) {
        return xScale(d.x);
      })
      .attr("y2", function(d) {
        return yScale(d.y - d.e_y);
      });

  // Add X Axis Error Line
  svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("class", "error-line")
      .attr("id", function (d) { return divid+"___lineX"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("x1", function(d) {
        return xScale(d.x - d.e_x);
      })
      .attr("y1", function(d) {
        return yScale(d.y);
      })
      .attr("x2", function(d) {
        return xScale(d.x + d.e_x);
      })
      .attr("y2", function(d) {
        return yScale(d.y);
      });

  // Add Error Top Cap
  svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("id", function (d) { return divid+"___top"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("class", "error-cap")
      .attr("x1", function(d) {
        return xScale(d.x) - 4;
      })
      .attr("y1", function(d) {
        return yScale(d.y + d.e_y);
      })
      .attr("x2", function(d) {
        return xScale(d.x) + 4;
      })
      .attr("y2", function(d) {
        return yScale(d.y + d.e_y);
      });

  // Add Error Bottom Cap
  svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("id", function (d) { return divid+"___bottom"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("class", "error-cap")
      .attr("x1", function(d) {
        return xScale(d.x) - 4;
      })
      .attr("y1", function(d) {
        return yScale(d.y - d.e_y);
      })
      .attr("x2", function(d) {
        return xScale(d.x) + 4;
      })
      .attr("y2", function(d) {
        return yScale(d.y - d.e_y);
      });

  // add right error cap
  svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("class", "error-cap")
      .attr("id", function (d) { return divid+"___right"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("x1", function(d) {
        return xScale(d.x + d.e_x);
      })
      .attr("y1", function(d) {
        return yScale(d.y) - 4;
      })
      .attr("x2", function(d) {
        return xScale(d.x + d.e_x);
      })
      .attr("y2", function(d) {
        return yScale(d.y) + 4;
      });

    // add left error cap
    svg.append("g").selectAll("line")
      .data(data).enter()
      .append("line")
      .attr("class", "error-cap")
      .attr("id", function (d) { return divid+"___left"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("x1", function(d) {
        return xScale(d.x - d.e_x);
      })
      .attr("y1", function(d) {
        return yScale(d.y) - 4;
      })
      .attr("x2", function(d) {
        return xScale(d.x - d.e_x);
      })
      .attr("y2", function(d) {
        return yScale(d.y) + 4;
      });

  // add dots
  let symbol = d3.symbol();

  let formatComma = d3.format(",");
  let formatDecimal = d3.format(".4f");

  let dots =svg.selectAll(".dots")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "benchmark_path");
    
  dots.attr("d", symbol.type(function(){return d3.symbolSquare}))
      .attr("id", function (d) {  return divid+"___"+d.toolname.replace(/[\. ()/-]/g, "_");})
      .attr("class","line")
      .attr('transform',function(d){ return "translate("+xScale(d.x)+","+yScale(d.y)+")"; })
      .attr("r", 6)
      .style("fill", function(d) {
        return color(cValue(d));
      })
      .on("mouseover", function(d) {
        // show tooltip only if the tool is visible
        let ID = divid+"___"+d.toolname.replace(/[\. ()/-]/g, "_");
        if (d3.select("#"+ID).style("opacity") == 1) {
          div.transition()		
              .duration(100)		
              .style("opacity", .9);		
          div.html("<b>" + d.toolname + "</b><br/>"  + metrics_names[metric_x] + ": " + formatComma(d.x) + "<br/>"  + metrics_names[metric_y] + ": " + formatDecimal(d.y))	
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
