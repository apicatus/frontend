/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.behavior', [
    'vectorMap',
    'stackedBarChart',
    'bivariateChart',
    'worldMap',
    'treeMap'
])
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state('main.dashboard.behavior', {
        url: '/behavior/:id/?since&until',
        templateUrl: 'dashboard/behavior/behavior.tpl.html',
        controller: 'DashboardBehaviorCtrl as behavior',
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
            }]
        },
        data: { pageTitle: 'Behavior' },
        onEnter: function(){
            console.log("enter behavior");
        }
    });
})
.controller( 'DashboardBehaviorCtrl', function DashboardBehaviorController( $scope, queryFactory, Restangular, apis, transferStatistics, unique) {
    var behavior = this;

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
                pointInterval: queryFactory().get().interval, // one day
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

    console.log("uniqueHistogram: ", behavior.uniqueHistogram);

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

});
