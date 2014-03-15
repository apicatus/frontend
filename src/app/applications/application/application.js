
angular.module( 'apicatus.application', [
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])


.config(function config( $stateProvider ) {
    $stateProvider.state('main.application', {
        url: '/application',
        template: '<ui-view/>',
        views: {
            "main": {
                controller: 'ApplicationCtrlX',
                templateUrl: 'applications/application/application.tpl.html'
            }
        },
        data: { pageTitle: 'Resource editor' },
        authenticate: false
    });

})

.controller( 'ApplicationCtrlX', function ApplicationController( $scope, $location, $stateParams, Restangular ) {
    console.log("application controler SINGLE");
});
