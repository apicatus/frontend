/*jshint -W040*/

var charts = charts || {};

charts.worldmap = function module() {
    'use strict';
    var width = 500,
        height = 500,
        topo,
        projection,
        path,
        canvas,
        svg,
        graticule = d3.geo.graticule(),
        daylightVisible = false,
        daylight = d3.geo.circle().angle(90).precision(0.5),
        daylightPath = null,
        active = d3.select(null),
        limitBounds = null,
        featureBounds = null,
        zoom = null,
        tlast = null,
        slast = null,
        fitGeoInside = null,
        setGeoTransform = null,
        geoLayer = {};

    var color = null;

    var dispatch = d3.dispatch('customHover');
    ///////////////////////////////////////////////////////////////////////////
    // Default chart options                                                 //
    ///////////////////////////////////////////////////////////////////////////
    var options = {
        chart: {
            type: 'worldmap',
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            tooltip: {
                enabled: false
            }
        },
        mapNavigation: {
            enabled: true,
            zoom: {
                enabled: true
            }
        },
        daylightVisible: {
            enabled: false
        },
        plotOptions: {
            fillOpacity: 0.5,
            fill: '#616D7D',
            series: {
                animation: false,
                pointInterval: 24 * 3600 * 1000, // one day
                pointStart: new Date().getTime(),
                units: null,
                tracking: true,
                makers: true,
                stroke: true
            },
            routes: {
                stroke: '#348fe2'
            },
            markers: {
                fill: '#f00'
            }
        },
        colorAxis: {
            minColor: '#616D7D',
            maxColor: '#00acac'
        }
    };
    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            var size = {
                'width': width - options.chart.margin.left - options.chart.margin.right,
                'height': height - options.chart.margin.top - options.chart.margin.bottom
            };
            color = d3.scale.linear()
                .interpolate(d3.interpolateRgb)
                .domain([0, d3.max(_data, function(country){
                    return country.value;
                })])
                .range([options.colorAxis.minColor, options.colorAxis.maxColor]);

            var π = Math.PI,
                radians = π / 180,
                degrees = 180 / π;

            var circle = d3.geo.circle().angle(90);

            function draw(topo, data) {

                var country = canvas.selectAll('.country').data(topo);

                country
                    .enter()
                    .insert('path')
                    .attr('class', 'country')
                    .attr('d', path)
                    .attr('id', function (d, i) {
                        return d.id;
                    })
                    .attr('title', function (d, i) {
                        return d.properties.name;
                    })
                    .style('fill', function(d){
                        var country = data.filter(function(c){
                            return d.id == c.key;
                        })[0];
                        if(country) {
                            return color(country.value);
                        } else {
                            return options.plotOptions.fill;
                        }
                    })
                    .on('click', clicked);

                // Draw Day/Night
                if(daylightVisible) {
                    daylightPath = canvas.append('path')
                        .attr('class', 'night')
                        .attr('d', path);
                    daylightPath.datum(circle.origin(antipode(solarPosition(new Date())))).attr('d', path);
                }

                exports.addZoomBtns();
                exports.addLabel();
            }
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            function getFeaturesBox() {
                return {
                    x: featureBounds[0][0],
                    y: featureBounds[0][1],
                    width: featureBounds[1][0] - featureBounds[0][0],
                    height: featureBounds[1][1] - featureBounds[0][1]
                };
            }

            // fits the geometry layer inside the viewport
            fitGeoInside = function () {
                var bbox = getFeaturesBox(),
                    scale = 0.95 / Math.max(bbox.width / width, bbox.height / height),
                    trans = [-(bbox.x + bbox.width / 2) * scale + width / 2, -(bbox.y + bbox.height / 2) * scale + height / 2];

                geoLayer.scale = scale;
                geoLayer.translate = trans;

                canvas
                .transition()
                .duration(750)
                .attr('transform', [
                    'translate(' + geoLayer.translate + ')',
                    'scale(' + geoLayer.scale + ')'
                ].join(' '));
            };

            // transform geoParent
            setGeoTransform = function(scale, trans, animate) {
                var container = canvas;
                zoom.scale(scale).translate(trans);

                tlast = trans;
                slast = scale;

                if(animate) {
                    container = canvas.transition().duration(750);
                }
                container
                    .attr('transform', [
                        'translate(' + trans + ')',
                        'scale(' + scale + ')'
                    ].join(' '))
                    .selectAll('.country')
                    .style('stroke-width', 1 / scale);
            };
            // limits panning
            // XXX: this could be better
            limitBounds = function (scale, trans, animate) {

                var bbox = getFeaturesBox();
                var outer = width - width * scale;
                var geoWidth = bbox.width * geoLayer.scale * scale,
                    geoLeft = -((width * scale) / 2 - ((geoWidth) / 2)),
                    geoRight = outer - geoLeft;

                if (scale === slast) {
                    //trans[0] = Math.min(0, Math.max(trans[0], width - width * scale));
                    trans[1] = Math.min(0, Math.max(trans[1], height - height * scale));

                    if (geoWidth > width) {
                        if (trans[0] < tlast[0]) { // panning left
                            trans[0] = Math.max(trans[0], geoRight);
                        } else if (trans[0] > tlast[0]) { // panning right
                            trans[0] = Math.min(trans[0], geoLeft);
                        }
                    } else {

                        if (trans[0] < geoLeft) {
                            trans[0] = geoLeft;
                        } else if (trans[0] > geoRight) {
                            trans[0] = geoRight;
                        }
                    }
                }

                setGeoTransform(scale, trans, animate);
            };
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////

            function clicked(d) {
                if (active.node() === this) {
                    return reset();
                }
                active.classed('active', false);
                active = d3.select(this).classed('active', true);

                var bounds = path.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = 0.9 / Math.max(dx / width, dy / height),
                    translate = [width / 2 - scale * x, height / 2 - scale * y];

                limitBounds(scale, translate, true);
            }
            function reset() {
                active.classed('active', false);
                active = d3.select(null);

                setGeoTransform(1, [0, 0], true);

                /*canvas.transition()
                    .duration(750)
                    .call(zoom.translate([0, 0]).scale(1).event);*/
            }


            function redraw() {
                width = document.getElementById('container').offsetWidth;
                height = width / 2;
                d3.select('svg').remove();
                setup(width, height);
                draw(topo);
            }
            function throttle() {
                window.clearTimeout(throttleTimer);
                throttleTimer = window.setTimeout(function () {
                    redraw();
                }, 200);
            }
            //geo translation on mouse click in map
            function click() {
                var latlon = projection.invert(d3.mouse(this));
                console.log(latlon);
            }

            // Sun calculations
            function antipode(position) {
                return [position[0] + 180, -position[1]];
            }

            function solarPosition(time) {
                var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
                    longitude = (d3.time.day.utc.floor(time) - time) / 864e5 * 360 - 180;
                return [
                    longitude - equationOfTime(centuries) * degrees,
                    solarDeclination(centuries) * degrees
                ];
            }

            // Equations based on NOAA’s Solar Calculator; all angles in radians.
            // http://www.esrl.noaa.gov/gmd/grad/solcalc/

            function equationOfTime(centuries) {
                var e = eccentricityEarthOrbit(centuries),
                    m = solarGeometricMeanAnomaly(centuries),
                    l = solarGeometricMeanLongitude(centuries),
                    y = Math.tan(obliquityCorrection(centuries) / 2);
                y *= y;
                return y * Math.sin(2 * l) - 2 * e * Math.sin(m) + 4 * e * y * Math.sin(m) * Math.cos(2 * l) - 0.5 * y * y * Math.sin(4 * l) - 1.25 * e * e * Math.sin(2 * m);
            }

            function solarDeclination(centuries) {
                return Math.asin(Math.sin(obliquityCorrection(centuries)) * Math.sin(solarApparentLongitude(centuries)));
            }

            function solarApparentLongitude(centuries) {
                return solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;
            }

            function solarTrueLongitude(centuries) {
                return solarGeometricMeanLongitude(centuries) + solarEquationOfCenter(centuries);
            }

            function solarGeometricMeanAnomaly(centuries) {
                return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;
            }

            function solarGeometricMeanLongitude(centuries) {
                var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
                return (l < 0 ? l + 360 : l) / 180 * π;
            }

            function solarEquationOfCenter(centuries) {
                var m = solarGeometricMeanAnomaly(centuries);
                return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) + Math.sin(m + m) * (0.019993 - 0.000101 * centuries) + Math.sin(m + m + m) * 0.000289) * radians;
            }

            function obliquityCorrection(centuries) {
                return meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;
            }

            function meanObliquityOfEcliptic(centuries) {
                return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;
            }

            function eccentricityEarthOrbit(centuries) {
                return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
            }

            // Events
            zoom = d3.behavior.zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([1, 9])
                .on('zoom', zoomed);

            function zoomed() {
                var e = d3.event,
                    scale = (e && e.scale) ? e.scale : zoom.scale(),
                    trans = (e && e.translate) ? e.translate : zoom.translate();

                limitBounds(scale, trans);
            }

            d3.select(window).on('resize', exports.throttle);

            // Init
            if(!svg) {
                exports.setup(this, size.width, size.height);
            }

            // Load world map
            d3.json('https://api.github.com/gists/1c5d429e6a944a288730', function (error, root) {

                var world = root.files['countries2.topo.json'].content;
                world = JSON.parse(world);
                var countries = topojson.feature(world, world.objects.countries).features;

                var collection = {
                    'type': 'FeatureCollection',
                    'features': countries
                };

                featureBounds = path.bounds(collection);

                // Calculate features bounding box
                var bbox = getFeaturesBox();
                var scale = 0.95 / Math.max(bbox.width / width, bbox.height / height);

                // set scale
                projection.scale(scale);

                draw(countries, _data);
            });
        });
    }
    ///////////////////////////////////////////////////////////////
    // Option accessors                                          //
    ///////////////////////////////////////////////////////////////
    exports.options = function(opt) {
        // Need deep copy !
        options = $.extend(true, {}, options, opt);
        return this;
    };
    exports.setup = function(element, width, height) {
        projection = d3.geo.miller()
            .translate([width / 2, height / 2 + 50])
            .scale(1)
            .precision(0.1);



        path = d3.geo.path().projection(projection);

        svg = d3.select(element)
            .append('svg')
            .attr('preserveAspectRatio', 'xMidYMid')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('width', '100%')
            .attr('height', '100%')
            .call(zoom)
            /*.on('click', function() {
                if (d3.event.defaultPrevented) {
                    d3.event.stopPropagation();
                }
            }, true)*/;

        canvas = svg.append('g').attr('class', 'canvas');
    };
    exports.zoom = function() {
        var currentZoom = zoom.scale();
        var newScale = Math.floor(currentZoom) + 1;
        console.log('zoom', currentZoom);
    };
    exports.click = function() {
        var event = d3.event;
        var latlon = projection.invert(d3.mouse(this));
        exports.addRoute(latlon, [-58.5201, -34.5309]);
        console.log(latlon);
    };
    exports.addRoute = function(origin, destination) {
        var addMarker = function(container, longitude, latitude, color) {
            var x = projection([longitude, latitude])[0];
            var y = projection([longitude, latitude])[1];
            var marker = container
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('class','point')
                .attr('r', 0)
                .style('fill', function(d){
                    return color || '#f03131';
                })
                .transition()
                .duration(1000)
                .attr('r', 8)
                .style('fill-opacity', 0)
                .each('end', function(){
                    this.remove();
                });
        };

        /*
        canvas.select('#ARG')
            .transition()
            .duration(1000)
            .style('fill', function(){
                var domain = color.domain();
                var c = domain[Math.floor(Math.random() * domain.length)];
                return color(c);
            });
        */

        // Draw Route
        var route = canvas.append('path')
            .datum({
                type: 'LineString',
                coordinates: [origin, destination] //exports.addRoute([-58.5201, -34.5309], [-74, 40.71])
            })
            .attr('class', 'route')
            .attr('d', path);

        var totalLength = route.node().getTotalLength();

        route
            .style('stroke-dasharray', totalLength + ' ' + totalLength)
            .style('stroke-dashoffset', totalLength)
            .style('stroke-linecap', 'round')
            .style('vector-effect', 'non-scaling-stroke')
            .style('stroke-width', 2)
            .style('stroke', function(d){
                return d.stroke || options.plotOptions.routes.fill;
            })
            .transition()
            .duration(1000)
            .ease('linear')
            .attr('stroke-dashoffset', 0)
            .each('end', function(){
                var color = d3.select(this).style('stroke');
                route
                    .transition()
                    .duration(1000)
                    .ease('linear')
                    .style('stroke-dashoffset', -totalLength)
                    .remove();
                    addMarker(canvas, destination[0], destination[1], color);
            });
    };
    exports.addLabel = function() {
        var label = svg.append('g').attr('class', 'label');
        var gradient = svg.append("svg:defs")
          .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", options.colorAxis.minColor)
            .attr("stop-opacity", 1);

        gradient.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", options.colorAxis.maxColor)
            .attr("stop-opacity", 1);

        console.log("options.colorAxis.maxColor: ", options.colorAxis.maxColor);
        label.append('rect')
            .attr('x', 0)
            .attr('y', height - options.chart.margin.bottom - 12)
            .attr('width', 180)
            .attr('height', 12)
            .style("fill", "url(#gradient)");

        label.append('text')
            .attr('x', 0)
            .attr('y', height - options.chart.margin.bottom - 13)
            .attr('class','label')
            .text('0%');
        label.append('text')
            .attr('x', 160)
            .attr('y', height - options.chart.margin.bottom - 13)
            .attr('class','label')
            .text('100%');
    };
    exports.addCircle = function(longitude, latitude, radius) {

        var gpoint = canvas.append('g').attr('class', 'gpoint');
        var x = projection([longitude, latitude])[0];
        var y = projection([longitude, latitude])[1];

        gpoint.append('svg:circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('class','point')
            .attr('r', 2);

        //conditional in case a point has no associated text
        if(text) {
            gpoint.append('text')
                .attr('x', x+2)
                .attr('y', y+2)
                .attr('class','text')
                .text(text);
        }
    };
    exports.addZoomBtns = function() {
        // Add Zoom Buttons
        var zoomBtnGroup = svg.append('g').attr('class', 'zoom-buttons');
        var zoomInGrp = zoomBtnGroup
            .append('g')
            .attr('class', 'zoom-in-grp');

        var zoomInBtn = zoomInGrp.append('rect')
            .attr('class', 'zoom-in-btn')
            .attr('x', 10)
            .attr('y', 10)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('width', 16)
            .attr('height', 16);

        zoomInGrp.append('text')
            .attr('fill','#fff')
            .attr('x', 14)
            .attr('y', 22)
            .text('+');

        zoomInGrp.on('click', function(event) {
            exports.zoom();
        });

        // Zoom Out
        var zoomOutGrp = zoomBtnGroup
            .append('g')
            .attr('class', 'zoom-out-grp');

        var zoomOutBtn = zoomOutGrp.append('rect')
            .attr('class', 'zoom-out-btn')
            .attr('x', 10)
            .attr('y', 30)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('width', 16)
            .attr('height', 16);

        zoomOutGrp.append('text')
            .attr('fill','#fff')
            .attr('x', 14)
            .attr('y', 42)
            .text('-');

        zoomInGrp.on('click', function(event) {
            exports.zoom();
        });
    };
    exports.width = function(_x) {
        if (!arguments.length) {
            return width;
        }
        width = parseInt(_x, 10);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) {
            return height;
        }
        height = parseInt(_x, 10);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
