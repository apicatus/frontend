/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.geo', [
    'D3Service',
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])
.controller( 'DashboardGeoCtrl', function DashboardGeoController( $scope, $location, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings ) {
    $scope.worldMap = [{
        latLng: [40.71, -74],
        name: "New York"
    }, {
        latLng: [39.9, 116.4],
        name: "Beijing"
    }, {
        latLng: [31.23, 121.47],
        name: "Shanghai"
    }, {
        latLng: [-33.86, 151.2],
        name: "Sydney"
    }];

    Restangular.all('geo').getList().then(function(data) {
        //console.log("geo: ", angular.copy(geo));
        $scope.geoRaw = data.map(function(data, index) {
            var flag = 'https://cdn.rawgit.com/koppi/iso-country-flags-svg-collection/master/svg/country-4x3/' + data._id.toLowerCase() + '.svg';
            return [
                data._id,
                data.total,
                data.minTime,
                data.maxTime,
                data.avgTime,
                flag
            ];
        });
        $scope.totalSessions = data.reduce(function(previousValue, currentValue) {
            return currentValue.total + previousValue;
        }, 0);

        var country = data.map(function(data, index){
            return [data._id, data.total, data.minTime];
        });
        country.unshift(['Country', 'Hits', 'Min Response Time']);

    }, function() {
        console.log("There was an error");
    });

    Restangular.all('languages').getList().then(function(data) {
        $scope.languages = data;
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
