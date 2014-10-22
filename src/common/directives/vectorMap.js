// AngularJS directives for jvectormap
angular.module('vectorMap', [])
.directive('vectorMap', ['$timeout', function ($timeout) {
    'use strict';
    return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            var map = null;


            scope.$watch(attrs.ngModel, function () {
                $timeout(function() {
                    render();
                }, 0);
            });
            scope.$watch(attrs.opts, function() {
                //render();
            });
            var render = function () {
                var model = ngModel.$viewValue;
                if(!model) {
                    return;
                }
                if(!map) {
                    map = $(element).vectorMap({
                        map: 'world_mill_en',
                        markers: [{
                            latLng: [40.71, -74],
                            name: "New York"
                        }],
                        series: {
                            regions: [{
                                values: model,
                                scale: ['#C8EEFF', '#49c5b1']
                            }]
                        },
                        regionStyle: {
                            initial: {
                                fill: "#EEEFF3"
                            },
                            hover: {
                                fill: '#555555'
                            }
                        },
                        markerStyle: {
                            initial: {
                                fill: "#BF616A",
                                stroke: "rgba(191,97,106,.8)",
                                "fill-opacity": 1,
                                "stroke-width": 9,
                                "stroke-opacity": 0.5
                            },
                            hover: {
                                stroke: "black",
                                "stroke-width": 2
                            }
                        },
                        normalizeFunction: 'polynomial',
                        zoomOnScroll: !1,
                        backgroundColor: null
                    });
                } else {
                    var mapObject = map.vectorMap('get', 'mapObject');
                    mapObject.reset();
                    mapObject.series.regions[0].setValues(model);
                    mapObject.series.regions[0].setScale(['#C8EEFF','#0071A4']);
                    mapObject.series.regions[0].setNormalizeFunction('polynomial');
                }
            };
        }
    };
}]);
