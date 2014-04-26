/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.technology', [
    'D3Service',
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])
.controller( 'DashboardTechnologyCtrl', function DashboardTechnologyController( $scope, $location, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings, ngTableParams ) {
    Restangular.all('platform').getList().then(function(data) {
        $scope.platforms = data;
        $scope.devices = data.map(function(data, index) {
            return {
                type: data.ua.device.type || 'desktop'
            };
        });
    }, function() {
        console.log("There was an error");
    });
})
// We already have a limitTo filter built-in to angular,
// let's make a startFrom filter
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});
