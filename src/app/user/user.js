///////////////////////////////////////////////////////////////////////////////
// @file         : user.js                                                   //
// @summary      : API Login controller                                      //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : API Login, Forgot & Reset controllers                     //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 2013                                                      //
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


angular.module( 'apicatus.user', [
    'ngMessages'
])

///////////////////////////////////////////////////////////////////////////////
// Module configuration & routes                                             //
///////////////////////////////////////////////////////////////////////////////
.config(function config( $stateProvider ) {
    $stateProvider.state( 'main.user', {
        url: '/user',
        abstract: true,
        views: {
            "main": {
                controller: 'UserCtrl',
                templateUrl: 'user/user.tpl.html'
            }
        }
    })
    .state( 'main.user.login', {
        url: '/login',
        controller: 'LoginCtrl as login',
        templateUrl: 'user/components/login.tpl.html',
        data: { pageTitle: 'Login' }
    })
    .state( 'main.user.logout', {
        url: '/logout',
        controller: 'LogoutCtrl as logout',
        templateUrl: 'user/components/logout.tpl.html',
        resolve: {
            signout: ['Restangular', function (Restangular) {
                return Restangular.one('user/signout').get();
            }]
        },
        data: { pageTitle: 'Logout' }
    })
    .state( 'main.user.forgot', {
        url: '/forgot',
        controller: 'ForgotCtrl as forgot',
        templateUrl: 'user/components/forgot.tpl.html',
        data: { pageTitle: 'Password Recovery' }
    })
    .state( 'main.user.reset', {
        url: '/reset/:token/:email',
        controller: 'ResetCtrl as reset',
        templateUrl: 'user/components/reset.tpl.html',
        data: { pageTitle: 'Reset' }
    });
})

///////////////////////////////////////////////////////////////////////////////
// User controller                                                          //
///////////////////////////////////////////////////////////////////////////////
.controller( 'UserCtrl', function UserController( $scope ){

})

///////////////////////////////////////////////////////////////////////////////
// Login controller                                                          //
///////////////////////////////////////////////////////////////////////////////
.controller( 'LoginCtrl', function LoginController( $scope, $state, AuthService, Restangular ) {

    var login = this;
    login.alerts = [];

    login.submit = function () {
        login.processing = true;
        AuthService.authenticate(login.username, login.password).then(function(result) {
            $scope.$emit('userLoggedIn', angular.copy(result));
            if($scope.user.token) {
                // Get previous state (page that requested authentication)
                var toState = AuthService.getState();
                if(toState.name) {
                    $state.transitionTo(toState.name);
                } else {
                    $state.transitionTo("main.home"); // Redirect to home
                }
            } else {
                login.alerts.push({
                    type: 'danger',
                    msg: 'error: Could not authenticate'
                });
            }
            login.processing = false;
        }, function(error) {
            login.alerts.push({
                type: 'danger',
                msg: 'error: ' + error.data.message
            });
            login.processing = false;
        });
    };
    login.closeAlert = function(index) {
        login.alerts.splice(index, 1);
    };
})

///////////////////////////////////////////////////////////////////////////////
// Logout controller                                                         //
///////////////////////////////////////////////////////////////////////////////
.controller( 'LogoutCtrl', ['$scope', '$moment', 'signout', function LogoutController( $scope, $moment, signout ) {
    var logout = this;
    logout.date = $moment().format('MMMM DD, YYYY [at] HH:MM A');
    $scope.$emit('userLoggedOut', logout.date);
}])

///////////////////////////////////////////////////////////////////////////////
// Forgot controller                                                         //
///////////////////////////////////////////////////////////////////////////////
.controller( 'ForgotCtrl', function ForgotController( $scope, Restangular ) {
    var forgot = this;
    forgot.alerts = [];
    forgot.submit = function() {
        forgot.processing = true;
        return Restangular.one('user/forgot').customPOST({email: forgot.email}).then(function(result){
            console.log("result: ", result);
            forgot.alerts.push({
                type: 'success',
                msg: result.message
            });
            forgot.processing = false;
        }, function(error) {
            forgot.alerts.push({
                type: 'danger',
                msg: error.data.message
            });
            forgot.processing = false;
        });
    };
    forgot.closeAlert = function($index) {
        forgot.alerts.splice($index, 1);
    };
})

///////////////////////////////////////////////////////////////////////////////
// Password reset controller                                                 //
///////////////////////////////////////////////////////////////////////////////
.controller( 'ResetCtrl', function ResetController( $scope, $state, $stateParams, Restangular ) {
    /* jslint -W024 */
    var reset = this;
    reset.alerts = [];
    reset.password = {};
    reset.token = $stateParams.token;
    reset.email = $stateParams.email;

    reset.submit = function() {
        reset.processing = true;
        return Restangular.one('user/reset', reset.token).customPOST({password: reset.password.new}).then(function(result){
            reset.alerts.push({
                type: 'success',
                msg: result.message
            });
            $state.transitionTo("main.user.login");
        }, function(error) {
            reset.alerts.push({
                type: 'danger',
                msg: error.data.message
            });
            reset.processing = false;
        });
    };
    reset.closeAlert = function($index) {
        reset.alerts.splice($index, 1);
    };
    reset.strength = [40,60];
})
.directive( 'compareTo', [function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
}]);

