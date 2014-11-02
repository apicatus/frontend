var charts = charts || {};

charts.multiline = function module() {
    var margin = {top: 5, right: 20, bottom: 16, left: 50},
        width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg, container = null, duration = 650;
    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');
    var keys = {
        timestamp: 'key',
        property: 'time_stats'
    };
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            var graph = this;

            function draw(data) {
                var size = {
                    'width': width - margin.left - margin.right,
                    'height': height - margin.top - margin.bottom
                };
                console.log("data: ", data);
                var pathContainer = null;
                var dateStart = data[0][keys.timestamp];
                var dateEnd = data[data.length - 1][keys.timestamp];
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

                console.log("data: ", daySpan);
                //Set up scales
                var xScale = d3.time.scale()
                    //.domain([new Date(dataset[0][0].time), d3.time.minute.offset(new Date(dataset[0][dataset[0].length - 1].time), 8)])
                    .domain(d3.extent(data, function(d) { return d[keys.timestamp]; }))
                    .rangeRound([0, size.width]);

                var yScale = d3.scale.linear()
                    .domain([d3.min(data, function(d) { return d[keys.property].min; }), d3.max(data, function(d) { return d[keys.property].max; })])
                    .range([size.height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .tickSize(5)
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
                    .orient("left")
                    .tickPadding(5)
                    .ticks(2);

                var area = d3.svg.area()
                    .x(function(d) { return xScale(d[keys.timestamp]); })
                    .y0(function(d) { 
                        return yScale(d[keys.property].min || yScale.domain()[0]); 
                    })
                    .y1(function(d) { 
                        return yScale(d[keys.property].max || yScale.domain()[0]);
                    });
                
                //Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("width", "100%")
                        .attr("height", "100%");
                    
                    pathContainer = svg.append("g")
                        .attr("transform", "translate(" + margin.left + ",0)");
                } else {
                    svg.select(".area")
                        .datum(data)
                        .attr("class", "area")
                        .style("fill", "#49c5b1")
                        .style("fill-opacity", 0.5)
                        .attr("d", area);
                    return;
                }

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(50," + size.height + ")")
                    .call(xAxis);

                var g = svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", "translate(" + margin.left + ",0)")
                    .call(yAxis);

                pathContainer.append("path")
                    .datum(data)
                    .attr("class", "area")
                    .style("stroke", "#49c5b1")
                    .style("fill", "#49c5b1")
                    .style("fill-opacity", 0.5)
                    .attr("d", area);

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
        return this;
    };
    exports.gap = function(_x) {
        if (!arguments.length) {
            return gap;
        }
        gap = _x;
        return this;
    };
    exports.timestampKey = function(_x) {
        if (!arguments.length) {
            return keys.timestamp;
        }
        keys.timestamp = _x;
        return this;
    };
    exports.propertyKey = function(key) {
        if (!arguments.length) {
            return keys.property;
        }
        keys.property = key;
        console.log("set chart keys.property: ", keys.property);
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