angular.module( 'apicatus', [
    'templates-app',
    'templates-common',
    'apicatus.main',
    'apicatus.home',
    'apicatus.applications',
    //'apicatus.application',
    'AuthService',
    'restangular',
    'ui.bootstrap',
    'ui.router',
    'ui.utils'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, RestangularProvider ) {
    $urlRouterProvider.otherwise( '/main/home' );
    RestangularProvider.setBaseUrl('http://localhost:8080');
    RestangularProvider.setDefaultHeaders({
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Access-Control-Allow-Headers": "x-requested-with"
    });
})

.run(function run($rootScope, $state, AuthService) {
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        window.state = $state;
        if (toState.authenticate && !AuthService.isAuthenticated()) {
            console.log("user isn't authenticated");
            AuthService.saveState(toState);
            // User isn’t authenticated
            $state.transitionTo("login");
            event.preventDefault();
        }
    });
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Restangular ) {
    /*$scope.account = {
        username: "James Woods",
        email: "jwoods@ananke.com",
        avatar: "https://pbs.twimg.com/profile_images/378800000534882248/fc2341fbc7d96cd7a9dc21f0f396e099.jpeg",
        firstName: "James",
        lastName: "Woods",
        phone: "555-555-555",
        address: "bonpland",
        zip: 4336,
        city: "Buenos Aires",
        timezone: "AGT",
    };*/
    // Restangular returns promises
    $scope.baseApi = Restangular.one('user');
    $scope.baseApi.get().then(function(account) {
        // returns a list of users
        $scope.account = account;   // first Restangular obj in list: { id: 123 }
    });

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | apicatus' ;
        }
    });
});
