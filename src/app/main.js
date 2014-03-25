/* Main module */

angular.module( 'apicatus.main', [
    'ui.router',
    'apicatus.navbar'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    $stateProvider.state( 'main', {
        url: '/main',
        abstract: true,
        template: '<ui-view/>',
        templateUrl: 'main/main.tpl.html',
        views: {
            "main": {
                templateUrl: 'main/main.tpl.html',
                controller: 'MainCtrl'
            },
            "navbar": {
                controller: 'NavBarCtrl',
                templateUrl: 'navbar/navbar.tpl.html'
            }
        }
    });
})
.controller( 'MainCtrl', function MainController( $scope ) {
});