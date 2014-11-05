// AngularJS directives for jvectormap
angular.module('vectorMap', [])
.directive('vectorMap', ['$timeout', function ($timeout) {
    'use strict';
    return {
        restrict: 'EAC',
        scope:{
            series: '=',
            markers: '='
        },
        link: function (scope, element, attrs) {
            var map = null;
            scope.$watchCollection('series', function(newVal, oldVal, scope) {
                if(!newVal || newVal.length <= 0) {
                    return;
                }
                var series = newVal.reduce(function(obj, key) {
                    obj[key.key.toUpperCase()] = key.doc_count;
                    return obj;
                }, {});
                $timeout(function() {
                    render(series, []);
                }, 0);
            });
            scope.$watch('markers', function(newVal, oldVal, scope) {
                if(newVal === oldVal || newVal.length <= 0) {
                    return;
                }
                $timeout(function() {
                    render({}, markers);
                }, 0);
            });
            scope.$watch(attrs.opts, function() {
                //render();
            });
            var render = function (series, markers) {
                if(!map) {
                    map = $(element).vectorMap({
                        map: 'world_mill_en',
                        markers: markers,
                        series: {
                            regions: [{
                                values: series,
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
                        backgroundColor: null,
                        onRegionTipShow: function(e, el, code){
                            el.html(el.html()+': '+ (series[code] || 0));
                        }
                    });
                } else {
                    var mapObject = map.vectorMap('get', 'mapObject');
                    mapObject.reset();
                    mapObject.series.regions[0].setValues(series);
                    mapObject.series.regions[0].setValues(markers);
                    //mapObject.series.regions[0].setScale(['#C8EEFF','#0071A4']);
                    //mapObject.series.regions[0].setNormalizeFunction('polynomial');
                }
            };
        }
    };
}]);
