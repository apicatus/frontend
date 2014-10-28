////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('stackedBarChart', ['D3Service'])
.directive('stackedBarChart', ['$timeout', '$window', 'D3Service', function($timeout, $window, D3Service) {
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
            var chartEl, chart;
            var observer = new MutationObserver(function(mutations) {  
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes') {
                        var isActive = mutation.target.classList.contains('active');
                        if(isActive) {
                            render(scope.data, element);
                        }
                    }
                });
            });

            var render = function(data, canvas) {
                var width = canvas[0].offsetWidth;
                var height = canvas[0].offsetHeight;
                console.log("height: " + height + " width: " + width);
                chartEl.call(chart.height(height));
                chartEl.call(chart.width(width));
                chartEl.datum(data).call(chart);
            };

            D3Service.d3().then(function(d3) {
                chart = charts.stacked();
                chartEl = d3.select(element[0]);

                var panel = $(element).closest('.tab-pane')[0];
                if(panel) {
                    observer.observe(panel, {
                        attributes: true, 
                        childList: true, 
                        characterData: true 
                    });
                } else {
                    render(scope.data, element);
                }
            });
            angular.element($window).bind('resize', function(){
                render(scope.data, element);
            });
        },
        controller: function( $scope, $element, $attrs, D3Service ) {
            /*D3Service.d3().then(function(d3) {
                var chart = charts.stacked();
                var chartEl = d3.select($element[0]);

                $scope.$watch('data', function (newVal, oldVal) {
                    chartEl.datum(newVal).call(chart);
                    var width = $element[0].offsetWidth;
                    var height = $element[0].offsetHeight;
                    console.log("height: " + height + " width: " + width);
                    window.pepe = $element[0];
                    chartEl.call(chart.height(height));
                    chartEl.call(chart.width(width));
                }, true);
            });*/
        }
    };
}]);
