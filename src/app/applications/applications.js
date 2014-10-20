/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.applications', [
    'D3Service',
    'worldMap',
    'budgetDonut',
    'barChart',
    'lineChart',
    'fileReader',
    'fileInput',
    'fileDrop'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    $stateProvider.state( 'main.applications', {
        url: '/applications',
        abstract: true,
        template: '<ui-view/>',
        views: {
            "main": {
                templateUrl: 'applications/applications.tpl.html'
            }
        },
        data: { pageTitle: 'Applications' },
        authenticate: true
    })
    .state('main.applications.list', {
        url: '/list',
        templateUrl: 'applications/list/applications.list.tpl.html',
        //authenticate: true,
        onEnter: function(){
            console.log("enter contacts.list");
        }
    })
    .state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        controller: 'ApplicationCtrl',
        data: { pageTitle: 'Resource editor'},
        onEnter: function(){
            console.log("enter contacts.detail");
        }
    });
})

.controller( 'FormCtrl', function FormController( $scope ) {
    $scope.update = function(api) {
        api.put().then(function(result) {
            console.log("api updated", result);
        });
    };
    $scope.remove = function(api) {
        api.remove().then(function() {
            $scope.apis = _.without($scope.apis, api);
        });
    };
})
// Applications controller
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $modal, fileReader, Restangular ) {

    $scope.apis = Restangular.all('digestors').getList().$object;
    /*$scope.applications = Restangular.one('digestors').getList().then(function(digestors) {
        $scope.apis = digestors;

        Restangular.one('summary').getList().then(function(data) {
            var summary = angular.copy(data);
            $scope.apis.forEach(function(api){
                var apiSummary = summary.filter(function(summary){
                    return summary._id == api._id;
                });
                api.summary = apiSummary[0];
                console.log("apiSummary: ", $scope.apis);
            });
        });

        Restangular.one('logs').getList().then(function(logs){
            $scope.logs = logs;
            $scope.apis.map(function(api) {
                var digestorLogs = $scope.logs.filter(function(log) {
                    return log.digestor == api._id;
                });
                //_.filter($scope.logs, {'digestor': api._id });
                if(digestorLogs.length <= 0) {
                    return;
                }
                digestorLogs = _.sortBy(digestorLogs, 'date');
                var mean = 1;
                //d3.mean(digestorLogs, function(d) { return d.time; });
                api.meanTime = parseInt(mean, 10);
                api.logs = angular.copy(digestorLogs);
            });
        });
    });
    */
    $scope.data = [1, 4, 2, 4, 7, 2, 9, 5, 6, 4, 1, 6, 8, 2];

    $scope.newApi = function () {
        var modalInstance = $modal.open({
            templateUrl: 'new_api_modal.html',
            controller: newApiModalCtrl,
            windowClass: '',
            resolve: {
                apis: function () {
                    return $scope.apis;
                }
            }
        });

        modalInstance.result.then(
            function (api) {
                console.log("modal ok: ", api);
                Restangular.all('digestors').post(api).then(function(result) {
                    console.log("api created ok: ", result);
                    $scope.apis.push(result);
                }, function(error) {

                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };
    // Please note that $modalInstance represents a modal window (instance) dependency.
    // It is not the same as the $modal service used above.
    var newApiModalCtrl = function ($scope, $modalInstance, apis) {
        $scope.api = {
            name: "test123",
            subdomain: "mySubdomain",
            synopsis: "API Description"
        };
        $scope.ok = function() {
            console.log("ok:", apis);
        };
        $scope.submit = function () {
            console.log("ok:", apis);
            $modalInstance.close($scope.api);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    };

    ////////////////////////////////////////////////////////////////////////////
    // Endpoints [ Create, Read, Update, Delete ]                             //
    ////////////////////////////////////////////////////////////////////////////
    $scope.import = function () {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = function ($scope, $modalInstance, apiModel) {
            console.log("aqui hay controler");
            $scope.apiModel = {};
            $scope.submit = function () {
                $modalInstance.close($scope.apiModel);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
            $scope.readFile = function () {
                console.log("file:", $scope.apiModel.file);
                fileReader.readAsText($scope.apiModel.file, $scope)
                .then(function(result) {
                    //console.log(result);
                    //$scope.imageSrc = result;
                    $scope.apiModel.processing = true;
                    Restangular.one('import').customPOST({format: 'blueprint', model: result}, 'test').then(function (result) {
                        console.log(result);
                        $scope.apiModel.processing = false;
                        $scope.apiModel.name = result.name;
                    }, function(error) {
                    });
                });
            };

        };
        var modalInstance = $modal.open({
            templateUrl: 'import_modal.html',
            controller: modalCtl,
            windowClass: '',
            resolve: {
                apiModel: function () {
                    return $scope.apiModel;
                }
            }
        });
        modalInstance.result.then(
            function (apiModel) {
                console.log("modal ok: ", apiModel);
                fileReader.readAsText(apiModel.file, $scope)
                .then(function(result) {
                    //console.log(result);
                    //$scope.imageSrc = result;
                    Restangular.one('import').customPOST({blueprint: result}, 'blueprint').then(function (result) {
                        console.log(result);
                        //$scope.apiModel.name = result.name;
                        //$scope.apis.push(result);
                        Restangular.all('digestors').post(result).then(function(result){
                            $scope.apis.push(result);
                        }, function(error) {
                            alert(JSON.stringify(error, null, 4));
                        });

                    }, function(error) {
                    });
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };
});

