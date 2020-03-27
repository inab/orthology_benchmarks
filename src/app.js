import './app.css';
import { createApolloFetch } from 'apollo-fetch';
import { append_classifiers_list } from "./selection_list";
import { createChart } from "./scatter_plot"

// ./node_modules/.bin/webpack-cli src/app.js --output=build/build.js -d -w


let MAIN_DATA = {};
let MAIN_METRICS = {};
let better = {};


function load_scatter_visualization(){

    
    let divid;
    
    let charts = document.getElementsByClassName("benchmarkingChart_scatter");
     
    let i = 0;
    let dataId;
    let y;
    
    // append ids to chart/s and make d3 plot
    i = 0
    for(y of charts){

      // define base url - production or development
      //check for mode by default it is production if no param is given
      var mode = $(y).data("mode") ? "dev-openebench" : "openebench"
      let base_url = "https://" + mode + ".bsc.es/";

      // get benchmarking event id
      dataId = y.getAttribute('data-id');

      //set chart id
      divid = (dataId+i).replace(":","_");
      y.id=divid;

      //append selection list
      append_classifiers_list(divid);
      let url = base_url + "sciapi/graphql";
      
      let json_query = `query getDatasets($dataset_id: String!){
                          getDatasets(datasetFilters:{id: $dataset_id, type:"aggregation"}) {
                              _id
                              community_ids
                              datalink{
                                  inline_data
                              }
                          }
                        }`

      get_data(url, json_query, dataId, divid); 


      //check the transformation to table attribute and append table to html
      if (y.getAttribute('toTable') == "true"){
        let table_id = divid + "_table";
        var input = $('<br><br><table id="'+table_id+'" data-id="'+dataId+'" class="benchmarkingTable_scatter"></table>');
        $("#" + divid + "flex-container").append(input);
      };
            
      i++;
    }
        
    
       
};



function get_data(url, json_query ,dataId, divid){

  try {

      const fetch = createApolloFetch({
        uri: url,
      });

      let vars = { dataset_id: dataId };

      fetch({
        query: json_query,
        variables: vars,
      }).then(res => {
          let result = res.data.getDatasets;
          if (result.length == 0){

            document.getElementById(divid + "_dropdown_list").remove();
      
            var para = document.createElement("td");
            para.id = "no_benchmark_data"
            var err_txt = document.createTextNode("No data available for the selected challenge: " + dataId);
            para.appendChild(err_txt);
            var element = document.getElementById(divid);
            element.appendChild(para);
      
        } else {

          // get the names of the tools that are present in the community
          const fetchData = () => fetch({
            query: `query getMetrics{
                        getMetrics {
                          _id
                          title
                          representation_hints
                        }
                    }`
          });
          
          fetchData().then(response => { 
            
            let metrics_list = response.data.getMetrics;
          
            // iterate over the list of metrics to generate a dictionary
            let metrics_names = {};
            let metrics_representation = {};
            metrics_list.forEach( function(element) {
              metrics_names[element._id] = element.title
              
            });
            // get optimization point
            if (result[0].datalink.inline_data.visualization.optimization == "bottom-right"){
              better[divid]= "bottom-right";
            } else {
              better[divid]= "top-right";
            };
            let metric_x = result[0].datalink.inline_data.visualization.x_axis;
            let metric_y = result[0].datalink.inline_data.visualization.y_axis;
            // append those metrics as div attributes, so that they cna be used later
            document.getElementById(divid).setAttribute("metric_x", metric_x); 
            document.getElementById(divid).setAttribute("metric_y", metric_y);
            join_all_json(result, divid, metric_x, metric_y,metrics_names, better);

          } );
          
        };
      });

    }
    catch (err) {
      console.log(`Invalid Url Error: ${err.stack} `);
    }

};



function join_all_json(result, divid, metric_x, metric_y,metrics_names, better){
  try{

    // transform the object to an array, which is usable by the D3 chart
    let full_json = [];
    result[0].datalink.inline_data.challenge_participants.forEach( function(element) {

      //if participant name is too long, slice it
      let tool_name = element.tool_id;
      var short_name;
      if (tool_name.length > 22){
        short_name = tool_name.substring(0,22);
      } else {
        short_name = tool_name
      }

      let jo = {};
      jo['toolname'] = short_name;
      jo['x'] = element.metric_x;
      jo['y'] = element.metric_y;
      jo['e_y'] = element.stderr_y ? parseFloat(element.stderr_y) : 0;
      jo['e_x'] = element.stderr_x ? parseFloat(element.stderr_x) : 0;
      full_json.push(jo); 

    });
    full_json.sort(function(a,b){
        let x = a.toolname.toLowerCase();
        let y = b.toolname.toLowerCase();
        if (x < y) { return -1;}
        if (x > y){ return 1;}
        return 0;
    });

    MAIN_DATA[divid] = full_json;
    MAIN_METRICS[divid] = metrics_names;
    // by default, no classification method is applied. it is the first item in the selection list
    var e = document.getElementById(divid + "_dropdown_list");
    let classification_type = e.options[e.selectedIndex].id;

    // load default zoom state from div attribute 'default-zoom'
    let default_zoom = document.getElementById(divid).getAttribute('default-zoom');
    default_zoom = (default_zoom && (default_zoom === 'on' || default_zoom === 'true'));

    //add button wich allows to toogle between reset view & out
    d3.select('#' + divid + '_buttons_container').append("button")
    .attr("class","toggle_axis_button")
    .attr("id",divid + "axis_button")
    .attr("name", default_zoom ? "reset view" : "optimal view")
    .text(default_zoom ? "reset view" : "optimal view")
    .on('click', function(d) {
      if (this.name == "optimal view"){
        d3.select(this).text("reset view");
        this.name = "reset view"
        //the chart will be created again, but first it needs to know which classification method is selected
        let select_list = document.getElementById(divid + "_dropdown_list")
        onQuartileChange(select_list.options[select_list.selectedIndex].id, metric_x, metric_y, better)

      } else {
        d3.select(this).text("optimal view");
        this.name = "optimal view"
        //the chart will be created again, but first it needs to know which classification method is selected
        let select_list = document.getElementById(divid + "_dropdown_list")
        onQuartileChange(select_list.options[select_list.selectedIndex].id, metric_x, metric_y, better)

      }
      
    })

    createChart(full_json,divid, classification_type, metric_x, metric_y,metrics_names, better, (default_zoom ? "auto" : 0));
  } catch(err){
    console.log(`Invalid Url Error: ${err.stack} `);
  }

    
};


function onQuartileChange(ID, metric_x, metric_y, better, axis_limit="auto"){  
  
  var chart_id = ID.split("__")[0];
  // console.log(d3.select('#'+'svg_'+chart_id));
  d3.select('#'+'svg_'+chart_id).remove();
  let classification_type = ID;

  var axis_limit;
  if (document.getElementById(chart_id + "axis_button").name == "optimal view"){
    axis_limit = 0;
  } else {
    axis_limit = "auto"
  }

  createChart(MAIN_DATA[chart_id],chart_id, classification_type, metric_x, metric_y, MAIN_METRICS[chart_id], better, axis_limit);
  
};


export{
  load_scatter_visualization,
  onQuartileChange,
  better
}

load_scatter_visualization();



