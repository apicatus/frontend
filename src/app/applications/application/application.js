/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.application', [
    'ui.ace',
    'vectorMap',
    'myGraph',
    'stackedBarChart',
    'bivariateChart'
])
.factory('MetricsService', ['$cacheFactory', 'Restangular', function($cacheFactory, Restangular) {
    var route = 'metrics';
    var cache = $cacheFactory(route);
    return Restangular
        .withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setDefaultHttpFields({cache: cache});
        })
        .extendCollection(route, function(collection) {
            collection.clearCache = function() {
                console.log("extendModel.clearCache: ", collection);
                cache.removeAll();
            };
            collection.getMethodData = function(id) {
                console.log("extendModel.getMethodData: ", id);
            };
            return collection;
        })
        .extendModel(route, function(metrics) {
            metrics.clearCache = function() {
                console.log("extendModel.clearCache: ", id);
                cache.removeAll();
            };
            metrics.getMethodData = function(id) {
                console.log("extendModel.getMethodData: ", id);
            };
            return metrics;
        })
        .service(route);
}])
.config(function config( $stateProvider ) {
    $stateProvider.state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        controller: 'ApplicationCtrl',
        resolve: {
            api: ['$stateParams', 'Restangular', function ($stateParams, Restangular) {
                return Restangular.one('digestors', $stateParams.id).get();
            }],
            logs: ['$stateParams', 'Restangular', function ($stateParams, Restangular) {
                return [];//Restangular.all('logs').getList({digestor: $stateParams.id, limit: 10});
            }],
            /*metrics: ['$stateParams', 'Restangular', 'MetricsService', function ($stateParams, Restangular, MetricsService) {
                return Restangular.one('metrics').getList($stateParams.id, {limit: 10});
            }],*/
            getBytesTransferred: ['$stateParams', 'Restangular', function ($stateParams, Restangular) {
                return Restangular.one('getBytesTransferred').getList($stateParams.id, {limit: 10});
            }]

            /*,
            performance: ['$stateParams', 'Restangular', function ($stateParams, Restangular) {
                return Restangular.one('metrics', $stateParams.id).all('performance').getList({digestor: $stateParams.id, limit: 0});
            }]*/
        },
        data: { pageTitle: 'Resource editor'},
        onEnter: function(){
            console.log("enter application.detail");
        }
    });
})
.controller( 'ApplicationCtrl', function ApplicationController( $scope, $timeout, $stateParams, $modal, $filter, Restangular, parseURL, httpSettings, api) {

    $scope.httpSettings = httpSettings.settings();
    $scope.api = api;
    /*
    $scope.logs = logs;
    $scope.metrics = metrics;
    $scope.getBytesTransferred = getBytesTransferred;
    $scope.percentiles = metrics.percentiles;
    */

    /*
    $scope.percentiles = metrics.map(function(metric, index) {
        return {_id: metric._id, percentiles: (function(arr) {
            function getPercentile(percentile, array) {
                var index = percentile * arr.length;
                var nearest = Math.floor(index);
                if(index % 1 === 0) {
                    return (array[nearest-1] + array[nearest]) / 2;
                } else {
                    return array[nearest];
                }
            }
            var percentiles = [];
            percentiles[98] = getPercentile(0.98, arr);
            percentiles[90] = getPercentile(0.90, arr);

            return percentiles;
        })
        (
            metric.dataset.map(function(set){
                return set.data;
            })
            .sort(function(a, b){
                return a-b;
            })
        )};
    });*/
    
    ///////////////////////////////////////////////////////////////////////////
    // Query template                                                        //
    ///////////////////////////////////////////////////////////////////////////
    $scope.datePicker = {
        show: false,
        range: 60
    };
    $scope.customQueryParams = function () {
        return {
            since: new Date().setMinutes(new Date().getMinutes() - 60),
            until: new Date().getTime()
        };
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
    $scope.createMethod = function (endpoint, $index) {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = function ($scope, $modalInstance) {
            $scope.httpSettings = httpSettings.settings();
            $scope.method = {
                name: "",
                synopsis: "Grabs information from the A1 data set",
                method: "GET",
                URI: "",
                response: {
                    "contentType": "application/json",
                    "statusCode": 200
                }
            };
            $scope.submit = function () {
                $modalInstance.close($scope.method);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        };
        var modalInstance = $modal.open({
            templateUrl: 'new_method_modal.html',
            controller: modalCtl,
            windowClass: ''
        });
        modalInstance.result.then(
            function (method) {
                console.log("modal ok: ", method);
                endpoint.methods.push(method);
                $scope.api.put().then(function(result) {
                    console.log("PUT: ", result);
                }, function(error) {
                    endpoint.methods.splice($index, 1);
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.updateMethod = function(method, $index) {
        console.log("updateMethod: ", method);
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
.controller( 'DemoCtrl', function DemoController($scope, parseURL, Restangular) {

    var demo = this;
    // Create demo code for method
    this.create = function(method) {
        var serviceUrl = parseURL.parse(Restangular.configuration.baseUrl);
        var options = {
            type: method.method.toUpperCase(),
            url: serviceUrl.protocol + "://" + $scope.api.name + "." + serviceUrl.host + ":" + serviceUrl.port + method.URI,
            data: {}
        };
        return "$.ajax(" + JSON.stringify(options) + ")\n.then(function(response){\n\talert(JSON.stringify(response, null, 4));\n});";
    };
    // Play method demo
    this.play = function(demo) {
        console.log("play demo");
        var result = $scope.$evalAsync(function(){
            return eval(demo);
        });
    };
})
.controller( 'SourceCtrl', function SourceController() {
    var source = this;
    this.create = function(api) {
        return JSON.stringify(api, null, 4);
    };
    this.save = function(model) {
        var api = JSON.parse(api);
        console.log(api);
    };
})
.controller( 'LogsCtrl', ['Restangular', function LogsController(Restangular) {

    var logs = this;
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

    this.pageChanged = function(page) {
        logs.load(logs.method);
    };

    this.init = function(method) {
        console.log("CALL INIT LogsCtrl: ", method._id);
        logs.method = method;
        logs.load(logs.method);
    };

}])
.controller( 'StatisticsCtrl', ['$timeout', '$scope', '$moment', 'Restangular', function StatisticsController($timeout, $scope, $moment, Restangular) {

    var statistics = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();

    function percetage(a, b) {
        console.log("a: %s b: %s", a, b);
        if(a > 0 && b > 0) {
            console.log("availability: ", a / b * 100);
            return a / b * 100;
        } else if (a <= 0) {
            return 100;
        } else if (b <= 0) {
            return 0;
        } 
    }
    statistics.load = function(method) {
        Restangular.one('metrics', method._id).get().then(function(records) {
            statistics.percentiles = records.percentiles;
            statistics.average = records.average;
            statistics.latency = records.letancy;
        }, function(error) {
            console.log("error getting logs: ", error);
        });
        ///analitics/:entity/:id
        Restangular.one('analitics/method', method._id).get().then(function(records) {
            statistics.statuses = [records.statuses['200'], records.statuses['400'], records.statuses['500']];
            statistics.availability = [records.statuses['200']];
        }, function(error) {
            console.log("error getting analitics: ", error);
        });
        // terms
        Restangular.one('terms/method', method._id).getList().then(function(records) {
            console.log("records: ", records);
            
            statistics.terms = {
                success: 0,
                fail: 0,
                error: 0
            };

            records.forEach(function(record){
                if(record.term == 200) {
                    statistics.terms.success = record.count;
                } else if (record.term == 400) {
                    statistics.terms.fail = record.count;
                } else {
                    statistics.terms.error = record.count;
                }
            });

            statistics.terms.availability = percetage( (statistics.terms.fail + statistics.terms.error), statistics.terms.success  );
            statistics.terms.failRate =  100 - statistics.terms.availability;
            console.log("terms: ", statistics.terms);

            /*
                http://www.percentagecalculator.net/javascripts/percentagecalculator.js
                var totalValue = a / b * 100;
                      break;
                    case "f3":
                var totalValue = (b - a) / a  * 100;
            */

        }, function(error) {
            console.log("error getting terms: ", error);
        });

        ///analitics/:entity/:id
        Restangular.one('timestatistics/method', method._id).get({since: since, until: until}).then(function(records) {
        //Restangular.one('timestatistics/method', method._id).getList().then(function(records) {
            statistics.timestatistics = records.buckets;
            statistics.stats = records.sum;
        }, function(error) {
            console.log("error getting analitics: ", error);
        });

        // Auto Update 
        /*
        $timeout(function(){
            statistics.load(method);
        }, 1500);
        */
    };
    statistics.init = function(method) {
        console.log("CALL INIT StatisticsCtrl: ", method._id);
        statistics.method = method;
        statistics.load(statistics.method);
    };
}])
.controller( 'TransferStatisticsCtrl', ['$timeout', '$scope', '$moment', 'Restangular', function TransferStatisticsController($timeout, $scope, $moment, Restangular) {

    var statistics = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();

    statistics.load = function(method) {
        Restangular.one('transferstatistics/method', method._id).get({since: since, until: until}).then(function(records) {
            statistics.transferstatistics = records.buckets;
            statistics.stats = records.sum;
        }, function(error) {
            console.log("error getting analitics: ", error);
        });
    };
    statistics.init = function(method) {
        console.log("CALL INIT TransferStatisticsCtrl: ", method._id);
        statistics.method = method;
        statistics.load(statistics.method);
    };
}])
.controller( 'MapCtrl', ['$timeout', 'Restangular', function TransferStatisticsController($timeout, Restangular) {

    var map = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();

    map.worldMap = {
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
    map.load = function(method) {
        Restangular.one('countrystatistics/method').getList(method._id, {since: since, until: until}).then(function(records) {
            map.data = records;
            console.log("COUNTRY LIST: ", map.data);
        }, function(error) {
            console.log("error getting analitics: ", error);
        });
    };
    map.init = function(method) {
        console.log("CALL INIT TransferStatisticsCtrl: ", method._id);
        map.method = method;
        map.load(map.method);
    };
}]);





