function draw_us() {
    $.ajax({
        dataType: 'json',
        url: '/static/js/us.json',
        async: false,
        success: function(us) {
            svg.insert('path', '.graticule')
                .datum(topojson.feature(us, us.objects.land))
                .attr('class', 'land')
                .attr('d', path)
                .attr('filter', 'url(#dropshadow)');

            svg.insert('path', '.graticule')
                .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
                .attr('class', 'county-boundary')
                .attr('d', path);

            svg.insert('path', '.graticule')
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr('class', 'state-boundary')
                .attr('d', path);
        }
    });

    $.ajax({
        dataType: 'json',
        url: '/static/js/us_cities.json',
        async: false,
        success: function(cities) {
            var des = [];
            for (var i = 0; i < cities.length; i++) {
                if (cities[i].star == 2) {
                    var ct = projection([cities[i].longitude, cities[i].latitude]);
                    cx = ct[0];
                    cy = ct[1];
                } else if (cities[i].star == 1) {
                    var dt = projection([cities[i].longitude, cities[i].latitude]);
                    des.push({'x': dt[0], 'y': dt[1]});
                }
            }
            var circles = svg.selectAll('.city')
                             .data(cities)
                             .enter()
                             .append('circle')
                             .attr('r', function(d) {
                                 if (d.star > 0)
                                    return 5;
                                 else
                                    return 2;
                             })
                             .attr('class', 'city')
                             .attr('fill', function(d) {
                                 if (d.star > 0) {
                                     return '#ca0020';
                                 } else {
                                     return '#31AFE5';
                                 }
                             })
                             .attr('filter', 'url(#glow)')
                             .attr('transform', function(d) {
                                 return 'translate(' + projection([d.longitude, d.latitude]) + ')';
                             });

             var paths = svg.selectAll('.path')
                            .data(des)
                            .enter()
                            .append('path')
                            .attr('class', 'path')
                            .attr('d', function(d) {
                                var r = Math.pow(Math.abs(cx - d.x), 2) + Math.pow(Math.abs(cy - d.y), 2);
                                r = Math.sqrt(r);
                                var clock;
                                if (cx > d.x)
                                    clock = 0;
                                else
                                    clock = 1;
                                var s = 'M {0} {1} A {2} {3}  0 0 {4} {5} {6}';
                                return s.format(cx, cy, r, r, clock, d.x, d.y);
                            })
                            .attr('filter', 'url(#inner-glow)');

             var pathIIs = svg.selectAll('.path2')
                            .data(des)
                            .enter()
                            .append('path')
                            .attr('class', 'path2')
                            .attr('d', function(d) {
                                var r = Math.pow(Math.abs(cx - d.x), 2) + Math.pow(Math.abs(cy - d.y), 2);
                                r = Math.sqrt(r);
                                var clock;
                                if (cx > d.x)
                                    clock = 0;
                                else
                                    clock = 1;
                                var s = 'M {0} {1} A {2} {3}  0 0 {4} {5} {6}';
                                return s.format(cx, cy, r, r, clock, d.x, d.y);
                            });

            var marker = svg.selectAll('.ball')
                            .data(des)
                            .enter()
                            .append('circle')
                            .attr('class', 'ball')
                            .attr('transform', 'translate(' + cx + ',' + cy + ')')
                            .attr('r', 2.5);

            var markerLights = svg.selectAll('.ball-lights')
                                   .data(des)
                                   .enter()
                                   .append('circle')
                                   .attr('class', 'ball-lights')
                                   .attr('transform', 'translate(' + cx + ',' + cy + ')')
                                   .attr('r', 5)
                                   .attr('filter', 'url(#ball-glow)');

            svg.selectAll('.ball-lights')
               .data(pathIIs[0])
               .each(function(d) {
                   transition(d3.select(this), d);
               });

            svg.selectAll('.ball')
               .data(pathIIs[0])
               .each(function(d) {
                   transition(d3.select(this), d);
               });

            function transition(a, b) {
                   a.transition()
                    .duration(7500)
                    .attrTween('transform', translateAlong(b))
                    .each('end', function() {
                        return transition(a, b);
                    });
            }

            function translateAlong(path) {
                var l = path.getTotalLength();
                return function(i) {
                    return function(t) {
                        var p = path.getPointAtLength(t * l);
                        return "translate(" + p.x + "," + p.y + ")";
                    }
                }
            }
        }
    });

}
