////////////////////////////////////////////////////////////////////////////////
// D3 loader service                                                          //
// NOTES:                                                                     //
// * Maybe it would be a good idea to use a CDN to fetch d3's source          //
////////////////////////////////////////////////////////////////////////////////
angular.module('AuthService', [])
.factory('AuthService', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
    var isAuthenticated = false;
    var appState = {};  // holds the state of the app

    function enterAuthentication(user, pass) {
        // Create a script tag with d3 as the source
        // and call our onScriptLoad callback when it
        // has been loaded
        var defer = $q.defer();
        var code = [];
        if(user == "admin" && pass == "admin") {
            code = ['window.isAuthenticated = true;'];
            isAuthenticated = true;
        } else {
            code = ['window.isAuthenticated = false;'];
            isAuthenticated = false;
        }
        var codeBlob = new Blob(code, {type : 'text/javascript'}); // the blob
        var url = URL.createObjectURL(codeBlob);
        var scriptTag = $document[0].createElement('script');

        function onAuthenticated(event){
            console.log("window", window.isAuthenticated);
            $rootScope.$apply(function() {
                defer.resolve(window.isAuthenticated);
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

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);
        return defer.promise;
    }
    function leaveAuthentication() {
        var defer = $q.defer();
        isAuthenticated = false;
        // Mock Api callback
        setTimeout(function(){
            defer.resolve(isAuthenticated);
        }, 500);
        return defer.promise;
    }
    return {
        authenticate: function(user, pass) {
            return enterAuthentication(user, pass);
        },
        logout: function() {
            return leaveAuthentication();
        },
        isAuthenticated: function() {
            return isAuthenticated; /*return d.promise;*/
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