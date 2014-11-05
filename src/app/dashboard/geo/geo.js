/*jslint evil: true */
/*jshint newcap: false */

angular.module( 'apicatus.dashboard.geo', [
    'vectorMap',
    'myGraph',
    'stackedBarChart',
    'bivariateChart',
    'worldMap'
])
.controller( 'DashboardGeoCtrl', function DashboardGeoController( $scope, $filter, $stateParams, Restangular, apis, geoStatistics, languageStatistics ) {
    
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
    
    if(!geoStatistics.summary.buckets.length) {
        geo.hasData = false;
    } else {
        geo.statistics = geoStatistics.summary.buckets;
        geo.map = geo.statistics;
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
