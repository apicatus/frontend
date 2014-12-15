var charts = charts || {};

charts.packing = function module() {
    'use strict';

    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 500,
        height = 500,
        gap = 0,
        color = null,
        ease = 'cubic-in-out';
    var svg, pathContainer = null, duration = 650;
    var pack = null;

    ///////////////////////////////////////////////////////////////////////////
    // Events                                                                //
    ///////////////////////////////////////////////////////////////////////////
    var dispatch = d3.dispatch('click', 'mouseover', 'mousemove', 'mouseout');

    var coloretes = ['#a00040', '#d73c4c', '#f66d39', '#ffaf5a', '#fee185', '#feffbb', '#e6f693', '#abdea3', '#63c4a5', '#2c87be'];

    var options = {
        chart: {
            type: 'packing',
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            tooltip: {
                enabled: false
            }
        },
        plotOptions: {
            fillOpacity: 0.5,
            series: {
                animation: false,
                units: null,
                stroke: true,
                labels: {
                    formatter: function (tick) {
                        return tick;
                    }
                }
            }
        },
        colorAxis: {
            minColor: '#616D7D',
            maxColor: '#00acac',
            stops: [
                [100, '#2c87be'],
                [200, '#2c87be'],
                [300, '#63c4a5'],
                [400, '#CF5AFF'],
                [500, '#ffaf5a'],
                [600, '#a00040']
            ]
        }
    };
    function exports(_selection) {
        _selection.each(function(_data) {
            var graph = this;
            if(!_data) {
                return;
            }
            function draw(data) {
                var size = {
                    'width': width - options.chart.margin.left - options.chart.margin.right,
                    'height': height - options.chart.margin.top - options.chart.margin.bottom
                };

                if(options.colorAxis.stops) {
                    color = d3.scale.threshold()
                        .domain(options.colorAxis.stops.map(function(threshold){
                            return threshold[0];
                        }))
                        .range(options.colorAxis.stops.map(function(threshold){
                            return threshold[1];
                        }));
                } else {
                    color = d3.scale.category10();
                }

                /*data = {
                    name: 'miApi',
                    children: [
                        {name: '/var', doc_count: 1000},
                        {name: '/pepe', doc_count: 2000},
                        {name: '/anan', doc_count: 3500},
                        {name: '/tony', doc_count: 3900},
                        {name: '/moco', doc_count: 800},
                        {
                            name: '/steve',
                            "children": [
                              {"name": "ArrayInterpolator", "doc_count": 1983},
                              {"name": "ColorInterpolator", "doc_count": 2047},
                              {"name": "DateInterpolator", "doc_count": 1375},
                              {"name": "Interpolator", "doc_count": 8746},
                              {"name": "MatrixInterpolator", "doc_count": 2202},
                              {"name": "NumberInterpolator", "doc_count": 1382},
                              {"name": "ObjectInterpolator", "doc_count": 1629},
                              {"name": "PointInterpolator", "doc_count": 1675},
                              {"name": "RectangleInterpolator", "doc_count": 2042}
                             ]
                        }
                    ]
                };*/
                /*data = [{
                    name: 'miApi',
                    children: [
                        {name: '/var', doc_count: 1000},
                        {name: '/pepe', doc_count: 2000},
                        {name: '/anan', doc_count: 3500},
                        {name: '/tony', doc_count: 3900},
                        {name: '/moco', doc_count: 800},
                        {
                            name: '/steve',
                            "children": [
                              {"name": "ArrayInterpolator", "doc_count": 1983},
                              {"name": "ColorInterpolator", "doc_count": 2047},
                              {"name": "DateInterpolator", "doc_count": 1375},
                              {"name": "Interpolator", "doc_count": 8746},
                              {"name": "MatrixInterpolator", "doc_count": 2202},
                              {"name": "NumberInterpolator", "doc_count": 1382},
                              {"name": "ObjectInterpolator", "doc_count": 1629},
                              {"name": "PointInterpolator", "doc_count": 1675},
                              {"name": "RectangleInterpolator", "doc_count": 2042}
                             ]
                        }
                    ]
                }, {
                    name: 'Cosos',
                    children: [
                        {name: '/var', doc_count: 1000},
                        {
                            name: '/steve',
                            "children": [
                              {"name": "ArrayInterpolator", "doc_count": 1983},
                              {"name": "ColorInterpolator", "doc_count": 2047}
                             ]
                        }
                    ]
                }
                ];*/

                pack = d3.layout.pack()
                    .size([
                        d3.min([size.width / data.length, size.height]),
                        d3.min([size.width / data.length, size.height])
                    ])
                    .value(function(d) {
                        if(d.stats && d.stats.doc_count) {
                            return d.stats.doc_count;
                        } else {
                            return 1;
                        }
                        //return d.stats.doc_count || 0;
                    });
                // Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("preserveAspectRatio", "xMidYMid")
                        .attr("viewBox", "0 0 " + size.width + " " + size.height)
                        .attr("width", "100%")
                        .attr("height", "100%");

                    pathContainer = svg.append("g");
                }
                var nodes = pathContainer.selectAll('.nodes')
                    .data(data)
                    .enter()
                    .append('g')
                    .attr('class', 'nodes')
                    .attr("transform", function(d, i) {
                        var x = d3.min([(size.width / data.length), size.height]);
                        var remaining = size.width - (x * data.length);
                        x = x * i + ((remaining / 2) * data.length);
                        return "translate(" + x + ", 0) scale(1)";
                    });

                var node = nodes.selectAll('.node')
                    .data(function(d){
                        return pack.nodes(d);
                    })
                    .enter()
                    .append('g')
                    .attr("class", function(d) {
                        return d.children ? "node" : "leaf node";
                    })
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                node.append("title")
                    .style('fill', '#fff')
                    .text(function(d) {
                        return d.name + (d.children ? "" : ": " + d3.format(",d")(d.value));
                    });

                node.append("circle")
                    .style('fill', function(d){
                        return d.color || '#ccc';
                    })
                    .style('stroke', function(d){
                        return d.color || '#ccc';
                    })
                    .attr("r", function(d) {
                        return d.r || 0;
                    });

                node.filter(function(d) { return !d.children; }).append("text")
                    .style('fill', '#fff')
                    .style("text-anchor", "middle")
                    .style("font-size", "1em")
                    .text(function(d) {
                        return d.name.substring(0, d.r / 3);
                    })
                    .style('font-size', function (d) {
                        var box = {
                            w: this.parentNode.getBoundingClientRect().width,
                            h: this.parentNode.getBoundingClientRect().height
                        };
                        var size = ((box.w / this.clientWidth) - 0.5);
                        return d3.min([size > 1 ? size : 1, 3]) + 'em';
                    })
                    .attr('y', '0em');
                node.filter(function(d) { return !d.children; }).append("text")
                    .attr('y', '1em')
                    .style('fill', '#fff')
                    .style('font-weight', 'bold')
                    .style("text-anchor", "middle")
                    .text(function(d) {
                        return (d.stats) ? d3.format(',d')(d.value) : 0;
                    })
                    .style("font-size", function (d) { return ((d.r / 50)) + "em"; });
            }
            draw(angular.copy(_data));
        });
    }
    exports.options = function(opt) {
        options = $.extend(true, {}, options, opt);
        return this;
    };
    exports.width = function(w) {
        if (!arguments.length) {
            return width;
        }
        width = parseInt(w, 10);
        return this;
    };
    exports.height = function(h) {
        if (!arguments.length) {
            return height;
        }
        height = parseInt(h, 10);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
