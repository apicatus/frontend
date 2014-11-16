/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.application', [
    'vectorMap',
    'normalBarChart'
])
.config(['$httpProvider', function ($httpProvider) {
    var interceptor = ['$injector', function ($injector) {
        return $injector.get('requestInterceptor');
    }];
    $httpProvider.interceptors.push(interceptor);
}])
.factory('requestInterceptor', ['ngRequestNotify', '$injector', '$q', function(ngRequestNotify, $injector, $q) {
        var http = null;
        var requestEnded = function() {
            http = http || $injector.get('$http');
            if (http.pendingRequests.length < 1) {
                // send notification requests are complete
                ngRequestNotify.requestEnded();
            }
        };
        return {
            request: function(config) {
                ngRequestNotify.requestStarted();
                return config;
            },

            response: function(response) {
                requestEnded();
                return response;
            },

            responseError: function(reason) {
                requestEnded();
                return $q.reject(reason);
            }
        };
    }]
)
.factory('ngRequestNotify', ['$rootScope', '$timeout', function($rootScope, $timeout){
    // private notification messages
    var START_REQUEST = 'ngRequestNotify:START_REQUEST';
    var END_REQUEST = 'ngRequestNotify:END_REQUEST';
    var isDisabled = false;
    var lastTimeout = null;

    return {
        /**
         * This method shall be called when an HTTP request
         * started. This is called by the initiating component - the
         * HTTP interceptor.
         */
        requestStarted: function() {
            if (!isDisabled) {
                $rootScope.$broadcast(START_REQUEST);
            }
        },

        /**
         * This method shall be called when an HTTP request
         * ends. This is called by the initiating component - the
         * HTTP interceptor.
         */
        requestEnded: function() {
            $rootScope.$broadcast(END_REQUEST);
        },

        /**
         * This method is invoked by any listener that wants to be
         * notified of the request start.
         *
         * @param handler
         */
        onRequestStarted: function(handler) {
            $rootScope.$on(START_REQUEST, function(event){
                handler(event);
            });
        },

        /**
         * This method is invoked by any listener that wants to be
         * notified of the request end.
         *
         * @param handler
         */
        onRequestEnded: function(handler) {
            $rootScope.$on(END_REQUEST, function(event){
                handler(event);
            });
        },

        /**
         * This method will disable sham spinner for the reset time. After
         * reset time the spinner will be enabled again. If reset time is
         * set to less than 0 then to enable spinner, call this method
         * again with false as the disable argument.
         *
         * @param disable       Set to true to disable the sham spinner
         * @param resetTime     reset time in ms (no reset if set to < 0)
         */
        setDisabled: function(disable, resetTime) {
            isDisabled = disable;
            if (isDisabled) {
                this.requestEnded();
                if (resetTime > 0) {
                    if (lastTimeout !== null) {
                        $timeout.cancel(lastTimeout);
                    }
                    lastTimeout = $timeout(function() {
                        isDisabled = false;
                        lastTimeout = null;
                    }, resetTime);
                }
            } else {
                if (lastTimeout !== null) {
                    $timeout.cancel(lastTimeout);
                    lastTimeout = null;
                }
            }
        }
    };
}])
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
            }]
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
    $scope.record = function(toggle) {
        $scope.api.learn = !$scope.api.learn;
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
    /*
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
    */
})
.controller( 'DemoCtrl', function DemoController($scope, parseURL, Restangular) {

    var demo = this;
    // Create demo code for method
    this.create = function(method) {
        var serviceUrl = parseURL.parse(Restangular.configuration.baseUrl);
        var options = {
            type: method.method.toUpperCase(),
            url: serviceUrl.protocol + "://" + $scope.api.subdomain + "." + serviceUrl.host + ":" + serviceUrl.port + method.URI,
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

}])
.controller( 'StatisticsCtrl', ['$timeout', '$scope', '$moment', 'Restangular', function StatisticsController($timeout, $scope, $moment, Restangular) {

    var statistics = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();
    var interval = 60 * 1000;

    // Calculate percentages
    statistics.percetage = function(value) {
        if(value > 0 && statistics.availability.total > 0) {
            return (value / statistics.availability.total) * 100;
        } else {
            return 0;
        }
    };

    statistics.lineChartOptions = {
        chart: {
            type: 'line'
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 1,
            series: {
                animation: false,
                pointInterval: interval, // one day
                pointStart: since
                //units: 'ms'
            }
        },
        yAxis: {
            ticks: 2
        }
    };
    statistics.rangeChartOptions = {
        chart: {
            type: 'bivariate'
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 1,
            series: {
                animation: false,
                pointInterval: interval, // one day
                pointStart: since
                //units: 'ms'
            }
        },
        yAxis: {
            ticks: 2
        }
    };
    statistics.statusClassesBarOptions = {
        chart: {
            type: 'stackedBar'
        },
        plotOptions: {
            fillOpacity: 1,
            series: {
                animation: false,
                pointInterval: interval, // one day
                pointStart: since
            }
        },
        yAxis: {
            ticks: 2
        }
    };
    statistics.load = function(method) {

        Restangular.one('transfer/method', method._id).get({since: since, until: until}).then(function(records){
            statistics.percentiles = records.aggregations.t_percentiles.values;
            statistics.stats = records.aggregations.t_statistics;
            statistics.timestatistics = records.aggregations.history.buckets;
            statistics.availability = records.aggregations.statuses.buckets.reduce(function(previousValue, currentValue){


                if(currentValue.key >= 100 && currentValue.key < 200) {
                    previousValue.informational += currentValue.doc_count;
                } else if(currentValue.key >= 200 && currentValue.key < 300) {
                    previousValue.success += currentValue.doc_count;
                } else if(currentValue.key >= 300 && currentValue.key < 400) {
                    previousValue.redirection += currentValue.doc_count;
                } else if(currentValue.key >= 400 && currentValue.key < 500) {
                    previousValue.clientError += currentValue.doc_count;
                } else if(currentValue.key >= 500) {
                    previousValue.serverError += currentValue.doc_count;
                }

                previousValue.total += currentValue.doc_count;
                previousValue.exception = previousValue.total - previousValue.success;
                return previousValue;

            }, {total: 0, exception: 0, informational: 0, success: 0, redirection: 0, clientError: 0, serverError: 0});

            statistics.timeStatsByDate = {
                avg: records.aggregations.history.buckets.map(function(history){
                    return history.time_statistics.avg || 0;
                }),
                max: records.aggregations.history.buckets.map(function(history){
                    return history.time_statistics.max || 0;
                }),
                min: records.aggregations.history.buckets.map(function(history){
                    return history.time_statistics.min || 0;
                })
            };

            statistics.responseClasses = records.aggregations.history.buckets.map(function(history){
                return history.statuses.buckets;
            });
            statistics.responseClasses = statistics.responseClasses.reduce(function(previousValue, currentValue, index, array){

                previousValue.forEach(function(previous, index){
                    previous.data = previous.data || [];
                    var count = currentValue.filter(function(classe) {
                        return (classe.key >= previous.key && classe.key < previous.key + 100);
                    })[0];
                    count = count ? count.doc_count : 0;
                    previous.data.push(count);
                });

                return previousValue;

            }, [{key: 100}, {key: 200}, {key: 300}, {key: 400}, {key: 500}]);

            // Average
            statistics.latencyHistogram = {
                series: [
                    {
                        name: 'avg',
                        stroke: '#2c3e50',
                        data: statistics.timeStatsByDate.avg
                    }
                ]
            };
            // Min Max Range
            statistics.latencyRangeHistogram = {
                series: [
                    {
                        name: 'range',
                        stroke: '#2980b9',
                        data: statistics.timeStatsByDate.min.map(function(min, index){
                            return [min, statistics.timeStatsByDate.max[index]];
                        })
                    }
                ]
            };

            // Min Max Range
            statistics.normalBars = {
                series: [
                    {
                        name: 'Success',
                        stroke: '#27ae60',
                        fill: '#27ae60',
                        data: statistics.responseClasses[1].data
                    },
                    {
                        name: 'Redirection',
                        stroke: '#2980b9',
                        fill: '#2980b9',
                        data: statistics.responseClasses[2].data
                    },
                    {
                        name: 'Client Error',
                        stroke: '#f1c40f',
                        fill: '#f1c40f',
                        data: statistics.responseClasses[3].data
                    },
                    {
                        name: 'Server Error',
                        stroke: '#c0392b',
                        fill: '#c0392b',
                        data: statistics.responseClasses[4].data
                    }
                ]
            };

            // Aggregate traffic status codes
            statistics.codeStatsChilds = records.aggregations.statuses.buckets.reduce(function(previousValue, currentValue, index, array){
                var current = parseInt(array[index].key, 10);
                var previous = previousValue.filter(function(value) {
                    return (current >= value.key && current < value.key + 100);
                })[0];

                previous.doc_count = previous.doc_count ? previous.doc_count + array[index].doc_count : array[index].doc_count; //previous.doc_count > 0 ? array[index].doc_count : array[index].doc_count + previous.doc_count

                previous.children = previous.children || [];
                previous.children.push(array[index]);

                return previousValue;
            }, [{key: 100}, {key: 200}, {key: 300}, {key: 400}, {key: 500}]);

            statistics.codeStats = {
                name: 'tree',
                children: statistics.codeStatsChilds
            };

        });

        // Auto Update
        /*
        $timeout(function(){
            statistics.load(method);
        }, 1500);
        */
    };
    statistics.init = function(method) {
        statistics.method = method;
        statistics.load(statistics.method);
    };
}])
.controller( 'TransferStatisticsCtrl', ['$timeout', '$scope', '$moment', 'Restangular', function TransferStatisticsController($timeout, $scope, $moment, Restangular) {

    var statistics = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();
    var interval = 60 * 1000;

    statistics.lineChartOptions = {
        chart: {
            type: 'line'
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 1,
            series: {
                animation: false,
                pointInterval: interval, // one day
                pointStart: since
                //units: 'ms'
            }
        },
        yAxis: {
            ticks: 2
        }
    };
    statistics.rangeChartOptions = {
        chart: {
            type: 'bivariate'
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 1,
            series: {
                animation: false,
                pointInterval: interval, // one day
                pointStart: since
                //units: 'ms'
            }
        },
        yAxis: {
            ticks: 2
        }
    };
    statistics.load = function(method) {
        Restangular.one('transfer/method', method._id).get({since: since, until: until}).then(function(records){
            statistics.percentiles = records.aggregations.z_percentiles.values;
            statistics.stats = records.aggregations.z_statistics;
            statistics.transferstatistics = records.aggregations.history.buckets;

            statistics.dataStatsByDate = {
                avg: records.aggregations.history.buckets.map(function(history){
                    return history.transfer_statistics.avg || 0;
                }),
                max: records.aggregations.history.buckets.map(function(history){
                    return history.transfer_statistics.max || 0;
                }),
                min: records.aggregations.history.buckets.map(function(history){
                    return history.transfer_statistics.min || 0;
                })
            };
            // Average
            statistics.dataHistogram = {
                series: [
                    {
                        name: 'avg',
                        stroke: '#27ae60',
                        data: statistics.dataStatsByDate.avg
                    }, {
                        name: 'max',
                        stroke: '#c0392b',
                        data: statistics.dataStatsByDate.max
                    }, {
                        name: 'min',
                        stroke: '#f1c40f',
                        data: statistics.dataStatsByDate.min
                    }
                ]
            };
            // Min Max Range
            statistics.dataRangeHistogram = {
                series: [
                    {
                        name: 'range',
                        stroke: '#2980b9',
                        data: statistics.dataStatsByDate.min.map(function(min, index){
                            return [min, statistics.dataStatsByDate.max[index]];
                        })
                    }
                ]
            };

        }, function(error) {
            console.log("error getting analitics: ", error);
        });
    };
    statistics.init = function(method) {
        statistics.method = method;
        statistics.load(statistics.method);
    };
}])
.controller( 'MapCtrl', ['$timeout', 'Restangular', function TransferStatisticsController($timeout, Restangular) {

    var map = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();
    map.worldMap = [{
        latLng: [40.71, -74],
        name: "New York"
    }, {
        latLng: [39.9, 116.4],
        name: "Beijing"
    }, {
        latLng: [31.23, 121.47],
        name: "Shanghai"
    }, {
        latLng: [-33.86, 151.2],
        name: "Sydney"
    }];
    map.load = function(method) {
        Restangular.one('geo/method', method._id).get({since: since, until: until}).then(function(records) {
            map.data = records.summary.buckets;
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
}])
.directive( 'loading', ['$timeout', '$q', 'ngRequestNotify', function($timeout, $q, ngRequestNotify) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            //element.find('.panel-body').prepend('<div class="panel-loader"><span class="spinner-small"></span></div>');

            /*
            $timeout(function() {
                element.addClass('panel-loading');
                element.find('.panel-body').addClass('fade in').prepend('<div class="panel-loader"><span class="spinner-small"></span></div>');
                //element.find('.panel-body').removeClass('fade in');
            }, 5000);
            */

            // subscribe to request started notification
            ngRequestNotify.onRequestStarted(function() {
                // got the request start notification, show the element
                element
                    .addClass('panel-loading')
                    .find('.panel-body')
                    .addClass('fade in')
                    .prepend('<div class="panel-loader"><span class="spinner-small"></span></div>');
            });

            // subscribe to request ended notification
            ngRequestNotify.onRequestEnded(function() {
                // got the request end notification, hide the element
                element
                    .removeClass('panel-loading')
                    .find('.panel-body')
                    .removeClass('fade in')
                    .find('.panel-loader')
                    .remove();
            });

        }
    };
}]);





