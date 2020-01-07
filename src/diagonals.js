import { remove_hidden_tools} from "./remove_tools";
import { fill_in_table, set_cell_colors } from "./table"

export function get_diagonal_quartiles(data, svg, xScale, yScale, div, width, height, removed_tools, better, divid, transform_to_table, legend_color_palette) {

    let tools_not_hidden = remove_hidden_tools(data, removed_tools);
  
    let x_values = tools_not_hidden.map(a => a.x);
    let y_values = tools_not_hidden.map(a => a.y);
  
    // get distance to lowest score corner
  
    // normalize data to 0-1 range
    let normalized_values = normalize_data(x_values, y_values);
    let [x_norm, y_norm] = [normalized_values[0], normalized_values[1]];
    
    let max_x = Math.max.apply(null, x_values);
    let max_y = Math.max.apply(null, y_values);
  
    // # compute the scores for each of the tool. based on their distance to the x and y axis
    let scores = []
    let scores_coords = {}; //this object will store the scores and the coordinates
    for (let i = 0; i < x_norm.length; i++) {
  
      if (better == "bottom-right"){
        scores.push(x_norm[i] + (1 - y_norm[i]));
        scores_coords[x_norm[i] + (1 - y_norm[i])] =  [x_values[i], y_values[i]];
        //append the score to the data array
        tools_not_hidden[i]['score'] = x_norm[i] + (1 - y_norm[i]);
      } 
      else if (better == "top-right"){
        scores.push(x_norm[i] + y_norm[i]);
        scores_coords[x_norm[i] + y_norm[i]] = [x_values[i], y_values[i]];
        //append the score to the data array
        tools_not_hidden[i]['score'] = x_norm[i] + y_norm[i];
      };
  
    };
  
    // sort the scores and compute quartiles
    scores.sort(function(a, b){return b-a});
  
    let first_quartile = d3.quantile(scores, 0.25);
    let second_quartile = d3.quantile(scores, 0.5);
    let third_quartile = d3.quantile(scores, 0.75);
  
    // compute the diagonal line coords
    let coords = [get_diagonal_line(scores, scores_coords, first_quartile, better, max_x, max_y,svg, xScale, yScale), 
                  get_diagonal_line(scores, scores_coords, second_quartile, better, max_x, max_y,svg, xScale, yScale), 
                  get_diagonal_line(scores, scores_coords, third_quartile, better, max_x, max_y,svg, xScale, yScale)
                ];
    
    // append the 3 lines to the svg
    let index = 0;
  
    coords.forEach(line => {
      let [x_coords, y_coords] = [line[0], line[1]];
      svg.append("line")
         .attr("clip-path","url(#clip)")
         .attr("x1", xScale(x_coords[0]))
         .attr("y1", yScale(y_coords[0]))
         .attr("x2", xScale(x_coords[1]))
         .attr("y2", yScale(y_coords[1]))  
         .attr("id", function (d) { return divid+"___diag_quartile_" + index;})
         .attr("stroke", "#0A58A2")
         .attr("stroke-width",2)
         .style("stroke-dasharray", ("20, 5"))
         .style("opacity", 0.4)
  
      svg.append("clipPath")
         .attr("id", "clip")
         .append("rect")
         .attr("width", width)
         .attr("height", height);
  
      index += 1;
    });
  
    //the tranformation to tabular format is done only if there are any table elements in the html file
    if (transform_to_table == true) {
      transform_diag_classif_to_table(tools_not_hidden, first_quartile, second_quartile, third_quartile, divid,svg, xScale, yScale, legend_color_palette, data, removed_tools);
    };
  
  };
  
  function transform_diag_classif_to_table(data, first_quartile, second_quartile, third_quartile, divid,svg, xScale, yScale, legend_color_palette, all_participants, removed_tools){
  
    let poly = [[],[],[],[]]
    data.forEach(function(element) {
  
      if (element['score'] > first_quartile){
            element['quartile'] = 1;
            poly[0].push([element['x'], element['y']]);
      }else if ( element['score'] > second_quartile && element['score'] <= first_quartile){
            element['quartile'] = 2;
            poly[1].push([element['x'], element['y']]);
      }else if ( element['score'] > third_quartile && element['score'] <= second_quartile){
            element['quartile'] = 3;
            poly[2].push([element['x'], element['y']]);
      }else if (element['score'] <= third_quartile){
            element['quartile'] = 4;
            poly[3].push([element['x'], element['y']]);
      }
    });
    let i = 1;
    poly.forEach(function(group) {
  
      var center = getCentroid(group);
  
      svg.append("text")
          .attr("class", function (d) { return divid+"___diag_num";})
          .attr("x", xScale(center[0]))
          .attr("y", yScale(center[1]))
          .style("opacity", 0.4)
          .style("font-size", "2vw")
          .style("fill", "#0A58A2")
          .text(i);
      i++;
  
    });
  
    fill_in_table (divid, data, all_participants, removed_tools);
    set_cell_colors(divid, legend_color_palette, removed_tools);
  
  };
  
  function getCentroid(coord) 
  {
      var center = coord.reduce(function (x,y) {
          return [x[0] + y[0]/coord.length, x[1] + y[1]/coord.length] 
      }, [0,0])
      return center;
  }
  
  function normalize_data(x_values, y_values){
  
    let maxX = Math.max.apply(null, x_values);
    let maxY = Math.max.apply(null, y_values);
    
    let x_norm = x_values.map(function(e) {  
      return e / maxX;
    });
  
    let y_norm = y_values.map(function(e) {  
      return e / maxY;
    });
  
    return [x_norm, y_norm];
  };
  
  function get_diagonal_line(scores, scores_coords, quartile, better, max_x, max_y,svg, xScale, yScale){
  
    let target;
    for (let i = 0; i < scores.length; i++) {
      // # find out which are the two points that contain the percentile value
      
      if (scores[i] <= quartile){
          target = [[scores_coords[scores[i - 1]][0], scores_coords[scores[i - 1]][1]],
                    [scores_coords[scores[i]][0], scores_coords[scores[i]][1]]];
          break;
      };
    };
    // # get the the mid point between the two, where the quartile line will pass
    let half_point = [(target[0][0] + target[1][0]) / 2, (target[0][1] + target[1][1]) / 2];
  
    // # draw the line depending on which is the optimal corner
    let x_coords;
    let y_coords;
    if (better == "bottom-right"){
         x_coords = [half_point[0] - 2*max_x, half_point[0] + 2*max_x];
         y_coords = [half_point[1] - 2*max_y, half_point[1] + 2*max_y];
    } else if (better == "top-right"){
         x_coords = [half_point[0] + 2*max_x, half_point[0] - 2*max_x];
         y_coords = [half_point[1] - 2*max_y, half_point[1] + 2*max_y];   
    };
  
    return [x_coords, y_coords];
  };
  