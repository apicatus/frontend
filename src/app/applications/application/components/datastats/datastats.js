angular.module( 'apicatus.application.datastats', [])
.controller( 'TransferStatisticsCtrl', ['$timeout', '$scope', '$moment', 'Restangular', function TransferStatisticsController($timeout, $scope, $moment, Restangular) {

    var statistics = this;
    statistics.period = $scope.accordion.selectedPeriod;
    statistics.since = new Date().getTime() - statistics.period.value;
    statistics.until = new Date().getTime();
    statistics.interval = 60 * 1000;

    statistics.lineChartOptions = {
        chart: {
            type: 'line'
        },
        plotOptions: {
            interpolate: 'linear',
            fillOpacity: 0.5,
            series: {
                animation: false,
                pointInterval: statistics.interval,
                pointStart: statistics.since
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
                pointInterval: statistics.interval,
                pointStart: statistics.since
                //units: 'ms'
            }
        },
        yAxis: {
            ticks: 2
        }
    };
    statistics.load = function(method) {
        Restangular.one('transfer/method', method._id).get({since: statistics.since, until: statistics.until}).then(function(records){
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

            // Update charts intervals and starting date
            [statistics.lineChartOptions, statistics.rangeChartOptions].forEach(function(chartOptions){
                chartOptions.plotOptions.series.pointInterval = records.period.interval.value;
                chartOptions.plotOptions.series.pointStart = statistics.since;
            });

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
        if(!statistics.method) {
            statistics.method = method;
            statistics.load(statistics.method);
            ////////////////////////////////////////////////////////////////////////////
            // Handle Date Range                                                      //
            ////////////////////////////////////////////////////////////////////////////
            $scope.$on('changePeriod', function(event, period) {
                statistics.period = period;
                statistics.since = new Date().getTime() - period.value;
                statistics.until = new Date().getTime();

                console.log("new Pariod: ", new Date(statistics.since), new Date(statistics.until));

                statistics.load(statistics.method);
            });
        }
    };
}]);
