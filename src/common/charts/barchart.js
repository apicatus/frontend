var charts = charts || {};

charts.stacked = function module() {
    var margin = {top: 5, right: 20, bottom: 20, left: 50},
        width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg, container = null, duration = 650;
    function prepare(data) {
        var dateParse = d3.time.format('%Y-%m-%d');
        data.forEach(function(v) {
            v.date = dateParse.parse(v.date);
        });

        var dateValueMap = data.reduce(function(r, v) {
            r[v.date.toISOString()] = v.value;
            return r;
        }, {});

        var dateExtent = d3.extent(data.map(function(v) {
            return v.date;
        }));

        // make data have each date within the extent
        var fullDayRange = d3.time.day.range(
            dateExtent[0],
            d3.time.day.offset(dateExtent[1], 1)
        );
        fullDayRange.forEach(function(date) {
            if (!(date.toISOString() in dateValueMap)) {
                data.push({
                    'date': date,
                    'value': 0
                });
            }
        });

        data = data.sort(function(a, b) {
            return a.date - b.date;
        });

        return data;
    }
    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {
            console.log("datax: ", _data);
            if(!_data) {
                return;
            }
            _data = [
                    {'date': '2014-01-31', 'value': 5261.38}, 
                    {'date': '2014-02-02', 'value': 7460.23}, 
                    {'date': '2014-02-03', 'value': 8553.39}, 
                    {'date': '2014-02-04', 'value': 3897.18}, 
                    {'date': '2014-02-05', 'value': 2822.22}, 
                    {'date': '2014-02-06', 'value': 6762.49}, 
                    {'date': '2014-02-07', 'value': 8624.56}, 
                    {'date': '2014-02-08', 'value': 7870.35}, 
                    {'date': '2014-02-09', 'value': 7991.43}, 
                    {'date': '2014-02-10', 'value': 9947.14}, 
                    {'date': '2014-02-11', 'value': 6539.75}, 
                    {'date': '2014-02-12', 'value': 2487.3}, 
                    {'date': '2014-02-15', 'value': 3517.38}, 
                    {'date': '2014-02-16', 'value': 1919.08}, 
                    {'date': '2014-02-19', 'value': 1764.8}, 
                    {'date': '2014-02-20', 'value': 5607.57}, 
                    {'date': '2014-02-21', 'value': 7148.87}, 
                    {'date': '2014-02-22', 'value': 5496.45}, 
                    {'date': '2014-02-23', 'value': 296.89}, 
                    {'date': '2014-02-24', 'value': 1578.59}, 
                    {'date': '2014-02-26', 'value': 1763.16}, 
                    {'date': '2014-02-27', 'value': 8622.26},
                    {'date': '2014-02-28', 'value': 7298.99}, 
                    {'date': '2014-03-01', 'value': 3014.06}, 
                    {'date': '2014-03-05', 'value': 6971.12}, 
                    {'date': '2014-03-06', 'value': 2949.03}, 
                    {'date': '2014-03-07', 'value': 8512.96}, 
                    {'date': '2014-03-09', 'value': 7734.72}, 
                    {'date': '2014-03-10', 'value': 6703.21}, 
                    {'date': '2014-03-11', 'value': 9798.07}, 
                    {'date': '2014-03-12', 'value': 6541.8}, 
                    {'date': '2014-03-13', 'value': 915.44}, 
                    {'date': '2014-03-14', 'value': 9570.82}, 
                    {'date': '2014-03-16', 'value': 6459.17}, 
                    {'date': '2014-03-17', 'value': 9389.62},
                    {'date': '2014-03-18', 'value': 6216.9}, 
                    {'date': '2014-03-19', 'value': 4433.5}, 
                    {'date': '2014-03-20', 'value': 9017.23},
                    {'date': '2014-03-23', 'value': 2828.45},
                    {'date': '2014-03-24', 'value': 63.29}, 
                    {'date': '2014-03-25', 'value': 3855.02},
                    {'date': '2014-03-26', 'value': 4203.06},
                    {'date': '2014-03-27', 'value': 3132.32}
                ];
            var graph = this;

            function draw(data) {
                var size = {
                    'width': width - margin.left - margin.right,
                    'height': height - margin.top - margin.bottom
                };

                if(!svg) {
                    svg = d3.select(graph).append('svg')
                        .attr('width', '100%')
                        .attr('height', '100%')
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
                }
                var dates = data.map(function(v) {
                    return v.date;
                });
                var x = d3.time.scale()
                    .range([0, size.width])
                    .domain(d3.extent(dates));
                var y = d3.scale.linear()
                    .range([size.height, 0])
                    .domain([0, d3.max(data.map(function(v) {
                        return v.value;
                    }))]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .tickPadding(5)
                    .ticks(2)
                    .orient('left');

                var barWidth = d3.scale.ordinal()
                    .domain(dates)
                    .rangeRoundBands(x.range(), 0.15)
                    .rangeBand();

                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(' + barWidth / 2 + ',' + size.height + ')')
                    .call(xAxis);

                svg.append('g')
                    .attr('class', 'y axis')
                    .call(yAxis);

                svg.selectAll('.bar')
                    .data(data)
                    .enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('x', function(d) {
                        return x(d.date);
                    })
                    .attr('width', barWidth)
                    .attr('y', function(d) {
                        return y(d.value);
                    })
                    .attr('height', function(d) {
                        return size.height - y(d.value);
                    })
                    .style("fill", "#49c5b1");
            }

            draw(prepare(_data));

        /*
            if(true) {
                return;
            }
            
            function prepare(data) {
                var dateParse = d3.time.format('%Y-%m-%d');
                data.forEach(function(v) {
                    v.date = dateParse.parse(v.date);
                });

                var dateValueMap = data.reduce(function(r, v) {
                    r[v.date.toISOString()] = v.value;
                    return r;
                }, {});

                var dateExtent = d3.extent(data.map(function(v) {
                    return v.date;
                }));

                // make data have each date within the extent
                var fullDayRange = d3.time.day.range(
                    dateExtent[0],
                    d3.time.day.offset(dateExtent[1], 1)
                );
                fullDayRange.forEach(function(date) {
                    if (!(date.toISOString() in dateValueMap)) {
                        data.push({
                            'date': date,
                            'value': 0
                        });
                    }
                });

                data = data.sort(function(a, b) {
                    return a.date - b.date;
                });

                return data;
            }
            if(!_data) {
                return;
            }
            _data = prepare(_data);
            console.log("_DATA: ", _data);
            var chartW = width - margin.left - margin.right,
                chartH = height - margin.top - margin.bottom;

            var stack = d3.layout.stack();

            var dates = _data.map(function(v) {
                return v.date;
            });
            console.log("DATES: ", dates);
            var x1 = d3.time.scale()
                //.domain([new Date(data.startDate), d3.time.minute.offset(new Date(data.startDate), data.dataset.length -1)])
                //.domain(d3.extent(_data.dataset, function(d, i) { return new Date(_data.startDate + (i * _data.interval)); }))
                .domain(d3.extent(dates))
                .range([0, chartW]);

            console.log("EXT: ", d3.extent(dates));
            var y1 = d3.scale.linear()
                .domain([0, d3.max(_data, function(d, i){ return d.value; })])
                .range([chartH, 0]);

            var xAxis = d3.svg.axis()
                .scale(x1)
                .tickSize(5)
                .orient("bottom")
                .tickFormat(d3.time.format(("%m-%d")));

            var yAxis = d3.svg.axis()
                .scale(y1)
                //.tickSize(chartW)
                .tickPadding(5)
                .ticks(2)
                .orient('left');

            var barWidth = d3.scale.ordinal()
                .domain(dates)
                .rangeRoundBands(x1.range(), 0.1)
                .rangeBand();

            var barW = chartW / _data.length;

            if(!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .attr('width',  '100%')
                    .attr('height', '100%')
                    .classed('chart', true);

                    console.log("w: ", chartW, " h: ", chartH);
                
                container = svg.append('g').classed('container-group', true);
                container.append('g').classed('chart-group', true);
                container.append('g').classed('x-axis-group axis', true);
                container.append('g').classed('y-axis-group axis', true);
            }

            svg.select('.container-group')
                .attr({transform: 'translate(' + margin.left + ',' + margin.top + ')'});

            svg.select('.x-axis-group.axis')
                //.attr({transform: 'translate(0,' + (chartH) + ')'})
                .attr('transform', 'translate(' + barWidth / 2 + ',' + chartH + ')')
                .call(xAxis);

            svg.select('.y-axis-group.axis')
            .attr('transform', 'translate(' + -barWidth + ',' + 0 + ')')
                .call(yAxis);

            //var bars = svg.selectAll("rect")
                //.data(_data.dataset)
                //.enter();

            container.select('.chart-group').selectAll('.bar')
                .data(_data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', function(d) {
                    return x1(d.date);
                })
                .attr('width', barWidth)
                .attr('y', function(d) {
                    return y1(d.value);
                })
                .attr('height', function(d) {
                    return chartH - y1(d.value);
                })
                .style("fill", "#49c5b1");

                */

            /*
            bars.append("rect")
                .attr("x", function(d, i) { 
                    var date = new Date(_data.startDate + (i * _data.interval));
                    console.log("date: ", date, "v: ", d, " x: ", x1(date), " y: ", y1(d));
                    return x1(date); 
                })
                .attr("y", function(d) { 
                    return chartH - y1(d); 
                })
                .attr("width", 7)
                .attr("height", function(d) { return y1(d); })
                .style("fill", "#49c5b1");
            */
            /*bars.append("rect")
                .attr("x", function(d) { return x1(new Date(d.timestamp)); })
                .attr("y", function(d) { return y1(d.out.bytes); })
                .attr("width", 5)
                .attr("height", function(d) { return chartH - y1(d.out.bytes); })
                .style("fill", "green");
                */

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