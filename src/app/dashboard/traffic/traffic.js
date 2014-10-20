/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.traffic', [
    'D3Service',
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])
.controller( 'DashboardTrafficCtrl', function DashboardTrafficController( $scope, $location, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings, ngTableParams, projects ) {
    console.log("projects: ", projects);
    $scope.$watch('selectedApi', function(newVal, oldVal, scope) {
        if(newVal === oldVal || newVal.length <= 0) {
            return;
        }
        console.log("selectedApi: ", $scope.selectedApi);
        loadStats();
    }, true);
    var loadStats = function() {

        console.log("$scope.dateRange: ", $scope.dateRange);
        Restangular.all('performance').getList({
            api: $scope.selectedApi._id,
            since: $scope.dateRange.since,
            until: $scope.dateRange.until
        }).then(function(data) {
            $scope.performance = data;
        });
        Restangular.all('contentlength').getList({
            api: $scope.selectedApi._id,
            since: $scope.dateRange.since,
            until: $scope.dateRange.until
        }).then(function(data) {
            $scope.contentlength = data[0];
            //console.log("contentlength: ", data[0].value['in'].sum);
            var ivo = data[0].value.dataset.map(function(data, index){
                return [moment(data.date).format('DD MMM'), data.bytesIn, data.bytesOut];
            });
            ivo.unshift(['Date', 'in', 'out']);
            var ticks = data[0].value.dataset.map(function(data, index){
                return new Date(data.date);
            });
            $scope.traffic = {
                performance: {
                    title: "Total bytes transferred",
                    id: 22,
                    width: "100%",
                    height: "480px",
                    aspectRatio: null,
                    chart: {
                        type: "ColumnChart",
                        options: {
                            height: 200,
                            animation: {
                                duration: 1000,
                                easing: 'inAndOut'
                            },
                            backgroundColor: "transparent",
                            fontName: 'Titillium Web',
                            colors: ['#edc951', '#00a0b0', '#cc333f', '#eb6841'],
                            chartArea: { left: 20, top: 0, width: "80%", height: "85%"},
                            bar: { groupWidth: '75%' },
                            legend: { position: 'right', maxLines: 3 },
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
                                textStyle: { color: '#666', fontName: 'Titillium Web', fontSize: 9, italic: false },
                                format: 'MMM d',
                                viewWindowMode: 'explicit',
                                viewWindow: {
                                    max: new Date(),
                                    min: new Date(2014, 3, 26)
                                }
                            }
                        },
                        formatters: {
                            number: [{
                                columnNum: 1,
                                pattern: "$ #,##0.00"
                            }]
                        },
                        data: ivo
                    },
                    maximize: true
                },
                inVsOut: {
                    title: "My Metrics",
                    id: 22,
                    width: "25%",
                    height: "280px",
                    data: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
                    aspectRatio: null,
                    chart: {
                        type: "PieChart",
                        options: {
                            height: 200,
                            displayExactValues: true,
                            backgroundColor: "transparent",
                            is3D: false,
                            colors: ['#edc951', '#00a0b0', '#cc333f', '#eb6841'],
                            chartArea: { width: "85%", height: "85%"},
                            legend: {
                                alignment: 'center',
                                textStyle: { color: '#666', fontName: 'Titillium Web' },
                                position: 'bottom'
                            }
                        },
                        data: [
                            ['Bytes', 'total'],
                            ['in', data[0].value['in'].sum],
                            ['out', data[0].value['out'].sum]
                        ]
                    },
                    maximize: true
                }
            };
        }, function() {
            console.log("There was an error");
        });
    };
})
// We already have a limitTo filter built-in to angular,
// let's make a startFrom filter
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});
