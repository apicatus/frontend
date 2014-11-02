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
    'apicatus.dashboard.traffic'
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
        resolve: {
            apis: ['Restangular', function (Restangular) {
                return Restangular.all('digestors').getList();
            }]
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
        url: '/geo/:id',
        templateUrl: 'dashboard/geo/geo.tpl.html',
        controller: 'DashboardGeoCtrl',
        data: { pageTitle: 'Geo' },
        resolve: {
            apis: ['apis', '$stateParams', 'Restangular', function (apis, $stateParams, Restangular) {
                console.log("scope", apis);
                console.log("$stateParams", $stateParams);
                return Restangular.one('geo').getList();
            }]
        },
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
.controller( 'DashboardCtrl', function DashboardController( $scope, $modal, Restangular, apis ) {
    var baseDigestors = Restangular.all('digestors');
    $scope.potatoes = 55;
    $scope.selectedApi = {};
    
    $scope.apis = apis;
    $scope.selectedApi = apis[0];

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

