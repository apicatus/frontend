///////////////////////////////////////////////////////////////////////////////
// @file         : ng-gravatar.js                                            //
// @summary      : Gravatar Directive                                        //
// @version      : 0.0.1                                                     //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 23 Nov 2014                                               //
// @license:     : MIT                                                       //
// ------------------------------------------------------------------------- //
//                                                                           //
// Copyright 2012~2014 Benjamin Maggi <benjaminmaggi@gmail.com>              //
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

angular.module( 'ngGravatar', ['ngMd5'] )
.directive("ngGravatar", ['md5', function (md5) {
    return {
        restrict: "A",
        scope: {
            ngGravatar: '='
        },
        link: function (scope, element, attrs) {
            var url = null;
            var config = {
                'email': scope.ngGravatar,
                'default': 'https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120'
            };
            function getGravatarUrl() {
                if(scope.ngGravatar) {
                    return 'http://www.gravatar.com/avatar/' + md5.createHash(config.email) + '?d=' + encodeURIComponent(config['default']);
                } else {
                    return config['default'];
                }
            }

            scope.$watch('ngGravatar', function (newVal, oldVal) {
                if (!newVal || newVal === oldVal) {
                    return;
                }
                config.email = scope.ngGravatar;
                element.attr('src', getGravatarUrl());
            });
            element.attr('src', getGravatarUrl());
        }
    };
}]);
