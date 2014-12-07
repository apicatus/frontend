///////////////////////////////////////////////////////////////////////////////
// @file         : app.js                                                   //
// @summary      : Main Application entry point                              //
// @version      : 0.1                                                       //
// @project      : Apicat.us                                                 //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 06 Oct 2013                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

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
    'ngSocket',
    'ngMasterSearch'
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
    mySocket.on('message', function(result){
        //console.log('WebSocket: ', result);
        /*messanger.post({
            message: result.greet,
            showCloseButton: true
        });*/
    });

    $scope.$on('userLoggedIn', function(event, user){
        $scope.user = user;
        $state.transitionTo('main.applications.list');

        mySocket.disconnect();
        mySocket.connect();
        mySocket.emit('userLoggedIn', {data: user.name});
    });
    $scope.$on('userLoggedOut', function(event, user){
        $scope.user = null;

        mySocket.emit('userLoggedOut', {data: 'myMessage'});
        mySocket.disconnect();
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
