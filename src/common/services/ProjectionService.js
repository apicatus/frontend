////////////////////////////////////////////////////////////////////////////////
// D3 loader service                                                          //
// NOTES:                                                                     //
// * Maybe it would be a good idea to use a CDN to fetch d3's source          //
////////////////////////////////////////////////////////////////////////////////
angular.module('ProjectionService', [])
.factory('ProjectionService', ['$document', '$q', '$rootScope', 'D3Service', function($document, $q, $rootScope, D3Service) {
    var d = $q.defer();
    function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() {
            d.resolve(window.d3.geo);
        });
    }
    // Create a script tag with d3 as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'http://d3js.org/d3.geo.projection.v0.min.js';
    scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') {
            onScriptLoad();
        }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    // Load after d3 is available
    D3Service.d3().then(function(d3) {
        s.appendChild(scriptTag);
    });

    return {
        projection: function() { return d.promise; }
    };
}]);