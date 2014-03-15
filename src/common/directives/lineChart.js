////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('lineChart', ['d3Service'])
.directive('lineChart', function () {
    return {
        restrict: 'E',
        scope:{
            title: '@',
            data: '=',
            validMetrics: '=',
            competitors: '=',
            key: '@',
            hovered: '&hovered'
        },
        controller: function( $scope, $element, $attrs, d3Service ) {
            d3Service.d3().then(function(d3) {
                var chart = charts.line();
                var chartEl = d3.select($element[0]);

                chart.on('customHover', function(d, i){
                    //$scope.hovered({args:d});
                });
                var width = $element[0].parentElement.clientWidth;
                var height = $element[0].parentElement.clientHeight;
                chart.height(height);
                chart.width(width);
                $scope.$watchCollection('data', function (newVal, oldVal) {
                    chartEl.datum(newVal).call(chart);
                }, true);
            });
        }
    };
});
