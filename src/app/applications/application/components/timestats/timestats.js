angular.module( 'apicatus.application.timestats', [])
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
    statistics.statusClassesBarOptions = {
        chart: {
            type: 'stackedBar'
        },
        plotOptions: {
            fillOpacity: 0.5,
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
}]);
