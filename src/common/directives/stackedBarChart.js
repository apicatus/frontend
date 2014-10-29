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
                scope.$watchCollection('data', function (newVal, oldVal) {
                    var width = canvas[0].offsetWidth;
                    var height = canvas[0].offsetHeight;
                    chartEl.call(chart.height(height));
                    chartEl.call(chart.width(width));
                    chartEl.datum(newVal).call(chart);
                }, true);
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
        }
    };
}]);
