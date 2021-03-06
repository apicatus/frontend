angular.module( 'apicatus.application.geo', [
    'ngChart'
])
.controller( 'GeoCtrl', ['$timeout', 'Restangular', 'countryCode', function GeoController($timeout, Restangular, countryCode) {
    var geo = this;
    var since = new Date().setMinutes(new Date().getMinutes() - 60);
    var until = new Date().getTime();

    geo.mapOptions = {
        plotOptions: {
            fill: '#EEEFF3'
        },
        mapNavigation: {
            enabled: false,
            enableButtons: true
        }
    };

    geo.worldMap = [{"key":"us","doc_count":6360,"stats":{"count":6360,"min":0,"max":46479,"avg":700.8207547169811,"sum":4457220,"sum_of_squares":19808798970,"variance":2623441.302776789,"std_deviation":1619.7040787677201}},{"key":"sa","doc_count":3316,"stats":{"count":3316,"min":0,"max":3351101,"avg":1729.4182750301568,"sum":5734751,"sum_of_squares":11242804265365,"variance":3387480845.049111,"std_deviation":58202.069078763096}},{"key":"ai","doc_count":3308,"stats":{"count":3308,"min":0,"max":69035,"avg":750.0952237001209,"sum":2481315,"sum_of_squares":21104616173,"variance":5817229.03355639,"std_deviation":2411.893246716444}},{"key":"vu","doc_count":3296,"stats":{"count":3296,"min":0,"max":8166509,"avg":3179.496055825243,"sum":10479619,"sum_of_squares":66703218015565,"variance":20227517629.94173,"std_deviation":142223.47777333294}},{"key":"uz","doc_count":3278,"stats":{"count":3278,"min":0,"max":75223,"avg":715.0176937156803,"sum":2343828,"sum_of_squares":16213176118,"variance":4434807.085714999,"std_deviation":2105.8981660362874}},{"key":"aw","doc_count":3260,"stats":{"count":3260,"min":0,"max":60024,"avg":812.8604294478528,"sum":2649925,"sum_of_squares":24726452047,"variance":6924059.163648896,"std_deviation":2631.3607057279123}},{"key":"id","doc_count":3258,"stats":{"count":3258,"min":0,"max":36710,"avg":751.8833640270104,"sum":2449636,"sum_of_squares":14278193960,"variance":3817174.157052894,"std_deviation":1953.7589813108714}},{"key":"ag","doc_count":3252,"stats":{"count":3252,"min":0,"max":30372,"avg":700.0713407134072,"sum":2276632,"sum_of_squares":10390172506,"variance":2704910.11360669,"std_deviation":1644.6610938447745}},{"key":"nz","doc_count":3242,"stats":{"count":3242,"min":0,"max":65790,"avg":694.6773596545343,"sum":2252144,"sum_of_squares":16168961242,"variance":4504764.896520111,"std_deviation":2122.4431432950355}},{"key":"cn","doc_count":3232,"stats":{"count":3232,"min":0,"max":42627,"avg":737.6924504950495,"sum":2384222,"sum_of_squares":13266811272,"variance":3560640.0687796385,"std_deviation":1886.9658366752797}},{"key":"vg","doc_count":3230,"stats":{"count":3230,"min":0,"max":43097,"avg":689.7504643962849,"sum":2227894,"sum_of_squares":11746252666,"variance":3160855.0293728495,"std_deviation":1777.8793629976274}},{"key":"au","doc_count":3228,"stats":{"count":3228,"min":0,"max":2947777,"avg":1615.4693308550186,"sum":5214735,"sum_of_squares":8701219228573,"variance":2692935249.105317,"std_deviation":51893.49910253997}},{"key":"ar","doc_count":3212,"stats":{"count":3212,"min":0,"max":76068,"avg":783.9436488169365,"sum":2518027,"sum_of_squares":20717132385,"variance":5835349.038231767,"std_deviation":2415.646712214302}},{"key":"vn","doc_count":3210,"stats":{"count":3210,"min":0,"max":23432,"avg":645.3249221183801,"sum":2071493,"sum_of_squares":7404243033,"variance":1890173.5121826264,"std_deviation":1374.835812809161}},{"key":"ve","doc_count":3209,"stats":{"count":3209,"min":0,"max":3604522,"avg":1862.3842318479276,"sum":5976391,"sum_of_squares":13007986409131,"variance":4050126541.8414593,"std_deviation":63640.60450562565}},{"key":"al","doc_count":3191,"stats":{"count":3191,"min":0,"max":2740364,"avg":1531.9683484801003,"sum":4888511,"sum_of_squares":7521306077579,"variance":2354690389.675902,"std_deviation":48525.152134495176}},{"key":"zw","doc_count":3190,"stats":{"count":3190,"min":0,"max":39289759,"avg":13987.80564263323,"sum":44621100,"sum_of_squares":1553470449427400,"variance":486785673402.2067,"std_deviation":697700.2747614528}},{"key":"ad","doc_count":3186,"stats":{"count":3186,"min":0,"max":536654,"avg":901.6089139987445,"sum":2872526,"sum_of_squares":306227759756,"variance":95303786.78867133,"std_deviation":9762.365839727137}},{"key":"ye","doc_count":3182,"stats":{"count":3182,"min":0,"max":3608997,"avg":1777.0502828409806,"sum":5654574,"sum_of_squares":13033757575188,"variance":4092931839.3657937,"std_deviation":63976.02550460441}},{"key":"vi","doc_count":3170,"stats":{"count":3170,"min":0,"max":36188,"avg":701.2457413249211,"sum":2222949,"sum_of_squares":10854322559,"variance":2932330.9273083624,"std_deviation":1712.4050126381792}},{"key":"uy","doc_count":3169,"stats":{"count":3169,"min":0,"max":51181,"avg":740.1953297570211,"sum":2345679,"sum_of_squares":17141802893,"variance":4861326.049886677,"std_deviation":2204.841502214315}},{"key":"gb","doc_count":3167,"stats":{"count":3167,"min":0,"max":65623,"avg":764.2491316703505,"sum":2420377,"sum_of_squares":24874093801,"variance":7270073.501874048,"std_deviation":2696.3073826761756}},{"key":"ir","doc_count":3157,"stats":{"count":3157,"min":0,"max":30152,"avg":721.8286347798543,"sum":2278813,"sum_of_squares":11431636655,"variance":3100007.658628893,"std_deviation":1760.6838610690145}},{"key":"ao","doc_count":3156,"stats":{"count":3156,"min":0,"max":26285097,"avg":9106.867237008872,"sum":28741273,"sum_of_squares":690928089836655,"variance":218842315234.2273,"std_deviation":467805.8520735149}},{"key":"af","doc_count":3134,"stats":{"count":3134,"min":0,"max":63469,"avg":676.8503509891513,"sum":2121249,"sum_of_squares":10659455965,"variance":2943103.967713661,"std_deviation":1715.547716536518}}];

    geo.data = {
        regions: [{
            name: 'mobile',
            minColor: '#49c5b1',
            maxColor: '#23443D',
            data: geo.worldMap.map(function(d){
                return {
                    key: countryCode.isoConvert(d.key).toUpperCase(),
                    value: d.doc_count
                };
            })
        }]
    };

    geo.load = function(method) {
        Restangular.one('geo/method', method._id).get({since: since, until: until}).then(function(records) {
            geo.data.regions[0].data = records.summary.buckets.map(function(region){
                return {
                    key: countryCode.isoConvert(region.key).toUpperCase(),
                    value: region.doc_count
                };
            });
        }, function(error) {
            console.log("error getting analitics: ", error);
        });
    };
    geo.init = function(method) {
        geo.method = method;
        geo.load(geo.method);
    };
}]);
