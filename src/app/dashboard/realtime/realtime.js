

angular.module( 'apicatus.dashboard.realtime', [
    'ngChart'
])

.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state('main.dashboard.realtime', {
        url: '/realtime/:id',
        views: {
            'widgets': {
                templateUrl: 'dashboard/realtime/realtime.tpl.html',
                controller: 'DashboardRealTimeCtrl as realtime'
            }
        },
        data: { pageTitle: 'RealTime Monitor' },
        //authenticate: true,
        onEnter: function(){
            console.log("enter realtime");
        }
    });
})
.controller( 'DashboardRealTimeCtrl', function DashboardRealTimeController( $scope, $interval, countryCode, mySocket ) {

    var realtime = this;

    realtime.mapOptions = {
        plotOptions: {
            fill: '#616D7D'
        },
        mapNavigation: {
            enabled: false,
            enableButtons: true
        }
    };
    /*jshint -W008 */
    var features=[{type:"Feature",properties:{name:"Mexico",amount:"2,485,336",rank:"6"},geometry:{type:"Point",coordinates:[-102.50662121099992,23.940958892339154]}},{type:"Feature",properties:{name:"Guatemala",amount:"60,891",rank:"5"},geometry:{type:"Point",coordinates:[-91.24008643324214,15.007764594360708]}},{type:"Feature",properties:{name:"Honduras",amount:"79,220",rank:"5"},geometry:{type:"Point",coordinates:[-86.61832371676599,14.821904530070185]}},{type:"Feature",properties:{name:"El Salvador",amount:"169,001",rank:"5"},geometry:{type:"Point",coordinates:[-88.86950657436876,13.73677620096106]}},{type:"Feature",properties:{name:"Korea",amount:"55,699",rank:"5"},geometry:{type:"Point",coordinates:[127.88014001934664,36.43732885374379]}},{type:"Feature",properties:{name:"India",amount:"164,508",rank:"5"},geometry:{type:"Point",coordinates:[82.75284814052941,22.426348968929915]}},{type:"Feature",properties:{name:"Vietnam",amount:"156,923",rank:"5"},geometry:{type:"Point",coordinates:[107.63398084933692,12.899789384572614]}},{type:"Feature",properties:{name:"Philippines",amount:"72,650",rank:"5"},geometry:{type:"Point",coordinates:[121.41797221934257,15.95336214214933]}},{type:"Feature",properties:{name:"Nicaragua",amount:"16,197",rank:"3"},geometry:{type:"Point",coordinates:[-85.03427140500116,12.845120529988606]}},{type:"Feature",properties:{name:"Ireland",amount:"4,389",rank:"2"},geometry:{type:"Point",coordinates:[-8.138264403779033,53.17669234237786]}},{type:"Feature",properties:{name:"Afghanistan",amount:"2436",rank:"2"},geometry:{type:"Point",coordinates:[66.00844758778612,33.83626696374955]}},{type:"Feature",properties:{name:"Albania",amount:"1589",rank:"1"},geometry:{type:"Point",coordinates:[20.053819505765716,41.14248112870132]}},{type:"Feature",properties:{name:"Argentina",amount:"9905",rank:"2"},geometry:{type:"Point",coordinates:[-65.1548248323,-35.18209766247696]}},{type:"Feature",properties:{name:"Armenia",amount:"273",rank:"1"},geometry:{type:"Point",coordinates:[44.9317308780777,40.28859678761182]}},{type:"Feature",properties:{name:"Australia",amount:"3168",rank:"2"},geometry:{type:"Point",coordinates:[124.96605229187992,-23.994211913448908]}},{type:"Feature",properties:{name:"Austria",amount:"1,065",rank:"1"},geometry:{type:"Point",coordinates:[14.130672916921753,47.58565692342842]}},{type:"Feature",properties:{name:"Bahamas",amount:"821",rank:"1"},geometry:{type:"Point",coordinates:[-77.69236131162506,24.008144780057705]}},{type:"Feature",properties:{name:"Bangladesh",amount:"11,690",rank:"3"},geometry:{type:"Point",coordinates:[90.22663495543901,23.88242325782727]}},{type:"Feature",properties:{name:"Barbados",amount:"1,976",rank:"2"},geometry:{type:"Point",coordinates:[-59.54057776565122,13.147694562654124]}},{type:"Feature",properties:{name:"Belarus",amount:"376",rank:"1"},geometry:{type:"Point",coordinates:[28.03356645962458,53.531880481998826]}},{type:"Feature",properties:{name:"Belgium",amount:"1,426",rank:"1"},geometry:{type:"Point",coordinates:[28.03356645962458,53.531880481998826]}},{type:"Feature",properties:{name:"Belize",amount:"5,153",rank:"2"},geometry:{type:"Point",coordinates:[-88.78601556036054,17.54397089941339]}},{type:"Feature",properties:{name:"Bolivia",amount:"3,463",rank:"2"},geometry:{type:"Point",coordinates:[-64.68475359110516,-16.706876766549385]}},{type:"Feature",properties:{name:"Bosnia",amount:"3,281",rank:"2"},geometry:{type:"Point",coordinates:[17.505690478432996,44.08017387812214]}},{type:"Feature",properties:{name:"Brazil",amount:"13,793",rank:"3"},geometry:{type:"Point",coordinates:[-59.005375702726326,-4.947418298115792]}},{type:"Feature",properties:{name:"Bulgaria",amount:"1,813",rank:"2"},geometry:{type:"Point",coordinates:[25.21749754347701,42.76853191221812]}},{type:"Feature",properties:{name:"Myanmar",amount:"3,489",rank:"2"},geometry:{type:"Point",coordinates:[96.48874352469409,21.215154155639937]}},{type:"Feature",properties:{name:"Cambodia",amount:"10,156",rank:"3"},geometry:{type:"Point",coordinates:[104.90525256955061,12.718007203469824]}},{type:"Feature",properties:{name:"Cameroon",amount:"4,221",rank:"2"},geometry:{type:"Point",coordinates:[12.73698295979591,5.693057542671625]}},{type:"Feature",properties:{name:"Canada",amount:"42,075",rank:"4"},geometry:{type:"Point",coordinates:[-117.09059449134253,59.65683609990623]}},{type:"Feature",properties:{name:"Cape Verde",amount:"58",rank:"1"},geometry:{type:"Point",coordinates:[-23.180382383440076,15.221337468049853]}},{type:"Feature",properties:{name:"Chile",amount:"3,436",rank:"2"},geometry:{type:"Point",coordinates:[-71.24781565426889,-35.44787283276486]}},{type:"Feature",properties:{name:"China",amount:"71,656",rank:"5"},geometry:{type:"Point",coordinates:[93.78454088305546,35.21709192565203]}},{type:"Feature",properties:{name:"Colombia",amount:"35,131",rank:"4"},geometry:{type:"Point",coordinates:[-73.07834068147713,3.911188855381511]}},{type:"Feature",properties:{name:"Costa Rica",amount:"4,511",rank:"2"},geometry:{type:"Point",coordinates:[-84.19202644686288,9.974655552412003]}},{type:"Feature",properties:{name:"Croatia",amount:"2,988",rank:"2"},geometry:{type:"Point",coordinates:[17.37565219599219,42.95000483985166]}},{type:"Feature",properties:{name:"Cuba",amount:"24,669",rank:"4"},geometry:{type:"Point",coordinates:[-79.54124915322569,22.093377645162377]}},{type:"Feature",properties:{name:"Czechoslovakia",amount:"1,698",rank:"2"},geometry:{type:"Point",coordinates:[15.31410310187681,49.73244820552043]}},{type:"Feature",properties:{name:"Denmark",amount:"1,583",rank:"1"},geometry:{type:"Point",coordinates:[8.811534049456952,55.80111302894329]}},{type:"Feature",properties:{name:"Dominica",amount:"1,232",rank:"1"},geometry:{type:"Point",coordinates:[-61.356921539097584,15.436438780925187]}},{type:"Feature",properties:{name:"Dominican Republic",amount:"5,324",rank:"2"},geometry:{type:"Point",coordinates:[-70.5003985986163,18.89926969484071]}},{type:"Feature",properties:{name:"Ecuador",amount:"8,666",rank:"2"},geometry:{type:"Point",coordinates:[-78.39002628888198,-1.448279428452679]}},{type:"Feature",properties:{name:"Egypt",amount:"4,854",rank:"2"},geometry:{type:"Point",coordinates:[29.86089558226547,26.492410511735898]}},{type:"Feature",properties:{name:"England",amount:"21,124",rank:"4"},geometry:{type:"Point",coordinates:[-1.460467598400783,52.601885382104854]}},{type:"Feature",properties:{name:"Eritrea",amount:"1,590",rank:"1"},geometry:{type:"Point",coordinates:[38.098713316066835,16.08684756646221]}},{type:"Feature",properties:{name:"Ethiopia",amount:"13,786",rank:"3"},geometry:{type:"Point",coordinates:[36.73714217097455,9.380194405247778]}},{type:"Feature",properties:{name:"Fiji",amount:"550",rank:"1"},geometry:{type:"Point",coordinates:[-178.72301086845667,-20.660115360335453]}},{type:"Feature",properties:{name:"France",amount:"8,244",rank:"2"},geometry:{type:"Point",coordinates:[2.449486512892406,46.62237366531258]}},{type:"Feature",properties:{name:"Germany",amount:"36,351",rank:"4"},geometry:{type:"Point",coordinates:[10.370787457775123,51.0871017663336]}},{type:"Feature",properties:{name:"Ghana",amount:"7,194",rank:"2"},geometry:{type:"Point",coordinates:[-1.216528980028272,7.953953003728316]}},{type:"Feature",properties:{name:"Greece",amount:"2,152",rank:"2"},geometry:{type:"Point",coordinates:[22.581857843165096,39.47499718996852]}},{type:"Feature",properties:{name:"Grenada",amount:"450",rank:"1"},geometry:{type:"Point",coordinates:[-61.39105183147666,12.514775948751208]}},{type:"Feature",properties:{name:"Guyana",amount:"2,285",rank:"2"},geometry:{type:"Point",coordinates:[-58.23109466184257,5.095633556179767]}},{type:"Feature",properties:{name:"Haiti",amount:"2,891",rank:"2"},geometry:{type:"Point",coordinates:[-72.35162970204897,18.37983179230355]}},{type:"Feature",properties:{name:"Hong Kong",amount:"7,921",rank:"2"},geometry:{type:"Point",coordinates:[114.02306654278686,22.41414018382261]}},{type:"Feature",properties:{name:"Hungary",amount:"2,367",rank:"2"},geometry:{type:"Point",coordinates:[19.39675926692678,47.16324368654705]}},{type:"Feature",properties:{name:"Indonesia",amount:"5,345",rank:"2"},geometry:{type:"Point",coordinates:[111.39454186211742,-.959551360206945]}},{type:"Feature",properties:{name:"Iran",amount:"22,859",rank:"4"},geometry:{type:"Point",coordinates:[54.27494245103344,32.578186643099286]}},{type:"Feature",properties:{name:"Iraq",amount:"8,307",rank:"2"},geometry:{type:"Point",coordinates:[43.74497360534775,33.03980593429662]}},{type:"Feature",properties:{name:"Israel",amount:"6,605",rank:"2"},geometry:{type:"Point",coordinates:[34.657992593483584,31.028641443248148]}},{type:"Feature",properties:{name:"Italy",amount:"5,589",rank:"2"},geometry:{type:"Point",coordinates:[9.581412900784926,45.23561638578775]}},{type:"Feature",properties:{name:"Jamaica",amount:"11,708",rank:"3"},geometry:{type:"Point",coordinates:[-77.31929751227023,18.154782461341654]}},{type:"Feature",properties:{name:"Japan",amount:"16,347",rank:"3"},geometry:{type:"Point",coordinates:[139.26813805372842,36.65362538180608]}},{type:"Feature",properties:{name:"Jordan",amount:"7,483",rank:"2"},geometry:{type:"Point",coordinates:[37.12067528943322,30.63632414004718]}},{type:"Feature",properties:{name:"Kazakhstan",amount:"474",rank:"1"},geometry:{type:"Point",coordinates:[67.28931090417507,48.15603820479947]}},{type:"Feature",properties:{name:"Kenya",amount:"8,888",rank:"2"},geometry:{type:"Point",coordinates:[37.79517961055075,.599014669291705]}},{type:"Feature",properties:{name:"Kuwait",amount:"4,156",rank:"2"},geometry:{type:"Point",coordinates:[47.482470739832934,29.51013402086852]}},{type:"Feature",properties:{name:"Laos",amount:"7,827",rank:"2"},geometry:{type:"Point",coordinates:[101.98889571136817,20.28534957892009]}},{type:"Feature",properties:{name:"Latvia",amount:"555",rank:"1"},geometry:{type:"Point",coordinates:[26.40511559780674,56.633417305664295]}},{type:"Feature",properties:{name:"Lebanon",amount:"7,191",rank:"2"},geometry:{type:"Point",coordinates:[35.87993372156416,33.92035445549391]}},{type:"Feature",properties:{name:"Liberia",amount:"2,301",rank:"2"},geometry:{type:"Point",coordinates:[-9.31986574450832,6.452235529146492]}},{type:"Feature",properties:{name:"Lithuania",amount:"310",rank:"1"},geometry:{type:"Point",coordinates:[21.029185417273368,55.36037655233616]}},{type:"Feature",properties:{name:"Macedonia",amount:"709",rank:"1"},geometry:{type:"Point",coordinates:[21.683830560931824,41.5950040310114]}},{type:"Feature",properties:{name:"Malaysia",amount:"4,809",rank:"2"},geometry:{type:"Point",coordinates:[102.18654663142206,4.029744843949572]}},{type:"Feature",properties:{name:"Moldova",amount:"506",rank:"1"},geometry:{type:"Point",coordinates:[28.461397116284047,47.1951013921157]}},{type:"Feature",properties:{name:"Morocco",amount:"1,255",rank:"1"},geometry:{type:"Point",coordinates:[-6.324451510528604,31.883031081919057]}},{type:"Feature",properties:{name:"Nepal",amount:"9,942",rank:"2"},geometry:{type:"Point",coordinates:[83.91625314306827,28.2479222938789]}},{type:"Feature",properties:{name:"Netherlands",amount:"4,520",rank:"2"},geometry:{type:"Point",coordinates:[3.567301872683458,51.34664423734182]}},{type:"Feature",properties:{name:"Nigeria",amount:"36,459",rank:"4"},geometry:{type:"Point",coordinates:[8.091488882805834,9.596971579574927]}},{type:"Feature",properties:{name:"Norway",amount:"3,023",rank:"2"},geometry:{type:"Point",coordinates:[11.46433556363553,61.443130264650165]}},{type:"Feature",properties:{name:"Pakistan",amount:"43,686",rank:"4"},geometry:{type:"Point",coordinates:[64.89552677384171,27.442049517471446]}},{type:"Feature",properties:{name:"Panama",amount:"10,137",rank:"3"},geometry:{type:"Point",coordinates:[-78.63576391647143,9.074346360995946]}},{type:"Feature",properties:{name:"Peru",amount:"21,052",rank:"4"},geometry:{type:"Point",coordinates:[-71.85199286188094,-13.58782829723799]}},{type:"Feature",properties:{name:"Poland",amount:"6,173",rank:"2"},geometry:{type:"Point",coordinates:[19.394323120415834,52.12477121721804]}},{type:"Feature",properties:{name:"Portugal",amount:"1,804",rank:"2"},geometry:{type:"Point",coordinates:[-7.978030682170072,39.678798984485695]}},{type:"Feature",properties:{name:"Romania",amount:"5,953",rank:"2"},geometry:{type:"Point",coordinates:[24.972949302568395,45.85346826984494]}},{type:"Feature",properties:{name:"Russia",amount:"15,894",rank:"3"},geometry:{type:"Point",coordinates:[115.01431766163091,61.89180055764979]}},{type:"Feature",properties:{name:"Saudi Arabia",amount:"5,107",rank:"2"},geometry:{type:"Point",coordinates:[44.53970806417601,24.124191728465632]}},{type:"Feature",properties:{name:"Scotland",amount:"3,311",rank:"2"},geometry:{type:"Point",coordinates:[-4.012183144536323,56.68592159550542]}},{type:"Feature",properties:{name:"Serbia",amount:"717",rank:"1"},geometry:{type:"Point",coordinates:[21.04587772567669,43.90765927275737]}},{type:"Feature",properties:{name:"Sierra Leone",amount:"2,742",rank:"2"},geometry:{type:"Point",coordinates:[-11.78734243130799,8.571908878192346]}},{type:"Feature",properties:{name:"Singapore",amount:"1,857",rank:"2"},geometry:{type:"Point",coordinates:[103.81346452416864,1.358924160721585]}},{type:"Feature",properties:{name:"South Africa",amount:"6,899",rank:"2"},geometry:{type:"Point",coordinates:[25.15924152977294,-29.009215741912783]}},{type:"Feature",properties:{name:"Spain",amount:"3,615",rank:"2"},geometry:{type:"Point",coordinates:[-3.566448279164604,40.40029669653546]}},{type:"Feature",properties:{name:"Sri Lanka",amount:"3,069",rank:"2"},geometry:{type:"Point",coordinates:[80.70518550780514,7.609333054676881]}},{type:"Feature",properties:{name:"Sudan",amount:"1,755",rank:"2"},geometry:{type:"Point",coordinates:[33.67838397144517,21.844659070564447]}},{type:"Feature",properties:{name:"Sweden",amount:"2,497",rank:"2"},geometry:{type:"Point",coordinates:[14.37197706578911,60.594601666933556]}},{type:"Feature",properties:{name:"Switzerland",amount:"891",rank:"1"},geometry:{type:"Point",coordinates:[8.210718017522652,46.97259012423501]}},{type:"Feature",properties:{name:"Syria",amount:"3,894",rank:"2"},geometry:{type:"Point",coordinates:[38.50828035445494,35.02561091151455]}},{type:"Feature",properties:{name:"Taiwan",amount:"22,116",rank:"4"},geometry:{type:"Point",coordinates:[120.96336239705715,23.753164085953983]}},{type:"Feature",properties:{name:"Thailand",amount:"11,823",rank:"3"},geometry:{type:"Point",coordinates:[101.00876004034376,15.137111836841939]}},{type:"Feature",properties:{name:"Ukraine",amount:"3,556",rank:"2"},geometry:{type:"Point",coordinates:[29.934702995646887,45.69260332668233]}},{type:"Feature",properties:{name:"Uruguay",amount:"2,873",rank:"2"},geometry:{type:"Point",coordinates:[-56.017869705722205,-32.800158283377925]}},{type:"Feature",properties:{name:"Uzbekistan",amount:"927",rank:"2"},geometry:{type:"Point",coordinates:[71.73441728383074,39.94138273512527]}},{type:"Feature",properties:{name:"Venezuela",amount:"15,992",rank:"3"},geometry:{type:"Point",coordinates:[-63.209483297416114,7.267615149519713]}},{type:"Feature",properties:{name:"Yemen",amount:"264",rank:"2"},geometry:{type:"Point",coordinates:[50.47001183377927,16.903633960339164]}}];

    realtime.transactions = 0;
    realtime.tpmAvg = 0;
    realtime.latencies = [];
    realtime.log = null;
    realtime.users = [];
    realtime.data = {
        'in': 0,
        'out': 0
    };

    realtime.tpm = [];

    $interval(function(){
        var sum = realtime.tpm.reduce(function(a, b) {
            return a + b;
        }, 0);
        var transactions = realtime.transactions != sum ? realtime.transactions - sum : 0;
        realtime.tpm.push(transactions);

        // take last 6 buckets
        realtime.tpmAvg = (realtime.tpm.slice(realtime.tpm.length - 6, realtime.tpm.length).reduce(function(a, b) {
            return a + b;
        }, 0) / 1) || 0;

    }, 10 * 1000);
    /*
    realtime.rtMap = {
        regions: [
            {
                name: 'hits',
                minColor: 'rgb(102, 132, 186)',
                maxColor: 'rgb(36, 88, 181)',
                data: [{
                    key: 'ARG',
                    value: 123
                }, {
                    key: 'RUS',
                    value: 800
                }, {
                    key: 'PRY',
                    value: 1000
                }, {
                    key: 'VEN',
                    value: 12
                }, {
                    key: 'USA',
                    value: 1500
                }]
            }
        ],
        routes: [{
            name: 'traffic',
            stroke: '#f00',
            animate: false,
            data: [[-58.5201, -34.5309], [-74, 40.71]]
        }],
        markers: [{
            id: 'womman',
            minColor: '#FFF',
            maxColor: '#49c5b1',
            fillOpacity: 0.65,
            minSize: 0,
            maxSize: 30,
            animate: false,
            data: [{
                id: 'ARG',
                longitude: -58.5201,
                latitude: -34.5309,
                value: 1500
            }, {
                id: 'Other',
                longitude: -74,
                latitude: 40.71,
                value: 2500
            }]
        }, {
            id: 'man',
            minColor: 'rgb(102, 132, 186)',
            maxColor: 'rgb(36, 88, 181)',
            fillOpacity: 0.65,
            minSize: 0,
            maxSize: 30,
            animate: false,
            data: [{
                id: 'Maldives',
                longitude: 73.22,
                latitude: 3.2,
                value: 3500
            }, {
                id: 'Singapore',
                longitude: 103.8,
                latitude: 1.3,
                value: 500
            }]
        }]
    };*/

    realtime.rtMap = {
        regions: [
            {
                name: 'hits',
                minColor: 'rgb(102, 132, 186)',
                maxColor: 'rgb(36, 88, 181)',
                data: []
            }
        ],
        routes: [{
            name: 'traffic',
            stroke: '#f00',
            animate: false,
            data: []
        }]
    };

    $interval(function(){
        //realtime.rtMap.markers[0].data[0].value = Math.random() * 15000;
        //realtime.rtMap.regions[0].data[0].value = Math.random() * 15000;
        //realtime.rtMap.routes = [];
    }, 1000);
    // SocketIO notifications
    mySocket.on('message', function(result){
        realtime.transactions += 1;
        realtime.log = result.log;
        realtime.data['out'] += parseInt(realtime.log.responseHeaders['content-length'], 10) || 0;
        realtime.data['in'] += result.log.data['in'];

        realtime.latencies.push(realtime.log.time);
        realtime.latency = realtime.latencies.reduce(function(a, b) { return a + b; }) / realtime.latencies.length;

        realtime.latencyPerTransaction = realtime.latencies.slice(realtime.latencies.length - realtime.tpmAvg, realtime.latencies.length).reduce(function(a, b) {
            return a + b;
        }, 0) / realtime.tpmAvg || '∞';

        // Unique Users
        if(result.log.ip) {
            if(realtime.users.indexOf(result.log.ip) <= -1) {
                realtime.users.push(result.log.ip);
            }
        }
        //console.log('WebSocket: ', realtime.log);
        if(result.log.geo) {
            //console.log('WebSocket: ', countryCode.isoConvert(realtime.log.geo.country));
            var country = realtime.rtMap.regions[0].data.filter(function(country){
                return country.key == countryCode.isoConvert(realtime.log.geo.country);
            })[0];

            if(!country) {
                realtime.rtMap.regions[0].data.push({
                    key: countryCode.isoConvert(realtime.log.geo.country),
                    value: 1
                });
            } else {
                country.value += 1;
            }
            realtime.rtMap.routes[0].data = [[result.log.geo.ll[1], result.log.geo.ll[0]], [-74, 40.71]];
        } else {
            realtime.rtMap.routes[0].data = [features[Math.floor(Math.random() * features.length)].geometry.coordinates, [-74, 40.71]];
        }
    });

    $scope.$on('$destroy', function() {
        console.log('leave realtime ');
        mySocket.removeListener('message');
    });

});
