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

// Applications controller
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $modal, fileReader, Restangular ) {

    var baseDigestors = Restangular.all('digestors');

    $scope.applications = Restangular.one('digestors').getList().then(function(digestors) {
        //$scope.apis = _.sortBy(digestors, {enabled: true});
        /*$scope.apis = digestors.sort(function(a, b) {
            return b.enabled - a.enabled;
        });*/
        $scope.apis = digestors;
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
    //Restangular.one('projects').getList().then(function(project){
        //console.log("project", project);
    //});
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
                baseDigestors.post(api).then(function(result){
                    $scope.apis.push(api);
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
            domain: "myDomain"
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
    $scope.addApplication = function() {
        $scope.apis.push({
            _id: "5262f08d284b9963b1000001",
            allowCrossDomain: false,
            created: "2013-10-19T20:50:21.553Z",
            enabled: true,
            entries: [],
            hits: 0,
            lastAccess: "2013-10-19T20:50:21.553Z",
            lastUpdate: "2013-10-19T20:50:21.553Z",
            logging: false,
            name: "myApi3",
            type: "REST"
        });
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
                        baseDigestors.post(result).then(function(result){
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

