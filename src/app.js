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
      var metric_x = y.getAttribute('metric_x');
      var metric_y = y.getAttribute('metric_y');
      //set chart id
      divid = (dataId+i).replace(":","_");
      y.id=divid;

      //append selection list
      append_classifiers_list(divid);
      let url = base_url + "sciapi/graphql";
      
      let json_query = `query getDatasets($challenge_id: String!){
                          getDatasets(datasetFilters:{challenge_id: $challenge_id, type:"assessment"}) {
                              _id
                              community_ids
                              datalink{
                                  inline_data
                              }
                              depends_on{
                                  tool_id
                                  metrics_id
                              }
                          }
                        }`

      get_data(url, json_query, dataId, divid, metric_x, metric_y); 


      //check the transformation to table attribute and append table to html
      if (y.getAttribute('toTable') == "true"){
        let table_id = divid + "_table";
        var input = $('<br><br><table id="'+table_id+'" data-id="'+dataId+'" class="benchmarkingTable_scatter"></table>');
        $("#" + divid).append(input);
      };
            
      i++;
    }
        
    
       
};



function get_data(url, json_query ,dataId, divid, metric_x, metric_y){

  try {

      const fetch = createApolloFetch({
        uri: url,
      });

      let vars = { challenge_id: dataId };

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
            query: `query getTools($community_id: String!){
                        getTools(toolFilters:{community_id: $community_id}) {
                            _id
                            name
                        }
                        getMetrics {
                          _id
                          title
                          representation_hints
                        }
                    }`,
            variables: {community_id: result[0].community_ids[0]},
          });

          fetchData().then(response => { 
            
            let tool_list = response.data.getTools;
            let metrics_list = response.data.getMetrics;
            // iterate over the list of tools to generate a dictionary
            let tool_names = {};
            tool_list.forEach( function(tool) {
                tool_names[tool._id] = tool.name
            
            });

            // iterate over the list of metrics to generate a dictionary
            let metrics_names = {};
            let metrics_representation = {};
            metrics_list.forEach( function(element) {
              metrics_names[element._id] = element.title
              if (element.representation_hints !== null) {
                metrics_representation[element._id] = element.representation_hints.optimization;
              } else {
                metrics_representation[element._id] = null;
              };
              
            });
            // get optimization point
            if ( metrics_representation[metric_x] == "minimize" || metrics_representation[metric_y] == "minimize") {
              better[divid] = "bottom-right";
            } else {
              better[divid] = "top-right";
            };
            join_all_json(result, tool_names, divid, metric_x, metric_y,metrics_names, better);

          } );
          
        };
      });

    }
    catch (err) {
      console.log(`Invalid Url Error: ${err.stack} `);
    }

};



function join_all_json(result, tool_names, divid, metric_x, metric_y,metrics_names, better){
  try{

    let tools_object  = {};

    result.forEach( function(dataset) {
      
      // get tool which this dataset belongs to
      let tool_name = tool_names[dataset.depends_on.tool_id];

      if (!(tool_name in tools_object))
          tools_object[tool_name] = new Array(4);

      // get value of the two metrics
      let metric = parseFloat( dataset.datalink.inline_data.value);
      if (dataset.depends_on.metrics_id == metric_x) {
          tools_object[tool_name][0] = metric;
          if (typeof dataset.datalink.inline_data.error !== 'undefined') {
            tools_object[tool_name][3] = parseFloat(dataset.datalink.inline_data.error);
          } else {
            tools_object[tool_name][3] = 0;
          };
      } else if (dataset.depends_on.metrics_id == metric_y) {
          tools_object[tool_name][1] = metric;
          if (typeof dataset.datalink.inline_data.error !== 'undefined') {
            tools_object[tool_name][2] = parseFloat(dataset.datalink.inline_data.error);
          } else {
            tools_object[tool_name][2] = 0;
          };
      }
    });

    // transform the object to an array, which is usable by the D3 chart
    let full_json = [];
    Object.keys(tools_object).forEach(tool_name => {

      let jo = {};
      jo['toolname'] = tool_name;
      jo['x'] = tools_object[tool_name][0];
      jo['y'] = tools_object[tool_name][1];
      jo['e_y'] = tools_object[tool_name][2];
      jo['e_x'] = tools_object[tool_name][3];
      full_json.push(jo); 

    });
    
    MAIN_DATA[divid] = full_json;
    MAIN_METRICS[divid] = metrics_names;
    // by default, no classification method is applied. it is the first item in the selection list
    var e = document.getElementById(divid + "_dropdown_list");
    let classification_type = e.options[e.selectedIndex].id;

    createChart(full_json,divid, classification_type, metric_x, metric_y,metrics_names, better);
  } catch(err){
    console.log(`Invalid Url Error: ${err.stack} `);
  }

    
};


function onQuartileChange(ID, metric_x, metric_y, better){  
  
  var chart_id = ID.split("__")[0];
  // console.log(d3.select('#'+'svg_'+chart_id));
  d3.select('#'+'svg_'+chart_id).remove();
  let classification_type = ID;

  createChart(MAIN_DATA[chart_id],chart_id, classification_type, metric_x, metric_y, MAIN_METRICS[chart_id], better);
  
};


export{
  load_scatter_visualization,
  onQuartileChange,
  better
}

load_scatter_visualization();



