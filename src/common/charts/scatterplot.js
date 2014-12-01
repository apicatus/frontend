///////////////////////////////////////////////////////////////////////////////
// @file         : multiline.js                                              //
// @summary      : D3 Multiline Chart                                        //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : D3 Multiline for apicatus UI                              //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 15 Nov 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

var charts = charts || {};

charts.scatterplot = function module() {
    'use strict';

    var width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg,
        pathContainer = null,
        needleContainer = null,
        markersContainer = null,
        axesContainer = null,
        gridContainer = null,
        labelsContainer = null,
        duration = 650,
        tooltip = null;

    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');

    var coloretes = ['#a00040', '#d73c4c', '#f66d39', '#ffaf5a', '#fee185', '#feffbb', '#e6f693', '#abdea3', '#63c4a5', '#2c87be'];
    ///////////////////////////////////////////////////////////////////////////
    // Default chart options                                                 //
    ///////////////////////////////////////////////////////////////////////////
    var options = {
        chart: {
            type: 'scatter',
            margin: {top: 20, right: 20, bottom: 30, left: 35},
            tooltip: {
                enabled: false
            }
        },
        plotOptions: {
            fillOpacity: 0.5,
            series: {
                animation: false,
                units: null,
                tracking: true,
                makers: true
            },
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            ticks: 4,
            labels: {
                formatter: timeToString
            }
        },
        xAxis: {
            title: {
                text: ''
            },
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: {
                formatter: function (tick) {
                }
            }
        },
        xGrid: {
            enabled: false
        },
        yGrid: {
            enabled: true
        }
    };
    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
    function timeToString(milliseconds) {

        var temp = Math.floor(milliseconds / 1000);

        var years = Math.floor(temp / 31536000);
        if (years) {
            return years + 'y';
        }
        var weeks = Math.floor((temp %= 31536000) / 604800);
        if (weeks) {
            return weeks + 'w';
        }
        var days = Math.floor((temp %= 31536000) / 86400);
        if (days) {
            return days + 'd';
        }
        var hours = Math.floor((temp %= 86400) / 3600);
        if (hours) {
            return hours + 'h';
        }
        var minutes = Math.floor((temp %= 3600) / 60);
        if (minutes) {
            return minutes + 'm';
        }
        var seconds = temp % 60;
        if (seconds) {
            return seconds + 's';
        }
        return milliseconds + 'ms';
    }

    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data || _data.length < 0) {
                return;
            }
            var graph = this;

            // Clean all
            d3.select(graph).select('svg').remove();
            svg = null;

            function draw(data) {
                var size = {
                    'width': width - options.chart.margin.left - options.chart.margin.right,
                    'height': height - options.chart.margin.top - options.chart.margin.bottom
                };
                data.forEach(function(item) {
                    // Assign default id
                    item.id = item.id || guidGenerator();
                    // Sort X value
                    item.data.sort(function (a,b) {
                        if (a[0] < b[0]) {
                            return -1;
                        }
                        if (a[0] > b[0]) {
                            return 1;
                        }
                        return 0;
                    });
                    // Transform
                    item.data = item.data.map(function(value, index){
                        return {
                            id: item.id,
                            x: value[0],
                            y: value[1],
                            r: value[2] || options.plotOptions.scatter.marker.radius,
                            fill: item.fill  || null,
                            stroke: item.stroke || 'none'
                        };
                    });
                    // Visibility F()
                    item.setVisible = function (toggle) {
                        alert('invisible !');
                    };
                });
                // Colors to id's
                var color = d3.scale.ordinal()
                .domain(data.map(function(ids){
                    return ids.id;
                }))
                .range(coloretes);

                ///////////////////////////////////////////////////////////////
                // Bisector                                                  //
                ///////////////////////////////////////////////////////////////
                var bisect = d3.bisector(function(d) {
                    return d.x;
                }).left;

                ///////////////////////////////////////////////////////////////
                // X Scale                                                   //
                ///////////////////////////////////////////////////////////////
                var xScale = d3.scale.linear()
                    //.domain(d3.extent(data[0].data, function(d) { return d.x; }))
                    .domain([
                        d3.min(data, function(d) {
                            return d3.min(d.data, function(item) {
                                return item.x;
                            });
                        }),
                        d3.max(data, function(d) {
                            return d3.max(d.data, function(item) {
                                return item.x;
                            });
                        })
                    ])
                    //.nice()
                    .rangeRound([0, size.width]);

                ///////////////////////////////////////////////////////////////
                // Y Scale                                                   //
                ///////////////////////////////////////////////////////////////
                var yScale = d3.scale.linear()
                    //.domain(d3.extent(data[0].data, function(d) { return d.y; }))
                    .domain([
                        d3.min(data, function(d) {
                            return d3.min(d.data, function(item) {
                                return item.y;
                            });
                        }),
                        d3.max(data, function(d) {
                            return d3.max(d.data, function(item) {
                                return item.y;
                            });
                        })
                    ])
                    .nice()
                    .range([size.height, 0]);

                ///////////////////////////////////////////////////////////////
                // X Axis                                                    //
                ///////////////////////////////////////////////////////////////
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');

                ///////////////////////////////////////////////////////////////
                // Y Axis                                                    //
                ///////////////////////////////////////////////////////////////
                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(options.yAxis.ticks)
                    .tickPadding(5)
                    .orient('left')
                    .tickFormat(options.yAxis.labels.formatter);


                ///////////////////////////////////////////////////////////////
                // Create SVG element                                        //
                ///////////////////////////////////////////////////////////////
                if(!svg) {
                    svg = d3.select(graph)
                        .append('svg')
                        .attr('preserveAspectRatio', 'xMidYMid')
                        .attr('viewBox', '0 0 ' + width + ' ' + height)
                        .attr('width', '100%')
                        .attr('height', '100%');

                    axesContainer = svg.append('g')
                        .attr('class', 'axes')
                        .attr('transform', 'translate(' + options.chart.margin.left + ',' + options.chart.margin.top + ')');
                    gridContainer = svg.append('g')
                        .attr('class', 'grids');
                    // Make Path Container
                    pathContainer = svg.append('g')
                        .attr('transform', 'translate(' + options.chart.margin.left + ',' + options.chart.margin.top + ')');

                    needleContainer = svg.append('g')
                        .attr('class', 'needle')
                        .attr('transform', 'translate(' + options.chart.margin.left + ',' + options.chart.margin.top + ')')
                        .style('opacity', 0);

                    labelsContainer = svg.append('g')
                        .attr('class', 'labels')
                        .attr('transform', 'translate(' + options.chart.margin.left + ',' + options.chart.margin.top + ')');

                    drawLabels(labelsContainer);
                    // Draw Needle
                    if(options.plotOptions.series.tracking) {
                        drawNeedle(needleContainer);
                    }

                    // Tooltip
                    d3.select('body').selectAll('chart-tooltip').remove();

                    if(options.chart.tooltip.enabled) {
                        tooltip = d3.select('body').append('div')
                        .attr('class', 'chart-tooltip')
                        .style('opacity', 0.5);
                    }
                }

                drawGrid(gridContainer, xScale, yScale);
                drawAxes(axesContainer);

                ///////////////////////////////////////////////////////////////
                // Axes                                                      //
                ///////////////////////////////////////////////////////////////
                function drawAxes (axesContainer) {
                    // Clean all
                    axesContainer.selectAll('.axis').remove();
                    // xAxis
                    axesContainer.append('g')
                        .attr('class', 'x axis')
                        .attr('transform', 'translate(0,' + size.height + ')')
                        .call(xAxis);
                    // yAxis
                    axesContainer.append('g')
                        .attr('class', 'y axis')
                        .call(yAxis);

                    axesContainer.selectAll('.tick')
                        .filter(function (d) { return d === 0;  })
                        .remove();
                }

                ////////////////////////////////////////////////////////////
                // Draw Labels                                            //
                ////////////////////////////////////////////////////////////
                function drawLabels(labelsContainer) {
                    // xAxis Label
                    var text = null;

                    labelsContainer.append('text')
                        .attr('class', 'label')
                        .attr('x', size.width)
                        .attr('y', size.height - 10)
                        .attr('text-anchor', 'middle')
                        .style('text-anchor', 'end')
                        .text(options.xAxis.title.text);

                    labelsContainer.append('text')
                        .attr('class', 'label')
                        .attr('transform', 'rotate(-90)')
                        .attr('y', 6)
                        .attr('dy', '.71em')
                        .style('text-anchor', 'end')
                        .text(options.yAxis.title.text);
                }

                ////////////////////////////////////////////////////////////
                // Grid                                                   //
                ////////////////////////////////////////////////////////////
                function drawGrid (gridContainer, xScale, yScale) {
                    var xGrid, yGrid;

                    // Clean all
                    gridContainer.selectAll('.grid').remove();

                    if(options.xGrid.enabled) {
                        xGrid = d3.svg.axis()
                            .scale(xScale)
                            .ticks(options.yAxis.ticks)
                            .tickSize(size.height, 0, 0)
                            .tickFormat('');
                        gridContainer.append('g')
                            .attr('class', 'x axis grid')
                            .call(xGrid);
                    }
                    if(options.yGrid.enabled) {
                        yGrid = d3.svg.axis()
                            .scale(yScale)
                            .ticks(options.yAxis.ticks)
                            .tickSize(-(size.width), 0, 0)
                            .tickPadding(5)
                            .orient('right')
                            .tickFormat('');
                        gridContainer.append('g')
                            .attr('class', 'y axis grid')
                            .attr('transform', 'translate(' + (size.width + options.chart.margin.left) + ',' + options.chart.margin.top + ')')
                            .call(yGrid);
                    }
                }

                ////////////////////////////////////////////////////////////
                // Dial needle on top of everything                       //
                ////////////////////////////////////////////////////////////
                function drawNeedle (needleContainer) {

                    var surface = needleContainer.append('rect')
                        .attr('x', 0)
                        .attr('y', 0)
                        .attr('width', size.width)
                        .attr('height', size.height)
                        .style({
                            'fill': '#fff',
                            'fill-opacity': 0
                        });

                    var hoverLine = needleContainer
                            .append('line')
                            .attr('x1', 0)
                            .attr('x2', 0)
                            .attr('y1', 0)
                            .attr('y2', size.height)
                            .style('stroke', '#444');
                    var hoverDate = needleContainer.append('text')
                        .attr('class', 'hover-text')
                        .attr('y', height - 10);

                    // Add circles
                    // var circles = addTrackerMarkers(needleContainer, data);

                    // Events
                    surface.on('mousemove', needleMove).on('mouseout', needleLeave);

                    // Handlers
                    function needleMove(event) {
                        /*jshint validthis:true */
                        var mouse_x = d3.mouse(this)[0];
                        var graph_x = xScale.invert(mouse_x);

                        needleContainer.transition().duration(100).style('opacity', 1);

                        data.forEach(function(metric, index) {

                            var i = bisect(metric.data, graph_x, 1);
                            var d0 = metric.data[i - 1];
                            var d1 = metric.data[i];
                            var d = graph_x - d0.x > d1.x - graph_x ? d1 : d0;


                            var dots = metric.data.filter(function(dot){
                                return dot.x === d.x;
                            });

                            hoverLine.attr('x1', xScale(graph_x)).attr('x2', xScale(graph_x));

                            d3.select(d.dot.parentElement).selectAll('.dot')
                                .transition()
                                .duration(75)
                                .attr('r', options.plotOptions.scatter.marker.radius)
                                .style('fill-opacity', options.plotOptions.fillOpacity)
                                .style('stroke', 'none');

                            dots.forEach(function(circle){
                                var node = circle.dot;
                                d3.select(node)
                                    .transition()
                                    .duration(75)
                                    .attr('r', options.plotOptions.scatter.marker.radius * 2)
                                    .style('fill-opacity', 1)
                                    .style('stroke', node.style.fill)
                                    .style('stroke-width', 4)
                                    .style('stroke-opacity', 0.5);
                            });
                        });
                    }
                    function needleLeave() {
                        needleContainer.transition().duration(1500).style('opacity', 0);
                        d3.select(graph).selectAll('.dot')
                            .transition()
                            .duration(75)
                            .attr('r', options.plotOptions.scatter.marker.radius)
                            .style('fill-opacity', options.plotOptions.fillOpacity)
                            .style('stroke', 'none');
                    }
                }

                ////////////////////////////////////////////////////////////
                // BELOW PROGRAMATIC STUFF ONLY                           //
                ////////////////////////////////////////////////////////////

                // Cean Paths
                pathContainer.selectAll('.scatter').remove();

                var scatter = pathContainer.selectAll('.scatter')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('class', 'dots');
                var dots = scatter.selectAll('.dots')
                    .data(function(d) {
                        return d.data;
                    })
                    .enter();

                dots.append('circle')
                    .attr('class', 'dot')
                    .attr('id', function(d){
                        d.dot = this;
                        return d.id;
                    })
                    .attr('r', function(d) {
                        return d.r;
                    })
                    .attr('cx', function(d) {
                        return xScale(d.x);
                    })
                    .attr('cy', function(d) {
                        return yScale(d.y);
                    })
                    .style('fill', function(d) {
                        return d.fill || color(d.id);
                    })
                    .style('stroke', function(d) {
                        return d.stroke || color(d.id);
                    })
                    .style('fill-opacity', options.plotOptions.fillOpacity);

            }
            ///////////////////////////////////////////////////////////////
            // Execute draw                                              //
            ///////////////////////////////////////////////////////////////
            draw(angular.copy(_data));
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
    exports.toPNG = function() {
        console.log(svg.node());
        var node = svg.node();
        var svgSize = node.getBoundingClientRect();
        var svgData = new XMLSerializer().serializeToString( node );
        var canvas = document.createElement( 'canvas' );

        canvas.width = svgSize.width;
        canvas.height = svgSize.height;

        var ctx = canvas.getContext( '2d' );

        var img = document.createElement( 'img' );
        img.setAttribute( 'src', 'data:image/svg+xml;base64,' + btoa( svgData ) );

        img.onload = function() {
            ctx.drawImage( img, 0, 0 );

            var link = document.createElement('a');
            link.download = 'filename.png';
            link.href = canvas.toDataURL( 'image/png' );
            link.target = '_self';

            document.body.appendChild(link);

            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);

        };
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
