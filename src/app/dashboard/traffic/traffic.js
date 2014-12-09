/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.traffic', [
    'donutChart',
    'ngChart'
])
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state('main.dashboard.traffic', {
        url: '/traffic/:id/?since&until',
        views: {
            'widgets': {
                templateUrl: 'dashboard/traffic/traffic.tpl.html',
                controller: 'DashboardTrafficCtrl as traffic'
            },
            'toolbar': {
                templateUrl: 'dashboard/components/toolbar.tpl.html'
            }
        },
        resolve: {
            transferStatistics: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('transfer/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('transfer').get(queryFactory().get());
                }
            }],
            geo2stats: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('geo2stats/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('geo2stats').get(queryFactory().get());
                }
            }],
            methodstatsbydate: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('methodstatsbydate/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('methodstatsbydate').get(queryFactory().get());
                }
            }],
            apis: ['apis', function(apis) {
                return apis;
            }]
        },
        data: { pageTitle: 'Traffic' },
        onEnter: function(){
            console.log("enter Traffic");
        }
    });
})
.controller( 'DashboardTrafficCtrl', function DashboardTrafficController( $scope, $interval, queryFactory, countryCode, transferStatistics, geo2stats, methodstatsbydate, apis ) {

    var traffic = this;
    traffic.apis = apis;
    traffic.hasData = true;

    //_.findWhere(publicServicePulitzers, {newsroom: "The New York Times"});
    var getCodesFromBuckets = function(buckets) {
        var codeStats = [
            { name: 100, value: 0 },
            { name: 200, value: 0 },
            { name: 300, value: 0 },
            { name: 400, value: 0 },
            { name: 500, value: 0 }
        ];

        buckets.forEach(function(code){
            var key = parseInt(code.key, 10);
            if(key >= 100 && key < 200) {
                codeStats[0].value += code.doc_count;
            } else if(key >= 200 && key < 300) {
                codeStats[1].value += code.doc_count;
            } else if(key >= 300 && key < 400) {
                codeStats[2].value += code.doc_count;
            } else if(key >= 400 && key < 500) {
                codeStats[3].value += code.doc_count;
            } else if(key >= 500) {
                codeStats[4].value += code.doc_count;
            }
        });

        return codeStats;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Chart config                                                          //
    ///////////////////////////////////////////////////////////////////////////
    traffic.timeChartOptions = {
        chart: {
            type: 'area'
        },
        plotOptions: {
            series: {
                animation: false,
                pointInterval: transferStatistics.period.interval.value, // one day
                pointStart: queryFactory().get().since
            }
        },
        xAxis: {
            tickInterval: queryFactory().get().interval
        }
    };

    traffic.scatterplotOptions = {
        chart: {
            type: 'scatter'
        },
        plotOptions: {
            fillOpacity: 0.5,
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                }
            }
        },
        yAxis: {
            title: {
                text: 'Response time'
            }
        },
        xAxis: {
            title: {
                text: 'API calls per minute'
            }
        }
    };

    traffic.mapOptions = {
        plotOptions: {
            fill: '#EEEFF3'
        },
        mapNavigation: {
            enabled: false,
            enableButtons: true
        },
        colorAxis: {
            minColor: '#EEEFF3',
            maxColor: '#49c5b1'
        }
    };

    traffic.timeStats = transferStatistics.aggregations.t_statistics;
    traffic.dataStats = transferStatistics.aggregations.z_statistics;
    traffic.codeStats = transferStatistics.aggregations.statuses.buckets.map(function(code){
        return {
            name: code.key,
            value: code.doc_count
        };
    });

    traffic.timeStatsByDate = {
        avg: transferStatistics.aggregations.history.buckets.map(function(history){
            return history.time_statistics.avg || 0;
        }),
        max: transferStatistics.aggregations.history.buckets.map(function(history){
            return history.time_statistics.max || 0;
        }),
        min: transferStatistics.aggregations.history.buckets.map(function(history){
            return history.time_statistics.min || 0;
        })
    };

    traffic.dataStatsByDate = {
        avg: transferStatistics.aggregations.history.buckets.map(function(history){
            return history.transfer_statistics.avg || 0;
        }),
        max: transferStatistics.aggregations.history.buckets.map(function(history){
            return history.transfer_statistics.max || 0;
        }),
        min: transferStatistics.aggregations.history.buckets.map(function(history){
            return history.transfer_statistics.min || 0;
        })
    };

    // Status aggregations 1XX, 2XX, 3XX, 4XX, 5XX
    traffic.codeStats = getCodesFromBuckets(transferStatistics.aggregations.statuses.buckets);

    // Total 4XX & 5XX Errors
    traffic.totalErrors = traffic.codeStats.reduce(function(previousValue, currentValue, index, array){
        var key = parseInt(currentValue.name, 10);
        var sum = (key >= 400) ? currentValue.value + previousValue : previousValue;
        return sum;
    }, 0);

    traffic.codeStatsByDate = {};
    [100, 200, 300, 400, 500].forEach(function(code){
        traffic.codeStatsByDate[code] = transferStatistics.aggregations.history.buckets.map(function(history) {
            var suma = 0;
            var total = history.statuses.buckets.reduce(function(previousValue, currentValue, index, array){
                var key = parseInt(currentValue.key, 10);
                var sum = (key >= code && key < (code + 100)) ? currentValue.doc_count + previousValue : previousValue;
                return sum;
            }, 0);
            return total;
        });
    });

    traffic.errorHistogram = {
        series: [
            {
                name: '200',
                stroke: '#a00040',
                data: traffic.codeStatsByDate['200']
            }, {
                name: '400',
                stroke: '#fee185',
                data: traffic.codeStatsByDate['400']
            }, {
                name: '500',
                stroke: '#2c87be',
                data: traffic.codeStatsByDate['500']
            }
        ]
    };

    traffic.transactionsHistogram = {
        series: [{
            name: 'transactions',
            stroke: '#a00040',
            data: transferStatistics.aggregations.history.buckets.map(function(history){
                return history.doc_count || 0;
            })
        }]
    };

    traffic.dataHistogram = {
        series: [
            {
                name: 'avg',
                stroke: '#a00040',
                data: traffic.dataStatsByDate.avg
            }, {
                name: 'max',
                stroke: '#fee185',
                data: traffic.dataStatsByDate.max
            }, {
                name: 'min',
                stroke: '#2c87be',
                data: traffic.dataStatsByDate.min
            }
        ]
    };


    traffic.latencyHistogram = {
        series: [
            {
                name: 'avg',
                stroke: '#a00040',
                data: traffic.timeStatsByDate.avg
            }, {
                name: 'max',
                stroke: '#fee185',
                data: traffic.timeStatsByDate.max
            }, {
                name: 'min',
                stroke: '#2c87be',
                data: traffic.timeStatsByDate.min
            }
        ]
    };

    // Response time vs Requests per XXX
    traffic.scatterplot = {
        series: [
            {
                name: 'response',
                data: transferStatistics.aggregations.history.buckets.map(function(history){
                    return [history.doc_count / ((queryFactory().get().interval / 1000) / 60), history.time_statistics.avg || 0];
                })
            }, {
                name: 'max',
                fill: '#2c87be',
                data: transferStatistics.aggregations.history.buckets.map(function(history){
                    return [history.doc_count / ((queryFactory().get().interval / 1000) / 60), history.time_statistics.max || 0];
                })
            }
        ]
    };

    traffic.donut = {
        series: [{
            name: 'Error',
            minColor: '#49c5b1',
            maxColor: '#F90101',
            data: [] //traffic.codeStats
        }]
    };

    traffic.map = {
        regions: [{
            name: 'mobile',
            minColor: '#49c5b1',
            maxColor: '#F90101',
            data: geo2stats.aggregations.summary.buckets.map(function(d){
                return {
                    key: countryCode.isoConvert(d.key).toUpperCase(),
                    value: d.doc_count
                };
            })
        }]
    };

    traffic.countryClick = function(contry) {
        //alert(contry.properties.name + ":" + contry.properties.value);
        console.log("traffic.codeStats", traffic.codeStats);
        traffic.donut.series[0].name = contry.properties.name;
        traffic.donut.series[0].data = [{
            name: 'pepe',
            value: Math.random() * 10000
        }, {
            name: 'anna',
            value: Math.random() * 10000
        }];
    };

    traffic.methodStats = methodstatsbydate.aggregations.methods.buckets;
    traffic.methodStats.forEach(function(stat){
        if($scope.selectedApi) {
            $scope.selectedApi.endpoints.forEach(function(endpoint){
                endpoint.methods.forEach(function(method){
                    if(stat.key == method._id) {
                        stat.method = method;
                        stat.api = $scope.selectedApi.name;
                    }
                });
            });
        } else {
            traffic.apis.forEach(function(api){
                api.endpoints.forEach(function(endpoint){
                    endpoint.methods.forEach(function(method){
                        if(stat.key == method._id) {
                            stat.method = method;
                            stat.api = api.name;
                        }
                    });
                });
            });
        }
    });

});
