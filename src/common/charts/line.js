var charts = charts || {};

charts.line = function module() {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 500,
        height = 500,
        ease = 'cubic-in-out';
    var svg, duration = 500;

    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            var chartW = width - margin.left - margin.right,
                chartH = height - margin.top - margin.bottom;

            var _key =  _selection.node().getAttribute('key') || 'value';

            _data.map(function(data) {
                data.date = new Date(data.date);
            });
            var x = d3.time.scale()
                .range([0, chartW])
                .domain(d3.extent(_data, function(d) { return d.date; }));

            var y = d3.scale.linear()
                .range([chartH, 0])
                .domain([0, d3.max(_data, function(d) { return d[_key]; })]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

            var line = d3.svg.line()
                .x(function(d) { return x(d.date); })
                .y(function(d) { return y(d[_key]); });

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
            // filters go in defs element
            var defs = svg.append("defs");

            // create filter with id #drop-shadow
            // height=130% so that the shadow is not clipped
            var filter = defs.append("filter")
                .attr("id", "drop-shadow")
                .attr("height", "130%");

            filter.append("feColorMatrix")
                .attr("in","SourceGraphic")
                .attr("type", "matrix")
                .attr("values", "0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.2 0")
                .attr("result","f1coloredMask");

            // SourceAlpha refers to opacity of graphic that this filter will be applied to
            // convolve that with a Gaussian with standard deviation 3 and store result
            // in blur
            filter.append("feGaussianBlur")
                .attr("in", "f1coloredMask")
                .attr("stdDeviation", 3)
                .attr("result", "blur");

            // translate output of Gaussian blur to the right and downwards with 2px
            // store result in offsetBlur
            filter.append("feOffset")
                .attr("in", "blur")
                .attr("dx", 3)
                .attr("dy", 3)
                .attr("result", "offsetBlur");

            // overlay original SourceGraphic over translated blurred opacity by using
            // feMerge filter. Order of specifying inputs is important!
            var feMerge = filter.append("feMerge");

            feMerge.append("feMergeNode")
                .attr("in", "offsetBlur");
            feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");

            svg.transition().duration(duration).attr({width: width, height: height});
            svg.select('.container-group')
                .attr({transform: 'translate(' + margin.left + ',' + margin.top + ')'});

            var meanValue = d3.mean(_data, function(d) { return d[_key]; });
            var meanLine = svg.select('.chart-group')
                .append('line')
                .datum(meanValue)
                .attr('class', 'mean-line')
                .attr('x1', 0)
                .attr('y1', function(d){
                    return y(d);
                })
                .attr('x2', chartW)
                .attr('y2', function(d){
                    console.log("call");
                    return y(d);
                })
                .style('stroke', "#ccc")
                .style('stroke-width', 1)
                .style('stroke-dasharray', '4,2');

            var path = svg.select('.chart-group')
                .append('path')
                .datum(_data)
                .attr('class', 'line')
                .attr('d', function(d) {
                    return line(d);
                })
                .style('stroke', '#fff')
                .style('filter', 'url(#drop-shadow)')
                .style('stroke-width', 4)
                .style('opacity', 1);


            var totalLength = path.node().getTotalLength();

            path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength);
            path.transition()
                .duration(duration)
                .ease('linear')
                .attr("stroke-dashoffset", 0);

            //path.transition().style({opacity: 0}).remove();
            duration = 500;
            function pathTween() {
                var interpolate = d3.scale.quantile()
                    .domain([0,1])
                    .range(d3.range(1, _data.length + 1));
                return function(t) {
                    return line(_data.slice(0, interpolate(t)));
                };
            }
            /*
            svg.select('.x-axis-group.axis')
                .transition()
                .duration(duration)
                .ease(ease)
                .attr({transform: 'translate(0,' + (chartH) + ')'})
                .call(xAxis);

            svg.select('.y-axis-group.axis')
                .transition()
                .duration(duration)
                .ease(ease)
                .call(yAxis);



            var gapSize = x1.rangeBand() / 100 * gap;
            barW = x1.rangeBand() - gapSize;
            var bars = svg.select('.chart-group')
                .selectAll('.bar')
                .data(_data);
            bars.enter().append('rect')
                .classed('bar', true)
                .attr('rx', 3)
                .attr('ry', 3)
                .attr({x: chartW,
                    width: barW,
                    y: function(d, i) { return y1(d); },
                    height: function(d, i) { return chartH - y1(d); }
                })
                .on('mouseover', dispatch.customHover);
            bars.transition()
                .duration(duration)
                .ease(ease)
                .attr({
                    width: barW,
                    x: function(d, i) { return x1(i) + gapSize/2; },
                    y: function(d, i) { return y1(d); },
                    height: function(d, i) { return chartH - y1(d); }
                });
            bars.exit().transition().style({opacity: 0}).remove();

            duration = 500;
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
        return this;
    };
    exports.key = function(key) {
        if (!arguments.length) {
            return _key;
        }
        _key = key;
        return this;
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