////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('barChart', ['D3Service'])
.directive('barChart', function () {
    return {
        restrict: 'E',
        scope:{
            title: '@',
            data: '=',
            validMetrics: '=',
            competitors: '=',
            hovered: '&hovered'
        },
        link: function(scope, element, attrs) {

        },
        controller: function( $scope, $element, $attrs, D3Service ) {
            D3Service.d3().then(function(d3) {
                var chart = charts.bars();
                var chartEl = d3.select($element[0]);

                chart.on('customHover', function(d, i){
                    $scope.hovered({args:d});
                });
                $scope.$watch('data', function (newVal, oldVal) {
                    chartEl.datum(newVal).call(chart);
                    var width = $element[0].parentElement.clientWidth;
                    var height = $element[0].parentElement.clientHeight;
                    chartEl.call(chart.height(height));
                    chartEl.call(chart.width(width));
                }, true);

                    var timer = setInterval(function(){
                        //d3.range(~~(Math.random()*50)+1).map(function(d, i){return ~~(Math.random()*1000);})
                        //$scope.data.push(Math.random()*50);
                        $scope.$apply();
                    }, 1500);

            });
            /*d3Service.d3().then(function(d3) {
                var makeBars = function(placeholder, width, height) {
                    ////////////////////////////////////////////////////////////////////////////
                    // Settings                                                               //
                    ////////////////////////////////////////////////////////////////////////////


                    var svg = d3.select(placeholder).append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    // watch for data changes and re-render
                    $scope.$watch('data', function(newVals, oldVals) {

                    }, true);

                    $(window).resize(function() {
                        var wi = $(placeholder).width();
                        var gr = d3.select(placeholder).select("svg");
                        gr.attr("width", wi);
                    });

                    return this;
                };

                //var bars = makeBars($element[0], $element[0].parentElement.clientWidth, $element[0].parentElement.clientHeight);
                console.log("makeBars: ", $element[0].parentElement.clientHeight);
            });*/
        }
    };
});
