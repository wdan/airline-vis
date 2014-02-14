var width = 960;
var height = 600;

//var projection = d3.geo.equirectangular()
//var projection = d3.geo.orthographic()
//var projection = d3.geo.mercator()
                   //.scale(180)
                   //.translate([width / 2, height / 2])
                   //.precision(.1);

String.prototype.format = function() {
    var formatted = this;
    for( var arg in arguments ) {
            formatted = formatted.replace("{" + arg + "}", arguments[arg]);
        }
    return formatted;
};

var projection = d3.geo.albers()
                   .parallels([29.5, 45.5])
                   .scale(1200)
                   .translate([width / 2, height / 2])
                   .precision(.1);

var path = d3.geo.path()
             .projection(projection);

var graticule = d3.geo.graticule();

var svg = d3.select('#paint-zone')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

svg.append('path')
   .datum(graticule)
   .attr('class', 'graticule')
   .attr('d', path);


//draw_airline();
draw_us();

//var currentRotation = 0;

//setInterval(function() {
    //currentRotation += 1;
    //projection.rotate([currentRotation, 0]);
    //svg.selectAll('.land')
       //.attr('d', path);
//}, 100);
