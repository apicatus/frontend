var charts = charts || {};

charts.stacked = function module() {
    var margin = {top: 5, right: 20, bottom: 16, left: 50},
        width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg, container = null, duration = 650;
    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            var graph = this;

            function draw(dataset) {
                var size = {
                    'width': width - margin.left - margin.right,
                    'height': height - margin.top - margin.bottom
                };
                function normalize(data) {
                    var lengths = data.map(function(d){return d.length;});
                    var max = d3.max(lengths);
                    var who = lengths.indexOf(max);

                    var startDate = d3.min(data.map(function(d){
                        return d[0] ? d[0].time : null;
                    }));
                    var endDate = d3.max(data.map(function(d){
                        return d[d.length -1] ? d[d.length -1].time : null;
                    }));

                    var allTimes = (function(data){
                        var array = [];
                        data.forEach(function(item) {
                            var arr = item.map(function(d){
                                return d.time;
                            });
                            array = array.concat(arr);
                        });
                        return array;
                    })(data);
                    // Extract unique industries from my vendors
                    timeSpan = (function getIndustries(times){
                        return times.reduce(function(prev, curr) {
                            if (prev.indexOf(curr) < 0) {
                                prev.push(curr);
                            }
                            return prev;
                        }, []);
                    })(allTimes);

                    timeSpan.sort(function(a, b){
                        return a - b;
                    });

                    window.timeSpan = timeSpan;

                    //var interval = (endDate - startDate) / (max - 1);
                    var interval = ( timeSpan[timeSpan.length -1] - timeSpan[0] ) / ( timeSpan.length - 1);
                    interval = 60000;
                    var dateSpan = (function(start, end, interval){
                        var array = [];
                        for(var i = start; i <= end; i+=interval) {
                            array.push(i);
                        }
                        return array;
                    })(startDate, endDate, interval);

                    //console.log("start: ", startDate, " end: ", endDate, " interval: ", interval, " dateSpan: ", dateSpan);

                    // fix missing intervals
                    data.forEach(function(item, index) {
                        for (var i = 0; i < timeSpan.length; i++) {
                            if(!item[i] || item[i].time > timeSpan[i]) {
                                item.splice(i, 0, {
                                    time: timeSpan[i],
                                    count: 0
                                });
                            }
                            item[i].y = item[i].count;
                        }
                    });
                }
                normalize(dataset);

                var dateStart = dataset[0][0].time;
                var dateEnd = dataset[0][dataset[0].length - 1].time;
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
                //Data, stacked
                stack(dataset);

                var color_hash = {
                    0: ["Success", "#49c5b1"],
                    1: ["Fail", "#f35757"],
                    2: ["Redirect", "#F3C857"]
                };
                var dates = dataset[0].map(function(d) {
                    return d.time;
                });

                //Set up scales
                var xScale = d3.time.scale()
                    //.domain([new Date(dataset[0][0].time), d3.time.minute.offset(new Date(dataset[0][dataset[0].length - 1].time), 8)])
                    .domain(d3.extent(dates))
                    .rangeRound([0, size.width]);

                var yScale = d3.scale.linear()
                    .domain([0,
                        d3.max(dataset, function(d) {
                            return d3.max(d, function(d) {
                                return d.y0 + d.y;
                            });
                        })
                    ])
                    .range([size.height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .tickSize(5)
                    //.tickSubdivide(subs)
                    //.ticks(ticks)
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
                    .orient("left")
                    .tickPadding(5)
                    .ticks(2);

                var barWidth = d3.scale.ordinal()
                    .domain(dates)
                    .rangeRoundBands(xScale.range(), 0.1)
                    .rangeBand();
                //Easy colors accessible via a 10-step ordinal scale
                var colors = d3.scale.category10();

                //Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%");
                } else {
                    return;
                }
                // Add a group for each row of data
                var groups = svg.selectAll("g")
                    .data(dataset)
                    .enter()
                    .append("g")
                    .attr("class", "rgroups")
                    .attr("transform", "translate(" + margin.left + "," + (size.height) + ")")
                    .style("fill", function(d, i) {
                        return color_hash[dataset.indexOf(d)][1];
                    });

                // Add a rect for each data value
                var rects = groups.selectAll("rect")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("rect")
                    .attr("width", barWidth)
                    .attr("y", -(size.height * 2))
                    .style("fill-opacity", 0.5);

                rects.transition()
                    .duration(function(d, i) {
                        return 750;
                    })
                    .ease(ease)
                    .attr("x", function(d) {
                        return xScale(new Date(d.time));
                    })
                    .attr("y", function(d) {
                        return -(-yScale(d.y0) - yScale(d.y) + (size.height) * 2);
                    })
                    .attr("height", function(d) {
                        return -yScale(d.y) + (size.height);
                    })
                    .attr("width", barWidth)
                    .style("fill-opacity", 1);

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(50," + size.height + ")")
                    .call(xAxis);

                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + margin.left + ",0)")
                    .call(yAxis);

            }

            draw(_data);
        });
    }
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
        console.log("set chart height: ", height);
        return this;
    };
    exports.gap = function(_x) {
        if (!arguments.length) {
            return gap;
        }
        gap = _x;
        return this;
    };
    exports.axis = function(_xAxis, _yAxis) {

    };
    exports.ease = function(_x) {
        if (!arguments.length) {
            return ease;
        }
        ease = _x;
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};