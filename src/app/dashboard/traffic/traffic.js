/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.traffic', [
    'donutChart'
])
.controller( 'DashboardTrafficCtrl', function DashboardTrafficController( $scope, transferStatistics ) {
    var traffic = this;

    traffic.timeStats = transferStatistics.aggregations.t_statistics;
    traffic.dataStats = transferStatistics.aggregations.z_statistics;
    traffic.codeStats = transferStatistics.aggregations.statuses.buckets.map(function(code){
        return {
            name: code.key,
            value: code.doc_count
        };
    });

    $scope.myData = [
        {
            name: "BytesIn",
            value: 100
        }, {
            name: "BytesOut",
            value: 200
        }
    ];
});
