angular.module( 'apicatus', [
    'templates-app',
    'templates-common',
    'apicatus.main',
    'apicatus.home',
    'apicatus.login',
    'apicatus.applications',
    'apicatus.application',
    'apicatus.settings',
    'apicatus.error',
    'AuthService',
    'timeago',
    'humanize',
    'restangular',
    'ui.bootstrap',
    'ui.router',
    'ui.utils',
    'LocalStorageModule',
    'pascalprecht.translate',
    'ui.ace',
    'ngTable',
    'parseURL',
    'httpSettings'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $translateProvider, RestangularProvider, localStorageServiceProvider ) {
    $urlRouterProvider.otherwise( '/main/home' );
    RestangularProvider.setBaseUrl('http://miapi.com:8080');
    RestangularProvider.setRestangularFields({
        id: "_id"
    });
    RestangularProvider.setDefaultHeaders({
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Access-Control-Allow-Headers": "x-requested-with"
    });
    $translateProvider.useStaticFilesLoader({
        prefix: '/languages/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    //RestangularProvider.setDefaultHttpFields({cache: true});
    localStorageServiceProvider.setPrefix('apicatus');
})

.run(function run($rootScope, $state, AuthService, Restangular) {
    Restangular.setErrorInterceptor(function (response) {
        console.log("error: ", response);
        switch(response.status) {
            case 401:
                $state.transitionTo("main.login");
                break;
            case 403:
                $state.transitionTo("main.login");
                break;
            case 404:
                $state.transitionTo("main.error.404", {data: "response.data"});
                break;
            case 500:
                $state.transitionTo("main.error.500", {data: "response.data"});
                break;
        }
        return response;
    });
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
        if (toState.authenticate && !AuthService.isAuthenticated()) {
            console.log("user isn't authenticated");
            AuthService.saveState(toState);
            // User isn’t authenticated
            $state.transitionTo("main.login");
            event.preventDefault();
        }
    });
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, localStorageService, Restangular ) {
    var token = localStorageService.get('token');
    if(token){
        Restangular.configuration.defaultHeaders.token = token.token;
        Restangular.one('user').get().then(function(user) {
            $scope.user = user;
        });
    }

    $scope.$on('userLoggedIn', function(event, user){
        $scope.user = user;
    });

    ///////////////////////////////////////////////////////////////////////////
    // User settings
    $scope.settings = localStorageService.get('settings') || {};
    $scope.$watch('settings', function(newVal, oldVal){
        console.log("settings changed: ", $scope.settings);
        window.settings = $scope.settings;
        localStorageService.add('settings', newVal);
    }, true);

    $scope.account = {
        username: "Marty Macfly",
        email: "jwoods@ananke.com",
        avatar: "https://pbs.twimg.com/profile_images/1234618042/MartyMcfly.jpg",
        firstName: "James",
        lastName: "Woods",
        phone: "555-555-555",
        address: "bonpland",
        zip: 4336,
        city: "Buenos Aires",
        timezone: "AGT"
    };
    // authenticate
    //$scope.user = Restangular.one('user').customPOST({username: "admin", password: "admin"}, 'signin');
    // Restangular returns promises
    //$scope.baseApi = Restangular.one('user');
    //$scope.baseApi.get().then(function(account) {
        // returns a list of users
    //    $scope.account = account;   // first Restangular obj in list: { id: 123 }
    //});
    $scope.getDate = function() {return new Date();};
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle;
        }
    });
});
