////////////////////////////////////////////////////////////////////////////////
// This function creates a new anchor element and uses location               //
// properties (inherent) to get the desired URL data. Some String             //
// operations are used (to normalize results across browsers).                //
////////////////////////////////////////////////////////////////////////////////
/* jshint es5: true */
angular.module('fileReader', [])
.factory('fileReader', ['$document', '$q', function($document, $q) {

    var onLoad = function(reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.resolve(reader.result);
            });
        };
    };
    var onError = function (reader, deferred, scope) {
        return function () {
            scope.$apply(function () {
                deferred.reject(reader.result);
            });
        };
    };
    var onProgress = function(reader, scope) {
        return function (event) {
            scope.$broadcast("fileProgress", {
                total: event.total,
                loaded: event.loaded
            });
        };
    };
    var readAsDataURL = function (file, scope) {
        var deferred = $q.defer();
        console.log("file", file);
        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);

        return deferred.promise;
    };
    var readAsText = function (file, scope) {
        var deferred = $q.defer();
        console.log("file", file);
        var reader = getReader(deferred, scope);
        reader.readAsText(file);

        return deferred.promise;
    };
    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };
    return {
        readAsDataUrl: readAsDataURL,
        readAsText: readAsText
    };
}]);
