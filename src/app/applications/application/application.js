///////////////////////////////////////////////////////////////////////////////
// @file         : application.js                                            //
// @summary      : Frontend Application controller                           //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : Frontend Application controller                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 2013                                                      //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.application', [
    'apicatus.application.demo',
    'apicatus.application.monitor',
    'apicatus.application.logs',
    'apicatus.application.timestats',
    'apicatus.application.datastats',
    'apicatus.application.geo',
    'queryFactory',
    'ngAssertions',
    'ngChart'
])
.config(['$httpProvider', function ( $httpProvider ) {
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
}])
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
.config(['$stateProvider', function ( $stateProvider ) {
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
}])
.controller( 'ApplicationCtrl', function ApplicationController( $scope, $timeout, $stateParams, $modal, $filter, Restangular, queryFactory, parseURL, ngAssertions, mySocket, httpSettings, api) {

    // some regular type of header names
    //return ["Accept", "Accept-Charset", "Accept-Encoding", "Accept-Language", "Accept-Datetime", "Authorization", "Cache-Control", "Connection", "Cookie", "Content-Length", "Content-MD5", "Content-Type", "Date", "Expect", "From", "Host", "If-Match", "If-Modified-Since", "If-None-Match", "If-Range", "If-Unmodified-Since", "Max-Forwards", "Pragma", "Proxy-Authorization", "Range", "Referer", "Runscope-Request-Port", "Runscope-Collection-Id", "Runscope-Bucket-Auth", "TE", "Upgrade", "User-Agent", "Via", "Warning"];

    $scope.httpSettings = httpSettings.settings();
    $scope.assertionSources = ngAssertions.getSources();
    $scope.assertions = ngAssertions.getAssertions();

    $scope.api = api;

    // Sort params
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
    };

    $scope.save = function(api) {
        $scope.api.put();
    };

    ///////////////////////////////////////////////////////////////////////////
    // Assertions                                                            //
    ///////////////////////////////////////////////////////////////////////////
    $scope.addAssertion = function(method) {
        console.log("addAssertion: ", method);
        method.assertions = method.assertions || [];
        method.assertions.push({
            source: 1,
            assertion: 2
        });
    };
    $scope.removeAssertion = function(method, asserion, $index) {
        method.assertions.splice($index, 1);
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
    $scope.editEndpoint = function(endpoint, $index) {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var modalCtl = function ($scope, $modalInstance, endpoint) {
            $scope.endpoint = endpoint;
            $scope.submit = function () {
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
                    return endpoint;
                }
            }
        });
        modalInstance.result.then(
            function (endpoint) {
                $scope.api.put().then(function(result) {
                }, function(error) {
                    console.log('error: ', error);
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
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
        return $scope.api.put();
    };
    ////////////////////////////////////////////////////////////////////////////
    // Response Headers [Add, Remove]                                         //
    ////////////////////////////////////////////////////////////////////////////
    $scope.addHeader = function(method, header, scope) {
        console.log("addHeader", header);
        if(!method.response.headers) {
            method.response.headers = [];
        }
        /*var indexes = method.response.headers.map(function(obj, index) {
            if(obj && obj.name == header.name) {
                return index;
            }
        }).filter(isFinite)[0];
        console.log("index", indexes);
        if(angular.equals({}, header) || _.findIndex(method.response.headers, {name: header.name}) >= 0) {
            return false;
        }*/
        method.response.headers.push({
            name: null,
            value: null
        });
    };
    $scope.removeHeader = function(method, header, $index) {
        return method.response.headers.splice($index, 1);
    };
    ////////////////////////////////////////////////////////////////////////////
    // API Demo                                                               //
    ////////////////////////////////////////////////////////////////////////////
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

    ///////////////////////////////////////////////////////////////////////////
    // Destroy SocketIO listener                                             //
    ///////////////////////////////////////////////////////////////////////////
    $scope.$on('$destroy', function() {
        console.log('leave realtime ');
        mySocket.removeListener('message');
    });

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
.controller( 'AccordionCtrl', ['$scope', 'queryFactory', function AccordionController( $scope, queryFactory ) {

    var accordion = this;
    ///////////////////////////////////////////////////////////////////////////
    // Query template                                                        //
    ///////////////////////////////////////////////////////////////////////////
    // Load preset periods
    accordion.periods = queryFactory().periods();
    // Default period
    accordion.selectedPeriod = queryFactory().period();

    // Change Periods
    accordion.selectPeriod = function(period) {
        accordion.selectedPeriod = period;
        $scope.$broadcast('changePeriod', period);
    };

}])
.directive( 'loading', ['$rootScope', '$timeout', '$q', 'ngRequestNotify', function($rootScope, $timeout, $q, ngRequestNotify) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                console.log("change started !!");
            });
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
}])
.directive('uniqueHeader', [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            headers: '='
        },
        link: function(scope, element, attributes, ngModel) {
            scope.$watch('headers', function(pass) {
                ngModel.$validate();
            });
            ngModel.$validators.uniqueHeader = function(modelValue, viewValue) {
                var value = modelValue || viewValue;
                if(!value || value.length < 1) {
                    return true;
                }
                var headers = scope.headers.filter(function(header){
                    return header.name == value;
                });
                console.log("value: ", value, " headers: ", headers.length);
                return (headers.length < 1);
            };
        }
    };
}])
.filter('filterBySource', [function() {
    return function(assertions, source) {
        return assertions.filter(function(assertion) {
            try {
                if(assertion.sourceTypes && assertion.sourceTypes.indexOf(source) != -1) {
                    return true;
                }
            } catch (error) {
                return false;
            }
            return false;
        });
    };
}]);





