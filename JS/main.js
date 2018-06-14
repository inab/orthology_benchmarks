

$(document).ready(function(){

    loadurl = function (){
        $.getJSON("csvjson.json", function(result){
            var datos = result;
            console.log(datos);
            createChart(datos)
        });
    };

    createChart = function (datos){
        console.log(datos);
        var chart = c3.generate({
            bindto: '#chart',
            data: {

                // iris data from R
                json: datos,
                keys: {
                    x: 'x_value',
                    value: ['y_value'],
                },
                type: 'scatter'
            },
            axis: {
                x: {
                    label: 'completed tree samples',
                    tick: {
                        fit: false
                    }
                },
                y: {
                    label: 'average RF distace'
                }
            }
        });
        // drawLabels(chart.internal);
    };

    drawLabels = function (chartInternal) {
        var textLayers = chartInternal.main.selectAll('.' + c3.chart.internal.fn.CLASS.texts);
        for (var i = 0; i < textLayers[0].length; i++) {
            // select each of the scatter points
            chartInternal.mainCircle[i].forEach(function (point, index) {
                var d3point = d3.select(point)
                d3.select(textLayers[0][i])
                    .append('text')
                    // center horizontally and vertically
                    .style('text-anchor', 'middle').attr('dy', '.3em')
                    .text(i + '.' + index)
                    // same as at the point
                    .attr('x', d3point.attr('cx')).attr('y', d3point.attr('cy'))
            })
        }
    }

    loadurl();  
        
    

    
});