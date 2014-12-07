/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.geo', [
    'vectorMap',
    'myGraph',
    'stackedBarChart',
    'bivariateChart',
    'worldMap'
])
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state('main.dashboard.geo', {
        url: '/geo/:id/?since&until',
        views: {
            'widgets': {
                templateUrl: 'dashboard/geo/geo.tpl.html',
                controller: 'DashboardGeoCtrl as geo'
            },
            'toolbar': {
                templateUrl: 'dashboard/components/toolbar.tpl.html'
            }
        },
        resolve: {
            geoStatistics: ['apis', '$stateParams', 'Restangular', function (apis, $stateParams, Restangular) {
                if($stateParams.id) {
                    return Restangular.one('geo/digestor', $stateParams.id).get();
                } else {
                    return Restangular.one('geo').get();
                }
            }],
            languageStatistics: ['$stateParams', 'Restangular', function ($stateParams, Restangular) {
                if($stateParams.id) {
                    return Restangular.one('lang/digestor', $stateParams.id).get();
                } else {
                    return Restangular.one('lang').get();
                }
            }]
        },
        data: { pageTitle: 'Geo' },
        onEnter: function() {
            console.log("enter geo");
        }
    });
})
.controller( 'DashboardGeoCtrl', function DashboardGeoController( $scope, $filter, $stateParams, Restangular, countryCode, apis, geoStatistics, languageStatistics ) {

    var geo = this;
    var data = null;
    var parseLangRange = function(lang_range) {
        var extractPartsReg = /^([\w\*]*)(-(\w*))?.*$/i;

        var match = lang_range.trim().match(extractPartsReg);

        if (!match) {
            return undefined;
        }

        // we will store the result in here to be returned later
        var result = {};

        // parse language
        var parseLangReg = /^([a-z]{2}|\*)$/i;
        var lang = match[1];
        if (lang) {
            var langMatch = lang.match(parseLangReg);
            if (langMatch) {
                result.language = langMatch[0].toLowerCase();
            }
        }

        // parse locale
        var parseLocaleReg = /[a-z]{2}/i;
        var locale = match[3];
        if (locale) {
            var localeMatch = locale.match(parseLocaleReg);
            if (localeMatch) {
                result.locale = localeMatch[0].toUpperCase();
            }
        }

        // if we havn't found anything return undefined
        if (result.language || result.locale) {
            return result;
        }

        return undefined;
    };

    geo.mapOptions = {
        plotOptions: {
            fill: '#EEEFF3'
        },
        colorAxis: {
            minColor: '#C8EEFF',
            maxColor: '#49c5b1'
        }
    };
    if(!geoStatistics.summary.buckets.length) {
        geo.hasData = false;
    } else {
        geo.statistics = geoStatistics.summary.buckets;
        // Put real country name
        geo.statistics.forEach(function(country){
            country.name = countryCode.convert(country.key);
            country.flag = country.key;
            country.key = countryCode.isoConvert(country.key);
            country.value = country.doc_count;
        });
        console.log("geo.statistics: ", geo.statistics);
        geo.map = {
            regions: [{
                name: 'hits',
                minColor: '#0F0',
                maxColor: '#F00',
                data: geo.statistics
            }]
        };
        geo.maxCountries = geo.statistics.reduce(function(pv, cv) {
            return pv + cv.doc_count;
        }, 0);

        geo.languages = languageStatistics.summary.buckets;

        geo.hasData = true;
    }
    geo.maxLanguages = 0;
    if(geo.languages) {
        geo.languages = geo.languages.map(function(lang) {
            geo.maxLanguages += lang.doc_count;
            return {
                doc_count: lang.doc_count,
                language: parseLangRange(lang.key.split(",")[0]).language,
                locale: parseLangRange(lang.key.split(",")[0]).locale
            };
        });
    }
});
