/**

 */
angular.module( 'apicatus.applications', [])

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
                controller: 'ApplicationsCtrl',
                templateUrl: 'applications/applications.tpl.html'
            }
        },
        data: { pageTitle: 'Applications' },
        authenticate: false
    })
    .state('main.applications.list', {
        url: '/list',
        templateUrl: 'applications/list/applications.list.tpl.html',
        onEnter: function(){
            console.log("enter contacts.list");
        }
    })
    .state('main.applications.application', {
        url: '/:id',
        templateUrl: 'applications/application/application.tpl.html',
        controller: function($scope, $stateParams, Restangular){
            $scope.applications = Restangular.one('digestors', $stateParams.id).get().then(function(digestor){
                console.log(digestor);
                $scope.api = digestor;
            });
            $scope.addResource = function () {
                $scope.api.entries.push({
                    "id": "dsfadsf-asdfasdf-asdfadsf",
                    "route": "",
                    "method": {"id": 2, "label": "GET"},
                    "parameters": {
                        headers: [],
                        values: []
                    },
                    "sends": "",
                    "status": { "id": 204 },
                    "contentType": { "id": 100 },
                    "description": "",
                    "proxy": {
                        "enabled": false,
                        "url": ""
                    },
                    "hits": 0,
                    "isEditing": false
                });
            };
        },
        data: { pageTitle: 'Application' },
        onEnter: function(){
          console.log("enter contacts.detail");
        }
    });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'ApplicationsCtrl', function ApplicationsController( $scope, $location, Restangular ) {

    $scope.applications = Restangular.one('digestors').getList().then(function(digestors){
        console.log(digestors);
        $scope.apis = digestors;
    });
});

