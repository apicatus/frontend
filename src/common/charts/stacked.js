var charts = charts || {};

charts.stacked = function module() {
    var margin = {top: 5, right: 5, bottom: 0, left: 5},
        width = 500,
        height = 500,
        gap = 0,
        ease = 'cubic-in-out';
    var svg, duration = 650;

    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {
            _data = {
                startDate: new Date(2014, 1, 1).getTime(),
                interval: 60000,
                dataset: [330,275,275,275,330,275,275,275,330,275,275,275,275,330,275,605,275,275,385,330,275,385,330,660,605,275,550,550,605,275,550,275,275,330,330,275,550,605,330,550,550,660,550,275,330,605,605,605,605,275,495,660,550,275,275,605,385,495,275,275]
            };

            if(!_data) {
                return;
            }
            var chartW = width - margin.left - margin.right,
                chartH = height - margin.top - margin.bottom;

            var stack = d3.layout.stack();

            var x1 = d3.time.scale()
                //.domain([new Date(data.startDate), d3.time.minute.offset(new Date(data.startDate), data.dataset.length -1)])
                .domain(d3.extent(_data.dataset, function(d, i) { return new Date(_data.startDate + (i * _data.interval)); }))
                .range([margin.left + margin.right, chartW]);

            var y1 = d3.scale.linear()
                .domain([0, d3.max(_data.dataset, function(d, i){ return d; })])
                .range([chartH, 0]);

            var xAxis = d3.svg.axis()
                .scale(x1)
                .orient("bottom")
                .tickFormat(d3.time.format(("%H:%M")));

            var yAxis = d3.svg.axis()
                .scale(y1)
                .orient('left');

            var barW = chartW / _data.length;

            if(!svg) {
                svg = d3.select(this)
                    .append('svg')
                    .classed('chart', true);
                var container = svg.append('g').classed('container-group', true);
                container.append('g').classed('chart-group', true);
                container.append('g').classed('x-axis-group axis', true);
                container.append('g').classed('y-axis-group axis', true);
            }

            svg.transition().duration(duration).attr({width: width, height: height});
            svg.select('.container-group')
                .attr({transform: 'translate(' + margin.left + ',' + margin.top + ')'});

            svg.select('.x-axis-group.axis')
                .attr({transform: 'translate(0,' + (chartH) + ')'})
                .call(xAxis);

            svg.select('.y-axis-group.axis')
                .call(yAxis);

            var bars = svg.selectAll("rect")
                .data(_data.dataset)
                .enter();

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