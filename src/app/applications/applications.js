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
                templateUrl: 'applications/applications.tpl.html',
                controller: 'ApplicationsCtrl as applications',
                resolve: {
                    apis: ['Restangular', function (Restangular) {
                        return Restangular.all('digestors').getList();
                    }],
                    summary: ['Restangular', function (Restangular) {
                        return Restangular.all('summary').getList();
                    }]
                }
            }
        },
        data: { pageTitle: 'Applications' },
        authenticate: true
    })
    .state('main.applications.list', {
        url: '/list',
        templateUrl: 'applications/list/applications.list.tpl.html',
        onEnter: function(){
            console.log("enter contacts.list");
        }
    });
})

// Applications controller
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $modal, fileReader, Restangular, apis, summary ) {

    //$scope.apis = Restangular.all('digestors').getList().$object;

    var applications = this.apis = apis;
    $scope.apis = apis;
    $scope.summary = summary;
    console.log("summary: ", summary);

    $scope.sort = {
        property: 'name',
        reverse: false
    };
    // Change column sorting
    $scope.sortBy = function(property) {
        $scope.sort = {
            property: property,
            reverse: !$scope.sort.reverse
        };
        console.log("sortBy", $scope.sort);
    };
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
    this.data = [1, 4, 2, 4, 7, 2, 9, 5, 6, 4, 1, 6, 8, 2];

    this.weekdays = moment.weekdaysMin();

    this.update = function(api) {
        api.put().then(function(result) {
            console.log("api updated", result);
        });
    };
    this.remove = function(api) {
        var that = this;
        api.remove().then(function() {
            that.apis = _.without(that.apis, api);
        });
    };

    $scope.newApi = function () {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var newApiModalCtrl = function ($scope, $modalInstance) {
            $scope.api = {
                name: "test123",
                subdomain: "mySubdomain",
                synopsis: "API Description"
            };
            $scope.submit = function () {
                $modalInstance.close($scope.api);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };

        var modalInstance = $modal.open({
            templateUrl: 'new_api_modal.html',
            controller: newApiModalCtrl,
            windowClass: ''
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


    ////////////////////////////////////////////////////////////////////////////
    // Endpoints [ Create, Read, Update, Delete ]                             //
    ////////////////////////////////////////////////////////////////////////////
    $scope.import = function () {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var that = this;
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
                fileReader.readAsText($scope.apiModel.file, $scope)
                .then(function(result) {
                    $scope.apiModel.processing = true;
                    Restangular.one('import').customPOST({format: 'blueprint', model: result}, 'test').then(function (result) {
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
                fileReader.readAsText(apiModel.file, $scope)
                .then(function(result) {
                    //console.log(result);
                    //$scope.imageSrc = result;
                    Restangular.one('import').customPOST({blueprint: result}, 'blueprint').then(function (result) {
                        //$scope.apiModel.name = result.name;
                        //$scope.apis.push(result);
                        console.log("iports", applications, that.apis, $scope);

                        /*Restangular.all('digestors').post(result).then(function(result){
                            that.apis.push(result);
                        }, function(error) {
                            console.log(error);
                        });
                        */

                    }, function(error) {
                    });
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };
})
.filter('listToMatrix', function() {
    function listToMatrix(list, elementsPerSubArray) {
        var matrix = [], i, k;

        for (i = 0, k = -1; i < list.length; i++) {
            if (i % elementsPerSubArray === 0) {
                k++;
                matrix[k] = [];
            }

            matrix[k].push(list[i]);
        }

        return matrix;
    }
    return function(list, elementsPerSubArray) {
        return listToMatrix(list, elementsPerSubArray);
    };
});

