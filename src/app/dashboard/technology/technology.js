/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.technology', [
    'vectorMap',
    'stackedBarChart',
    'bivariateChart',
    'worldMap'
])
.controller( 'DashboardTechnologyCtrl', function DashboardTechnologyController( $scope, $filter, $stateParams, Restangular, apis, agentStatistics) {
    var technology = this;
    var parser = new UAParser();

    technology.agents = agentStatistics.agents.buckets;
    technology.devices = agentStatistics.devices.buckets;
    technology.strings = agentStatistics.strings.buckets;
    technology.oess = agentStatistics.oess.buckets;
    
    technology.platforms = {
        console: 0,
        mobile: 0,
        other: 0,
        smarttv: 0, 
        tablet: 0
    };
    technology.maxPlatforms = 0;

    if(!technology.devices.length && !technology.agents.length && !technology.oess.length) {
        technology.hasData = false;
    } else {
        technology.maxAgents = technology.devices.reduce(function(pv, cv) { 
            return pv + cv.doc_count; 
        }, 0);
        technology.maxDevices = technology.agents.reduce(function(pv, cv) { 
            return pv + cv.doc_count; 
        }, 0);
        technology.strings.forEach(function(device){
            var hw = parser.setUA(device.key).getDevice();
            Object.keys(technology.platforms).forEach(function(key){
                if(hw.type) {
                    technology.platforms[key] += hw.type.toLowerCase().indexOf(key) > -1 ? device.doc_count : 0;
                }
            });
            technology.platforms.other += hw.type ? device.doc_count : 0;
            technology.maxPlatforms += device.doc_count;
            device.type = hw.type;
            device.vendor = hw.vendor;
            device.model = hw.model;
        });

        technology.maxOess = technology.oess.reduce(function(pv, cv) { 
            return pv + cv.doc_count; 
        }, 0);
        technology.hasData = true;

    }
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
});
