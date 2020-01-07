import *  as clusterMaker from 'clusters';
import * as d3Polygon from "d3-polygon";
import { remove_hidden_tools} from "./remove_tools";
import { fill_in_table, set_cell_colors } from "./table"

export function get_clusters(data, svg, xScale, yScale, div, width, height, removed_tools, better,divid, transform_to_table, legend_color_palette) {

  let tools_not_hidden = remove_hidden_tools(data, removed_tools);
  let x_values = tools_not_hidden.map(a => a.x);
  let y_values = tools_not_hidden.map(a => a.y);

  let coordinates = [];

  for (let i = 0; i < x_values.length; i++) {
    coordinates.push([x_values[i], y_values[i]]);
  };
  
  //number of clusters
  clusterMaker.k(4);

  //number of iterations (higher number gives more time to converge)
  clusterMaker.iterations(500);

  //data from which to identify clusters
  clusterMaker.data(coordinates);

  let results = clusterMaker.clusters();

  // normalize data to 0-1 range
  let centroids_x = []
  let centroids_y = []
  results.forEach(function(element) {
      centroids_x.push(element.centroid[0])
      centroids_y.push(element.centroid[1])
  });
  let [x_norm, y_norm] = normalize_data(centroids_x, centroids_y)

  // get distance from centroids to better corner

  let scores = [];
  if (better == "top-right") {

    for (let i = 0; i < x_norm.length; i++) {
      let distance = x_norm[i] + y_norm[i];
      scores.push(distance);
      results[i]['score'] = distance;
    };

  } else if (better == "bottom-right"){
    
    for (let i = 0; i < x_norm.length; i++) {
      let distance = x_norm[i] + (1 - y_norm[i]);
      scores.push(distance);
      results[i]['score'] = distance;
    };
  };

  let sorted_results = sortByKey(results, "score");

  sorted_results = print_clusters(svg, divid, xScale, yScale, sorted_results);
    
  //the tranformation to tabular format is done only if there are any table elements in the html file
  if (transform_to_table == true) {
    transform_clust_classif_to_table(tools_not_hidden, sorted_results, divid, legend_color_palette, data, removed_tools);
  };

};


function print_clusters(svg, divid, xScale, yScale, sorted_results){

  let cluster_no = 1;

  var arrayOfPolygons =  [];

  sorted_results.forEach(function(element) {

    var poly = [];

    element['cluster'] = cluster_no;
    svg.append("text")
      .attr("class", function (d) { return divid+"___cluster_num";})
      .attr("x", xScale(element.centroid[0]))
      .attr("y", yScale(element.centroid[1]))
      .style("opacity", 0.9)
      .style("font-size", "2vw")
      .style("fill", "#0A58A2")
      .text(cluster_no);
    let participants = element['points'];
    participants.forEach(function(coords) {

      poly.push([coords[0], coords[1]])
      svg.append("line")
       .attr("x1", xScale(element.centroid[0]))
       .attr("y1", yScale(element.centroid[1]))
       .attr("x2", xScale(coords[0]))
       .attr("y2", yScale(coords[1]))  
       .attr("class", function (d) { return divid+"___clust_lines";})
       .attr("stroke", "#0A58A2")
       .attr("stroke-width",2)
       .style("stroke-dasharray", ("20, 5"))
       .style("opacity", 0.4)
    });

    var hull = d3Polygon.polygonHull(poly);

    arrayOfPolygons.push({"points": hull});

    cluster_no++;
  });

  svg.selectAll("polygon")
  .data(arrayOfPolygons)
  .enter().append("polygon")
  .attr("points",function(d) { 
    if (d.points != null){
      return d.points.map(function(d) { 
        return [xScale(d[0]),yScale(d[1])].join(",");
      }).join(" ");
    };
  })
  .attr("class", function (d) { return divid+"___clust_polygons";})
  .attr("fill", "#0A58A2")
  .style("opacity", 0.1);

    

  return (sorted_results);
};


function transform_clust_classif_to_table(data, results, divid, legend_color_palette, all_participants, removed_tools){

  data.forEach(function(element) {

    let coords = [element.x, element.y];

    results.forEach(function(result) {
      
      if (isArrayInArray(result.points, coords) == true){
        element['quartile'] = result.cluster;
      };

    });
  });

  fill_in_table (divid, data, all_participants, removed_tools);
  set_cell_colors(divid, legend_color_palette, removed_tools);

};

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
  
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0)) * -1;
    });
  };
  
  function isArrayInArray(arr, item){
    var item_as_string = JSON.stringify(item);
  
    var contains = arr.some(function(ele){
      return JSON.stringify(ele) === item_as_string;
    });
    return contains;
  };