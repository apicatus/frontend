var charts = charts || {};

charts.donut = function module() {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 200,
        height = 200,
        arc = 0,
        radius = 0,
        r = 100,
        ir = 45,
        ease = 'cubic-in-out',
        textOffset = 14,
        tweenDuration = 750;

    //OBJECTS TO BE POPULATED WITH DATA LATER
    var lines, valueLabels, nameLabels;
    var pieData = [];
    var oldPieData = [];
    var filteredPieData = [];

    var donut = null;

    var svg, container = null, duration = 650;
    var stack = d3.layout.stack();
    var dispatch = d3.dispatch('customHover');
    var color = d3.scale.ordinal()
        .range(["#00acac", "#348FE1", "#ff5b57", "#f59c1a", "#727cb6", "#49b6d6", "#348fe2"]);
    var keys = {
        property: 'value',
        caption: 'name'
    };
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                return;
            }
            ///////////////////////////////////////////////////////////
            // GENERATE FAKE DATA /////////////////////////////////////
            ///////////////////////////////////////////////////////////

            var arrayRange = 100000; //range of potential values for each item
            var arraySize;
            var streakerDataAdded;

            function fillArray() {
                return {
                    port: "port",
                    octetTotalCount: Math.ceil(Math.random() * (arrayRange))
                };
            }
            //D3 helper function to populate pie slice parameters from array data
            var donut = d3.layout.pie().value(function(d) {
                return d[keys.property];
            });

            var graph = this;

            function draw(data) {
                var size = {
                    'width': width - margin.left - margin.right,
                    'height': height - margin.top - margin.bottom
                };
                
                radius = Math.min(size.width, size.height) / 2;

                var pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d[keys.property]; });

                // Create SVG element
                if(!svg) {
                    svg = d3.select(graph)
                        .append("svg")
                        .attr("width", size.width)
                        .attr("height", size.height);
                }

                //GROUP FOR ARCS/PATHS
                var arc_group = svg.append("g")
                    .attr("class", "arc")
                    .attr("transform", "translate(" + (size.width / 2) + "," + (size.height / 2) + ")");

                //GROUP FOR LABELS
                var label_group = svg.append("svg:g")
                    .attr("class", "label_group")
                    .attr("transform", "translate(" + (size.width / 2) + "," + (size.height / 2) + ")");

                //GROUP FOR CENTER TEXT  
                var center_group = svg.append("svg:g")
                    .attr("class", "center_group")
                    .attr("transform", "translate(" + (size.width / 2) + "," + (size.height / 2) + ")");

                //PLACEHOLDER GRAY CIRCLE
                var paths = arc_group.append("svg:circle")
                    .attr("fill", "#EFEFEF")
                    .attr("r", r);

                ///////////////////////////////////////////////////////////
                // CENTER TEXT ////////////////////////////////////////////
                ///////////////////////////////////////////////////////////

                //WHITE CIRCLE BEHIND LABELS
                var whiteCircle = center_group.append("svg:circle")
                    .attr("fill", "white")
                    .attr("r", ir);

                // "TOTAL" LABEL
                var totalLabel = center_group.append("svg:text")
                    .attr("class", "label")
                    .attr("dy", -15)
                    .attr("text-anchor", "middle") // text-align: right
                    .text("TOTAL");

                //TOTAL TRAFFIC VALUE
                var totalValue = center_group.append("svg:text")
                    .attr("class", "total")
                    .attr("dy", 7)
                    .attr("text-anchor", "middle") // text-align: right
                    .text("Waiting...");

                //UNITS LABEL
                var totalUnits = center_group.append("svg:text")
                    .attr("class", "units")
                    .attr("dy", 21)
                    .attr("text-anchor", "middle") // text-align: right
                    .text("kb");

                //var updateInterval = window.setInterval(update, 1500);
                update();
                // to run each time data is generated
                function update() {

                    var totalOctets = 0;
                    filteredPieData = donut(data).filter(filterData);

                    function filterData(element, index, array) {
                        element.name = data[index][keys.caption];
                        element.value = data[index][keys.property];
                        totalOctets += element.value;
                        return (element.value > 0);
                    }

                    if (filteredPieData.length > 0) {

                        //REMOVE PLACEHOLDER CIRCLE
                        arc_group.selectAll("circle").remove();

                        totalValue.text(function() {
                            var kb = totalOctets / 1024;
                            return kb.toFixed(1);
                            //return bchart.label.abbreviated(totalOctets*8);
                        });

                        //DRAW ARC PATHS
                        paths = arc_group.selectAll("path").data(filteredPieData);
                        paths.enter().append("svg:path")
                            .attr("stroke", "white")
                            .attr("class", "slice")
                            .attr("stroke-width", 0.5)
                            .attr("fill", function(d, i) {
                                return color(i);
                            })
                            .transition()
                            .duration(tweenDuration)
                            .attrTween("d", pieTween);
                        paths
                            .transition()
                            .duration(tweenDuration)
                            .attrTween("d", pieTween);
                        paths.exit()
                            .transition()
                            .duration(tweenDuration)
                            .attrTween("d", removePieTween)
                            .remove();

                        //DRAW TICK MARK LINES FOR LABELS
                        lines = label_group.selectAll("line").data(filteredPieData);
                        lines.enter().append("svg:line")
                            .attr("x1", 0)
                            .attr("x2", 0)
                            .attr("y1", -r - 3)
                            .attr("y2", -r - 8)
                            .attr("stroke", "gray")
                            .attr("transform", function(d) {
                                return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
                            });
                        lines.transition()
                            .duration(tweenDuration)
                            .attr("transform", function(d) {
                                return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
                            });
                        lines.exit().remove();

                        //DRAW LABELS WITH PERCENTAGE VALUES
                        valueLabels = label_group.selectAll("text.value").data(filteredPieData)
                            .attr("dy", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                                    return 5;
                                } else {
                                    return -7;
                                }
                            })
                            .attr("text-anchor", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                                    return "beginning";
                                } else {
                                    return "end";
                                }
                            })
                            .text(function(d) {
                                var percentage = (d.value / totalOctets) * 100;
                                return percentage.toFixed(1) + "%";
                            });

                        valueLabels.enter().append("svg:text")
                            .attr("class", "value")
                            .attr("transform", function(d) {
                                return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
                            })
                            .attr("dy", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                                    return 5;
                                } else {
                                    return -7;
                                }
                            })
                            .attr("text-anchor", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                                    return "beginning";
                                } else {
                                    return "end";
                                }
                            }).text(function(d) {
                                var percentage = (d.value / totalOctets) * 100;
                                return percentage.toFixed(1) + "%";
                            });

                        valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

                        valueLabels.exit().remove();

                        //DRAW LABELS WITH ENTITY NAMES
                        nameLabels = label_group.selectAll("text.units").data(filteredPieData)
                            .attr("dy", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                                    return 17;
                                } else {
                                    return 5;
                                }
                            })
                            .attr("text-anchor", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                                    return "beginning";
                                } else {
                                    return "end";
                                }
                            }).text(function(d) {
                                return d.name;
                            });

                        nameLabels.enter().append("svg:text")
                            .attr("class", "units")
                            .attr("transform", function(d) {
                                return "translate(" + Math.cos(((d.startAngle + d.endAngle - Math.PI) / 2)) * (r + textOffset) + "," + Math.sin((d.startAngle + d.endAngle - Math.PI) / 2) * (r + textOffset) + ")";
                            })
                            .attr("dy", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 > Math.PI / 2 && (d.startAngle + d.endAngle) / 2 < Math.PI * 1.5) {
                                    return 17;
                                } else {
                                    return 5;
                                }
                            })
                            .attr("text-anchor", function(d) {
                                if ((d.startAngle + d.endAngle) / 2 < Math.PI) {
                                    return "beginning";
                                } else {
                                    return "end";
                                }
                            }).text(function(d) {
                                return d.name;
                            });

                        nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

                        nameLabels.exit().remove();
                    }
                }
            }

            draw(_data);
        });

        //D3 helper function to draw arcs, populates parameter "d" in path object
        var arc = d3.svg.arc()
            .startAngle(function(d) {
                return d.startAngle;
            })
            .endAngle(function(d) {
                return d.endAngle;
            })
            .innerRadius(ir)
            .outerRadius(r);
        ///////////////////////////////////////////////////////////
        // FUNCTIONS //////////////////////////////////////////////
        ///////////////////////////////////////////////////////////

        // Interpolate the arcs in data space.
        function pieTween(d, i) {
            var s0;
            var e0;
            if (oldPieData[i]) {
                s0 = oldPieData[i].startAngle;
                e0 = oldPieData[i].endAngle;
            } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
                s0 = oldPieData[i - 1].endAngle;
                e0 = oldPieData[i - 1].endAngle;
            } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
                s0 = oldPieData[oldPieData.length - 1].endAngle;
                e0 = oldPieData[oldPieData.length - 1].endAngle;
            } else {
                s0 = 0;
                e0 = 0;
            }
            i = d3.interpolate({
                startAngle: s0,
                endAngle: e0
            }, {
                startAngle: d.startAngle,
                endAngle: d.endAngle
            });
            return function(t) {
                var b = i(t);
                return arc(b);
            };
        }

        function removePieTween(d, i) {
            s0 = 2 * Math.PI;
            e0 = 2 * Math.PI;
            i = d3.interpolate({
                startAngle: d.startAngle,
                endAngle: d.endAngle
            }, {
                startAngle: s0,
                endAngle: e0
            });
            return function(t) {
                var b = i(t);
                return arc(b);
            };
        }

        function textTween(d, i) {
            var a;
            if (oldPieData[i]) {
                a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI) / 2;
            } else if (!(oldPieData[i]) && oldPieData[i - 1]) {
                a = (oldPieData[i - 1].startAngle + oldPieData[i - 1].endAngle - Math.PI) / 2;
            } else if (!(oldPieData[i - 1]) && oldPieData.length > 0) {
                a = (oldPieData[oldPieData.length - 1].startAngle + oldPieData[oldPieData.length - 1].endAngle - Math.PI) / 2;
            } else {
                a = 0;
            }
            var b = (d.startAngle + d.endAngle - Math.PI) / 2;

            var fn = d3.interpolateNumber(a, b);
            return function(t) {
                var val = fn(t);
                return "translate(" + Math.cos(val) * (r + textOffset) + "," + Math.sin(val) * (r + textOffset) + ")";
            };
        }
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