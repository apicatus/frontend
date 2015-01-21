///////////////////////////////////////////////////////////////////////////////
// @file         : applications.js                                           //
// @summary      : API Digestors controller                                  //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : API Digestors controller                                  //
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

angular.module( 'apicatus.applications', [
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
    // Last 7 Days
    var since = new Date().setDate(new Date().getDate() - 7);
    var until = new Date().getTime();

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
                        return Restangular.one('summary').get({since: since, until: until});
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

///////////////////////////////////////////////////////////////////////////////
// Applications controller                                                   //
///////////////////////////////////////////////////////////////////////////////
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, $interval, $modal, fileReader, Restangular, mySocket, apis, summaries ) {

    apis.forEach(function(api){
        var index = $scope.user.digestors.indexOf(api._id);
        if(index > -1) {
            api.imOwner = true;
        }
    });
    var applications = this.apis = apis;
    $scope.apis = apis;
    $scope.summaries = summaries;
    //$scope.user.digestors

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

    // Update API
    this.update = function(api) {
        api.put().then(function(result) {
            console.log("api updated", result);
        });
    };

    // Remove API
    this.remove = function(api) {
        var that = this;
        api.remove().then(function() {
            that.apis = _.without(that.apis, api);
        });
    };

    $scope.addHeader = function(api, header, scope) {
        console.log("addHeader", header);
        if(!api.request.headers) {
            api.request.headers = [];
        }
        var indexes = api.request.headers.map(function(obj, index) {
            if(obj.name == header.name) {
                return index;
            }
        }).filter(isFinite)[0];
        console.log("index", indexes);
        if(angular.equals({}, header) || _.findIndex(api.request.headers, {name: header.name}) >= 0) {
            return false;
        }
        api.request.headers.push(angular.copy(header));
        $scope.api.put();
    };

    $scope.removeHeader = function(api, header, $index) {
        api.request.headers.splice($index, 1);
        $scope.api.put();
    };

    // Create new API Modal
    $scope.newApi = function () {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var ModalController = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
            $scope.api = {
                name: '',
                subdomain: '',
                synopsis: 'API Description'
            };
            $scope.submit = function () {
                $modalInstance.close($scope.api);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }];

        var modalInstance = $modal.open({
            templateUrl: 'applications/list/components/modals/new.tpl.html',
            controller: ModalController,
            windowClass: ''
        });

        modalInstance.result.then(
            function (api) {
                Restangular.all('digestors').post(api).then(function(result) {
                    result.imOwner = true;
                    $scope.apis.push(result);
                }, function(error) {
                    alert(error.data.message);
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };

    // Edit API Modal
    $scope.editApi = function (api) {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var ModalController = ['$scope', '$modalInstance', 'apiModel', function ($scope, $modalInstance, apiModel) {
            $scope.apiModel = apiModel;
            $scope.submit = function () {
                $modalInstance.close($scope.apiModel);
            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        }];

        var modalInstance = $modal.open({
            templateUrl: 'applications/list/components/modals/edit.tpl.html',
            controller: ModalController,
            windowClass: '',
            resolve: {
                apiModel: [function () {
                    return api;
                }]
            }
        });

        modalInstance.result.then(
            function (api) {
                api.put().then(function(result) {
                    console.log("api updated", result);
                });
                /*
                Restangular.all('digestors').post(api).then(function(result) {
                    result.imOwner = true;
                    $scope.apis.push(result);
                }, function(error) {
                    alert(error.data.message);
                });
                */
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
        });
    };

    // Import API Modal
    $scope.import = function () {
        // Please note that $modalInstance represents a modal window (instance) dependency.
        // It is not the same as the $modal service used above.
        var that = this;
        var ModalController = ['$scope', '$modalInstance', 'apiModel', function ($scope, $modalInstance, apiModel) {
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

        }];
        var modalInstance = $modal.open({
            templateUrl: 'applications/list/components/modals/import.tpl.html',
            controller: ModalController,
            windowClass: '',
            resolve: {
                apiModel: [function () {
                    return $scope.apiModel;
                }]
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
                        console.log('Error: ', error);
                    });
                });
            },
            function () {
                console.info('Modal dismissed at: ' + new Date());
            }
        );
    };


    // SocketIO notifications
    mySocket.on('message', function(result){
        //console.log('WebSocket: ', result.log.digestor);
    });

    $scope.$on('$destroy', function() {
        console.log('leave realtime ');
        mySocket.removeListener('message');
    });
})
///////////////////////////////////////////////////////////////////////////////
// Single Card controller                                                    //
///////////////////////////////////////////////////////////////////////////////
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

        card.barChart = {
            data: [],
            options: { height: '80%', width: '100%', fill: ['#49c5b1'] }
        };
        try {
            card.summary = {
                current: ($filter('filter')(summaries.current.digestors.buckets, {key: api._id}))[0],
                previous: ($filter('filter')(summaries.previous.digestors.buckets, {key: api._id}))[0]
            };
            if(!card.summary.current) {
                return;
            }
            card.summary.current.data = card.summary.current.dataset.buckets.map(function(bucket){
                return {
                    timestamp: bucket.key,
                    stats: bucket.time_stats,
                    count: bucket.doc_count
                };
            });

            card.barChart.data = card.summary.current.data.map(function(data){
                return data.stats.avg || 0;
            });
            card.barChart.calls = card.summary.current.data.map(function(data){
                return data.count || 0;
            });


        } catch (error) {
            console.log(error);
        }
    };
})
///////////////////////////////////////////////////////////////////////////////
// API Lists as table controller                                             //
///////////////////////////////////////////////////////////////////////////////
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
        table.barChart = {
            data: [],
            options: { height: '80%', width: '100%', fill: ['#49c5b1'] }
        };
        try {
            table.summary = {
                current: ($filter('filter')(summaries.current.digestors.buckets, {key: api._id}))[0],
                previous: ($filter('filter')(summaries.previous.digestors.buckets, {key: api._id}))[0]
            };
            table.summary.current.data = table.summary.current.dataset.buckets.map(function(bucket){
                return {
                    timestamp: bucket.key,
                    stats: bucket.time_stats,
                    count: bucket.doc_count
                };
            });
            table.barChart.data = table.summary.current.data.map(function(data){
                return data.stats.avg || 0;
            });
        } catch (error) {
            //console.log(error);
        }
    };
})
///////////////////////////////////////////////////////////////////////////////
// Heartbeat Directive                                                       //
///////////////////////////////////////////////////////////////////////////////
.directive( 'heartbeat', ['$timeout', '$q', 'mySocket', function($timeout, $q, mySocket) {
    return {
        restrict: 'A',
        scope: {
            heartbeat: '@'
        },
        controller: function($scope, $element, mySocket) {
            mySocket.on('message', function(result){
                if(result.log && $scope.heartbeat == result.log.digestor) {
                    $element.toggleClass('visible');
                }
            });

            $scope.$on('$destroy', function() {
                console.log('$destroy heartbeat');
                mySocket.removeListener('message');
            });
        }
    };
}])

///////////////////////////////////////////////////////////////////////////////
// Object to Array filter                                                    //
///////////////////////////////////////////////////////////////////////////////
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

