/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.technology', [
    'ngChart'
])
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state('main.dashboard.technology', {
        url: '/technology/:id/?since&until',
        views: {
            'widgets': {
                templateUrl: 'dashboard/technology/technology.tpl.html',
                controller: 'DashboardTechnologyCtrl as technology'
            },
            'toolbar': {
                templateUrl: 'dashboard/components/toolbar.tpl.html'
            }
        },
        resolve: {
            agentStatistics: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('agent/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('agent').get(queryFactory().get());
                }
            }],
            agentHistory: ['$stateParams', 'Restangular', 'queryFactory', function ($stateParams, Restangular, queryFactory) {
                if($stateParams.id) {
                    return Restangular.one('agenthistory/digestor', $stateParams.id).get(queryFactory().get());
                } else {
                    return Restangular.one('agenthistory').get(queryFactory().get());
                }
            }]
        },
        data: { pageTitle: 'Technology' },
        onEnter: function(){
            console.log("enter technology");
        }
    });
})
.controller( 'DashboardTechnologyCtrl', function DashboardTechnologyController( $scope, $filter, $stateParams, Restangular, queryFactory, countryCode, apis, agentStatistics, agentHistory) {
    console.log("run DashboardTechnologyController");
    var technology = this;

    technology.agents = agentStatistics.agents.buckets;
    technology.deviceFamilies = agentStatistics.deviceFamilies.buckets;
    technology.deviceTypes = agentStatistics.deviceTypes.buckets;
    technology.strings = agentStatistics.strings.buckets;
    technology.oess = agentStatistics.oess.buckets;
    technology.geo = agentStatistics.geo.buckets;


    ///////////////////////////////////////////////////////////////////////////
    // Chart config                                                          //
    ///////////////////////////////////////////////////////////////////////////
    technology.mapOptions = {
        plotOptions: {
            fill: '#EEEFF3'
        },
        mapNavigation: {
            enabled: false,
            enableButtons: true
        }
    };
    technology.deviceSplit = {
        chart: {
            type: 'area',
            margin: {top: 0, right: 0, bottom: 30, left: 0}
        },
        plotOptions: {
            fillOpacity: 0.75,
            area: {
                stacking: 'percent'
            },
            series: {
                animation: false,
                pointInterval: queryFactory().get().interval,
                pointStart: queryFactory().get().since,
                markers: false,
                tracking: false,
                stroke: false
            }
        },
        yAxis: {
            ticks: 2,
            labels: {
                formatter: function (tick) {
                    return tick + '%';
                }
            }
        },
        yGrid: {
            enabled: false
        }
    };

    console.log("Q: ", queryFactory().get());

    technology.platforms = {
        phone: {
            value: 0,
            color: 'rgb(65, 152, 55)', //'#348fe2',
            class: 'device-color-phone',
            icon: 'device-phone'
        },
        tablet: {
            value: 0,
            color: '#49b6d6',
            class: 'device-color-tablet',
            icon: 'device-tablet'
        },
        desktop: {
            value: 0,
            color: '#ff5b57',
            class: 'device-color-laptop',
            icon: 'device-laptop'
        },
        tv: {
            value: 0,
            color: 'rgb(123, 26, 245)', //'#f59c1a',
            class: 'device-color-monitor',
            icon: 'device-monitor'
        }
    };
    technology.maxPlatforms = 0;

    if(!technology.deviceFamilies.length && !technology.agents.length && !technology.oess.length) {
        technology.hasData = false;
    } else {
        technology.maxAgents = technology.deviceFamilies.reduce(function(pv, cv) {
            return pv + cv.doc_count;
        }, 0);
        technology.maxDeviceFamilies = technology.agents.reduce(function(pv, cv) {
            return pv + cv.doc_count;
        }, 0);
        technology.maxDeviceTypes = technology.deviceTypes.reduce(function(pv, cv) {
            return pv + cv.doc_count;
        }, 0);
        technology.maxOess = technology.oess.reduce(function(pv, cv) {
            return pv + cv.doc_count;
        }, 0);

        // Get Devices
        technology.deviceTypes.forEach(function(type){
            if(technology.platforms.hasOwnProperty(type.key)) {
                technology.platforms[type.key].value = type.doc_count;
            }
        });

        technology.hasData = true;
    }

    technology.history = {
        devices: agentHistory.history.buckets.map(function(history){
            return history.deviceTypes.buckets;
        })
    };

    Object.keys(technology.platforms).forEach(function(type){
        technology.history[type] = technology.history.devices.map(function(devices){
            var count = devices.filter(function(device){
                return device.key == type;
            })[0];
            return count ? (count.doc_count || 0) : 0;
        });
    });

    technology.deviceSplitx = {
        series: [
            {
                name: 'Tv',
                stroke: '#7B1AF5',
                fill: '#7B1AF5',
                data: angular.copy(technology.history['tv'])
            }, {
                name: 'Tablet',
                stroke: '#49b6d6',
                fill: '#49b6d6',
                data: angular.copy(technology.history['tablet'])
            }, {
                name: 'Phone',
                stroke: '#419837',
                fill: '#419837',
                data: angular.copy(technology.history['phone'])
            }, {
                name: 'Desktop',
                stroke: '#ff5b57',
                fill: '#ff5b57',
                data: angular.copy(technology.history['desktop'])
            }
        ]
    };

    technology.getOsIcon = function(os) {
        var icon = [{
            name: 'windows',
            icon: 'fa-windows'
        }, {
            name: 'linux',
            icon: 'fa-linux'
        }, {
            name: 'android',
            icon: 'fa-android'
        }, {
            name: 'mac',
            icon: 'fa-apple'
        }, {
            name: 'ios',
            icon: 'fa-apple'
        }].filter(function(element, index, array) {
            return os.toLowerCase().indexOf(element.name) > -1 ? true : false;
        })[0];
        return icon ? icon.icon : 'fa-question';
    };


    technology.deviceTypeSplit = {
        series: [{
            name: 'Device types',
            data: [] //traffic.codeStats
        }]
    };

    technology.map = {
        regions: [{
            name: 'mobile',
            minColor: '#49c5b1',
            maxColor: '#23443D',
            data: technology.geo.map(function(d){
                return {
                    key: countryCode.isoConvert(d.key).toUpperCase(),
                    value: d.doc_count
                };
            })
        }]
    };

    technology.countryClick = function(contry) {
        var technologyByCountry = technology.deviceTypes.map(function(device){
            var data = device.geo.buckets.filter(function(country){
                return countryCode.isoConvert(country.key).toUpperCase() == contry.id;
            })[0];

            return {
                name: device.key,
                value: data ? data.doc_count : 0,
                fill: technology.platforms[device.key].color
            };
        });
        technology.deviceTypeSplit.series[0].name = contry.properties.name;
        var sum = technologyByCountry.reduce(function(previousValue, currentValue) {
            return previousValue + currentValue.value;
        }, 0);
        technology.deviceTypeSplit.series[0].data = sum > 0 ? technologyByCountry : [];
        console.log("techy: ", sum, technologyByCountry);
    };
})
.directive( 'progressbarColor', [function() {
    return {
        restrict: 'A',
        terminal: true,
        link: function(scope, element, attributes) {
            element.find('.progress-bar').css({
                'background-color': attributes['progressbarColor']
            });
        }
    };
}]);
