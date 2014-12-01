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

charts.multiline = function module() {
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
            type: 'area',
            margin: {top: 20, right: 20, bottom: 30, left: 35},
            tooltip: {
                enabled: false
            }
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 0.5,
            area: {
                stacking: 'normal'
            },
            series: {
                animation: false,
                pointInterval: 24 * 3600 * 1000, // one day
                pointStart: new Date().getTime(),
                units: null,
                tracking: true,
                makers: true,
                stroke: true
            }
        },
        yAxis: {
            ticks: 6,
            labels: {
                formatter: function(tick) {
                    var sign = (tick < 0) ? '-' : '';
                    tick = Math.abs(tick);
                    if(tick < 1000) {
                        return tick || 0;
                    }
                    var si = ['K', 'M', 'G', 'T', 'P', 'H'];
                    var exp = Math.floor(Math.log(tick) / Math.log(1000));
                    var result = tick / Math.pow(1000, exp);
                    result = (result % 1 > (1 / Math.pow(1000, exp - 1))) ? result.toFixed(2) : result.toFixed(0);
                    return isNaN(result) ? 0 : sign + result + si[exp - 1];
                }
            }
        },
        xAxis: {
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
                var color = d3.scale.category10();
                color.domain(d3.keys(data).filter(function(key) { return key !== 'date'; }));

                if(options.plotOptions.area.stacking == 'percent') {
                    var arrSum = data.map(function(serie) {
                        return serie.data.map(function(value, index){
                            return data.reduce(function(previous, current){
                                return previous + current.data[index] || 0;
                            }, 0);

                        });
                    });
                }

                // Put Dates
                data.forEach(function(item, i) {
                    // Assign default id
                    item.id = item.id || guidGenerator();
                    item.data = item.data.map(function(value, index) {
                        return {
                            date: new Date(options.plotOptions.series.pointStart + (options.plotOptions.series.pointInterval * index)), //options.plotOptions.pointStart + (options.plotOptions.pointInterval * index),
                            value: value,
                            stroke: item.stroke,
                            fill: item.fill
                        };
                    });
                    item.setVisible = function (toggle) {
                        alert('invisible !');
                    };
                });

                var dateStart = options.plotOptions.series.pointStart;
                var dateEnd = options.plotOptions.series.pointStart + options.plotOptions.series.pointInterval * (data[0].data.length - 1);
                var daySpan = Math.round((dateEnd - dateStart) / (1000 * 60 * 60 * 24));

                var ticks, subs;

                if (daySpan === 1) {
                    ticks = 3;
                    subs = 6;
                } else if (daySpan === 7) {
                    ticks = 4;
                    subs = 1;
                } else {
                    ticks = 4;
                    subs = 6;
                }

                ///////////////////////////////////////////////////////////////
                // Bisector                                                  //
                ///////////////////////////////////////////////////////////////
                var bisect = d3.bisector(function(d) {
                    return d.date;
                }).left;

                ///////////////////////////////////////////////////////////////
                // X Scale                                                   //
                ///////////////////////////////////////////////////////////////
                var xScale = d3.time.scale()
                    .domain([new Date(options.plotOptions.series.pointStart), new Date(dateEnd)])
                    .rangeRound([0, size.width]);

                ///////////////////////////////////////////////////////////////
                // Y Scale                                                   //
                ///////////////////////////////////////////////////////////////
                var yScale = d3.scale.linear()
                    .range([size.height, 0]);

                ///////////////////////////////////////////////////////////////
                // X Axis                                                    //
                ///////////////////////////////////////////////////////////////
                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .tickFormat(function(d) {
                        if (daySpan <= 1) {
                            return d3.time.format('%H:%M')(d).replace(/\s/, '').replace(/^0/, '');
                        } else {
                            return d3.time.format('%m/%d')(d).replace(/\s/, '').replace(/^0/, '').replace(/\/0/, '/');
                        }
                    });

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
                // Stacked area                                              //
                ///////////////////////////////////////////////////////////////
                var stack = d3.layout.stack()
                    .offset('zero')
                    .values(function(d) {
                        return d.data;
                    })
                    .x(function(d) {
                        return d.date;
                    })
                    .y(function(d) {
                        return d.value;
                    });

                var layers = stack(data);

                ///////////////////////////////////////////////////////////////
                // Domain Scales                                             //
                ///////////////////////////////////////////////////////////////
                switch(options.chart.type) {
                    case 'area':
                        yScale.domain([0,
                            d3.max(data, function(d) {
                                return d3.max(d.data, function(d) {
                                    return d.y0 + d.y;
                                });
                            })
                        ]);
                    break;
                    case 'line':
                        yScale.domain([
                            d3.min(data, function(d) {
                                return d3.min(d.data, function(item) {
                                    return item.value;
                                });
                            }),
                            d3.max(data, function(d) {
                                return d3.max(d.data, function(item) {
                                    return item.value;
                                });
                            })
                        ]);
                    break;
                    case 'bivariate':
                        yScale.domain([
                            d3.min(data, function(d) {
                                return d3.min(d.data, function(item) {
                                    return item.value[0];
                                });
                            }),
                            d3.max(data, function(d) {
                                return d3.max(d.data, function(item) {
                                    return item.value[1];
                                });
                            })
                        ]);
                    break;
                }

                ///////////////////////////////////////////////////////////////
                // Area                                                      //
                ///////////////////////////////////////////////////////////////
                var area = d3.svg.area()
                    .interpolate(options.plotOptions.interpolate)
                    .x(function(d) {
                        return xScale(d.date);
                    })
                    .y0(function(d) {
                        return yScale(d.y0);
                    })
                    .y1(function(d) {
                        return yScale(d.y0 + d.y);
                    });

                ///////////////////////////////////////////////////////////////
                // Range (bivariate)                                         //
                ///////////////////////////////////////////////////////////////
                var bivariate = d3.svg.area()
                    .x(function(d) {
                        return xScale(d.date);
                    })
                    .y0(function(d) {
                        return yScale(d.value[0]);
                    })
                    .y1(function(d) {
                        return yScale(d.value[1]);
                    });

                ///////////////////////////////////////////////////////////////
                // Line                                                      //
                ///////////////////////////////////////////////////////////////
                var line = d3.svg.line()
                    .interpolate(options.plotOptions.interpolate)
                    .x(function(d) {
                        return xScale(d.date);
                    })
                    .y(function(d) {
                        return yScale(d.value);
                    });

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

                    markersContainer = svg.append('g')
                        .attr('class', 'markers')
                        .attr('transform', 'translate(' + options.chart.margin.left + ',' + options.chart.margin.top + ')');
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

                // Cean Paths
                pathContainer.selectAll('.metric').remove();

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
                    var circles = addTrackerMarkers(needleContainer, data);

                    // Events
                    surface.on('mousemove', needleMove).on("mouseout", needleLeave);

                    // Handlers
                    function needleMove(event) {
                        /*jshint validthis:true */
                        var mouse_x = d3.mouse(this)[0];
                        var graph_x = xScale.invert(mouse_x);
                        var format = d3.time.format('%a %d %H:%Mhs');

                        needleContainer.transition().duration(100).style('opacity', 1);

                        data.forEach(function(metric, index) {

                            var i = bisect(metric.data, graph_x, 1);
                            var d0 = metric.data[i - 1];
                            var d1 = metric.data[i];
                            var d = graph_x - d0.date > d1.date - graph_x ? d1 : d0;

                            var yValue = 0;
                            switch(options.chart.type) {
                                case 'line':
                                    yValue = yScale(d.value);
                                    break;
                                case 'area':
                                    yValue = yScale(d.y + d.y0);
                                    break;
                                case 'bivariate':
                                    yValue = yScale(d.y);
                                    break;
                            }
                            hoverLine.attr('x1', xScale(d.date)).attr('x2', xScale(d.date));
                            if(circles[metric.id]) {
                                circles[metric.id].attr("transform", "translate(" + xScale(d.date) + "," + yValue + ")");
                            }
                        });
                    }
                    function needleLeave() {
                        needleContainer.transition().duration(1500).style("opacity", 0);
                    }
                }

                ////////////////////////////////////////////////////////////
                // BELOW PROGRAMATIC STUFF ONLY                           //
                ////////////////////////////////////////////////////////////
                function addTrackerMarkers(container, metrics) {
                    var i = 0;
                    var circles = [];

                    // Bivariate charts just need one marker over the average line
                    if(options.chart.type == 'bivariate') {
                        metrics = metrics.filter(function(d){
                            return d.linkedTo;
                        });
                    }
                    for(i = 0; i < metrics.length; i += 1) {

                        var brand = metrics[i];
                        var color = brand.color || brand.stroke;

                        circles[brand.id] = container.append("g")
                            .attr("class", "circles")
                            .attr("id", brand.id);

                        var label = circles[brand.id].append("g")
                            .attr("class", "label");

                        /*
                        // Label Background
                        label.append('rect')
                            .attr("x", 8)
                            .attr("y", -8)
                            .attr("rx", 2)
                            .attr("ry", 2)
                            .attr("width", 120)
                            .attr("height", 18)
                            .style("fill", color);
                        // Label Text
                        label.append('text')
                            .attr("class", "metric-tip")
                            .attr("x", 12)
                            .attr("y", 5)
                            .attr("fill", "#fff");
                        */

                        // Circles
                        circles[brand.id].append("circle")
                            .attr("class", "circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", 4)
                            .attr("fill", color);

                        circles[brand.id].append("circle")
                            .attr("class", "circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", 2)
                            .attr("fill", "#fff");

                        circles[brand.id].append("circle")
                            .attr("class", "circle")
                            .attr("cx", 0)
                            .attr("cy", 0)
                            .attr("r", 1)
                            .attr("fill", color);
                    }
                    return circles;
                }

                // Path group
                var metric = pathContainer.selectAll('.line')
                    .data(function() {
                        switch(options.chart.type) {
                            case 'line':
                                return data;
                            case 'area':
                                return layers;
                            case 'bivariate':
                                return data;
                            default:
                                return data;
                        }
                    })
                    .enter()
                    .append('g')
                    .attr('class', 'metric');

                ///////////////////////////////////////////////////////////////
                // Draw Paths                                                //
                ///////////////////////////////////////////////////////////////
                var paths = metric.append('path')
                    .attr('class', 'line')
                    .attr('d', function(d) {
                        switch(options.chart.type) {
                            case 'line':
                                return line(d.data);
                            case 'area':
                                return area(d.data);
                            case 'bivariate':
                                if(!d.linkedTo) {
                                    return bivariate(d.data);
                                } else {
                                    return line(d.data);
                                }
                                break;
                            default:
                                return data;
                        }
                    })
                    .style('stroke', function(d) {
                        switch(options.chart.type) {
                            case 'line':
                                return d.stroke || color(d.name);
                            case 'area':
                                //return d.stroke || color(d.name);
                                return 'none';
                            case 'bivariate':
                                if(!d.linkedTo) {
                                    return 'none';
                                } else {
                                    return d.stroke || color(d.name);
                                }
                                break;
                            default:
                                return '#f00';
                        }
                    })
                    .style('fill', function(d) {
                        switch(options.chart.type) {
                            case 'line':
                                return 'none';
                            case 'area':
                                return d.stroke || color(d.name);
                            case 'bivariate':
                                if(!d.linkedTo) {
                                    return d.stroke || color(d.name);
                                } else {
                                    return 'none';
                                }
                                break;
                            default:
                                return '#f00';
                        }
                    })
                    .style('fill-opacity', 0)
                    .transition()
                    .duration(duration)
                    .ease(ease)
                    .style('fill-opacity', options.plotOptions.fillOpacity);

                    if(options.chart.type == 'area' && options.plotOptions.series.stroke) {
                        drawAreaLine(metric);
                    }
                    // Add Markers
                    if(options.plotOptions.series.makers) {
                        drawMarkers(pathContainer);
                    }

                ///////////////////////////////////////////////////////////////
                // Draw Markers                                              //
                ///////////////////////////////////////////////////////////////
                function drawAreaLine(container) {
                    var areaLine = d3.svg.line()
                        .x(function(d) { return xScale(d.date); })
                        .y(function(d) { return yScale(d.y + d.y0); });

                    var line = container.append('path')
                        .attr('class', 'line')
                        .attr('d', function(d){
                            return areaLine(d.data);
                        })
                        .style('stroke', function(d) {
                            return d.stroke || color(d.name);
                        })
                        .style('fill', 'none');
                    return line;
                }

                ///////////////////////////////////////////////////////////////
                // Draw Markers                                              //
                ///////////////////////////////////////////////////////////////
                function drawMarkers(container) {

                    var markers = markersContainer.selectAll('.markers')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('class', 'dots');

                    var dots = markers.selectAll('.dots')
                        .data(function(d) {
                            if(options.chart.type != 'bivariate' || d.linkedTo) {
                                return d.data;
                            } else {
                                return [];
                            }
                        })
                        .enter();

                    var dot = dots.append('circle')
                        .attr('class', 'dot')
                        .attr("cx", function(d){
                            return xScale(d.date);
                        })
                        .attr("cy", function(d){
                            switch(options.chart.type) {
                                case 'line':
                                    return yScale(d.value);
                                case 'area':
                                    return yScale(d.y + d.y0);
                                case 'bivariate':
                                    return yScale(d.y);
                            }
                        })
                        /*.on("mouseover", function(d) {
                            var width = tooltip.node().offsetWidth;
                            tooltip.transition()
                                .duration(200)
                                .style("opacity", 1);
                            tooltip.html("Value: 1234")
                                .style("left", (d3.event.pageX - (width / 2)) + "px")
                                .style("top", (d3.event.pageY - 35) + "px");
                            })
                        .on("mouseout", function(d) {
                            tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        })*/
                        .attr("r", 0)
                        .style('stroke-width', 2)
                        .style('stroke', function(d){
                            return d.stroke || color(d.name);
                        })
                        .style('fill', '#fff')
                        .transition()
                        .duration(duration)
                        .ease(ease)
                        .attr("r", 2);

                }
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
        var canvas = document.createElement( "canvas" );

        canvas.width = svgSize.width;
        canvas.height = svgSize.height;

        var ctx = canvas.getContext( "2d" );

        var img = document.createElement( "img" );
        img.setAttribute( "src", "data:image/svg+xml;base64," + btoa( svgData ) );

        img.onload = function() {
            ctx.drawImage( img, 0, 0 );

            var link = document.createElement("a");
            link.download = 'filename.png';
            link.href = canvas.toDataURL( "image/png" );
            link.target = "_self";

            document.body.appendChild(link);

            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);

        };
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
