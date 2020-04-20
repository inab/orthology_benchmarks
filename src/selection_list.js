import { onQuartileChange } from "./app"
import { better } from "./app"

export function append_classifiers_list(divid){

// append buttons
      let button1_id = divid + "__none";
      let button2_id = divid + "__squares";
      let button3_id = divid + "__diagonals";
      let button4_id = divid + "__clusters";
      
      // append selection list tooltip container
      d3.select('#'+divid).append("div")
        .attr("id", "tooltip_container")
      // add div which will hold all the buttons for user actions
      d3.select('#'+divid).append("div")
      .attr("id", divid + "_buttons_container")
      .attr("class", "buttons_container")

        let select_list = d3.select("#" + divid + "_buttons_container").append("form").append("select")
        .attr("class","classificators_list")
        .attr("id",divid + "_dropdown_list")
        .on('change', function(d) {
          let active_chart = document.getElementById(this.options[this.selectedIndex].id.split("__")[0])
          let metric_x = active_chart.getAttribute('metric_x');
          let metric_y = active_chart.getAttribute('metric_y');
          onQuartileChange(this.options[this.selectedIndex].id, metric_x, metric_y, better);
        })
        .append("optgroup")
        .attr("label","Select a classification method:");
        
        d3.select('#'+divid).append("div").attr("class", "flex-container").attr("id", divid + "flex-container")

        select_list.append("option")
        .attr("class", "selection_option")
        .attr("id", button1_id)
        .attr("title", "Show only raw data")
        .attr("selected","disabled")
        .attr("data-toggle", "list_tooltip")
        .attr("data-container", "#tooltip_container") 
        .text("NO CLASSIFICATION")
        
        select_list.append("option")
        .attr("class", "selection_option")
        .attr("id", button2_id)
        .attr("title", "Apply square quartiles classification method (based on the 0.5 quartile of the X and Y metrics)")
        .attr("data-toggle", "list_tooltip")
        .attr("data-container", "#tooltip_container") 
        .text("SQUARE QUARTILES")
  
        select_list.append("option")
        .attr("class", "selection_option")
        .attr("id", button3_id)
        .attr("title", "Apply diagonal quartiles classifcation method (based on the assignment of a score to each participant proceeding from its distance to the 'optimal performance' corner)")
        .attr("data-toggle", "list_tooltip")
        .attr("data-container", "#tooltip_container") 
        .text("DIAGONAL QUARTILES")

        select_list.append("option")
        .attr("class", "selection_option")
        .attr("id", button4_id)
        .attr("title", "Apply K-Means clustering method (group the participants using the K-means clustering algorithm and sort the clusters according to the performance)")
        .attr("data-toggle", "list_tooltip")
        .attr("data-container", "#tooltip_container") 
        .text("K-MEANS CLUSTERING")
};