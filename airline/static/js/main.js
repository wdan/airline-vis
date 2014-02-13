var width = 1600;
var height = 900;

//var projection = d3.geo.equirectangular()
//var projection = d3.geo.orthographic()
var projection = d3.geo.mercator()
                   .scale(180)
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

var map = {};
var counts = {};

$.ajax({
    dataType: 'json',
    url: '/static/js/airports.json',
    async: false,
    success: function(airports) {
        for (var i = 0; i < airports.length; i++) {
            map[airports[i].name] = {'x': parseInt(airports[i].x),
                                    'y': parseInt(airports[i].y)};
        }
    }
});

$.ajax({
    dataType: 'json',
    url: '/static/js/routes.json',
    async: false,
    success: function(routes) {
        for (var i = 0; i < routes.length; i++) {
            var a = parseInt(routes[i].a);
            var b = parseInt(routes[i].b);
            if (a > b) {
                var t = a;
                a = b;
                b = t;
            }
            if (counts[a] == undefined) {
                counts[a] = {};
            }
            if (counts[a][b]) {
                counts[a][b] += 1;
            } else {
                counts[a][b] = 1;
            }
        }
        var max = 0;
        var recordsLong = [];
        var recordsShort = [];
        $.each(counts, function(a, val) {
            $.each(val, function(b, cnt) {
                if (cnt > max)
                    max = cnt;
                var aT = projection([map[a].x, map[a].y]);
                var bT = projection([map[b].x, map[b].y]);
                var xMax = Math.max(map[a].x, map[b].x);
                var xMin = Math.min(map[a].x, map[b].x);
                var yMax = Math.max(map[a].y, map[b].y);
                var yMin = Math.min(map[a].y, map[b].y);
                //if (xMax - xMin <= 180) {
                    if (Math.pow((xMax - xMin), 2) + Math.pow((yMax - yMin), 2) < 16)
                        recordsShort.push({'aX': aT[0], 'aY': aT[1], 'bX': bT[0], 'bY': bT[1], 'val': cnt});
                    else
                        recordsLong.push({'aX': aT[0], 'aY': aT[1], 'bX': bT[0], 'bY': bT[1], 'val': cnt});
                //}
            });
        });
        var longs = svg.selectAll('.long')
                    .data(recordsLong)
                    .enter()
                    .append('path')
                    .attr('class', 'long')
                    .attr('d', function(d) {
                        //return 'M' + d.aX + ',' + d.aY + 'C' + (d.aX + d.bX) / 2 + ',' + d.aY + ' ' + d.bX + ',' + (d.aY + d.bY) / 2 + ' ' + d.bX + ',' + d.bY;
                        var r = Math.pow(Math.abs(d.aX - d.bX), 2) + Math.pow(Math.abs(d.aY - d.bY), 2);
                        r = Math.sqrt(r);
                        var s = 'M ';
                        s += d.aX;
                        s += ' ';
                        s += d.aY;
                        s += ' A ';
                        s += r;
                        s += ' ';
                        s += r;
                        s += '  0 ';
                        s += 0;
                        s += ' ';
                        if (d.aY > d.bY)
                            s += 1;
                        else
                            s += 0;
                        s += ' ';
                        s += d.bX;
                        s += ' ';
                        s += d.bY;
                        return s;
                    })
                    .attr('fill', 'none')
                    .style('stroke-opacity', function(d) {
                        return 0.2 + 0.4 * (d.val - 1) / 25;
                    });

        var shorts = svg.selectAll('.short')
                        .data(recordsShort)
                        .enter()
                        .append('line')
                        .attr('class', 'short')
                        .attr('x1', function(d) {
                            return d.aX;
                        })
                        .attr('x2', function(d) {
                            return d.bX;
                        })
                        .attr('y1', function(d) {
                            return d.aY;
                        })
                        .attr('y2', function(d) {
                            return d.bY;
                        })
                        .attr('stroke-opacity', function(d) {
                        return 0.3 + 0.5 * (d.val - 1) / 25;
                        });

    }
});

$.ajax({
    dataType: 'json',
    url: '/static/js/airports.json',
    async: false,
    success: function(airports) {
        var circles = svg.selectAll('.airport')
                         .data(airports)
                          .enter()
                          .append('circle')
                          .attr('r', 0.5)
                          .attr('class', 'airport')
                          .attr('transform', function(d) {
                              return 'translate(' + projection([d.x, d.y]) + ')';
                          });
    }
});

d3.json('/static/js/world.json', function(error, world) {
    svg.insert('path', '.graticule')
       .datum(topojson.feature(world, world.objects.land))
       .attr('class', 'land')
       .attr('d', path);

    svg.insert('path', '.graticule')
        .datum(topojson.mesh(world, world.objects.countries, function(a, b) {
            return a !== b;
        }))
        .attr('class', 'boundary')
        .attr('d', path);
});

d3.select(self.frameElement).style('height', height + 'px');

var currentRotation = 0;

//setInterval(function() {
    //currentRotation += 1;
    //projection.rotate([currentRotation, 0]);
    //svg.selectAll('.land')
       //.attr('d', path);
//}, 100);
