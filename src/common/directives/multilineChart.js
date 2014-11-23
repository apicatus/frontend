////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('multilineChart', ['D3Service'])
.directive('multilineChart', ['$timeout', '$window', 'D3Service', function($timeout, $window, D3Service) {
    return {
        restrict: 'E',
        scope:{
            title: '@',
            data: '=',
            options: '=',
            hovered: '&hovered'
        },
        link: function(scope, element, attrs) {
            var chartEl, chart;
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes') {
                        var isActive = mutation.target.classList.contains('active');
                        if(isActive) {
                            render(element);
                        }
                    }
                });
            });

            var render = function(canvas) {

                var width = canvas[0].offsetWidth;
                var height = canvas[0].offsetHeight;

                chartEl.call(chart.height(height));
                chartEl.call(chart.width(width));
                chartEl.call(chart.options(scope.options));
                if(scope.data && scope.data.length > 0 ) {
                    chartEl.datum(scope.data).call(chart);
                }
                // Update series data
                scope.$watchCollection('data', function (newVal, oldVal) {
                    chartEl.datum(newVal).call(chart);
                }, true);
                // Update Options
                scope.$watch('options', function (newVal, oldVal) {
                    chartEl.call(chart.options(newVal));
                }, true);
            };

            D3Service.d3().then(function(d3) {
                chart = charts.multiline();
                chartEl = d3.select(element[0]);

                var panel = $(element).closest('.tab-pane:not(.active)')[0];
                if(panel) {
                    observer.observe(panel, {
                        attributes: true,
                        childList: true,
                        characterData: true
                    });
                } else {
                    render(element);
                }
            });
            angular.element($window).bind('resize', function(){
                //render(element);
            });
            scope.$on('$destroy', function() {
                //angular.element($window).unbind('resize', delayedResize);
                console.log("DESTROY MULTILINE");
            });
        }
    };
}]);
