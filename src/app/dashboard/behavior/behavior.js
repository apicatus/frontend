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
            }]
        },
        data: { pageTitle: 'Behavior' },
        onEnter: function(){
            console.log("enter behavior");
        }
    });
})
.controller( 'DashboardBehaviorCtrl', function DashboardBehaviorController( $scope, $filter, $stateParams, Restangular, apis, transferStatistics) {
    var behavior = this;
    behavior.hasData = transferStatistics.aggregations.statuses.buckets.length;
    behavior.realCodeStats = transferStatistics.aggregations.statuses.buckets.map(function(code){
        return {
            name: code.key,
            value: code.doc_count
        };
    });

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
