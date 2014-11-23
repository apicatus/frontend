angular.module( 'apicatus.application.logs', [])
/*.config(['$stateProvider', function ( $stateProvider ) {
    $stateProvider.state('main.applications.application.logs', {
        url: '/logs/:method',
        templateUrl: 'applications/application/components/logs/logs.tpl.html',
        controller: 'LogsCtrl as logs',
        resolve: {
            records: ['$stateParams', 'Restangular', function ( $stateParams, Restangular) {
                return Restangular.one('logs').get({method: $stateParams.method, limit: 10, from: 0});
            }]
        }
    });
}])*/
.controller( 'LogsCtrl', ['$scope', '$modal', 'Restangular', function LogsController( $scope, $modal, Restangular ) {

    var logs = this;
    logs.period = $scope.accordion.selectedPeriod;
    logs.since = new Date().getTime() - logs.period.value;
    logs.until = new Date().getTime();
    logs.findWhat = null;

    logs.currentPage = 1;
    logs.maxSize = 10;
    logs.totalItems = 0;

    ////////////////////////////////////////////////////////////////////////////
    // Load Data                                                              //
    ////////////////////////////////////////////////////////////////////////////
    this.load = function(method) {
        var limit = logs.maxSize;
        var from = (logs.currentPage - 1) * logs.maxSize;
        if(logs.currentPage > 1 && (logs.currentPage * logs.maxSize > logs.totalItems)) {
            limit = (logs.totalItems - (logs.currentPage - 1) * logs.maxSize);
        }
        Restangular.one('logs')
        .get({
            method: method._id,
            limit: limit,
            from: from,
            since: logs.since,
            until: logs.until,
            find: logs.findWhat
        })
        .then(function(records) {
            logs.totalItems = records.total;
            logs.records = records.hits;
        }, function(error) {
            logs.totalItems = 0;
            logs.records = [];
            console.log("error getting logs: ", error);
        });
    };

    ////////////////////////////////////////////////////////////////////////////
    // Return Logs Keys                                                      //
    ////////////////////////////////////////////////////////////////////////////
    logs.keys = function(object) {
        return Object.keys(object);
    };
    // Paging
    logs.pageChanged = function(page) {
        logs.load(logs.method);
    };
    // Remove all logs
    logs.deleteLogs = function() {
        Restangular.one('logs').remove().then(function(){
            logs.init(logs.method);
        });
    };
    logs.find = function($event){
        logs.load(logs.method);
    };
    ////////////////////////////////////////////////////////////////////////////
    // Endpoints [ Create, Read, Update, Delete ]                             //
    ////////////////////////////////////////////////////////////////////////////
    logs.viewResponse = function (response) {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = ['$scope', '$modalInstance', 'response', function ($scope, $modalInstance, response) {
            $scope.body = JSON.stringify(response, null, 4);
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }];
        var modalInstance = $modal.open({
            templateUrl: 'view_response.html',
            controller: modalCtl,
            windowClass: 'ace-editor',
            resolve: {
                response: [function () {
                    return response;
                }]
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

    logs.init = function(method) {
        if(!logs.method) {
            console.log("CALL INIT LogsCtrl: ", method._id, " load: ", logs.since, logs.until);
            logs.method = method;
            logs.load(logs.method);
            ////////////////////////////////////////////////////////////////////////////
            // Handle Date Range                                                      //
            ////////////////////////////////////////////////////////////////////////////
            $scope.$on('changePeriod', function(event, period) {
                logs.period = period;
                logs.since = new Date().getTime() - period.value;
                logs.until = new Date().getTime();
                logs.currentPage = 1;

                logs.load(logs.method);
            });
        }
    };

}]);
