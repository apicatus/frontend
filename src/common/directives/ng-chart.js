///////////////////////////////////////////////////////////////////////////////
// @file         : ng-carts.js                                               //
// @summary      : Apicatus muti purpose charting directive                  //
// @version      : 0.1                                                       //
// @project      : Apicatus                                                  //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 19 Oct 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('ngChart', ['D3Service', 'ProjectionService', 'TopoJsonService'])
.directive('ngChart', ['$timeout', '$window', '$q', 'D3Service', 'ProjectionService', 'TopoJsonService', function($timeout, $window, $q, D3Service, ProjectionService, TopoJsonService) {
    return {
        restrict: 'E',
        scope: {
            title: '@',
            type: '@',
            data: '=',
            options: '=',
            hovered: '&hovered'
        },
        link: function(scope, element, attrs) {
            var chartEl,
                chart,
                size = {
                    width: 0,
                    height: 0
                },
                canvasIsReady = false;

            ///////////////////////////////////////////////////////////////////
            // This bit deals with charts inside tabs                        //
            ///////////////////////////////////////////////////////////////////
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes') {
                        var isActive = mutation.target.classList.contains('active');
                        if(isActive) {
                            console.log("observe ng-chart !");
                            setupChart(element);
                        }
                    }
                });
            });

            function setupChart(canvas) {
                var width = canvas[0].offsetWidth;
                var height = canvas[0].offsetHeight;

                // No redraw
                if(canvasIsReady && (size.width == width || size.height == height)) {
                    return;
                }

                size = {
                    width: width,
                    height: height
                };

                // Chart Setup
                chartEl.call(chart.height(size.height));
                chartEl.call(chart.width(size.width));

                canvasIsReady = true;

                // Data migth be ready to be used, trigger a digest to
                // Specially for controller with resolved data !
                return scope.$evalAsync(function() {
                    render();
                });
            }

            ///////////////////////////////////////////////////////////////////
            // Watch data & options changes then call render                 //
            ///////////////////////////////////////////////////////////////////
            function render(canvas) {
                var rendered = false;
                // Update Options
                scope.$watch('options', function (newVal, oldVal) {
                    chartEl.call(chart.options(newVal));
                }, true);

                // Update series data
                if(angular.isArray(scope.data)) {

                    scope.$watchCollection('data', function (newVal, oldVal) {
                        if ((newVal === oldVal) && rendered) {
                            return;
                        }
                        console.log("change on data array");
                        chartEl.datum(scope.data).call(chart);
                        rendered = true;
                    }, true);

                } else {

                    scope.$watch('data', function (newVal, oldVal) {
                        if (newVal === oldVal && rendered) {
                            return;
                        }
                        console.log("change on data object");
                        chartEl.datum(scope.data).call(chart);
                        rendered = true;
                    }, true);

                }
            }

            ///////////////////////////////////////////////////////////////////
            // D3 Service is ready ?                                         //
            ///////////////////////////////////////////////////////////////////
            $q.all([D3Service.d3(), TopoJsonService.topojson(), ProjectionService.projection()]).then(function (result){
                var d3 = result[0];
                chart = charts[scope.type]();
                chartEl = d3.select(element[0]);

                var panel = $(element).closest('.tab-pane:not(.active)')[0];
                // Chart inside a panel ? or div with display:none ?
                if(panel) {
                    observer.observe(panel, {
                        attributes: true,
                        childList: true,
                        characterData: true
                    });
                } else {
                    console.log("direct render !");
                    setupChart(element);
                }
            });
            angular.element($window).bind('resize', function(){
                //setupChart(element);
            });
            scope.$on('$destroy', function() {
                //angular.element($window).unbind('resize', delayedResize);
                console.log("DESTROY CHART");
            });
        }
    };
}]);
