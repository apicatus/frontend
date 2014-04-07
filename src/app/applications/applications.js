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
                    console.log(result);
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
                    console.log(result);
                    //$scope.imageSrc = result;
                    Restangular.one('import').customPOST({blueprint: result}, 'blueprint').then(function (result) {
                        console.log(result);
                        $scope.apiModel.name = result.name;
                    }, function(error) {
                    });
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };
})
/*.controller( 'ApplicationCtrl', function ApplicationController( $scope, $location, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings, ngTableParams ) {
    $scope.httpSettings = httpSettings.settings();
    $scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor) {
        $scope.api = digestor;
        $scope.apiModel = JSON.stringify(angular.copy($scope.api), null, 4);
        // If empty fill out
        if(!$scope.api.endpoints) {
            $scope.api.endpoints = [];
            return;
        }
        Restangular.one('logs').get({digestor: digestor._id, limit: 0}).then(function(logs) {
            $scope.api.logs = logs;
            for(var i = 0; i < $scope.api.endpoints.length; i++) {
                var endpoint = $scope.api.endpoints[i];
                for(var j = 0; j < endpoint.methods.length; j++) {
                    var method = endpoint.methods[j];
                    // Pair methods and logs
                    method.logs = _.filter(logs, {'method': method._id });
                    method.tableParams = makeTableParmas(method.logs);
                    $scope.createDemo(method);
                }
            }

            function makeTableParmas(data) {
                return new ngTableParams({
                    page: 1,            // show first page
                    count: 10,           // count per page
                    sorting: {
                        name: 'asc'     // initial sorting
                    }
                }, {
                    counts: [], // hide page counts control
                    total: $scope.api.logs.length, // length of data
                    getData: function($defer, params) {
                        // use build-in angular filter
                        var orderedData = params.sorting() ? $filter('orderBy')(data , params.orderBy()) : data;
                        orderedData = params.filter() ? $filter('filter')(orderedData, params.filter()) : orderedData;
                        params.total(orderedData.length);
                        orderedData.forEach(function(data, index) {
                            //console.log(data.time);
                        });
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
            }
        });
    });

    $scope.$watchCollection('api.endpoints', function(newVal, oldVal, scope) {
        if(newVal === oldVal || newVal.length <= 0) {
            return;
        }
    });
    $scope.currentPage = 1;
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.save = function(api) {
        $scope.api.put();
    };
    /////////////////////
    // Settings Control
    $scope.setOpened = function(endpoint, $index, isOpened) {
        console.log(endpoint, $index, isOpened);
    };
    ////////////////////////////////////////////////////////////////////////////
    // Endpoints [ Create, Read, Update, Delete ]                             //
    ////////////////////////////////////////////////////////////////////////////
    $scope.createEndpoint = function () {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = function ($scope, $modalInstance, endpoint) {
            console.log("aqui hay controler");
            $scope.endpoint = {
                name: ""
            };
            $scope.ok = function() {
                console.log("ok:", endpoint);
            };
            $scope.submit = function () {
                console.log("ok:", endpoint);
                $modalInstance.close($scope.endpoint);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
        var modalInstance = $modal.open({
            templateUrl: 'new_endpoint_modal.html',
            controller: modalCtl,
            windowClass: '',
            resolve: {
                endpoint: function () {
                    return $scope.endpoint;
                }
            }
        });
        modalInstance.result.then(
            function (endpoint) {
                endpoint.methods = [];
                console.log("modal ok: ", endpoint);
                $scope.api.endpoints.push(endpoint);
                //$scope.api.put();
                $scope.api.put().then(function(result) {
                }, function(error) {
                    $scope.api.endpoints.pop();
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.createEndpoint2 = function (api) {
        var endpoint = {
            name: "Resource group",
            methods: []
        };
        $scope.api.endpoints.push(endpoint);
        $scope.api.put();
    };
    $scope.updateEndpoint = function(endpoint, $index) {
        $scope.api.put();
    };
    $scope.deleteEndpoint = function(endpoints, $index) {
        endpoints.splice($index, 1);
        $scope.api.put();
    };
    ////////////////////////////////////////////////////////////////////////////
    // Methods [ Create, Read, Update, Delete ]                               //
    ////////////////////////////////////////////////////////////////////////////
    $scope.createMethod = function(endpoint) {
        var method = {
            "name": "Method XX1",
            "synopsis": "Grabs information from the A1 data set",
            "method": "GET",
            "URI": "/myroute"
        };
        $scope.createDemo(method);
        endpoint.methods.push(method);
        $scope.api.put();
    };
    $scope.updateMethod = function(method, $index) {
        console.log(method);
        $scope.api.put();
    };
    $scope.deleteMethod = function(methods, $index) {
        methods.splice($index, 1);
    };
    $scope.header = {};
    $scope.addHeader = function(method, header, scope) {
        console.log("addHeader", header);
        console.log("addHeader");
        if(!method.response.headers) {
            method.response.headers = [];
        }
        var indexes = method.response.headers.map(function(obj, index) {
            if(obj.name == header.name) {
                return index;
            }
        }).filter(isFinite)[0];
        console.log("index", indexes);
        if(angular.equals({}, header) || _.findIndex(method.response.headers, {name: header.name}) >= 0) {
            return false;
        }
        method.response.headers.push(angular.copy(header));
        $scope.header = {};
        //$scope.api.put();
    };

    $scope.removeHeader = function(method, header, $index) {
        _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
        method.response.headers.splice($index, 1);
    };
    // API Demo
    $scope.createDemo = function(method) {
        // Create simple demo to test the endpoint
        var serviceUrl = parseURL.parse(Restangular.configuration.baseUrl);
        var options = {
            type: method.method.toUpperCase(),
            url: serviceUrl.protocol + "://" + $scope.api.name + "." + serviceUrl.host + ":" + serviceUrl.port + method.URI,
            data: {}
        };
        method.demo = "$.ajax(" + JSON.stringify(options) + ")\n.then(function(response){\n\talert(response);\n});";
    };
    $scope.demo = function(demo) {
        var result = eval(demo);
    };

    // The modes
    $scope.editor = {
        modes: ['Scheme', 'XML', 'Javascript'],
        options: {
            mode: 'json',
            theme: 'monokai',
            onLoad: function (_ace) {
                console.log("ace loaded: ", _ace);
                window.ace = _ace;
                _ace.getSession().setMode('ace/mode/javascript');
                _ace.getSession().setUseWorker(false);
                // HACK to have the ace instance in the scope...
                $scope.modeChanged = function () {
                    _ace.getSession().setMode('ace/mode/' + $scope.mode.toLowerCase());
                };
            }
        }
    };
})
// We already have a limitTo filter built-in to angular,
// let's make a startFrom filter
.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
})*/;

