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
    'apicatus.dashboard.realtime'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state( 'main.dashboard', {
        url: '/dashboard',
        reloadOnSearch : false,
        abstract: true,
        template: '<ui-view/>',
        views: {
            "main": {
                controller: 'DashboardCtrl',
                templateUrl: 'dashboard/dashboard.tpl.html'
            }
        },
        resolve: {
            apis: ['Restangular', function (Restangular) {
                return Restangular.all('digestors').getList();
            }]
        },
        data: { pageTitle: 'Dashboard' },
        authenticate: true
    })
    .state('main.dashboard.traffic', {
        url: '/traffic/:id/?since&until&interval',
        templateUrl: 'dashboard/traffic/traffic.tpl.html',
        controller: 'DashboardTrafficCtrl as traffic',
        resolve: {
            transferStatistics: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('transfer/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('transfer').get(queryFactory().get());
                }
            }],
            geo2stats: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('geo2stats/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('geo2stats').get(queryFactory().get());    
                }
            }],
            methodstatsbydate: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('methodstatsbydate/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('methodstatsbydate').get(queryFactory().get());
                }
            }],
            apis: ['apis', function(apis) {
                return apis;
            }]
        },
        data: { pageTitle: 'Traffic' },
        onEnter: function(){
            console.log("enter Traffic");
        }
    })
    .state('main.dashboard.geo', {
        url: '/geo/:id',
        templateUrl: 'dashboard/geo/geo.tpl.html',
        controller: 'DashboardGeoCtrl as geo',
        resolve: {
            geoStatistics: ['apis', '$stateParams', 'Restangular', function (apis, $stateParams, Restangular) {
                if($stateParams.id) {
                    return Restangular.one('geo/digestor', $stateParams.id).get();
                } else {
                    return Restangular.one('geo').get();
                }
            }],
            languageStatistics: ['$stateParams', 'Restangular', function ($stateParams, Restangular) {
                if($stateParams.id) {
                    return Restangular.one('lang/digestor', $stateParams.id).get();
                } else {
                    return Restangular.one('lang').get();
                }
            }]
        },
        data: { pageTitle: 'Geo' },
        onEnter: function() {
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
    .state('main.dashboard.realtime', {
        url: '/realtime/:id',
        templateUrl: 'dashboard/realtime/realtime.tpl.html',
        controller: 'DashboardRealTimeCtrl as realtime',
        data: { pageTitle: 'RealTime Monitor' },
        //authenticate: true,
        onEnter: function(){
            console.log("enter realtime");
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
        url: '/technology/:id',
        templateUrl: 'dashboard/technology/technology.tpl.html',
        controller: 'DashboardTechnologyCtrl as technology',
        resolve: {
            agentStatistics: ['apis', '$stateParams', 'Restangular', function (apis, $stateParams, Restangular) {
                if($stateParams.id) {
                    return Restangular.one('agent/digestor', $stateParams.id).get();
                } else {
                    return Restangular.one('agent').get();
                }
            }]
        },
        data: { pageTitle: 'Technology' },
        onEnter: function(){
            console.log("enter technology");
        }
    });
})
.provider('queryFactory', function () {
    'use strict';

    // Default query params
    var query = {
        size: 100,
        skip: 100,
        limit: 100,
        since: new Date().setDate(new Date().getDate() - 1),
        until: new Date().getTime(),
        interval: 1800 * 1000 // one day '1d'
    };

    var periods = [{
        name: '1 hour',
        value: 3600 * 1000
    }, {
        name: '6 hours',
        value: 6 * 3600 * 1000
    }, {
        name: '12 hours',
        value: 12 * 3600 * 1000
    }, {
        name: '24 hours',
        value: 24 * 3600 * 1000
    }, {
        name: '1 week',
        value: 7 * 24 * 3600 * 1000
    }, {
        name: '30 days',
        value: 30 * 24 * 3600 * 1000
    }];
    // expose to provider
    this.$get = ['$rootScope', function ($rootScope) {

        var asyncAngularify = function (socket, callback) {
            return callback ? function () {
                var args = arguments;
                $timeout(function () {
                    callback.apply(socket, args);
                }, 0);
            } : angular.noop;
        };

        return function queryFactory (options) {
            angular.extend(query, options);

            var wrappedQuery = {
                get: function () {
                    query.interval = (query.until - query.since) / 48;
                    return query;
                },
                set: function (options) {
                    query = angular.extend(query, options);
                    console.log("SET: ", query);
                },
                periods: function() {
                    return periods;
                }
            };
            return wrappedQuery;
        };
    }];
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'DashboardCtrl', function DashboardController( $scope, $state, $location, $stateParams, $filter, Restangular, queryFactory, apis ) {

    // Load APIs
    $scope.selectedApi = ($filter('filter')(apis, {_id: $state.params.id || null}))[0] || null;
    $scope.apis = apis;

    // Change API
    $scope.selectApi = function(api) {
        $scope.selectedApi = api;
        $state.transitionTo($state.current.name, {id: api ? api._id : ''});
    };

    // Load preset periods
    $scope.periods = queryFactory().periods();
    // Default period
    $scope.selectedPeriod = $scope.periods[0];
    // Change Periods
    $scope.selectPeriod = function(period) {
        queryFactory().set({
            since: new Date().getTime() - period.value,
            until: new Date().getTime()
        });
        $scope.selectedPeriod = period;
        $state.transitionTo($state.current.name, {
            id: $scope.selectedApi ? $scope.selectedApi._id : '',
            since: queryFactory().get().since,
            until: queryFactory().get().until
        });
    };
});

