/*jshint newcap: false */

angular.module( 'apicatus', [
    'templates-app',
    'templates-common',
    'apicatus.main',
    'apicatus.home',
    'apicatus.login',
    'apicatus.logout',
    'apicatus.applications',
    'apicatus.application',
    'apicatus.dashboard',
    'apicatus.settings',
    'apicatus.error',
    'apicatus.help',
    'apicatus.about',
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
// Global constans
.constant('$moment', moment)
.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, $documentProvider, RestangularProvider, localStorageServiceProvider ) {
    $urlRouterProvider.otherwise( '/main/applications/list' );
    //$locationProvider.html5Mode(true);
    RestangularProvider.setBaseUrl('http://api.apicat.us:' + document.location.port);
    RestangularProvider.setRestangularFields({
        id: "_id"
    });
    RestangularProvider.setDefaultHeaders({
        "Content-Type": "application/json"
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
            case 404:
                //$state.transitionTo("main.error.404", {data: "response.data"});
                break;
            case 498:
                $state.transitionTo("main.login");
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
.constant('Messenger', Messenger)
.provider('messanger', ['Messenger', function messanger(Messenger) {

    this.defaults = {
        extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
        theme: 'flat',
        showCloseButton: true
    };

    Messenger.options = this.defaults;

    this.options = function(options) {
        Messenger.options = angular.extend(this.defaults, options);
    };

    this.$get = ["$timeout", function messangerFactory($timeout) {
        return {
            post: function(options) {
                return Messenger().post(options);
            },
            run: function(options) {
                return Messenger().run(options);
            }
        };
    }];
}])
.controller( 'AppCtrl', function AppCtrl ( $scope, $state, $location, localStorageService, $cookies, Restangular, mySocket, messanger ) {
    var token = localStorageService.get('token');
    if ($cookies.token) {
        token = unescape($cookies.token);
        console.log("I got a cookie token", token);
        Restangular.configuration.defaultHeaders['token'] = token;
        Restangular.one('user').get().then(function(user) {
            localStorageService.add('token', token);
            $scope.user = user;
        }, function(error) {
            console.log("could not authenticate user with cookie token");
            $cookies.token = undefined;
        });
    } else if(token) {
        console.log("localStorage token: ", token);
        Restangular.configuration.defaultHeaders['token'] = token.token;
        Restangular.one('user').get().then(function(user) {
            $scope.user = user;
        }, function(error) {
            console.log("could not authenticate user with localStorage token");
            localStorageService.remove('token');
        });
    } else {
        console.log('no auth token received');
    }

    // SocketIO notifications
    mySocket.emit('angularMessage', {data: 'myMessage'});
    mySocket.on('message', function(result){
        /*messanger.post({
            message: result.hello,
            showCloseButton: true
        });*/
    });

    $scope.$on('userLoggedIn', function(event, user){
        $scope.user = user;
        $state.transitionTo('main.applications.list');
    });
    $scope.$on('userLoggedOut', function(event, user){
        $scope.user = null;
    });

    ///////////////////////////////////////////////////////////////////////////
    // User settings                                                         //
    ///////////////////////////////////////////////////////////////////////////
    $scope.settings = localStorageService.get('settings') || {};
    $scope.$watch('settings', function(newVal, oldVal){
        console.log("settings changed: ", $scope.settings);
        window.settings = $scope.settings;
        localStorageService.add('settings', newVal);
    }, true);

    // Page title
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle;
        }
    });
});
