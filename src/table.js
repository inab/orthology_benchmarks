
export function fill_in_table (divid, data, all_participants, removed_tools){

  //create table dinamically
  var table = document.getElementById(divid + "_table");
  var row = table.insertRow(-1);
  row.insertCell(0).innerHTML = "<b>TOOL</b>";
  row.insertCell(1).innerHTML = "<b>QUARTILE</b>";

  all_participants.forEach(function(element) {
    var row = table.insertRow(-1);
    row.insertCell(0).innerHTML = element.toolname;
    //if the participant is not hidden the 2nd column is filled with the corresponding quartile
    // if not it is filled with --
    if ($.inArray(element.toolname.replace(/[\. ()/_]/g, "-"), removed_tools) == -1) {
      // var quartile;
      let obj = data.find(o => o.toolname.replace(/[\. ()/_]/g, "-") === element.toolname.replace(/[\. ()/_]/g, "-"));
      row.insertCell(1).innerHTML = obj.quartile;
    } else {
      row.insertCell(1).innerHTML = "--";
    }
    
    // add id
    var my_cell = row.cells[0];
    my_cell.id = divid+"___cell"+element.toolname.replace(/[\. ()/-]/g, "_");

    my_cell.addEventListener('click', function (d) {

      let ID = this.id;
      // trigger a click event on the legend rectangle (hide participant)
      let legend_rect = (divid+"___leg_rect"+ ID.split("___cell")[1]);
      document.getElementById(legend_rect).dispatchEvent(new Event('click'));
    });

    my_cell.addEventListener('mouseover', function (d) {

      let ID = this.id;
      d3.select(this).style("cursor", "pointer");
      let legend_rect = (divid+"___leg_rect"+ ID.split("___cell")[1]);

      if (d3.select(this).style("opacity") == 1 || d3.select(this).style("opacity") == 0.5){
        $(this).css('opacity', 0.7);
        $(this).closest("tr").css('opacity', 0.7);
      } else {
        $(this).css('opacity', 1);
        $(this).closest("tr").css('opacity', 1);
      };

    });

    my_cell.addEventListener('mouseout', function (d) {
      
      let ID = this.id;
      d3.select(this).style("cursor", "default");
      let legend_rect = (divid+"___leg_rect"+ ID.split("___cell")[1]);

      if (d3.select("#" + legend_rect).style("opacity") == 0.2 || d3.select("#" + legend_rect).style("opacity") == 0.5){
        $(this).css('opacity', 0.5);
        $(this).closest("tr").css('opacity', 0.5);
      } else {
        $(this).css('opacity', 1);
        $(this).closest("tr").css('opacity', 1);
      };

    });

  });

};

export function set_cell_colors(divid, legend_color_palette, removed_tools){

  var tools = Object.keys(legend_color_palette);

  var cell = $("#" + divid + "_table td"); 

  cell.each(function() { //loop through all td elements ie the cells

    var cell_value = $(this).html(); //get the value
    if (cell_value == 1) { //if then for if value is 1
      $(this).css({'background' : '#238b45'});   // changes td to red.
    } else if (cell_value == 2) {
      $(this).css({'background' : '#74c476'}); 
    } else if (cell_value == 3) {
      $(this).css({'background' : '#bae4b3'}); 
    } else if (cell_value == 4) {
      $(this).css({'background' : '#edf8e9'}); 
    } else if (cell_value == "--") {
      $(this).css({'background' : '#f0f0f5'}); 
    } else if ($.inArray(cell_value, tools) > -1 && $.inArray(cell_value.replace(/[\. ()/_]/g, "-"), removed_tools) == -1) {
      $(this).css({'background' : 'linear-gradient(to left, white 92%, ' + legend_color_palette[cell_value] + ' 8%)'});
    } else if ($.inArray(cell_value.replace(/[\. ()/_]/g, "-"), removed_tools) > -1) {
      $(this).css({ 'background' : 'linear-gradient(to left, white 92%, ' + legend_color_palette[cell_value] + ' 8%)', 'opacity': 0.5});
      $(this).closest("tr").css('opacity', 0.5);
    } else {
      $(this).css({'background' : '#FFFFFF'});
    };

    // lighten(' + legend_color_palette[cell_value] + ', 50%)

  });

};