// Inspired by
// projects.flowingdata.com/life-expectancy

// Global variables
var margins = [10, 10, 10, 10],
    w       = 1200,
    h       = 500,
    padding = 30,
    x       = d3.scale.linear().domain([0,1]).range([padding,w-padding]),
    y       = d3.scale.linear().domain([-0.3,-1.5]).range([padding,h-padding]);

// Select the window to plot to
var curve_panel = d3.select('#curve_panel')
                    .append("svg:svg")
                    .attr({'width': w, 'height': h})
                    .style('padding', margins.join('px ') + 'px');

// Create the line function used to draw lines
var line = d3.svg.line()
              .x(function(d,i) { return d.x; })
              .y(function(d,y) { return d.y; })

// Create the axis functions used to create axes and gridlines
var xAxis = d3.svg.axis()
              .scale(x)
              .orient('bottom')
              .ticks(10);
var yAxis = d3.svg.axis()
              .scale(y)
              .orient('left')
              .ticks(12);

// Returns the colorclass of a curve based on the vortices
// Classes can be red, green or blue
function getColorClass(vortices, walls){
  if(vortices[0]==vortices[1] && vortices[0]==vortices[2]){
    console.log(walls);
    if(walls){
      var colorclass = 'red';
    } else {
      var colorclass = 'magenta';
    }
  } else if (vortices[0]<vortices[1] && vortices[0]<vortices[2]){
    var colorclass = 'green';
  } else if (vortices[0]>vortices[1] && vortices[0]>vortices[2]){
    var colorclass = 'blue';
  } else {
    var colorclass = 'uneven';
  }
  return colorclass
}

// Get the data and draw it
var data;
d3.json('raw_curves.json', function(jsondata){
  data = jsondata;
  for (var i=0; i<data.length; i++){
    curve = data[i].curve
    path = []
    for (var j=0; j<curve.length; j++){
      path.push({'x': x(curve[j][0]), 'y': y(curve[j][1])})
    }
    curve_panel.append("svg:path")
      .attr('d', line(path))
      .attr('class','curve')
      .classed('walls', data[i].walls)
      .classed('no_walls', !data[i].walls)
      .attr('vortices', data[i].vortices.join())
      .classed(getColorClass(data[i].vortices, data[i].walls), true)
      .attr('file', data[i].file.substring(0,data[i].file.length-5))
      .on('mouseover', onmouseover)
      .on('mouseout', onmouseout)
      .on('click', onclick);
  }
});

// Draw axes
curve_panel.append('g')
  .attr('class','axis')
  .attr('transform', 'translate(0,'+(h-padding)+')')
  .call(xAxis);
curve_panel.append('g')
  .attr('class','axis')
  .attr('transform', 'translate('+padding+',0)')
  .call(yAxis);
// Draw the grid lines
curve_panel.append('g')
  .attr('class','grid')
  .attr('transform', 'translate(0,'+(h-padding)+')')
  .call(xAxis
    .tickSize(-(h-2*padding),0,0)
    .tickFormat("")
  );
curve_panel.append('g')
  .attr('class','grid')
  .attr('transform', 'translate('+padding+',0)')
  .call(yAxis
    .tickSize(-(w-2*padding),0,0)
    .tickFormat("")
  );

// Interactivity function
function onmouseover(){
  d3.select(this)
    .classed('active',true);
}

function onmouseout(){
  d3.select(this)
    .classed('active',false);
}

function onclick(){
  // Get the correct plot filename
  var file = d3.select(this).attr('file');
  file = 'plot/' + file + '.png';
  if(file=='plot/world_00000000.png'){
    file = 'plot/initial_condition.png';
  }
  // Decide wether it is already selected or not
  if(d3.select(this).classed('selected')){
    // Toggle selected off and remove the DOM element
    d3.select(this).classed('selected', false);
    d3.selectAll('img').filter( function(d, i) { 
      return d3.select(this).attr('file') == file ? 1 : 0;
    }).remove()
  } else {
    // Toggle selected on and create DOM element
    d3.select(this).classed('selected', true);
    d3.select('body').append('img')
      .attr('src', function(d) { return file; })
      .attr('file', file)
      .on('click', image_click);
  }
}

function image_click(){
  // Find the corresponding curve and remove it
  var file = d3.select(this).attr('file');
  if(file=='plot/initial_condition.png'){
    file = 'plot/world_00000000.png';
  }
  var world = file.slice(5, file.length - 4);
  curves = d3.selectAll('.curve')[0];
  for(var i=0; i<curves.length; i++){
    var curve = d3.select(curves[i]);
    if(curve.attr('file')==world){
      curve.classed('selected', false);
    }
  }
  // Remove the image
  d3.select(this).remove();
}
