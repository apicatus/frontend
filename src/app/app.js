angular.module( 'apicatus', [
    'templates-app',
    'templates-common',
    'apicatus.main',
    'apicatus.home',
    'apicatus.login',
    'apicatus.applications',
    'apicatus.application',
    'apicatus.dashboard',
    'apicatus.settings',
    'apicatus.error',
    'apicatus.help',
    'AuthService',
    'timeago',
    'humanize',
    'restangular',
    'ui.bootstrap',
    'ui.router',
    'ui.utils',
    'LocalStorageModule',
    'ngCookies',
    'pascalprecht.translate',
    'ui.ace',
    'parseURL',
    'httpSettings',
    'ngSocket'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, $documentProvider, RestangularProvider, localStorageServiceProvider ) {
    $urlRouterProvider.otherwise( '/main/applications/list' );
    //$locationProvider.html5Mode(true);
    RestangularProvider.setBaseUrl(document.location.origin);
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
            //$state.transitionTo("main.login");
            $state.transitionTo("main.login");
            event.preventDefault();
        }
    });
})
.factory('mySocket', function (ngSocketFactory) {
    var mySocket = ngSocketFactory();
    mySocket.forward('error');
    return mySocket;
})
.controller( 'AppCtrl', function AppCtrl ( $scope, $location, localStorageService, $cookies, Restangular, mySocket ) {
    var token = localStorageService.get('token');
    if(token) {
        console.log("I got a local storage token", token);
        Restangular.configuration.defaultHeaders.token = token.token;
        Restangular.one('user').get().then(function(user) {
            $scope.user = user;
        }, function(error) {
            console.log("could not authenticate user");
            localStorageService.remove('token');
        });
    } else if ($cookies.token) {
        token = unescape($cookies.token);
        console.log("I got a cookie token", token);
        Restangular.configuration.defaultHeaders.token = token;
        Restangular.one('user').get().then(function(user) {
            localStorageService.add('token', token);
            $scope.user = user;
        }, function(error) {
            console.log("could not authenticate user");
            $cookies.token = undefined;
        });
    }
    mySocket.emit('angularMessage', {data: "myMessage"});
    mySocket.on('message', function(result){
        console.log("socket message: ", result);
    });

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
