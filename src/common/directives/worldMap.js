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
            addRoute: '=',
            hovered: '&hovered'
        },
        controller: function( $scope, $element, $attrs, D3Service, ProjectionService, TopoJsonService) {
            $q.all([D3Service.d3(), TopoJsonService.topojson(), ProjectionService.projection()]).then(function (result){
                var d3 = result[0];
                var topojson = result[1];

                var worldmap = charts.worldmap();
                var el = d3.select($element[0]);

                var width = $($element[0].parentElement).width();
                var height = $($element[0].parentElement).height();
                worldmap.height(height);
                worldmap.width(width);

                $scope.$watchCollection('data', function (newVal, oldVal) {
                    el.datum(newVal).call(worldmap);
                }, true);

                $scope.$watch('addRoute', function (newVal, oldVal) {
                    worldmap.addRoute(newVal.origin, newVal.destination);
                }, false);

            });
        }
    };
});
