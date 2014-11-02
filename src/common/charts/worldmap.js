var charts = charts || {};

charts.worldmap = function module() {
    var margin = {top: 5, right: 5, bottom: 0, left: 5},
        width = 500,
        height = 500,
        topo,
        projection,
        path,
        g,
        svg,
        graticule = d3.geo.graticule(),
        projectionMode = "equirectangular",
        daylightVisible = !0;
        daylight = d3.geo.circle().angle(90).precision(0.5);
        daylightPath = null;

    var dispatch = d3.dispatch('customHover');
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data) {
                console.log("quit no data");
                return;
            }
            var chartW = width - margin.left - margin.right,
                chartH = height - margin.top - margin.bottom;

            var barW = chartW / _data.length;
            var π = Math.PI,
                radians = π / 180,
                degrees = 180 / π;
            var circle = d3.geo.circle().angle(90);

            d3.select(window).on("resize", exports.throttle);

            function setup(el, width, height) {
                projection = d3.geo.mercator()
                    .translate([(width / 2), (height / 2)])
                    .scale(width / 2 / Math.PI);

                path = d3.geo.path().projection(projection);

                svg = d3.select(el).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .call(zoom)
                    .on("click", click)
                    .append("g");

                g = svg.append("g");
                return svg;
            }
            function draw(topo) {
                console.log("draw");
                var country = g.selectAll(".country").data(topo);

                country.enter().insert("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .attr("id", function (d, i) {
                        return d.id;
                    })
                    .attr("title", function (d, i) {
                        return d.properties.name;
                    });
                if(daylightVisible) {
                    daylightPath = g.append("path")
                        .attr("class", "night")
                        .attr("d", path);
                    daylightPath.datum(circle.origin(antipode(solarPosition(new Date())))).attr("d", path);
                }

            }
            function redraw() {
                width = document.getElementById('container').offsetWidth;
                height = width / 2;
                d3.select('svg').remove();
                setup(width, height);
                draw(topo);
            }
            function move() {
                var t = d3.event.translate;
                var s = d3.event.scale;
                zscale = s;
                var h = height / 4;
                t[0] = Math.min(
                    (width / height) * (s - 1),
                    Math.max(width * (1 - s), t[0])
                );
                t[1] = Math.min(
                    h * (s - 1) + h * s,
                    Math.max(height * (1 - s) - h * s, t[1])
                );
                zoom.translate(t);
                g.attr("transform", "translate(" + t + ")scale(" + s + ")");
                // adjust the country hover stroke width based on zoom level
                d3.selectAll(".country").style("stroke-width", 1.5 / s);

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

            // Zoom
            zoom = d3.behavior.zoom()
                .scaleExtent([1, 9])
                .on("zoom", move);

            console.log("w: ", width, "h:", height);

            // Init
            if(!svg) {
                exports.setup(this, width, height);
            }
            // Load world map
            d3.json("https://api.github.com/gists/9735307", function (error, root) {

                var world = root.files['world-50m.json'].content;
                world = JSON.parse(world);
                var countries = topojson.feature(world, world.objects.countries).features;

                topo = countries;
                draw(topo);
                exports.addpoint(-58.5201, -34.5309);
            });
        });
    }
    exports.setup = function(el, w, h) {
        /*projection = d3.geo.mercator()
            .translate([(w / 2), (h / 2)])
            .scale((w + 1) / 2 / Math.PI)
            .precision(0.1);*/
        projection = d3.geo.equirectangular()
            .translate([w / 2, h / 2])
            //.scale(100)
            .scale((w + 1) / 2 / Math.PI)
            .precision(0.1);

        path = d3.geo.path().projection(projection);

        svg = d3.select(el).append("svg")
            .attr("width", '100%')
            .attr("height", '100%')
            .call(zoom)
            .on("click", this.click)
            .append("g");

        g = svg.append("g");
    };
    /*exports.zoom = function() {
        console.log("zoom", exports.move);
        return d3.behavior.zoom()
        .scaleExtent([1, 9])
        .on("zoom", exports.move);
    };
    exports.draw = function(topo) {
        var country = g.selectAll(".country").data(topo);
        country.enter().insert("path")
            .attr("class", "country")
            .attr("d", function(d) {
                return path(d);
            })
            .attr("id", function (d, i) {
                return d.id;
            })
            .attr("title", function (d, i) {
                return d.properties.name;
            })
            .style("fill", function (d, i) {
                return "#49cc90";
            });
    };*/
    exports.click = function() {
        var event = d3.event;
        var latlon = projection.invert(d3.mouse(this));
        console.log(latlon);
    };
    /*
    exports.throttle = function() {
        var self = this;
        window.clearTimeout(throttleTimer);
        var throttleTimer = window.setTimeout(function () {
            exports.redraw();
        }, 200);
    };
    exports.redraw = function() {
        this.width = d3.select(this).node().offsetWidth;
        this.height = this.width / 2;
        d3.select('svg').remove();
        this.setup(this.width, this.height);
        this.draw(this.topo);
    };
    exports.move = function() {
        var t = d3.event.translate;
        var s = d3.event.scale;
        zscale = s;
        var h = this.height / 4;


        t[0] = Math.min(
            (this.width / this.height) * (s - 1),
            Math.max(this.width * (1 - s), t[0])
        );

        t[1] = Math.min(
            h * (s - 1) + h * s,
            Math.max(height * (1 - s) - h * s, t[1])
        );
        this.zoom.translate(t);
        this.g.attr("transform", "translate(" + t + ")scale(" + s + ")");
        //adjust the country hover stroke width based on zoom level
        d3.selectAll(".country").style("stroke-width", 1.5 / s);

    };*/
    exports.addpoint = function(longitude, latitude, text) {

        var gpoint = g.append("g").attr("class", "gpoint");
        var x = projection([longitude, latitude])[0];
        var y = projection([longitude, latitude])[1];

        gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class","point")
        .attr("r", 2);

        //conditional in case a point has no associated text
        if(text.length > 0) {
            gpoint.append("text")
                .attr("x", x+2)
                .attr("y", y+2)
                .attr("class","text")
                .text(text);
        }
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
