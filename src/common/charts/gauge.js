///////////////////////////////////////////////////////////////////////////////
// @file         : gauge.js                                                  //
// @summary      : Gauge widget                                              //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  : D3 Stacked Bar charts for apicatus UI                     //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 29 Nov 2014                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2013~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
//                                                                           //
//                                                                           //
// License:                                                                  //
// Permission is hereby granted, free of charge, to any person obtaining a   //
// copy of this software and associated documentation files                  //
// (the "Software"), to deal in the Software without restriction, including  //
// without limitation the rights to use, copy, modify, merge, publish,       //
// distribute, sublicense, and/or sell copies of the Software, and to permit //
// persons to whom the Software is furnished to do so, subject to the        //
// following conditions:                                                     //
//                                                                           //
// The above copyright notice and this permission notice shall be included   //
// in all copies or substantial portions of the Software.                    //
//                                                                           //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS   //
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF                //
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.    //
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY      //
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,      //
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE         //
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                    //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

var charts = charts || {};

charts.gauge = function module() {
    var width = 500,
        height = 500,
        ease = 'elastic';

    var svg,
        chart = null,
        percent = 0.15,
        barWidth = 40,
        numSections = 10,
        sectionPerc = 1 / numSections / 2,
        padRad = 0.025,
        chartInset = 10,
        totalPercent = 0.75,
        duration = 650;

    var dispatch = d3.dispatch('customHover');

    var coloretes = ['#a00040', '#d73c4c', '#f66d39', '#ffaf5a', '#fee185', '#feffbb', '#e6f693', '#abdea3', '#63c4a5', '#2c87be'];
    ///////////////////////////////////////////////////////////////////////////
    // Default chart options                                                 //
    ///////////////////////////////////////////////////////////////////////////
    var options = {
        chart: {
            type: 'area',
            margin: {top: 20, right: 20, bottom: 30, left: 35}
        },
        plotOptions: {
            interpolate: 'basis',
            fillOpacity: 0.5,
            series: {
                animation: false,
                pointInterval: 24 * 3600 * 1000, // one day
                pointStart: new Date().getTime(),
                units: null
            }
        }
    };
    function exports(_selection) {
        _selection.each(function(_data) {
            if(!_data || _data.length < 0) {
                return;
            }
            var graph = this;

            // Clean all
            d3.select(graph).select('svg').remove();
            svg = null;

            function draw(data) {
                var size = {
                    'width': width - options.chart.margin.left - options.chart.margin.right,
                    'height': height - options.chart.margin.top - options.chart.margin.bottom
                };
                radius = Math.min(width, height) / 2;
                // Colors to id's
                var color = d3.scale.ordinal()
                .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
                .range(coloretes);


                ///////////////////////////////////////////////////////////////
                // Create SVG element                                        //
                ///////////////////////////////////////////////////////////////
                if(!svg) {
                    svg = d3.select(graph)
                        .append('svg')
                        .attr('preserveAspectRatio', 'xMidYMid')
                        .attr('viewBox', '0 0 ' + width + ' ' + height)
                        .attr('width', '100%')
                        .attr('height', '100%');
                    chart = svg.append('g')
                        .attr('transform', "translate(" + ((size.width + options.chart.margin.left) / 2) + ", " + ((size.height + options.chart.margin.top) / 2) + ")");
                }

                percToDeg = function(perc) {
                    return perc * 360;
                };

                percToRad = function(perc) {
                    return degToRad(percToDeg(perc));
                };

                degToRad = function(deg) {
                    return deg * Math.PI / 180;
                };


                for (sectionIndx = _i = 1; 1 <= numSections ? _i <= numSections : _i >= numSections; sectionIndx = 1 <= numSections ? ++_i : --_i) {
                    arcStartRad = percToRad(totalPercent);
                    arcEndRad = arcStartRad + percToRad(sectionPerc);
                    totalPercent += sectionPerc;
                    startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
                    endPadRad = sectionIndx === numSections ? 0 : padRad / 2;

                    arc = d3.svg
                        .arc()
                        .outerRadius(radius - chartInset)
                        .innerRadius(radius - chartInset - barWidth).startAngle(arcStartRad + startPadRad)
                        .endAngle(arcEndRad - endPadRad);
                    chart
                        .append('path')
                        .attr('class', "arc chart-color" + sectionIndx)
                        .attr('d', arc)
                        .style('fill', color(sectionIndx));
                }

                Needle = (function() {
                    function Needle(len, radius) {
                        this.len = len;
                        this.radius = radius;
                    }

                    Needle.prototype.drawOn = function(el, perc) {
                        el.append('circle')
                            .attr('class', 'needle-center')
                            .attr('cx', 0)
                            .attr('cy', 0)
                            .attr('r', this.radius);
                        return el.append('path')
                            .attr('class', 'needle')
                            .attr('d', this.mkCmd(perc));
                    };

                    Needle.prototype.animateOn = function(el, perc) {
                        var self;
                        self = this;
                        return el.transition()
                            .delay(500)
                            .ease('elastic')
                            .duration(3000)
                            .selectAll('.needle')
                            .tween('progress', function() {
                                return function(percentOfPercent) {
                                    var progress;
                                    progress = percentOfPercent * perc;
                                    return d3.select(this).attr('d', self.mkCmd(progress));
                                };
                            });
                    };

                    Needle.prototype.mkCmd = function(perc) {
                        var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
                        thetaRad = percToRad(perc / 2);
                        centerX = 0;
                        centerY = 0;
                        topX = centerX - this.len * Math.cos(thetaRad);
                        topY = centerY - this.len * Math.sin(thetaRad);
                        leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
                        leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
                        rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
                        rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
                        return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
                    };

                    return Needle;

                })();

                needle = new Needle(90, 15);

                needle.drawOn(chart, 0);

                setInterval(function(){
                    needle.animateOn(chart, Math.random());
                }, 2000);
            }

            ///////////////////////////////////////////////////////////////
            // Execute draw                                              //
            ///////////////////////////////////////////////////////////////
            draw(angular.copy(_data));
        });
    }
    ///////////////////////////////////////////////////////////////
    // Option accessors                                          //
    ///////////////////////////////////////////////////////////////
    exports.options = function(opt) {
        // Need deep copy !
        options = $.extend(true, {}, options, opt);
        return this;
    };
    exports.width = function(w) {
        if (!arguments.length) {
            return width;
        }
        width = parseInt(w, 10);
        return this;
    };
    exports.height = function(h) {
        if (!arguments.length) {
            return height;
        }
        height = parseInt(h, 10);
        return this;
    };
    d3.rebind(exports, dispatch, 'on');
    return exports;
};
