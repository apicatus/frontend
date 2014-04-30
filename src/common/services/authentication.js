////////////////////////////////////////////////////////////////////////////////
// D3 loader service                                                          //
// NOTES:                                                                     //
// * Maybe it would be a good idea to use a CDN to fetch d3's source          //
////////////////////////////////////////////////////////////////////////////////
angular.module('AuthService', ['restangular'])
.config(function AuthServiceConfig (RestangularProvider) {
    //console.log(RestangularProvider);
})
.factory('AuthService', ['$document', '$q', '$rootScope', 'Restangular', 'localStorageService', '$cookies', function($document, $q, $rootScope, Restangular, localStorageService, $cookies) {
    var isAuthenticated = false;
    var appState = {};  // holds the state of the app

    function globalAuthenticate(isAuthenticated, defer) {
        var code = ['window.isAuthenticated = ' + isAuthenticated + ';'];
        var codeBlob = null;
        var url = null;
        var scriptTag = $document[0].createElement('script');
        function onAuthenticated(event){
            $rootScope.$apply(function() {
                defer.resolve(isAuthenticated);
            });
        }
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.src = url;
        scriptTag.onreadystatechange = function () {
            if (!this.readyState || this.readyState == 'complete') {
                onAuthenticated();
            }
        };
        scriptTag.onload = onAuthenticated;

        var node = $document[0].getElementsByTagName('body')[0];
        node.appendChild(scriptTag);
    }
    function enterAuthentication(user, pass) {
        var defer = $q.defer();
        var code = [];

        var token = localStorageService.get('token');
        if(token) {
            localStorageService.add('token', token.token);
            Restangular.configuration.defaultHeaders.token = token.token;
            isAuthenticated = true;
        } else if ($cookies.token) {
            token = unescape($cookies.token);
            Restangular.configuration.defaultHeaders.token = token;
            isAuthenticated = true;
        }
        Restangular.one('user').customPOST({username: user, password: pass}, 'signin').then(function (user) {

            var codeBlob = null;
            var url = null;
            var scriptTag = $document[0].createElement('script');

            if(user.token.token) {
                Restangular.configuration.defaultHeaders.token = user.token.token;
                localStorageService.add('token', user.token);
                code = ['window.isAuthenticated = true;'];
                isAuthenticated = true;
            } else {
                localStorageService.remove('token');
                code = ['window.isAuthenticated = false;'];
                isAuthenticated = false;
                defer.reject(null);
            }

            codeBlob = new Blob(code, {type : 'text/javascript'});
            url = URL.createObjectURL(codeBlob);

            function onAuthenticated(event){
                $rootScope.$apply(function() {
                    defer.resolve(user);
                });
            }
            scriptTag.type = 'text/javascript';
            scriptTag.async = true;
            scriptTag.src = url;
            scriptTag.onreadystatechange = function () {
                if (!this.readyState || this.readyState == 'complete') {
                    onAuthenticated();
                }
            };
            scriptTag.onload = onAuthenticated;

            var node = $document[0].getElementsByTagName('body')[0];
            node.appendChild(scriptTag);

        }, function(error) {
            code = ['window.isAuthenticated = false;'];
            isAuthenticated = false;
            defer.reject(error);
        });

        return defer.promise;
    }
    function checkAuthenticated() {
        var token = localStorageService.get('token');
        if(token) {
            isAuthenticated = true;
            return true;
        } else if ($cookies.token) {
            token = unescape($cookies.token);
            isAuthenticated = true;
            return true;
        } else {
            isAuthenticated = false;
            return false;
        }
    }
    return {
        authenticate: function(user, pass) {
            return enterAuthentication(user, pass);
        },
        logout: function() {
            return leaveAuthentication();
        },
        isAuthenticated: function() {
            return checkAuthenticated(); /*return d.promise;*/
        },
        saveState: function(state) {
            appState = state; // Save the app state before going into the login secuence
        },
        getState: function() {
            return appState;
        },
        getRole: function() {
            return "admin";
        }
    };
}]);
