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
    var width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg,
        pathContainer = null,
        axesContainer = null,
        duration = 650;

    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');

    var coloretes = ['#a00040', '#d73c4c', '#f66d39', '#ffaf5a', '#fee185', '#feffbb', '#e6f693', '#abdea3', '#63c4a5', '#2c87be'];
    ///////////////////////////////////////////////////////////////////////////
    // Default chart options                                                 //
    ///////////////////////////////////////////////////////////////////////////
    var options = {
        chart: {
            type: 'area',
            margin: {top: 0, right: 0, bottom: 20, left: 35}
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 0.5,
            series: {
                animation: false,
                pointInterval: 24 * 3600 * 1000, // one day
                pointStart: new Date().getTime(),
                units: null
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
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data || _data.length < 0) {
                return;
            }
            var graph = this;

            function draw(data) {
                var size = {
                    'width': width - options.chart.margin.left - options.chart.margin.right,
                    'height': height - options.chart.margin.top - options.chart.margin.bottom
                };
                var color = d3.scale.category10();
                color.domain(d3.keys(data).filter(function(key) { return key !== "date"; }));
                // Put Dates
                data.forEach(function(item){
                    item.data = item.data.map(function(value, index){
                        return {
                            date: new Date(options.plotOptions.series.pointStart + (options.plotOptions.series.pointInterval * index)), //options.plotOptions.pointStart + (options.plotOptions.pointInterval * index),
                            value: value
                        };
                    });
                    item.setVisible = function (toggle) {
                        alert('invisible !');
                    };
                });

                var dateStart = options.plotOptions.series.pointStart;
                var dateEnd = options.plotOptions.series.pointStart + options.plotOptions.series.pointInterval * data[0].data.length;
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

                var bisect = d3.bisector(function(d) {
                    return d.date;
                }).right;
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

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(function(d) {
                        if (daySpan <= 1) {
                            return d3.time.format('%H:%M')(d).replace(/\s/, '').replace(/^0/, '');
                        } else {
                            return d3.time.format('%m/%d')(d).replace(/\s/, '').replace(/^0/, '').replace(/\/0/, '/');
                        }
                    });

                var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .ticks(options.yAxis.ticks)
                    .tickPadding(5)
                    .orient("left")
                    .tickFormat(options.yAxis.labels.formatter);

                ///////////////////////////////////////////////////////////////
                // Stacked area                                              //
                ///////////////////////////////////////////////////////////////
                var stack = d3.layout.stack()
                    .offset("zero")
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
                        .append("svg")
                        .attr("preserveAspectRatio", "xMidYMid")
                        .attr("viewBox", "0 0 " + width + " " + height)
                        .attr("width", "100%")
                        .attr("height", "100%");

                    axesContainer = svg.append('g')
                        .attr("transform", "translate(" + options.chart.margin.left + "," + options.chart.margin.top + ")");
                    drawGrid(svg, xScale, yScale);
                    drawAxes(axesContainer);


                    pathContainer = svg.append("g")
                        .attr("transform", "translate(" + options.chart.margin.left + "," + options.chart.margin.top + ")");

                    // Clean all
                    pathContainer.selectAll(".metric").remove();

                    drawNeedle(svg);
                }

                function drawAxes (axesContainer) {
                    function customAxis(g) {
                        //g.selectAll("text")
                        //    .attr("x", -(margin.left));
                    }
                    // Clean all
                    axesContainer.selectAll('.axis').remove();
                    // xAxis
                    axesContainer.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + size.height + ")")
                        .call(xAxis);
                    // yAxis
                    axesContainer.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .call(customAxis);

                    axesContainer.selectAll(".tick")
                        .filter(function (d) { return d === 0;  })
                        .remove();
                }
                function drawGrid (gridContainer, xScale, yScale) {
                    var xGrid, yGrid;
                    ////////////////////////////////////////////////////////////
                    // Axix                                                   //
                    ////////////////////////////////////////////////////////////
                    if(options.xGrid.enabled) {
                        xGrid = d3.svg.axis()
                            .scale(xScale)
                            .ticks(options.yAxis.ticks)
                            .tickSize(size.height, 0, 0)
                            .tickFormat('');
                        gridContainer.append("g")
                            .attr("class", "x axis grid")
                            .call(xGrid);
                    }
                    if(options.yGrid.enabled) {
                        yGrid = d3.svg.axis()
                            .scale(yScale)
                            .ticks(options.yAxis.ticks)
                            .tickSize(-(size.width), 0, 0)
                            .orient('right');
                        svg.append("g")
                            .attr("class", "y axis grid")
                            .attr("transform", "translate(" + (size.width + options.chart.margin.left) + ", 0)")
                            .call(yGrid);
                    }
                }

                function drawNeedle (needleContainer) {
                    ////////////////////////////////////////////////////////////
                    // Dial needle on top of everything                       //
                    ////////////////////////////////////////////////////////////


                    var hoverLineGroup = needleContainer.append("g")
                        .attr("class", "needle")
                        .attr("transform", "translate(" + options.chart.margin.left + "," + options.chart.margin.top + ")")
                        .style({
                            'opacity': 0
                        });

                    var surface = needleContainer.append('rect')
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", size.width)
                        .attr("height", size.height)
                        .style({
                            'fill': '#fff',
                            'fill-opacity': 0.1
                        })
                        .attr("transform", "translate(" + options.chart.margin.left + "," + options.chart.margin.top + ")");

                    var hoverLine = hoverLineGroup
                            .append("line")
                            .attr("x1", 0)
                            .attr("x2", 0)
                            .attr("y1", 0)
                            .attr("y2", size.height)
                            .style("stroke", "#000"); //49c5b1
                    var hoverDate = hoverLineGroup.append('text')
                        .attr("class", "hover-text")
                        .attr('y', height - 10);

                    surface.on("mousemove", needleMove);

                    function needleMove(event) {
                        var mouse_x = d3.mouse(this)[0];
                        var mouse_y = d3.mouse(this)[1];
                        var graph_y = yScale.invert(mouse_y);
                        var graph_x = xScale.invert(mouse_x);
                        var format = d3.time.format('%a %d %H:%Mhs');

                        var item = data[0].data[bisect(data[0].data, new Date(graph_x))];
                        if(item) {
                            hoverLineGroup.transition().duration(100).style("opacity", 1);
                            hoverLine.attr("x1", xScale(item.date)).attr("x2", xScale(item.date));
                        }
                    }
                }

                // Path group
                var metric = pathContainer.selectAll(".line")
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
                    .append("g")
                    .attr("class", "metric");

                ///////////////////////////////////////////////////////////////
                // Draw Paths                                                //
                ///////////////////////////////////////////////////////////////
                var paths = metric.append("path")
                    .attr("class", "line")
                    .attr("d", function(d) {
                        switch(options.chart.type) {
                            case 'line':
                                return line(d.data);
                            case 'area':
                                return area(d.data);
                            case 'bivariate':
                                return bivariate(d.data);
                            default:
                                return data;
                        }
                    })
                    .style("stroke", function(d) {
                        switch(options.chart.type) {
                             case 'line':
                                return d.stroke || color(d.name);
                            case 'area':
                                return d.stroke || color(d.name);
                            case 'bivariate':
                                return d.stroke || color(d.name);
                            default:
                                return '#f00';
                        }
                    })
                    .style("fill", function(d) {
                        return options.chart.type == 'line' ? 'none' : d.stroke || color(d.name);
                    })
                    .style("fill-opacity", 0)
                    .transition()
                    .duration(duration)
                    .ease(ease)
                    .style("fill-opacity", options.plotOptions.fillOpacity);
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
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
