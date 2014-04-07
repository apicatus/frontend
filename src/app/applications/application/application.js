/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.application', [
    'D3Service',
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart'
])
.controller( 'ApplicationCtrl', function ApplicationController( $scope, $location, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings, ngTableParams ) {
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
});
