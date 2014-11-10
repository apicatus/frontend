

angular.module( 'apicatus.dashboard.realtime', [
    'worldMap'
])
.controller( 'DashboardRealTimeCtrl', function DashboardRealTimeController( $scope ) {

	console.log("activeting DashboardRealTimeController");
	var realtime = this;

	realtime.worldMap = [{
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

});
