var charts = charts || {};

charts.multiline = function module() {
    var margin = {top: 0, right: 0, bottom: 20, left: 0},
        width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg, pathContainer = null, duration = 650;
    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');

    var coloretes = ['#a00040', '#d73c4c', '#f66d39', '#ffaf5a', '#fee185', '#feffbb', '#e6f693', '#abdea3', '#63c4a5', '#2c87be'];
    var options = {
        chart: {
            type: 'area',
            margin: {top: 0, right: 0, bottom: 20, left: 0}
        },
        plotOptions: {
            series: {
                animation: false,
                pointInterval: 24 * 3600 * 1000, // one day
                pointStart: new Date().getTime()
            }
        },
        xAxis: {
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            dateTimeLabelFormats: {
                day: '%a',
                week: '%d'
            },
            labels: {
                formatter: function() {
                    return Highcharts.dateFormat('%a %d', this.value);
                }
            }
        }
    };
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            /*_data = [
                { name: 'SerieA', data: [210, 11, 324,234,324, 23, 56,567, 23,134] },
                { name: 'SerieB', data: [110,111,1324,134,342,123,156,267,123,  0] },
                { name: 'SerieC', data: [  0,411, 132,123,132, 12, 15,156, 12, 13] }
            ];*/
            var graph = this;

            function draw(data) {
                var size = {
                    'width': width - margin.left - margin.right,
                    'height': height - margin.top - margin.bottom
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
                console.log("data: ", data);

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
                //Set up scales
                var xScale = d3.time.scale()
                    .domain([new Date(options.plotOptions.series.pointStart), new Date(options.plotOptions.series.pointStart + options.plotOptions.series.pointInterval * (data[0].data.length - 1))])
                    .rangeRound([0, size.width]);

                var yScale = d3.scale.linear()
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
                    .ticks(6)
                    .tickSize(size.width)
                    .tickPadding(5)
                    .orient("right");

                var nest = d3.nest()
                    .key(function(d) { 
                        console.log("nest: ", d);
                        return d.name; 
                    });
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
                }

                // Area
                var area = d3.svg.area()
                    .interpolate("basis")
                    .x(function(d) { 
                        return xScale(d.date); 
                    })
                    .y0(function(d) { 
                        return yScale(d.y0); 
                    })
                    .y1(function(d) { 
                        return yScale(d.y0 + d.y); 
                    });

                // Line
                var line = d3.svg.line()
                    .interpolate("basis")
                    .x(function(d) { 
                        return xScale(d.date); 
                    })
                    .y(function(d) {
                        return yScale(d.value); 
                    });
                
                //Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("preserveAspectRatio", "xMidYMid")
                        .attr("viewBox", "0 0 " + width + " " + height)
                        .attr("width", "100%")
                        .attr("height", "100%");
                    
                    pathContainer = svg.append("g")
                        /*.attr("transform", "translate(" + margin.left + ",0)")*/;
                }

                // xAxis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(" + margin.left + "," + size.height + ")")
                    .call(xAxis);
                // yAxis
                svg.append("g")
                    .attr("class", "y axis")
                    //.attr("transform", "translate(" + margin.left + ",0)")
                    .call(yAxis)
                    .call(customAxis);

                svg.selectAll(".tick")
                    .filter(function (d) { return d === 0;  })
                    .remove();

                function customAxis(g) {
                    g.selectAll("text")
                        .attr("x", 0)
                        .attr("dy", -4);
                }

                // Path group
                var metric = pathContainer.selectAll(".line")
                    .data(function() {
                        switch(options.chart.type) {
                            case 'line': 
                                return data;
                            case 'area':
                                return layers;
                            default:
                                return data;
                        }
                    })
                    .enter()
                    .append("g")
                    .attr("class", "metric");

                // Path
                metric.append("path")
                    .attr("class", "line")
                    .attr("d", function(d) {
                        switch(options.chart.type) {
                            case 'line': 
                                return line(d.data);
                            case 'area':
                                return area(d.data);
                            default:
                                return data;
                        }
                    })
                    .style("stroke", function(d) { 
                        return options.chart.type == 'line' ? d.stroke || color(d.name) : 'none'; 
                    })
                    .style("fill", function(d) { 
                        return options.chart.type == 'line' ? 'none' : d.stroke || color(d.name); 
                    })
                    .style("fill-opacity", 0.75);
            }            
            draw(_data);
        });
    }
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