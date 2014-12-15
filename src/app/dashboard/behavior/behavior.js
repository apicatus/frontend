/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.behavior', [
    'ngChart'
])
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state('main.dashboard.behavior', {
        url: '/behavior/:id/?since&until',
        views: {
            'widgets': {
                templateUrl: 'dashboard/behavior/behavior.tpl.html',
                controller: 'DashboardBehaviorCtrl as behavior'
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
            unique: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('unique/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('unique').get(queryFactory().get());
                }
            }],
            methodstatsbydate: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('methodstatsbydate/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('methodstatsbydate').get(queryFactory().get());
                }
            }]
        },
        data: { pageTitle: 'Behavior' },
        onEnter: function(){
            console.log("enter behavior");
        }
    });
})
.factory('getMethodColor', [function(){
    var colors = {
        /* Methods Colors */
        'GET': '#0064CD',
        'POST': '#46A546',
        'PUT': '#FF7D00',
        'DELETE': '#BD2C00',
        'OPTIONS': '#9C1ACA',
        'HEAD': '#3BD9EC',
        'CONNECT': '#A9304F',
        'PATCH': '#E7CA29',
        'TRACE': '#F577CD'
    };
    return function(methodName){
        return colors[methodName];
    };
}])
.controller( 'DashboardBehaviorCtrl', function DashboardBehaviorController( $scope, queryFactory, Restangular, apis, transferStatistics, methodstatsbydate, unique, getMethodColor) {
    var behavior = this;
    behavior.apis = apis;

    ///////////////////////////////////////////////////////////////////////////
    // Chart config                                                          //
    ///////////////////////////////////////////////////////////////////////////
    behavior.timeChartOptions = {
        chart: {
            type: 'area'
        },
        plotOptions: {
            series: {
                animation: false,
                pointInterval: unique.period.interval.value,
                pointStart: queryFactory().get().since
            }
        },
        yAxis: {
            ticks: 2
        },
        xAxis: {
            tickInterval: queryFactory().get().interval
        }
    };
    behavior.hover = function(args) {
        console.log("args: ", args);
    };

    behavior.hasData = transferStatistics.aggregations.statuses.buckets.length;
    behavior.unique = unique.aggregations.unique;
    behavior.calls = unique.aggregations.count;
    behavior.realCodeStats = transferStatistics.aggregations.statuses.buckets.map(function(code){
        return {
            name: code.key,
            value: code.doc_count
        };
    });

    behavior.uniqueHistogram = {
        series: [
            {
                name: 'unique',
                stroke: '#a00040',
                data: unique.aggregations.history.buckets.map(function(history){
                    return history.ip_count.value || 0;
                })
            }
        ]
    };

    // Aggregate traffic status codes
    behavior.codeStatsChilds = transferStatistics.aggregations.statuses.buckets.reduce(function(previousValue, currentValue, index, array){
        var current = parseInt(array[index].key, 10);
        var previous = previousValue.filter(function(value) {
            return (current >= value.key && current < value.key + 100);
        })[0];

        previous.doc_count = previous.doc_count ? previous.doc_count + array[index].doc_count : array[index].doc_count; //previous.doc_count > 0 ? array[index].doc_count : array[index].doc_count + previous.doc_count

        previous.children = previous.children || [];
        previous.children.push(array[index]);

        return previousValue;
    }, [{key: 100}, {key: 200}, {key: 300}, {key: 400}, {key: 500}]);

    behavior.codeStats = {
        name: "tree",
        children: behavior.codeStatsChilds
    };

    if($scope.selectedApi) {
        behavior.methodStats = $scope.selectedApi.endpoints.map(function(endpoint){
            return {
                name: endpoint.name || 'endpoint',
                children: endpoint.methods.map(function(method){
                    return {
                        id: method._id,
                        name: method.URI,
                        color: getMethodColor(method.method),
                        stats: methodstatsbydate.aggregations.methods.buckets.filter(function(bucket){
                            return bucket.key === method._id;
                        })[0]
                    };
                })
            };
        });
    } else {
        behavior.methodStats = behavior.apis.map(function(api){
            return {
                name: api.name,
                color: api.color,
                children: api.endpoints.map(function(endpoint){
                    return {
                        name: endpoint.name || 'endpoint',
                        children: endpoint.methods.map(function(method){
                            return {
                                id: method._id,
                                name: method.URI,
                                color: getMethodColor(method.method),
                                stats: methodstatsbydate.aggregations.methods.buckets.filter(function(bucket){
                                    return bucket.key === method._id;
                                })[0]
                            };
                        })
                    };
                })
            };
        });
    }

});
