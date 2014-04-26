/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.geo', [
    'D3Service',
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])
.controller( 'DashboardGeoCtrl', function DashboardGeoController( $scope, $location, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings, ngTableParams ) {
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

        $scope.geoData = {
            type: "GeoChart",
            options: {
                height: 400,
                animation: {
                    duration: 1000,
                    easing: 'inAndOut'
                },
                backgroundColor: "transparent",
                colors: ['#edc951', '#eb6841'],
                chartArea: { left: 20, top: 0, width: "80%", height: "85%"},
                bar: { groupWidth: '75%' },
                legend: {
                    textStyle: { color: '#666', fontName: 'Titillium Web', fontSize: 9 }
                },
                tooltip: {
                    textStyle: { color: '#666', fontName: 'Titillium Web', fontSize: 11 }
                },
                isStacked: true,
                vAxis: {
                    title: 'Total bytes transferred',
                    titleTextStyle: { color: '#666', fontName: 'Titillium Web', italic: false },
                    gridlines: { color: '#DDD' },
                    minorGridlines: { color: '#eee', count: 2 },
                    baselineColor: '#ccc'
                },
                hAxis: {
                    baselineColor: '#ccc',
                    textStyle: { color: '#666', fontName: 'Titillium Web', fontSize: 9, italic: false }
                }
            },
            data: country
        };
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
