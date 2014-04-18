////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('worldMap', ['D3Service', 'ProjectionService', 'TopoJsonService'])
.directive('worldMap', function ($q) {
    return {
        restrict: 'E',
        scope:{
            title: '@',
            data: '=',
            hovered: '&hovered'
        },
        controller: function( $scope, $element, $attrs, D3Service, ProjectionService, TopoJsonService) {
            $q.all([D3Service.d3(), TopoJsonService.topojson()]).then(function (result){
                var d3 = result[0];
                var topojson = result[1];

                console.log("all is loaded: ", result);
                var worldmap = charts.worldmap();
                var el = d3.select($element[0]);

                var width = $($element[0].parentElement).width();
                var height = $($element[0].parentElement).height();
                worldmap.height(height);
                worldmap.width(width);

                //console.log(width, ",", height, $element[0]);

                $scope.$watchCollection('data', function (newVal, oldVal) {
                    //console.log($scope.data);
                    el.datum(newVal).call(worldmap);
                }, true);

            });
            D3Service.d3().then(function(d3) {
                /*
                var worldmap = charts.worldmap();
                var el = d3.select($element[0]);

                var width = $element[0].parentElement.clientWidth;
                var height = $element[0].parentElement.clientHeight;
                worldmap.height(height);
                worldmap.width(width);

                //console.log(width, ",", height, $element[0]);

                $scope.$watchCollection('data', function (newVal, oldVal) {
                    //console.log($scope.data);
                    el.datum(newVal).call(worldmap);
                }, true);
                */
                /*
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
                */
            });
        }
    };
});
