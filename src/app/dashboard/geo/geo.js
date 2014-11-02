/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.geo', [
    'vectorMap',
    'myGraph',
    'stackedBarChart',
    'bivariateChart',
    'worldMap'
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

    /*Restangular.all('geo').getList().then(function(data) {
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
    });*/
})
.controller( 'MapCtrl', ['$timeout', 'Restangular', function TransferStatisticsController($timeout, Restangular) {

    var map = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();
    var interval = '1d';

    map.load = function(method) {
        Restangular.one('geo/method').getList(method._id, {since: since, until: until}).then(function(records) {
            map.data = records;
        }, function(error) {
            console.log("error getting analitics: ", error);
        });
    };
    
    map.init = function(method) {
        map.method = method;
        map.load(map.method);
    };
}]);
