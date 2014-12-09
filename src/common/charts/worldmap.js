/*jshint -W040*/

var charts = charts || {};

charts.worldmap = function module() {
    'use strict';

    var width = 500,
        height = 500,
        duration = 650,
        ease = 'cubic-in-out';
    var svg,
        canvas = null,
        projection = null,
        path = null,
        getFeaturesBox = null,
        featureBounds = null,
        zoom = null;

    var color = null;
    var tooltip = null;

    ///////////////////////////////////////////////////////////////////////////
    // Events                                                                //
    ///////////////////////////////////////////////////////////////////////////
    var dispatch = d3.dispatch('click', 'mouseover', 'mousemove', 'mouseout');

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
            enabled: false,
            enableButtons: false
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
                stroke: true,
                tooltip: {
                    enabled: true,
                    formatter: function (tick) {
                        return tick;
                    }
                }
            },
            routes: {
                stroke: '#348fe2'
            },
            markers: {
                fillOpacity: 0.75,
                fill: '#f00',
                radius: 10,
                minSize: 2,
                maxSize: 50
            }
        },
        legend: {
            enabled: true
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
        return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
    }
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            var graph = this;

            var size = {
                'width': width - options.chart.margin.left - options.chart.margin.right,
                'height': height - options.chart.margin.top - options.chart.margin.bottom
            };

            ///////////////////////////////////////////////////////////////////
            // Normalize Data                                                //
            ///////////////////////////////////////////////////////////////////
            Object.keys(_data).forEach(function(collections){
                _data[collections].forEach(function(collection){
                    collection.id = collection.id || guidGenerator();
                });
            });


            ///////////////////////////////////////////////////////////////////
            // Draw Features (contries, states, etc...)                      //
            ///////////////////////////////////////////////////////////////////
            function drawFeatures(features) {

                var country = canvas.selectAll('.country').data(features);

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
                    .style('fill', options.plotOptions.fill);

                    if(options.plotOptions.series.tooltip) {
                        country
                        .on('mousemove', function(data, i){

                            var mouse_x = d3.mouse(this)[0];
                            var mouse_y = d3.mouse(this)[1];

                            tooltip
                                .classed('hidden', false)
                                .html(options.plotOptions.series.tooltip.formatter('<span class="text">' + data.properties.name + ':</span> <span class="value">' + (data.properties.value || 0) + '</span>'))
                                .style('left', function(d){
                                    var bbox = this.getBoundingClientRect();
                                    return (mouse_x - bbox.width / 2) + 'px';
                                })
                                .style('top', function(d){
                                    var bbox = this.getBoundingClientRect();
                                    return (mouse_y - bbox.height - 15) + 'px';
                                });
                        })
                        .on('mouseout',  function(d,i) {
                            tooltip.classed('hidden', true);
                        })
                        .on('click', dispatch.click);
                    }
            }

            ///////////////////////////////////////////////////////////////////
            // Draw Markers (circles with coded information)                 //
            ///////////////////////////////////////////////////////////////////
            function drawMarkers(markers) {
                if(!markers) {
                    return false;
                }
                markers.forEach(function(marker, index) {
                    var g = canvas
                        .append('g')
                        .attr('class', 'markers')
                        .attr('id', 'markers-' + marker.id);
                    exports.updateMarkers(g, marker);
                });
            }

            ///////////////////////////////////////////////////////////////////
            // Draw Markers (circles with coded information)                 //
            ///////////////////////////////////////////////////////////////////
            function drawRoutes(routes) {
                if(!routes) {
                    return false;
                }
                routes.forEach(function(route, index) {
                    var g = canvas
                        .append('g')
                        .attr('class', 'routes')
                        .attr('id', 'routes-' + route.id);
                    exports.updateRoute(g, route);
                });
            }

            ///////////////////////////////////////////////////////////////////
            // Draw Regions with coded infromation (color)                   //
            ///////////////////////////////////////////////////////////////////
            function drawRegions(regions) {
                if(!regions) {
                    return false;
                }
                regions.forEach(function(region, index) {
                    exports.updateRegions(canvas, region);
                });
            }

            ///////////////////////////////////////////////////////////////////
            // Draw Regions with coded infromation (color)                   //
            ///////////////////////////////////////////////////////////////////
            function drawLabels(regions) {
                if(!regions) {
                    return false;
                }
                regions.forEach(function(region, index) {
                    var g = svg
                        .append('g')
                        .attr('class', 'labels')
                        .attr('id', 'labels-' + region.id)
                        .attr('transform', 'translate(10,' + -10 + ')');
                    exports.drawLegend(g, region);
                });

            }

            ///////////////////////////////////////////////////////////////////
            // Draw Regions with coded infromation (color)                   //
            ///////////////////////////////////////////////////////////////////
            function updateChart(data) {
                var result = null;
                result = data.regions ? data.regions.forEach(function(region, index) {
                    exports.updateRegions(canvas, region);
                }) : null;
                result = data.markers ? data.markers.forEach(function(marker, index) {
                    var g = canvas.select('#markers-' + marker.id);
                    exports.updateMarkers(g, marker);
                }) : null;
                result = data.routes ? data.routes.forEach(function(route, index) {
                    var g = canvas.select('#routes-' + route.id);
                    exports.updateRoute(g, route);
                }) : null;
                result = data.regions ? data.regions.forEach(function(region, index) {
                    var g = svg.select('#labels-' + region.id);
                    exports.drawLegend(g, region);
                }) : null;
            }


            getFeaturesBox = function (feature) {
                return {
                    x: feature[0][0],
                    y: feature[0][1],
                    width: feature[1][0] - feature[0][0],
                    height: feature[1][1] - feature[0][1]
                };
            };

            // Events
            zoom = d3.behavior.zoom().translate([0, 0]).scale(1).scaleExtent([1, 40]).on("zoom", function(){
                var t = d3.event.translate;
                var s = d3.event.scale;

                var w_max = 0;
                var w_min = width * (1 - s);
                var h_max = height < s*width/2 ? s*(width/2-height)/2 : (1-s)*height/2;
                var h_min = height < s*width/2 ? -s*(width/2-height)/2-(s-1)*height : (1-s)*height/2;

                t[0] = Math.min(w_max, Math.max(w_min, t[0]));
                t[1] = Math.min(h_max, Math.max(h_min, t[1]));

                zoom.translate(t);
                canvas.attr("transform", "translate(" + t + ")scale(" + s + ")");
                canvas.selectAll("path").style("stroke-width", 0.5 / s + "px");
            });

            function makeToolTip() {
                tooltip = d3.select(graph).append('div').attr("class", "tooltip hidden");
            }
            // Init
            if(!svg) {
                // Load world map
                projection = d3.geo.miller()
                    .translate([width / 2, height / 1.60])
                    .scale(1);

                path = d3.geo.path().projection(projection);

                svg = d3.select(this)
                    .append('svg')
                    .attr('preserveAspectRatio', 'xMidYMid meet')
                    .attr('viewBox', '0 0 ' + width + ' ' + height)
                    .attr('width', '100%')
                    .attr('height', '100%');

                if(options.mapNavigation.enabled) {
                    svg.call(zoom);
                }

                canvas = svg.append('g').attr('class', 'canvas');


                d3.json('https://api.github.com/gists/1c5d429e6a944a288730', function (error, root) {

                    var world = JSON.parse(root.files['countries2.topo.json'].content);
                    var features = topojson.feature(world, world.objects.countries).features;

                    var collection = {
                        'type': 'FeatureCollection',
                        'features': features
                    };

                    featureBounds = path.bounds(collection);

                    // Calculate features bounding box
                    var bbox = getFeaturesBox(featureBounds);
                    var scale = 0.965 / Math.max(bbox.width / width, bbox.height / height);

                    // [width / 2 - scale * bbox.x, height / 2 - scale * bbox.y]

                    // set scale
                    projection.scale(scale);
                    //projection.translate(translate);

                    // Draw map features
                    drawFeatures(features);

                    // Draw map data
                    drawRegions(_data.regions);
                    drawMarkers(_data.markers);
                    drawRoutes(_data.routes);

                    makeToolTip();

                    if(options.mapNavigation.enableButtons) {
                        projection.center([0, 0]);
                        exports.addZoomBtns();
                    }
                    if(options.legend.enabled) {
                        if(!_data.regions) {
                            return false;
                        }
                        drawLabels(_data.regions);
                    }

                    svg.call(zoom.event);

                });

            } else if (featureBounds) {
                updateChart(_data);
            }

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
                    addMarker(canvas, destination[0], destination[1], {
                        'fill': color
                    });
            });
    };
    exports.drawLegend = function(element, region) {
        var color = d3.scale.linear()
            .interpolate(d3.interpolateRgb)
            .domain([0, 10])
            .range([region.minColor || options.colorAxis.minColor, region.maxColor || options.colorAxis.maxColor]);

        var tick = {
            width: 16,
            height: 16
        };
        element.select('#legenda').remove();
        // create a new group with the specific base color and add the lower value
        element.append('g')
                .attr('id', 'legenda');
        // add the various blocks of the legenda
        element.select('#legenda').selectAll('rect')
            .data(d3.range(0, 10))
            .enter()
            .append('rect')
                .attr('x', function (d, i) {
                    return i * tick.width;
                })
                .attr('y', height - tick.height)
                .attr('width', tick.width)
                .attr('height', tick.height)
                .style('fill', function(d, i){
                    return color(i);
                });

        // add a text element
        element.select('#legenda')
            .append('text')
                .attr('x', 0)
                .attr('y', height - (tick.height + 5))
                .text('Min: ' + (d3.min(region.data, function(d){
                    return d.value;
                }) || 0));
        element.select('#legenda')
            .append('text')
                .attr('y', height - (tick.height + 5))
                .style('text-anchor','left')
                .text('Max: ' + (d3.max(region.data, function(d){
                    return d.value;
                }) || 0))
                .attr('x', function(d){
                    var box = {
                        w: this.getBoundingClientRect().width,
                        h: this.getBoundingClientRect().height
                    };
                    return (color.domain()[1] * tick.width) - box.w;
                });
    };

    exports.updateLabels = function(container, collection) {

        var gradient = svg.append('svg:defs')
          .append('svg:linearGradient')
            .attr('id', 'gradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%')
            .attr('spreadMethod', 'pad');

        gradient.append('svg:stop')
            .attr('offset', '0%')
            .attr('stop-color', collection.minColor || options.colorAxis.minColor)
            .attr('stop-opacity', 1);

        gradient.append('svg:stop')
            .attr('offset', '100%')
            .attr('stop-color', collection.maxColor || options.colorAxis.maxColor)
            .attr('stop-opacity', 1);

        container.append('rect')
            .attr('x', 0)
            .attr('y', height - 12)
            .attr('width', 180)
            .attr('height', 12)
            .style('fill', 'url(#gradient)');

        container.append('text')
            .attr('x', 0)
            .attr('y', height - 12)
            .attr('class','label')
            .text(d3.min(collection.data, function(d){
                return d.value;
            }));
        container.append('text')
            .attr('x', 160)
            .attr('y', height - 12)
            .attr('class','label')
            .style('text-anchor','left')
            .text(d3.max(collection.data, function(d){
                return d.value;
            }));
    };
    exports.updateRegions = function(container, regions) {
        var color = d3.scale.linear()
            .interpolate(d3.interpolateRgb)
            .domain([d3.min(regions.data, function(data){
                return data.value;
            }), d3.max(regions.data, function(data){
                return data.value;
            })])
            .range([regions.minColor || options.colorAxis.minColor, regions.maxColor || options.colorAxis.maxColor]);

        var countries = canvas.selectAll('.country');

        regions.data.forEach(function(data){
            var country = countries.filter(function(country){
                return country.id == data.key;
            })[0];
            if(country) {
                // Decorate geoJSON witn value
                var info = d3.select(country[0]).data()[0];
                if(info) {
                    info.properties.value = data.value;
                }
                d3.select(country[0])
                .style('fill', function(d) {
                    return color(data.value || 0);
                });
            }
        });
    };
    exports.updateRoute = function(container, route) {
        if(route.data.length < 1){
            return;
        }
        var routePath = container.append('path')
            .datum({
                type: 'LineString',
                coordinates: [route.data[0], route.data[1]] //exports.addRoute([-58.5201, -34.5309], [-74, 40.71])
            })
            .attr('class', 'route')
            .attr('d', path);

        var totalLength = routePath.node().getTotalLength();

        routePath
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
                routePath
                    .transition()
                    .duration(1000)
                    .ease('linear')
                    .style('stroke-dashoffset', -totalLength)
                    .remove();
                    hitTarget(canvas, route.data[1][0], route.data[1][1], {
                        'fill': color
                    });
            });
        function hitTarget(container, longitude, latitude, css) {
            var x = projection([longitude, latitude])[0];
            var y = projection([longitude, latitude])[1];

            var marker = container
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('class','point')
                .attr('r', 0)
                .style(css)
                .transition()
                .duration(1000)
                .attr('r', 8)
                .style('fill-opacity', 0)
                .each('end', function(){
                    this.remove();
                });
        }
    };
    exports.updateMarkers = function(container, markers) {

        var color = d3.scale.linear()
            .interpolate(d3.interpolateRgb)
            .domain([d3.min(markers.data, function(data){
                return data.value;
            }), d3.max(markers.data, function(data){
                return data.value;
            })])
            .range([markers.minColor || options.colorAxis.minColor, markers.maxColor || options.colorAxis.maxColor]);

        var radius = d3.scale.linear()
            .domain([d3.min(markers.data, function(data){
                return data.value;
            }), d3.max(markers.data, function(data){
                return data.value;
            })])
            .range([markers.minSize || options.plotOptions.markers.minSize, markers.maxSize || options.plotOptions.markers.maxSize]);


        // DATA JOIN
        // Join new data with old elements, if any.
        var dots = container
            .selectAll('circle')
            .data(markers.data);

        // UPDATE
        // Update old elements as needed.
        dots.attr('class', 'update');

        // ENTER
        // Create new elements as needed.
        dots.enter().append('circle')
            .attr('cx', function(d){
                return projection([d.longitude, d.latitude])[0];
            })
            .attr('cy', function(d){
                return projection([d.longitude, d.latitude])[1];
            })
            .attr('r', 0)
            .style('fill-opacity', 0);

        // ENTER + UPDATE
        // Appending to the enter selection expands the update selection to include
        // entering elements; so, operations on the update selection after appending to
        // the enter selection will apply to both entering and updating nodes.
        dots
            .transition()
            .duration(1000)
            .attr('r', function(d){
                return radius(d.value);
            })
            .style('fill', function(d){
                return color(d.value);
            })
            .style('fill-opacity', markers.fillOpacity || options.plotOptions.markers.fillOpacity);

        // EXIT
        // Remove old elements as needed.
        dots.exit().transition().style({opacity: 0}).remove();
    };
    exports.addZoomBtns = function() {
        // Add Zoom Buttons
        var button = {
            width: 16,
            height: 16
        };
        function handleZoom(factor) {
            // Calculate features bounding box
            var bbox = getFeaturesBox(featureBounds);
            var scale = zoom.scale();

            if(factor > 0) {
                scale = (scale + factor) < d3.max(zoom.scaleExtent()) ? Math.round(scale + factor) : d3.max(zoom.scaleExtent());
            } else {
                scale = (scale - Math.abs(factor)) > d3.min(zoom.scaleExtent()) ? Math.round(scale - Math.abs(factor)) : d3.min(zoom.scaleExtent());
            }

            svg.transition()
                .duration(750)
                .call(zoom.translate([width / 2 - scale * bbox.x, height / 1.60 - scale * bbox.y]).scale(scale).event);
        }

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
            .attr('width', button.width)
            .attr('height', button.height);

        zoomInGrp.append('text')
            .attr('fill','#fff')
            .attr('x', 14)
            .attr('y', 22)
            .text('+');

        zoomInGrp.on('click', function(event) {
            handleZoom(1);
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
            .attr('width', button.width)
            .attr('height', button.height);

        zoomOutGrp.append('text')
            .attr('fill','#fff')
            .attr('x', 14)
            .attr('y', 42)
            .text('-');

        zoomOutGrp.on('click', function(event) {
            handleZoom(-1);
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
    exports.resize = function(width, height) {
        svg.attr('viewBox', '0 0 ' + width + ' ' + height);
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};

