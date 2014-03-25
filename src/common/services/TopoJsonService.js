////////////////////////////////////////////////////////////////////////////////
// D3 loader service                                                          //
// NOTES:                                                                     //
// * Maybe it would be a good idea to use a CDN to fetch d3's source          //
////////////////////////////////////////////////////////////////////////////////
angular.module('TopoJsonService', [])
.factory('TopoJsonService', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
    var d = $q.defer();
    function onScriptLoad() {
        // Load client in the browser
        $rootScope.$apply(function() {
            d.resolve(window.topojson);
        });
    }
    // Create a script tag with d3 as the source
    // and call our onScriptLoad callback when it
    // has been loaded
    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'http://d3js.org/topojson.v1.min.js';
    scriptTag.onreadystatechange = function () {
        if (this.readyState == 'complete') {
            onScriptLoad();
        }
    };
    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    s.appendChild(scriptTag);

    return {
        topojson: function() { return d.promise; }
    };
}]);