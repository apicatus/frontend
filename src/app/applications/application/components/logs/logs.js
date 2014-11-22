angular.module( 'apicatus.application.logs', [])
.controller( 'LogsCtrl', ['$modal', 'Restangular', function LogsController($modal, Restangular) {

    var logs = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();

    logs.currentPage = 1;
    logs.maxSize = 10;
    logs.totalItems = 0;

    this.load = function(method) {
        var limit = logs.maxSize;
        var from = (logs.currentPage - 1) * logs.maxSize;
        if(logs.currentPage > 1 && (logs.currentPage * logs.maxSize > logs.totalItems)) {
            limit = (logs.totalItems - (logs.currentPage - 1) * logs.maxSize);
        }
        Restangular.one('logs').get({method: method._id, limit: limit, from: from}).then(function(records) {
            logs.totalItems = records.total;
            logs.records = records.hits;
        }, function(error) {
            console.log("error getting logs: ", error);
        });
    };

    this.keys = function(object) {
        console.log("get keys: ", Object.keys(object));
        //return ["ip", "uri"];
        return Object.keys(object);
    };

    this.pageChanged = function(page) {
        logs.load(logs.method);
    };

    logs.deleteLogs = function() {
        Restangular.one('logs').remove().then(function(){
            logs.init(logs.method);
        });
    };

    ////////////////////////////////////////////////////////////////////////////
    // Endpoints [ Create, Read, Update, Delete ]                             //
    ////////////////////////////////////////////////////////////////////////////
    this.viewResponse = function (response) {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = function ($scope, $modalInstance, response) {
            $scope.body = JSON.stringify(response, null, 4);
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
        var modalInstance = $modal.open({
            templateUrl: 'view_response.html',
            controller: modalCtl,
            windowClass: 'ace-editor',
            resolve: {
                response: function () {
                    return response;
                }
            }
        });
        modalInstance.result.then(
            function () {
                console.log("modal ok");
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };

    this.init = function(method) {
        console.log("CALL INIT LogsCtrl: ", method._id);
        logs.method = method;
        logs.load(logs.method);
    };

}]);
