var charts = charts || {};

charts.treemap = function module() {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 500,
        height = 500,
        gap = 0,
        color = null,
        ease = 'cubic-in-out';
    var svg, pathContainer = null, duration = 650;
    var treemap = null;
    var dispatch = d3.dispatch('customHover');

    var coloretes = ['#a00040', '#d73c4c', '#f66d39', '#ffaf5a', '#fee185', '#feffbb', '#e6f693', '#abdea3', '#63c4a5', '#2c87be'];

    var options = {
        chart: {
            type: 'worldmap',
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            tooltip: {
                enabled: false
            }
        },
        plotOptions: {
            fillOpacity: 0.5,
            series: {
                animation: false,
                units: null,
                stroke: true,
                labels: {
                    formatter: function (tick) {
                        return tick;
                    }
                }
            }
        },
        colorAxis: {
            minColor: '#616D7D',
            maxColor: '#00acac',
            stops: [
                [100, '#2c87be'],
                [200, '#2c87be'],
                [300, '#63c4a5'],
                [400, '#CF5AFF'],
                [500, '#ffaf5a'],
                [600, '#a00040']
            ]
        }
    };
    function exports(_selection) {
        _selection.each(function(_data) {
            var graph = this;
            if(!_data) {
                return;
            }
            function draw(data) {
                var size = {
                    'width': width - options.chart.margin.left - options.chart.margin.right,
                    'height': height - options.chart.margin.top - options.chart.margin.bottom
                };

                if(options.colorAxis.stops) {
                    color = d3.scale.threshold()
                        .domain(options.colorAxis.stops.map(function(threshold){
                            return threshold[0];
                        }))
                        .range(options.colorAxis.stops.map(function(threshold){
                            return threshold[1];
                        }));
                } else {
                    color = d3.scale.category10();
                }


                treemap = d3.layout.treemap()
                    .size([size.width, size.height])
                    .sticky(true)
                    .value(function(d) { return d.doc_count; });

                // Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("preserveAspectRatio", "xMidYMid")
                        .attr("viewBox", "0 0 " + width + " " + height)
                        .attr("width", "100%")
                        .attr("height", "100%");

                    pathContainer = svg.append("g");
                }
                pathContainer.selectAll('.node').remove();

                var node = pathContainer
                    .datum(data)
                    .selectAll("g")
                    .data(treemap.nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                var box = node.append('rect')
                    .attr('width', function(d){
                        return d.dx;
                    })
                    .attr('height', function(d){
                        return d.dy;
                    })
                    .style("stroke", '#fff')
                    .style("fill", function(d) {
                        return d.children ? color(d.key) : 'none';
                    });

                var label = node.append('text')
                    .attr('x', function(d){
                        return d.dx / 2;
                    })
                    .attr('y', function(d){
                        return d.dy / 2;
                    })
                    .attr("dy", ".35em")
                    .attr('text-anchor', 'middle')
                    .style('fill', '#fff')
                    .text(function(d) {
                        if(d.dy > 0) {
                            return d.children ? null : d.key;
                        }
                    })
                    .style('fill-opacity', function(d){
                        var box = {
                            w: this.parentNode.querySelector('rect').getBoundingClientRect().width,
                            h: this.parentNode.querySelector('rect').getBoundingClientRect().height
                        };
                        if(box.w < this.clientWidth || box.h + 10 < this.clientHeight) {
                            return 0;
                        } else {
                            return 1;
                        }
                    });

            }
            draw(_data);
        });
    }
    exports.options = function(opt) {
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
