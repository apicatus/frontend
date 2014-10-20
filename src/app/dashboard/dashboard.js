/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */

angular.module( 'apicatus.dashboard', [
    'apicatus.dashboard.geo',
    'apicatus.dashboard.technology',
    'apicatus.dashboard.traffic',
    'D3Service',
    'worldMap',
    'budgetDonut',
    'barChart',
    'lineChart'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state( 'main.dashboard', {
        url: '/dashboard',
        abstract: true,
        template: '<ui-view/>',
        views: {
            "main": {
                controller: 'DashboardCtrl',
                templateUrl: 'dashboard/dashboard.tpl.html'
            }
        },
        data: { pageTitle: 'Dashboard' },
        authenticate: true
    })
    .state('main.dashboard.traffic', {
        url: '/traffic',
        templateUrl: 'dashboard/traffic/traffic.tpl.html',
        controller: 'DashboardTrafficCtrl',
        data: { pageTitle: 'Traffic' },
        //authenticate: true,
        resolve: {
            projects: function($stateParams, $timeout, $q) {
                var deferred = $q.defer();
                //console.log("scope", $scope);
                $timeout(function(){
                    deferred.resolve([{ id: 0, name: "Alice" }, { id: 1, name: "Bob" }]);
                }, 1500);
                return deferred.promise;
            }
        },
        onEnter: function(){
            console.log("enter Traffic");
        }
    })
    .state('main.dashboard.geo', {
        url: '/geo',
        templateUrl: 'dashboard/geo/geo.tpl.html',
        controller: 'DashboardGeoCtrl',
        data: { pageTitle: 'Geo' },
        onEnter: function(){
            console.log("enter geo");
        }
    })
    .state('main.dashboard.behavior', {
        url: '/behavior',
        templateUrl: 'dashboard/behavior/behavior.tpl.html',
        data: { pageTitle: 'Behavior' },
        //authenticate: true,
        onEnter: function(){
            console.log("enter behavior");
        }
    })
    .state('main.dashboard.timeline', {
        url: '/timeline',
        templateUrl: 'dashboard/timeline/timeline.tpl.html',
        data: { pageTitle: 'Timeline' },
        //authenticate: true,
        onEnter: function(){
            console.log("enter timeline");
        }
    })
    .state('main.dashboard.technology', {
        url: '/technology',
        templateUrl: 'dashboard/technology/technology.tpl.html',
        controller: 'DashboardTechnologyCtrl',
        data: { pageTitle: 'Technology' },
        //authenticate: true,
        onEnter: function(){
            console.log("enter technology");
        }
    });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DashboardCtrl', function DashboardController( $scope, $modal, Restangular  ) {
    var baseDigestors = Restangular.all('digestors');
    $scope.potatoes = 55;
    $scope.selectedApi = {};
    $scope.dateRange = {
        since: moment().subtract('days', 29).valueOf(),
        until: moment().valueOf()
    };
    $scope.widgets = [{
        title: "My Metrics",
        id: 22,
        width: "100%",
        height: "280px",
        data: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
        aspectRatio: null,
        chart: {
            "type": "AreaChart",
            "displayed": true,
            "data": {
                "cols": [{
                    "id": "month",
                    "label": "Month",
                    "type": "string",
                    "p": {}
                }, {
                    "id": "laptop-id",
                    "label": "Laptop",
                    "type": "number",
                    "p": {}
                }, {
                    "id": "desktop-id",
                    "label": "Desktop",
                    "type": "number",
                    "p": {}
                }, {
                    "id": "server-id",
                    "label": "Server",
                    "type": "number",
                    "p": {}
                }, {
                    "id": "cost-id",
                    "label": "Shipping",
                    "type": "number"
                }],
                "rows": [{
                    "c": [{
                        "v": "January"
                    }, {
                        "v": 19,
                        "f": "42 items"
                    }, {
                        "v": 12,
                        "f": "Ony 12 items"
                    }, {
                        "v": 7,
                        "f": "7 servers"
                    }, {
                        "v": 4
                    }]
                }, {
                    "c": [{
                        "v": "February"
                    }, {
                        "v": 13
                    }, {
                        "v": 1,
                        "f": "1 unit (Out of stock this month)"
                    }, {
                        "v": 12
                    }, {
                        "v": 2
                    }]
                }, {
                    "c": [{
                        "v": "March"
                    }, {
                        "v": 24
                    }, {
                        "v": 5
                    }, {
                        "v": 11
                    }, {
                        "v": 6
                    }]
                }]
            },
            options: {
                height: 200,
                backgroundColor: "transparent",
                colors: ['#edc951', '#00a0b0', '#cc333f', '#eb6841'],
                chartArea: { left: 20, top: 0, width: "90%", height: "85%"},
                bar: { groupWidth: '75%' },
                legend: { position: 'top', maxLines: 3 },
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
            "formatters": {}
        },
        maximize: true
        }, {
        title: "My Metrics",
        id: 22,
        width: "25%",
        height: "280px",
        data: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
        aspectRatio: null,
        chart: {
            type: "PieChart",
            options: {
                displayExactValues: true,
                backgroundColor: "transparent",
                is3D: false,
                colors: ['#edc951', '#00a0b0', '#cc333f', '#eb6841'],
                chartArea: {
                    left: 10,
                    top: 0,
                    right: 10,
                    bottom: 10,
                    width: "100%",
                    height: 240
                }
            },
            formatters: {
                number: [{
                    columnNum: 1,
                    pattern: "$ #,##0.00"
                }]
            },
            data: [
                ['Media', 'Share'],
                ['Tv', 44],
                ['Radio', 22],
                ['Internet', 33]
            ]
        },
        maximize: true
        }, {
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
                    textStyle: { color: '#666', fontName: 'Titillium Web', fontSize: 9, italic: false }
                }
            },
            formatters: {
                number: [{
                    columnNum: 1,
                    pattern: "$ #,##0.00"
                }]
            },
            data: [
                ['Year', 'Sent', 'Received', "Debt"],
                ['2000', 1000, 300, 10],
                ['2001', 800, 430, 70],
                ['2002', 920, 530, 50],
                ['2003', 710, 630, 40],
                ['2004', 680, 730, 30],
                ['2005', 1170, 460, 60],
                ['2006', 660, 120, 340],
                ['2007', 830, 520, 80],
                ['2008', 930, 550, 55],
                ['2009', 630, 560, 75],
                ['2010', 530, 530, 88],
                ['2011', 730, 520, 60],
                ['2011', 830, 510, 50],
                ['2011', 1130, 540, 90],
                ['2014', 980, 520, 70]
            ]
        },
        maximize: true
        }, {
        title: "Stocks",
        id: 23,
        width: "25%",
        height: "280px",
        data: [100, 101, 142, 122, 113, 98, 87, 97, 110],
        aspectRatio: 1,
        chart: {
            type: "PieChart",
            options: {
                width: "100%",
                backgroundColor: "transparent",
                is3D: false,
                colors: ['#e0440e', '#e6693e', '#ec8f6e'],
                legend: {
                    position: 'labeled',
                    alignment: 'center'
                },
                pieHole: 0.5,
                pieSliceText: 'none',
                chartArea: {
                    left: 0,
                    top: 0,
                    right: 10,
                    bottom: 10,
                    width: "100%",
                    height: 240
                }
            },
            data: [
                ['Fuit', 'Stock'],
                ['Apples', 144],
                ['Pears', 428],
                ['Bananas', 256]
            ]
        },
        maximize: true
        }, {
        title: "Geo",
        id: 22,
        width: "100%",
        height: "480px",
        aspectRatio: null,
        chart: {
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
            formatters: {
                number: [{
                    columnNum: 1,
                    pattern: "$ #,##0.00"
                }]
            },
            data: [
                ['Country', 'Popularity'],
                ['Germany', 200],
                ['United States', 300],
                ['Brazil', 400],
                ['Canada', 500],
                ['France', 600],
                ['RU', 700]
            ]
        },
        maximize: true
        }];

    $scope.byEndpoint = {
        performance: {
            title: "Total bytes transferred",
            id: 22,
            width: "100%",
            height: "480px",
            aspectRatio: null,
            chart: {
                type: "Sankey",
                options: {
                    height: 200,
                    animation: {
                        duration: 1000,
                        easing: 'inAndOut'
                    },
                    backgroundColor: "transparent",
                    colors: ['#edc951', '#00a0b0', '#cc333f', '#eb6841'],
                    chartArea: { left: 20, top: 0, width: "80%", height: "85%"},
                    curveType: 'function',
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
                        textStyle: { color: '#666', fontName: 'Titillium Web', fontSize: 9, italic: false }
                    }
                },
                formatters: {
                    number: [{
                        columnNum: 1,
                        pattern: "$ #,##0.00"
                    }]
                },
                data: [
                    ['From', 'To', 'Weight'],
                    [ 'A', 'X', 5 ],
                    [ 'A', 'Y', 7 ],
                    [ 'A', 'Z', 6 ],
                    [ 'B', 'X', 2 ],
                    [ 'B', 'Y', 9 ],
                    [ 'B', 'Z', 4 ]
                ]
            },
            maximize: true
        }
    };
    $scope.selectApi = function($api) {
        $scope.selectedApi = $api;
    };
    $scope.applications = Restangular.one('digestors').getList().then(function(digestors) {
        $scope.apis = digestors;
        $scope.selectedApi = digestors[0];
    });
    $scope.$watch('selectedApi', function(newVal, oldVal, scope) {
        if(newVal === oldVal || newVal.length <= 0) {
            return;
        }
        console.log("selectedApi: ", $scope.selectedApi);
    }, true);
    $scope.$watch('dateRange', function(newVal, oldVal, scope) {
        if(newVal === oldVal || newVal.length <= 0) {
            return;
        }
        console.log("dateRange: ", $scope.dateRange);
    }, false);
});

