var charts = charts || {};

charts.donut = function module() {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 200,
        height = 200,
        arc = 0,
        radius = 0,
        ease = 'cubic-in-out',
        textOffset = 14,
        tweenDuration = 250;
        
    var svg, container = null, duration = 650;
    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');
    var keys = {
        property: 'value',
        caption: 'name'
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
                var color = d3.scale.ordinal()
                    .range(["#00acac", "#348FE1", "#ff5b57", "#f59c1a", "#727cb6", "#49b6d6", "#348fe2"]);
                
                console.log("size: ", size);
                radius = Math.min(size.width, size.height) / 2;

                var arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(radius - 40);

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d[keys.property]; });

                // Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("width", size.width)
                        .attr("height", size.height)
                        .append("g")
                        .attr("transform", "translate(" + size.width / 2 + "," + size.height / 2 + ")");
                }

                var g = svg.selectAll(".arc")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");

                g.append("path")
                    .attr("d", arc)
                    .style("fill", function(d) { 
                        //return color(d.data.age); 
                        console.log("data", d.data.name);
                        return color(d.data.name); 
                    });
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