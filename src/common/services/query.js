///////////////////////////////////////////////////////////////////////////////
// Query Factory                                                             //
///////////////////////////////////////////////////////////////////////////////
angular.module('queryFactory', [])
.provider('queryFactory', function () {
    'use strict';

    var periods = [{
        name: '1 hour',
        value: 3600 * 1000
    }, {
        name: '6 hours',
        value: 6 * 3600 * 1000
    }, {
        name: '12 hours',
        value: 12 * 3600 * 1000
    }, {
        name: '24 hours',
        value: 24 * 3600 * 1000
    }, {
        name: '1 week',
        value: 7 * 24 * 3600 * 1000
    }, {
        name: '30 days',
        value: 30 * 24 * 3600 * 1000
    }];

    // Default period
    var period = periods[3];

    // Default query params
    var query = {
        size: 100,
        skip: 100,
        limit: 100,
        since: new Date().setDate(new Date().getDate() - 1),    //
        until: new Date().getTime(),
        interval: 1800 * 1000                                   // one day '1d'
    };

    // expose to provider
    this.$get = ['$rootScope', function ($rootScope) {

        return function queryFactory (options) {

            angular.extend(query, options);

            var wrappedQuery = {
                get: function () {
                    query.interval = (query.until - query.since) / 48;
                    return query;
                },
                set: function (options) {
                    query = angular.extend(query, options);
                },
                periods: function() {
                    return periods;
                },
                period: function() {
                    return period;
                }
            };
            return wrappedQuery;
        };
    }];
});
