/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.application', [
    'D3Service',
    'd3Service',
    'budgetDonut',
    'barChart',
    'lineChart',
    'vectorMap'
])
.config(function config( $stateProvider ) {
    $stateProvider.state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        controller: 'ApplicationCtrl',
        data: { pageTitle: 'Resource editor'},
        onEnter: function(){
            console.log("enter contacts.detail");
        }
    });
})
.controller( 'ApplicationCtrl', function ApplicationController( $scope, $location, $stateParams, $modal, $filter, $http, $timeout, Restangular, parseURL, httpSettings ) {


    $scope.worldMap = {
        "AF": 16.63,
        "AL": 11.58,
        "DZ": 158.97,
        "AO": 85.81,
        "AG": 1.1,
        "AR": 351.02,
        "AM": 8.83,
        "AU": 1219.72,
        "AT": 366.26,
        "AZ": 52.17,
        "BS": 7.54
    };
    $scope.waitAndActivate = function() {
        $timeout(function(){
            console.log("activate");
            $scope.imActivex = true;
        }, 0);
    };
    $scope.httpSettings = httpSettings.settings();
    $scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor) {
        $scope.api = digestor;
        console.log("Endpoints: ", $scope.api);
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
                    //method.tableParams = makeTableParmas(method.logs);
                    $scope.createDemo(method);
                }
            }
        });
    });

    $scope.currentPage = 1;
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.save = function(api) {
        $scope.api.put();
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
                name: '',
                synopsis: ''
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
    /*$scope.createMethod = function(endpoint) {
        var method = {
            "name": "Method XX1",
            "synopsis": "Grabs information from the A1 data set",
            "method": "GET",
            "URI": "/myroute",
            "response": {
                "contentType": "application/json",
                "statusCode": 200
            }
        };
        $scope.createDemo(method);
        endpoint.methods.push(method);
        //$scope.api.put();
    };
    */
    $scope.createMethod = function ($endpoint) {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = function ($scope, $modalInstance, method) {
            $scope.httpSettings = httpSettings.settings();
            $scope.method = {
                name: "",
                synopsis: "Grabs information from the A1 data set",
                method: "GET",
                URI: "/myroute",
                response: {
                    "contentType": "application/json",
                    "statusCode": 200
                }
            };
            $scope.ok = function() {
                console.log("ok:", method);
            };
            $scope.submit = function () {
                console.log("ok:", method);
                $modalInstance.close($scope.method);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
        var modalInstance = $modal.open({
            templateUrl: 'new_method_modal.html',
            controller: modalCtl,
            windowClass: '',
            resolve: {
                method: function () {
                    return $scope.method;
                }
            }
        });
        modalInstance.result.then(
            function (method) {
                $endpoint.methods.push(method);
                console.log("modal ok: ", method);
                //$scope.api.endpoints.push(endpoint);
                //$scope.api.put();

                /*
                $scope.api.put().then(function(result) {
                }, function(error) {
                    $scope.api.endpoints.pop();
                });
                */
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.updateMethod = function(method, $index) {
        console.log(method);
        $scope.api.put();
    };
    $scope.deleteMethod = function(methods, $index) {
        methods.splice($index, 1);
        $scope.api.put();
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
    $scope.demo = function(method) {
        var result = $scope.$evalAsync(function(){
            return eval(method.demo);
        });
        var url = document.location.protocol + '//' + $scope.api.name + '.' + document.location.host + method.URI;
        $http.get(url).then(function(result, status){
            console.log(url, result);
            window.rr = result;
        });
        console.log("M: ", method);
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
