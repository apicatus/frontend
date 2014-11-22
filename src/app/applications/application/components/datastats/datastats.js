angular.module( 'apicatus.application.datastats', [])
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
            fillOpacity: 0.5,
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
            fillOpacity: 0.5,
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
}]);
