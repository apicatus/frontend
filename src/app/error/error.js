/**

 */
angular.module( 'apicatus.error', [])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    $stateProvider.state( 'main.error', {
        url: '/error',
        abstract: true,
        template: '<ui-view/>',
        views: {
            "main": {
                controller: 'ErrorCtrl',
                templateUrl: 'error/error.tpl.html'
            }
        },
        data: { pageTitle: 'Error' },
        authenticate: false
    })
    .state('main.error.500', {
        url: '/500/:data',
        templateUrl: 'error/500/500.tpl.html',
        data: { pageTitle: 'Error 500' },
        authenticate: false,
        controller: function($scope, $stateParams) {
            console.log($stateParams);
        }
    })
    .state('main.error.404', {
        url: '/404/:data',
        templateUrl: 'error/404/404.tpl.html',
        data: { pageTitle: 'Error 404' },
        authenticate: false,
        controller: function($scope, $stateParams) {
            console.log($stateParams);
            /*$scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor){
            });*/
        }
    });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'ErrorCtrl', function ErrorController( $scope, $location ) {

});

