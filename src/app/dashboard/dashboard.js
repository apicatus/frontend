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
    'apicatus.dashboard.behavior',
    'apicatus.dashboard.geo',
    'apicatus.dashboard.technology',
    'apicatus.dashboard.traffic',
    'apicatus.dashboard.realtime',
    'countryCode'
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
    });
})

///////////////////////////////////////////////////////////////////////////////
// Query Factory                                                             //
///////////////////////////////////////////////////////////////////////////////
.provider('queryFactory', function () {
    'use strict';

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

    // Default period
    var period = periods[3];

    // Default query params
    var query = {
        size: 100,
        skip: 100,
        limit: 100,
        since: new Date().setDate(new Date().getDate() - 1),    //
        until: new Date().getTime(),
        interval: 1800 * 1000                                   // one day '1d'
    };

    // expose to provider
    this.$get = ['$rootScope', function ($rootScope) {

        return function queryFactory (options) {

            angular.extend(query, options);

            var wrappedQuery = {
                get: function () {
                    query.interval = (query.until - query.since) / 48;
                    return query;
                },
                set: function (options) {
                    query = angular.extend(query, options);
                },
                periods: function() {
                    return periods;
                },
                period: function() {
                    return period;
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
    $scope.selectedPeriod = queryFactory().period();

    // Change Periods
    $scope.selectPeriod = function(period) {
        console.log("change period: ", period);
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

