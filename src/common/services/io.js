////////////////////////////////////////////////////////////////////////////////
// io loader service                                                          //
// NOTES:                                                                     //
// * Maybe it would be a good idea to use a CDN to fetch io's source          //
////////////////////////////////////////////////////////////////////////////////
angular.module('io', [])
.factory('io', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
    var d = $q.defer();
    function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() { d.resolve(window.io); });
    }
    // Create a script tag with io as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = '/socket.io/socket.io.js';
    scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') {
            onScriptLoad();
        }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
        io: function() { return d.promise; }
    };
}]);
