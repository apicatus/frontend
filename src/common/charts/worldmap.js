var charts = charts || {};

charts.worldmap = function module() {
    var margin = {top: 0, right: 5, bottom: 0, left: 0},
        width = 500,
        height = 500,
        topo,
        projection,
        path,
        canvas,
        svg,
        graticule = d3.geo.graticule(),
        daylightVisible = false;
        daylight = d3.geo.circle().angle(90).precision(0.5);
        daylightPath = null,
        active = d3.select(null),
        limitBounds = null,
        tlast = null,
        slast = null,
        fitGeoInside = null,
        setGeoTransform = null,
        geoLayer = {};
    var features = [
{ "type": "Feature", "properties": {  "name": "Mexico" , "amount":"2,485,336", "rank":"6" }, "geometry": { "type": "Point", "coordinates": [ -102.506621210999924, 23.940958892339154 ] } },
{ "type": "Feature", "properties": {  "name": "Guatemala" , "amount":"60,891", "rank":"5" }, "geometry": { "type": "Point", "coordinates": [ -91.240086433242141, 15.007764594360708 ] } },
{ "type": "Feature", "properties": {  "name": "Honduras" , "amount":"79,220", "rank":"5" }, "geometry": { "type": "Point", "coordinates": [ -86.618323716765985, 14.821904530070185 ] } },
{ "type": "Feature", "properties": {  "name": "El Salvador" , "amount":"169,001", "rank":"5" }, "geometry": { "type": "Point", "coordinates":[ -88.869506574368756, 13.73677620096106 ] } },
{ "type": "Feature", "properties": {  "name": "Korea" , "amount":"55,699", "rank":"5" }, "geometry": { "type": "Point", "coordinates": [ 127.880140019346641, 36.437328853743793 ] } },
{ "type": "Feature", "properties": {  "name": "India" , "amount":"164,508", "rank":"5" }, "geometry": { "type": "Point", "coordinates": [ 82.752848140529409, 22.426348968929915 ]} },
{ "type": "Feature", "properties": {  "name": "Vietnam" , "amount":"156,923", "rank":"5" }, "geometry": { "type": "Point", "coordinates":  [ 107.633980849336922, 12.899789384572614 ]  } },
{ "type": "Feature", "properties": {  "name": "Philippines" , "amount":"72,650", "rank":"5" }, "geometry": { "type": "Point", "coordinates":  [ 121.417972219342573, 15.953362142149331 ] } },
{ "type": "Feature", "properties": {  "name": "Nicaragua" , "amount":"16,197", "rank":"3" }, "geometry": { "type": "Point", "coordinates":  [ -85.034271405001164, 12.845120529988606 ] } },
{ "type": "Feature", "properties": {  "name": "Ireland" , "amount":"4,389", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -8.138264403779033, 53.176692342377862 ] } },
{ "type": "Feature", "properties": {  "name": "Afghanistan", "amount":"2436", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 66.008447587786122, 33.836266963749551 ] } },
{ "type": "Feature", "properties": {  "name": "Albania", "amount":"1589", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 20.053819505765716, 41.14248112870132 ] } },
{ "type": "Feature", "properties": {  "name": "Argentina", "amount":"9905", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -65.154824832299994, -35.182097662476963 ] } },
{ "type": "Feature", "properties": {  "name": "Armenia", "amount":"273", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 44.931730878077701, 40.288596787611823 ] } },
{ "type": "Feature", "properties": {  "name": "Australia" , "amount":"3168", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 124.966052291879919, -23.994211913448908 ] } },
{ "type": "Feature", "properties": {  "name": "Austria" , "amount":"1,065", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 14.130672916921753, 47.585656923428417 ] } },
{ "type": "Feature", "properties": {  "name": "Bahamas" , "amount":"821", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ -77.692361311625064, 24.008144780057705 ] } },
{ "type": "Feature", "properties": {  "name": "Bangladesh" , "amount":"11,690", "rank":"3" }, "geometry": { "type": "Point", "coordinates": [ 90.22663495543901, 23.88242325782727 ] } },
{ "type": "Feature", "properties": {  "name": "Barbados" , "amount":"1,976", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -59.540577765651221, 13.147694562654124 ] } },
{ "type": "Feature", "properties": {  "name": "Belarus" , "amount":"376", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 28.033566459624581, 53.531880481998826 ] } },
{ "type": "Feature", "properties": {  "name": "Belgium" , "amount":"1,426", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 28.033566459624581, 53.531880481998826 ] } },
{ "type": "Feature", "properties": {  "name": "Belize" , "amount":"5,153", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -88.786015560360539, 17.543970899413392 ] } },
{ "type": "Feature", "properties": {  "name": "Bolivia" , "amount":"3,463", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ -64.684753591105164, -16.706876766549385 ] } },
{ "type": "Feature", "properties": {  "name": "Bosnia" , "amount":"3,281", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 17.505690478432996, 44.080173878122139 ] } },
{ "type": "Feature", "properties": {  "name": "Brazil" , "amount":"13,793", "rank":"3" }, "geometry": { "type": "Point", "coordinates":[ -59.005375702726326, -4.947418298115792 ] } },
{ "type": "Feature", "properties": {  "name": "Bulgaria" , "amount":"1,813", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 25.217497543477009, 42.768531912218123 ] } },
{ "type": "Feature", "properties": {  "name": "Myanmar" , "amount":"3,489", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 96.488743524694087, 21.215154155639937 ] } },
{ "type": "Feature", "properties": {  "name": "Cambodia" , "amount":"10,156", "rank":"3" }, "geometry": { "type": "Point", "coordinates":[ 104.905252569550612, 12.718007203469824 ] } },
{ "type": "Feature", "properties": {  "name": "Cameroon" , "amount":"4,221", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 12.73698295979591, 5.693057542671625 ] } },
{ "type": "Feature", "properties": {  "name": "Canada" , "amount":"42,075", "rank":"4" }, "geometry": { "type": "Point", "coordinates":[ -117.090594491342529, 59.656836099906229 ] } },
{ "type": "Feature", "properties": {  "name": "Cape Verde" , "amount":"58", "rank":"1" }, "geometry": { "type": "Point", "coordinates":[ -23.180382383440076, 15.221337468049853 ] } },
{ "type": "Feature", "properties": {  "name": "Chile" , "amount":"3,436", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ -71.247815654268891, -35.447872832764858 ] } },
{ "type": "Feature", "properties": {  "name": "China" , "amount":"71,656", "rank":"5" }, "geometry": { "type": "Point", "coordinates":[ 93.784540883055456, 35.217091925652028 ] } },
{ "type": "Feature", "properties": {  "name": "Colombia" , "amount":"35,131", "rank":"4" }, "geometry": { "type": "Point", "coordinates":[ -73.07834068147713, 3.911188855381511 ] } },
{ "type": "Feature", "properties": {  "name": "Costa Rica" , "amount":"4,511", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ -84.192026446862883, 9.974655552412003 ] } },
{ "type": "Feature", "properties": {  "name": "Croatia" , "amount":"2,988", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 17.375652195992188, 42.950004839851658 ] } },
{ "type": "Feature", "properties": {  "name": "Cuba" , "amount":"24,669", "rank":"4" }, "geometry": { "type": "Point", "coordinates":[ -79.541249153225692, 22.093377645162377 ] } },
{ "type": "Feature", "properties": {  "name": "Czechoslovakia" , "amount":"1,698", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 15.31410310187681, 49.732448205520427 ] } },
{ "type": "Feature", "properties": {  "name": "Denmark" , "amount":"1,583", "rank":"1" }, "geometry": { "type": "Point", "coordinates":[ 8.811534049456952, 55.801113028943291 ] } },
{ "type": "Feature", "properties": {  "name": "Dominica" , "amount":"1,232", "rank":"1" }, "geometry": { "type": "Point", "coordinates":[ -61.356921539097584, 15.436438780925187 ] } },
{ "type": "Feature", "properties": {  "name": "Dominican Republic" , "amount":"5,324", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ -70.5003985986163, 18.899269694840712 ] } },
{ "type": "Feature", "properties": {  "name": "Ecuador" , "amount":"8,666", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ -78.390026288881984, -1.448279428452679 ] } },
{ "type": "Feature", "properties": {  "name": "Egypt" , "amount":"4,854", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 29.860895582265471, 26.492410511735898 ] } },
{ "type": "Feature", "properties": {  "name": "England" , "amount":"21,124", "rank":"4" }, "geometry": { "type": "Point", "coordinates":[ -1.460467598400783, 52.601885382104854 ] } },
{ "type": "Feature", "properties": {  "name": "Eritrea" , "amount":"1,590", "rank":"1" }, "geometry": { "type": "Point", "coordinates":[ 38.098713316066835, 16.086847566462211 ] } },
{ "type": "Feature", "properties": {  "name": "Ethiopia" , "amount":"13,786", "rank":"3" }, "geometry": { "type": "Point", "coordinates":[ 36.73714217097455, 9.380194405247778 ] } },
{ "type": "Feature", "properties": {  "name": "Fiji" , "amount":"550", "rank":"1" }, "geometry": { "type": "Point", "coordinates":[ -178.723010868456669, -20.660115360335453 ] } },
{ "type": "Feature", "properties": {  "name": "France" , "amount":"8,244", "rank":"2" }, "geometry": { "type": "Point", "coordinates":[ 2.449486512892406, 46.62237366531258 ] } },
{ "type": "Feature", "properties": {  "name": "Germany" , "amount":"36,351", "rank":"4" }, "geometry": { "type": "Point", "coordinates": [ 10.370787457775123, 51.087101766333603 ] } },
{ "type": "Feature", "properties": {  "name": "Ghana" , "amount":"7,194", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -1.216528980028272, 7.953953003728316 ] } },
{ "type": "Feature", "properties": {  "name": "Greece" , "amount":"2,152", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 22.581857843165096, 39.474997189968519 ] } },
{ "type": "Feature", "properties": {  "name": "Grenada" , "amount":"450", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ -61.391051831476659, 12.514775948751208 ] } },
{ "type": "Feature", "properties": {  "name": "Guyana" , "amount":"2,285", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -58.231094661842569, 5.095633556179767 ] } },
{ "type": "Feature", "properties": {  "name": "Haiti" , "amount":"2,891", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ -72.351629702048967, 18.379831792303548 ] } },
{ "type": "Feature", "properties": {  "name": "Hong Kong" , "amount":"7,921", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 114.023066542786864, 22.41414018382261 ] } },
{ "type": "Feature", "properties": {  "name": "Hungary" , "amount":"2,367", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 19.396759266926779, 47.163243686547048 ] } },
{ "type": "Feature", "properties": {  "name": "Indonesia" , "amount":"5,345", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 111.394541862117421, -0.959551360206945 ] } },
{ "type": "Feature", "properties": {  "name": "Iran" , "amount":"22,859", "rank":"4" }, "geometry": { "type": "Point", "coordinates": [ 54.274942451033439, 32.578186643099286 ] } },
{ "type": "Feature", "properties": {  "name": "Iraq" , "amount":"8,307", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 43.744973605347752, 33.039805934296623 ] } },
{ "type": "Feature", "properties": {  "name": "Israel" , "amount":"6,605", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 34.657992593483584, 31.028641443248148 ] } },
{ "type": "Feature", "properties": {  "name": "Italy" , "amount":"5,589", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 9.581412900784926, 45.23561638578775 ] } },
{ "type": "Feature", "properties": {  "name": "Jamaica" , "amount":"11,708", "rank":"3" }, "geometry": { "type": "Point", "coordinates": [ -77.319297512270225, 18.154782461341654 ] } },
{ "type": "Feature", "properties": {  "name": "Japan" , "amount":"16,347", "rank":"3" }, "geometry": { "type": "Point", "coordinates": [ 139.268138053728421, 36.65362538180608 ] } },
{ "type": "Feature", "properties": {  "name": "Jordan" , "amount":"7,483", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 37.120675289433223, 30.636324140047179 ] } },
{ "type": "Feature", "properties": {  "name": "Kazakhstan" , "amount":"474", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 67.289310904175068, 48.156038204799472 ] } },
{ "type": "Feature", "properties": {  "name": "Kenya" , "amount":"8,888", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 37.795179610550747, 0.599014669291705 ] } },
{ "type": "Feature", "properties": {  "name": "Kuwait" , "amount":"4,156", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 47.482470739832934, 29.51013402086852 ] } },
{ "type": "Feature", "properties": {  "name": "Laos" , "amount":"7,827", "rank":"2" }, "geometry": { "type": "Point", "coordinates": [ 101.988895711368173, 20.285349578920091 ] } },
{ "type": "Feature", "properties": {  "name": "Latvia" , "amount":"555", "rank":"1" }, "geometry": { "type": "Point", "coordinates": [ 26.405115597806741, 56.633417305664295 ] } },
{ "type": "Feature", "properties": {  "name": "Lebanon" , "amount":"7,191", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 35.879933721564157, 33.920354455493907 ] } },
{ "type": "Feature", "properties": {  "name": "Liberia" , "amount":"2,301", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ -9.31986574450832, 6.452235529146492 ] } },
{ "type": "Feature", "properties": {  "name": "Lithuania" , "amount":"310", "rank":"1" }, "geometry": { "type": "Point", "coordinates":  [ 21.029185417273368, 55.360376552336163 ] } },
{ "type": "Feature", "properties": {  "name": "Macedonia" , "amount":"709", "rank":"1" }, "geometry": { "type": "Point", "coordinates":  [ 21.683830560931824, 41.595004031011399 ] } },
{ "type": "Feature", "properties": {  "name": "Malaysia" , "amount":"4,809", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 102.186546631422061, 4.029744843949572 ] } },
{ "type": "Feature", "properties": {  "name": "Moldova" , "amount":"506", "rank":"1" }, "geometry": { "type": "Point", "coordinates":  [ 28.461397116284047, 47.195101392115703 ] } },
{ "type": "Feature", "properties": {  "name": "Morocco" , "amount":"1,255", "rank":"1" }, "geometry": { "type": "Point", "coordinates":  [ -6.324451510528604, 31.883031081919057 ] } },
{ "type": "Feature", "properties": {  "name": "Nepal" , "amount":"9,942", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 83.916253143068275, 28.247922293878901 ] } },
{ "type": "Feature", "properties": {  "name": "Netherlands" , "amount":"4,520", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 3.567301872683458, 51.34664423734182 ] } },
{ "type": "Feature", "properties": {  "name": "Nigeria" , "amount":"36,459", "rank":"4" }, "geometry": { "type": "Point", "coordinates":  [ 8.091488882805834, 9.596971579574927 ] } },
{ "type": "Feature", "properties": {  "name": "Norway" , "amount":"3,023", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 11.46433556363553, 61.443130264650165 ] } },
{ "type": "Feature", "properties": {  "name": "Pakistan" , "amount":"43,686", "rank":"4" }, "geometry": { "type": "Point", "coordinates":  [ 64.895526773841709, 27.442049517471446 ] } },
{ "type": "Feature", "properties": {  "name": "Panama" , "amount":"10,137", "rank":"3" }, "geometry": { "type": "Point", "coordinates":  [ -78.635763916471433, 9.074346360995946 ] } },
{ "type": "Feature", "properties": {  "name": "Peru" , "amount":"21,052", "rank":"4" }, "geometry": { "type": "Point", "coordinates":  [ -71.851992861880944, -13.587828297237991 ] } },
{ "type": "Feature", "properties": {  "name": "Poland" , "amount":"6,173", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 19.394323120415834, 52.12477121721804 ] } },
{ "type": "Feature", "properties": {  "name": "Portugal" , "amount":"1,804", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ -7.978030682170072, 39.678798984485695 ] } },
{ "type": "Feature", "properties": {  "name": "Romania" , "amount":"5,953", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 24.972949302568395, 45.853468269844939 ] } },
{ "type": "Feature", "properties": {  "name": "Russia" , "amount":"15,894", "rank":"3" }, "geometry": { "type": "Point", "coordinates":  [ 115.014317661630912, 61.891800557649788 ]  } },
{ "type": "Feature", "properties": {  "name": "Saudi Arabia" , "amount":"5,107", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 44.539708064176011, 24.124191728465632 ]  } },
{ "type": "Feature", "properties": {  "name": "Scotland" , "amount":"3,311", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ -4.012183144536323, 56.68592159550542 ]  } },
{ "type": "Feature", "properties": {  "name": "Serbia" , "amount":"717", "rank":"1" }, "geometry": { "type": "Point", "coordinates":  [ 21.045877725676689, 43.907659272757371 ]  } },
{ "type": "Feature", "properties": {  "name": "Sierra Leone" , "amount":"2,742", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ -11.787342431307991, 8.571908878192346 ] } },
{ "type": "Feature", "properties": {  "name": "Singapore" , "amount":"1,857", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 103.813464524168637, 1.358924160721585 ] } },
{ "type": "Feature", "properties": {  "name": "South Africa" , "amount":"6,899", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 25.159241529772942, -29.009215741912783 ] } },
{ "type": "Feature", "properties": {  "name": "Spain" , "amount":"3,615", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ -3.566448279164604, 40.400296696535463 ] } },
{ "type": "Feature", "properties": {  "name": "Sri Lanka" , "amount":"3,069", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 80.70518550780514, 7.609333054676881 ] } },
{ "type": "Feature", "properties": {  "name": "Sudan" , "amount":"1,755", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 33.678383971445172, 21.844659070564447 ] } },
{ "type": "Feature", "properties": {  "name": "Sweden" , "amount":"2,497", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 14.37197706578911, 60.594601666933556 ] } },
{ "type": "Feature", "properties": {  "name": "Switzerland" , "amount":"891", "rank":"1" }, "geometry": { "type": "Point", "coordinates":  [ 8.210718017522652, 46.972590124235012 ] } },
{ "type": "Feature", "properties": {  "name": "Syria" , "amount":"3,894", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 38.508280354454939, 35.025610911514548 ] } },
{ "type": "Feature", "properties": {  "name": "Taiwan" , "amount":"22,116", "rank":"4" }, "geometry": { "type": "Point", "coordinates":  [ 120.963362397057153, 23.753164085953983 ] } },
{ "type": "Feature", "properties": {  "name": "Thailand" , "amount":"11,823", "rank":"3" }, "geometry": { "type": "Point", "coordinates":  [ 101.008760040343759, 15.137111836841939 ] } },
{ "type": "Feature", "properties": {  "name": "Ukraine" , "amount":"3,556", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 29.934702995646887, 45.692603326682331 ] } },
{ "type": "Feature", "properties": {  "name": "Uruguay" , "amount":"2,873", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ -56.017869705722205, -32.800158283377925 ] } },
{ "type": "Feature", "properties": {  "name": "Uzbekistan" , "amount":"927", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 71.734417283830737, 39.941382735125273 ] } },
{ "type": "Feature", "properties": {  "name": "Venezuela" , "amount":"15,992", "rank":"3" }, "geometry": { "type": "Point", "coordinates":  [ -63.209483297416114, 7.267615149519713 ] } },
{ "type": "Feature", "properties": {  "name": "Yemen" , "amount":"264", "rank":"2" }, "geometry": { "type": "Point", "coordinates":  [ 50.470011833779267, 16.903633960339164 ] } }
];
    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                console.log("quit no data");
                return;
            }
           var size = {
                'width': width - margin.left - margin.right,
                'height': height - margin.top - margin.bottom
            };

            var π = Math.PI,
                radians = π / 180,
                degrees = 180 / π;

            var circle = d3.geo.circle().angle(90);

            function draw(topo) {
                var country = canvas.selectAll(".country").data(topo);

                country
                    .enter()
                    .insert("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .attr("id", function (d, i) {
                        return d.id;
                    })
                    .attr("title", function (d, i) {
                        return d.properties.name;
                    })
                    .on("click", clicked); //exports.click);

                // Draw Day/Night
                if(daylightVisible) {
                    daylightPath = canvas.append("path")
                        .attr("class", "night")
                        .attr("d", path);
                    daylightPath.datum(circle.origin(antipode(solarPosition(new Date())))).attr("d", path);
                }

                exports.addZoomBtns();

                /*features.forEach(function(feature){
                    exports.addRoute(feature.geometry.coordinates, [-58.5201, -34.5309]);
                });*/
                //exports.addRoute([-58.5201, -34.5309], [-74, 40.71]);

            }
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            function getFeaturesBox() {
                return {
                    x: featureBounds[0][0],
                    y: featureBounds[0][1],
                    width: featureBounds[1][0] - featureBounds[0][0],
                    height: featureBounds[1][1] - featureBounds[0][1]
                };
            }

            // fits the geometry layer inside the viewport
            fitGeoInside = function () {
                var bbox = getFeaturesBox(),
                    scale = 0.95 / Math.max(bbox.width / width, bbox.height / height),
                    trans = [-(bbox.x + bbox.width / 2) * scale + width / 2, -(bbox.y + bbox.height / 2) * scale + height / 2];

                geoLayer.scale = scale;
                geoLayer.translate = trans;

                canvas
                .transition()
                .duration(750)
                .attr('transform', [
                    'translate(' + geoLayer.translate + ')',
                    'scale(' + geoLayer.scale + ')'
                ].join(' '));
            };

            // transform geoParent
            setGeoTransform = function(scale, trans, animate) {
                var container = canvas;
                zoom.scale(scale).translate(trans);

                tlast = trans;
                slast = scale;

                if(animate) {
                    container = canvas.transition().duration(750);
                }
                container
                    .attr('transform', [
                        'translate(' + trans + ')',
                        'scale(' + scale + ')'
                    ].join(' '))
                    .selectAll(".country")
                    .style("stroke-width", 1 / scale);
            };
            // limits panning
            // XXX: this could be better
            limitBounds = function (scale, trans, animate) {

                var bbox = getFeaturesBox();
                var outer = width - width * scale;
                var geoWidth = bbox.width * geoLayer.scale * scale,
                    geoLeft = -((width * scale) / 2 - ((geoWidth) / 2)),
                    geoRight = outer - geoLeft;

                if (scale === slast) {
                    //trans[0] = Math.min(0, Math.max(trans[0], width - width * scale));
                    trans[1] = Math.min(0, Math.max(trans[1], height - height * scale));

                    if (geoWidth > width) {
                        if (trans[0] < tlast[0]) { // panning left
                            trans[0] = Math.max(trans[0], geoRight);
                        } else if (trans[0] > tlast[0]) { // panning right
                            trans[0] = Math.min(trans[0], geoLeft);
                        }
                    } else {

                        if (trans[0] < geoLeft) {
                            trans[0] = geoLeft;
                        } else if (trans[0] > geoRight) {
                            trans[0] = geoRight;
                        }
                    }
                }

                setGeoTransform(scale, trans, animate);
            };
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////

            function clicked(d) {
                if (active.node() === this) {
                    return reset();
                }
                active.classed("active", false);
                active = d3.select(this).classed("active", true);

                var bounds = path.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = 0.9 / Math.max(dx / width, dy / height),
                    translate = [width / 2 - scale * x, height / 2 - scale * y];

                limitBounds(scale, translate, true);
            }
            function reset() {
                active.classed("active", false);
                active = d3.select(null);

                setGeoTransform(1, [0, 0], true);

                /*canvas.transition()
                    .duration(750)
                    .call(zoom.translate([0, 0]).scale(1).event);*/
            }


            function redraw() {
                width = document.getElementById('container').offsetWidth;
                height = width / 2;
                d3.select('svg').remove();
                setup(width, height);
                draw(topo);
            }
            function throttle() {
                window.clearTimeout(throttleTimer);
                throttleTimer = window.setTimeout(function () {
                    redraw();
                }, 200);
            }
            //geo translation on mouse click in map
            function click() {
                var latlon = projection.invert(d3.mouse(this));
                console.log(latlon);
            }

            // Sun calculations
            function antipode(position) {
                return [position[0] + 180, -position[1]];
            }

            function solarPosition(time) {
                var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
                    longitude = (d3.time.day.utc.floor(time) - time) / 864e5 * 360 - 180;
                return [
                    longitude - equationOfTime(centuries) * degrees,
                    solarDeclination(centuries) * degrees
                ];
            }

            // Equations based on NOAA’s Solar Calculator; all angles in radians.
            // http://www.esrl.noaa.gov/gmd/grad/solcalc/

            function equationOfTime(centuries) {
                var e = eccentricityEarthOrbit(centuries),
                    m = solarGeometricMeanAnomaly(centuries),
                    l = solarGeometricMeanLongitude(centuries),
                    y = Math.tan(obliquityCorrection(centuries) / 2);
                y *= y;
                return y * Math.sin(2 * l) - 2 * e * Math.sin(m) + 4 * e * y * Math.sin(m) * Math.cos(2 * l) - 0.5 * y * y * Math.sin(4 * l) - 1.25 * e * e * Math.sin(2 * m);
            }

            function solarDeclination(centuries) {
                return Math.asin(Math.sin(obliquityCorrection(centuries)) * Math.sin(solarApparentLongitude(centuries)));
            }

            function solarApparentLongitude(centuries) {
                return solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;
            }

            function solarTrueLongitude(centuries) {
                return solarGeometricMeanLongitude(centuries) + solarEquationOfCenter(centuries);
            }

            function solarGeometricMeanAnomaly(centuries) {
                return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;
            }

            function solarGeometricMeanLongitude(centuries) {
                var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
                return (l < 0 ? l + 360 : l) / 180 * π;
            }

            function solarEquationOfCenter(centuries) {
                var m = solarGeometricMeanAnomaly(centuries);
                return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) + Math.sin(m + m) * (0.019993 - 0.000101 * centuries) + Math.sin(m + m + m) * 0.000289) * radians;
            }

            function obliquityCorrection(centuries) {
                return meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;
            }

            function meanObliquityOfEcliptic(centuries) {
                return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;
            }

            function eccentricityEarthOrbit(centuries) {
                return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
            }

            // Events
            zoom = d3.behavior.zoom()
                .translate([0, 0])
                .scale(1)
                .scaleExtent([1, 9])
                .on("zoom", zoomed);

            function zoomed() {
                //canvas.style("stroke-width", 1 / d3.event.scale);
                //canvas.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

                var e = d3.event,
                    scale = (e && e.scale) ? e.scale : zoom.scale(),
                    trans = (e && e.translate) ? e.translate : zoom.translate();

                limitBounds(scale, trans);
            }

            d3.select(window).on("resize", exports.throttle);

            // Init
            if(!svg) {
                exports.setup(this, size.width, size.height);
            }

            // Load world map
            d3.json("https://api.github.com/gists/1c5d429e6a944a288730", function (error, root) {

                var world = root.files['countries2.topo.json'].content;
                world = JSON.parse(world);
                var countries = topojson.feature(world, world.objects.countries).features;

                collection = {
                    'type': 'FeatureCollection',
                    'features': countries
                };

                featureBounds = path.bounds(collection);

                var bbox = getFeaturesBox(),
                    scale = 0.95 / Math.max(bbox.width / width, bbox.height / height);

                // set scale
                projection.scale(scale);

                draw(countries);
                exports.addpoint(-58.5201, -34.5309);
            });
        });
    }
    exports.setup = function(element, width, height) {
        projection = d3.geo.miller()
            .translate([width / 2, height / 2 + 50])
            .scale(1)
            .precision(0.1);



        path = d3.geo.path().projection(projection);

        svg = d3.select(element)
            .append("svg")
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("width", '100%')
            .attr("height", '100%')
            .call(zoom);

        canvas = svg.append("g").attr('class', 'canvas');
    };
    exports.zoom = function() {
        var currentZoom = zoom.scale();
        var newScale = Math.floor(currentZoom) + 1;
        console.log("zoom", currentZoom);
    };
    exports.click = function() {
        var event = d3.event;
        var latlon = projection.invert(d3.mouse(this));
        exports.addRoute(latlon, [-58.5201, -34.5309]);
        console.log(latlon);
    };
    exports.move = function() {
        active = d3.select(null);

        var translate = d3.event.translate;
        var scale = d3.event.scale;
        var h = height / 4;
        translate[0] = Math.min(
            (width / height) * (scale - 1),
            Math.max(width * (1 - scale), translate[0])
        );
        translate[1] = Math.min(
            h * (scale - 1) + h * scale,
            Math.max(height * (1 - scale) - h * scale, translate[1])
        );
        zoom.translate(translate);
        canvas.attr('transform', "translate(" + translate + ")scale(" + scale + ")");
        // adjust the country hover stroke width based on zoom level
        d3.selectAll(".country")
            .style("stroke-width", 1 / scale);

    };
    exports.addRoute = function(origin, destination) {
        var route = canvas.append("path")
        .datum({
            type: "LineString",
            coordinates: [origin, destination] //exports.addRoute([-58.5201, -34.5309], [-74, 40.71])
        })
        .attr("class", "route")
        .attr("d", path);

        var totalLength = route.node().getTotalLength();

        route
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(1000)
            .ease("linear")
            .attr("stroke-dashoffset", 0)
            .each("end", _.once(function(){
                route
                    .transition()
                    .duration(1000)
                    .ease("linear")
                    //.style({opacity: 0})
                    .attr("stroke-dashoffset", -totalLength)
                    .remove();
            }));
    };
    exports.addpoint = function(longitude, latitude, text) {

        var gpoint = canvas.append("g").attr("class", "gpoint");
        var x = projection([longitude, latitude])[0];
        var y = projection([longitude, latitude])[1];

        gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class","point")
        .attr("r", 2);

        //conditional in case a point has no associated text
        if(text) {
            gpoint.append("text")
                .attr("x", x+2)
                .attr("y", y+2)
                .attr("class","text")
                .text(text);
        }
    };
    exports.addZoomBtns = function() {
        // Add Zoom Buttons
        var zoomBtnGroup = svg.append("g").attr('class', 'zoom-buttons');
        var zoomInGrp = zoomBtnGroup
            .append('g')
            .attr('class', 'zoom-in-grp');

        var zoomInBtn = zoomInGrp.append('rect')
            .attr('class', 'zoom-in-btn')
            .attr('x', 10)
            .attr('y', 10)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('width', 16)
            .attr('height', 16);

        zoomInGrp.append("text")
            .attr("fill","#fff")
            .attr('x', 14)
            .attr('y', 22)
            .text('+');

        zoomInGrp.on("click", function(event) {
            exports.zoom();
        });

        // Zoom Out
        var zoomOutGrp = zoomBtnGroup
            .append('g')
            .attr('class', 'zoom-out-grp');

        var zoomOutBtn = zoomOutGrp.append('rect')
            .attr('class', 'zoom-out-btn')
            .attr('x', 10)
            .attr('y', 30)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('width', 16)
            .attr('height', 16);

        zoomOutGrp.append("text")
            .attr("fill","#fff")
            .attr('x', 14)
            .attr('y', 42)
            .text('-');

        zoomInGrp.on("click", function(event) {
            exports.zoom();
        });
    };
    exports.width = function(_x) {
        if (!arguments.length) {
            return width;
        }
        width = parseInt(_x, 10);
        return this;
    };
    exports.height = function(_x) {
        if (!arguments.length) {
            return height;
        }
        height = parseInt(_x, 10);
        duration = 0;
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
