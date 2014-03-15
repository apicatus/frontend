////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('budgetDonut', ['d3Service'])
.directive('budgetDonut', function () {
    return {
        restrict: 'E',
        scope:{
            title: '@',
            data: '=',
            validMetrics: '=',
            competitors: '=',
            onClick: "&"
        },
        controller: function( $scope, $element, $attrs, d3Service ) {
            d3Service.d3().then(function(d3) {
                var makeDonut = function(placeholder, width, height) {
                    ////////////////////////////////////////////////////////////////////////////
                    // Settings                                                               //
                    ////////////////////////////////////////////////////////////////////////////
                    var radius = Math.min(width, height) / 2;

                    var color = d3.scale.ordinal()
                        .range(["#2ad2bb", "#ee9748", "#e24348", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                    var arc = d3.svg.arc()
                        .outerRadius(radius)
                        .innerRadius(radius - 40);

                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function(d) { return d.population; });

                    var svg = d3.select(placeholder).append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    $scope.data.forEach(function(d) {
                        d.population = +d.population;
                    });

                    var g = svg.selectAll(".arc")
                        .data(pie($scope.data))
                    .enter().append("g")
                        .attr("class", "arc");

                    var path = g.append("path")
                        .attr("d", arc)
                        .style("fill", function(d) { return color(d.data.media); })
                        .each(function(d) { this._current = d; }); // store the initial angles

                    g.append("text")
                        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                        .attr("dy", ".35em")
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.data.media; });
                    // watch for data changes and re-render
                    $scope.$watch('data', function(newVals, oldVals) {
                        //console.log("donut change date: ", path.data());
                        //pie.value(function(d) { return d.population; });
                        path.data(pie($scope.data)); // compute the new angles
                        path.transition().duration(750).attrTween("d", arcTween); // redraw the arcs
                        //return $scope.render($element[0], newVals, $element[0].parentElement.clientWidth, 200);
                    }, true);

                    // Store the displayed angles in _current.
                    // Then, interpolate from _current to the new angles.
                    // During the transition, _current is updated in-place by d3.interpolate.
                    function arcTween(a) {
                        var i = d3.interpolate(this._current, a);
                        this._current = i(0);
                        return function(t) {
                            return arc(i(t));
                        };
                    }

                    $(window).resize(function() {
                        var wi = $(placeholder).width();
                        var gr = d3.select(placeholder).select("svg");
                        gr.attr("width", wi);
                    });

                    return this;
                };

                var donut = makeDonut($element[0], $element[0].parentElement.clientWidth, $element[0].parentElement.clientHeight);
                console.log("donut: ", $element[0].parentElement.clientHeight);
            });
        }
    };
});
