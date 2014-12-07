
angular.module( 'apicatus.application.monitor', [])
.controller( 'MonitorCtrl', ['$scope', 'parseURL', 'Restangular', function DemoController($scope, Restangular) {
    var monitor = this;
    monitor.tasts = [{
        name: 'pepe',
        id: 123
    }, {
        name: 'other',
        id: 123
    }];
}]);
