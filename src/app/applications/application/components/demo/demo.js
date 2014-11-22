/*jslint evil: true */

angular.module( 'apicatus.application.demo', [])
.controller( 'DemoCtrl', ['$scope', 'parseURL', 'Restangular', function DemoController($scope, parseURL, Restangular) {

    var demo = this;
    // Create demo code for method
    this.create = function(method) {
        var serviceUrl = parseURL.parse(Restangular.configuration.baseUrl);
        var options = {
            type: method.method.toUpperCase(),
            url: serviceUrl.protocol + "://" + $scope.api.subdomain + "." + serviceUrl.host + ":" + serviceUrl.port + method.URI,
            data: {}
        };
        return "$.ajax(" + JSON.stringify(options) + ")\n.then(function(response){\n\talert(JSON.stringify(response, null, 4));\n});";
    };
    // Play method demo
    this.play = function(demo) {
        console.log("play demo");
        var result = $scope.$evalAsync(function(){
            return eval(demo);
        });
    };
}]);
