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
    'fileDrop',
    'ng-peity'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    var since = new Date().setDate(new Date().getDate() - 2);
    var until = new Date().getTime();
    var interval = '2h';

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
                    summaries: ['Restangular', function (Restangular) {
                        return Restangular.one('summary').get({since: since, until: until, interval: interval});
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
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $interval, $modal, fileReader, Restangular, apis, summaries ) {

    //$scope.apis = Restangular.all('digestors').getList().$object;

    var applications = this.apis = apis;
    $scope.apis = apis;
    $scope.summaries = summaries;
    console.log("summaries: ", summaries);

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
    this.data = [1, 4, 2, 4, 7, 2, 9, 5, 6, 4, 1, 6, 8, 2];

    $scope.BarChart = {
        data: [1, 4, 2, 4, 7, 2, 9, 5, 6, 4, 1, 6, 8, 2],
        options: {
            width: '100%',
            height: 10,
            fill: ['#f00']
        }
    };

    $interval(function() {
        var random = Math.round(Math.random() * 10);
        $scope.BarChart.data.shift();
        $scope.BarChart.data.push(random);
        $scope.BarChart.options.fill[0] = '#'+Math.floor(Math.random()*16777215).toString(16);
    }, 1000);

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
.controller( 'CardCtrl', function CardController( $scope, $filter ) {

    var card = this;

    card.percent = function(a, b) {
        if(a > 0 && b > 0) {
            return a / b * 100;
        } else if (a <= 0) {
            return 100;
        } else if (b <= 0) {
            return 0;
        } 
    };
    card.init = function(api, summaries) {
        if(card.api) {
            return;
        }
        card.api = api;
        card.summary = {
            current: ($filter('filter')(summaries.current, {key: api._id}))[0],
            previous: ($filter('filter')(summaries.previous, {key: api._id}))[0]
        };
        card.barChart = {
            data: [],
            options: { height: '80%', width: '100%', fill: ['#49c5b1'] }
        };
        try {
            card.summary.current.data = card.summary.current.dataset.buckets.map(function(bucket){
                return {
                    timestamp: bucket.key,
                    stats: bucket.time_stats
                };
            });
            card.barChart.data = card.summary.current.data.map(function(data){
                return data.stats.avg || 0;
            });
        } catch (error) {
            console.log(error);
        }
    };
})
.controller( 'TableCtrl', function TableController( $scope, $filter ) {

    var table = this;

    table.percent = function(a, b) {
        if(a > 0 && b > 0) {
            return a / b * 100;
        } else if (a <= 0) {
            return 100;
        } else if (b <= 0) {
            return 0;
        } 
    };
    table.init = function(api, summaries) {
        if(table.api) {
            return;
        }
        table.api = api;
        table.summary = {
            current: ($filter('filter')(summaries.current, {key: api._id}))[0],
            previous: ($filter('filter')(summaries.previous, {key: api._id}))[0]
        };
        table.barChart = {
            data: [],
            options: { height: '80%', width: '100%', fill: ['#49c5b1'] }
        };
        try {
            table.summary.current.data = table.summary.current.dataset.buckets.map(function(bucket){
                return {
                    timestamp: bucket.key,
                    stats: bucket.time_stats
                };
            });
            table.barChart.data = table.summary.current.data.map(function(data){
                return data.stats.avg || 0;
            });
        } catch (error) {
            console.log(error);
        }
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

