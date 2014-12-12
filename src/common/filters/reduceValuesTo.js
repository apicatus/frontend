angular.module('reduceValuesTo', [])
.filter('reduceValuesTo', [function() {
    return function(array, maxValues) {
        var results = [];
        if(!array) {
            return results;
        }
        var max = Math.floor(array.length / (maxValues < array.length ? maxValues || 1 : array.length));
        function sliceAverage(array, length) {
            return array.reduce(function(p, c){
                return p + c;
            }, 0) / length;
        }
        for (var i = 0; i < array.length; i+=max) {
            results.push(sliceAverage(array.slice(i, i + max), max));
        }
        return results;
    };
}]);
