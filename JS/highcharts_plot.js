loadurl = function (file){

    $.getJSON(file, function(result){
        data = result;
        console.log(data);
        createChart(data);
        
    });
  
  };
  
  createChart = function (data){
      
    var chart = new Highcharts.Chart({
        chart: {
            renderTo: 'container',
            defaultSeriesType: 'scatter'
        },
        
        plotOptions: {
           scatter: {
              marker: {
                 radius: 4,
                 states: {
                    hover: {
                       enabled: true,
                       lineColor: 'rgb(100,100,100)'
                    }
                 }
              },
              states: {
                 hover: {
                    marker: {
                       enabled: false
                    }
                 }
              }
           }
        },
        series: [{
            data: [
                {
                  name: "OMA Pairs (Refset5)",
                  x: 8239,
                  y: 0.05366750358053163
                },
                {
                  name: "orthoinspector 1.30 (blast threshold 10-9)",
                  x: 10385,
                  y: 0.06242977082330284

                },
                {
                  name: "RSD 0.8 1e-5 Deluca",
                  x: 8880,
                  y: 0.06991364740990992
                },
                {
                  name: "RBH / BBH",
                  x: 9234,
                  y: 0.06719729683777345
                }                
              ]
              
        }]
    });

  };
  
  
  
  function get_square_quartiles(data) {
    var x_values = data.map(a => a.x).sort(function(a, b){return a - b});
    var y_values = data.map(a => a.y).sort(function(a, b){return a - b});
  
    var quantile_x = d3.quantile(x_values, 0.5);
    var quantile_y = d3.quantile(y_values, 0.5);
  
    return [quantile_x, quantile_y];
  };
  
  var input = ["sample_data.json", "sample_2.json", "sample_3.json"];
  for (i = 0; i < input.length; i++) { 
    loadurl (input[i]);
  }
  