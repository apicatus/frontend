///////////////////////////////////////////////////////////////////////////////
// @file         : multilina.js                                              //
// @summary      : Generic Multilina Chart                                   //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : D3 Multilina for apicatus UI                              //
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

charts.normalBarChart = function module() {
    var margin = {top: 0, right: 0, bottom: 20, left: 35},
        width = 500,
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
            margin: {top: 0, right: 0, bottom: 20, left: 0}
        },
        plotOptions: {
            fillOpacity: 1,
            series: {
                animation: false,
                pointInterval: 24 * 3600 * 1000, // one day
                pointStart: new Date().getTime(),
                units: null
            }
        },
        yAxis: {
            ticks: 2
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                day: '%a',
                week: '%d'
            },
            labels: {
                formatter: function(number) {
                    console.log("formatter: ", number);
                    var sign = (number < 0) ? '-' : '';
                    number = Math.abs(number);
                    if(number < 1000) {
                        return number || 0;
                    }
                    var si = ['K', 'M', 'G', 'T', 'P', 'H'];
                    var exp = Math.floor(Math.log(number) / Math.log(1000));
                    var result = number / Math.pow(1000, exp);
                    result = (result % 1 > (1 / Math.pow(1000, exp - 1))) ? result.toFixed(2) : result.toFixed(0);
                    return isNaN(result) ? 0 : sign + result + si[exp - 1];
                }
            }
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
                    'width': width - margin.left - margin.right,
                    'height': height - margin.top - margin.bottom
                };
                var color = d3.scale.category10();
                var datasets = [];
                data.forEach(function(item){
                    var values = item.data.map(function(value, index){
                        return {
                            time: new Date(options.plotOptions.series.pointStart + (options.plotOptions.series.pointInterval * index)),
                            count: value,
                            name: item.name,
                            fill: item.fill,
                            y: value
                        };
                    });
                    datasets.push(values);
                });

                stack(datasets);

                var dateStart = options.plotOptions.series.pointStart;
                var dateEnd = options.plotOptions.series.pointStart + options.plotOptions.series.pointInterval * datasets[0].length; //datasets[0][datasets[0].length - 1].time;
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
                // X Scale                                                   //
                ///////////////////////////////////////////////////////////////
                var xScale = d3.time.scale()
                    .domain([new Date(options.plotOptions.series.pointStart), new Date(dateEnd)])
                    .rangeRound([0, size.width]);

                ///////////////////////////////////////////////////////////////
                // Y Scale                                                   //
                ///////////////////////////////////////////////////////////////
                var yScale = d3.scale.linear()
                    .domain([0,
                        d3.max(datasets, function(d) {
                            return d3.max(d, function(d) {
                                return d.y0 + d.y;
                            });
                        })
                    ])
                    .range([size.height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .tickSubdivide(subs)
                    .ticks(ticks)
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
                    //.tickSize(size.width)
                    .tickPadding(5)
                    .tickValues([(yScale.domain()[1] / 2), (yScale.domain()[1] * 0.9)])
                    .orient("left")
                    .tickFormat(options.xAxis.labels.formatter);

                console.log(".tickValues(): ", yScale.domain());
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
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    drawAxes(axesContainer);

                    pathContainer = svg.append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    // Clean all
                    pathContainer.selectAll(".bars").remove();
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
                        .attr("transform", "translate(" + margin.left + "," + size.height + ")")
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

                var barWidth = d3.scale.ordinal()
                    .domain(datasets[0].map(function(d) {
                        return d.time;
                    }))
                    .rangeRoundBands(xScale.range(), 0.45)
                    .rangeBand();

                // Add a group for each row of data
                var bars = pathContainer.selectAll(".bars")
                    .data(datasets)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(0," + size.height + ")")
                    .attr("class", "bars");

                // Add a rect for each data value
                var rects = bars.selectAll("rect")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                        return xScale(new Date(d.time));
                    })
                    .attr("y", function(d) {
                        return -(-yScale(d.y0) - yScale(d.y) + (size.height) * 2);
                    })
                    .attr("width", barWidth)
                    .attr("height", function(d) {
                        return -yScale(d.y) + (size.height);
                    })
                    .style("stroke", function(d) {
                        return d.fill || color(d.name);
                    })
                    .style("fill", function(d){
                        return d.fill || color(d.name);
                    })
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
        console.log("options: ", options);
        options = angular.extend(options, opt);
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
