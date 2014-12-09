///////////////////////////////////////////////////////////////////////////////
// @file         : ng-master-searh.js                                        //
// @summary      : Input search directive                                    //
// @version      : 0.0.1                                                     //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 1 Nov 2014                                                //
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

angular.module( 'ngMasterSearch', [] )
.directive("ngMasterSearch", [function () {
    return {
        restrict: "A",
        require: '?ngModel',
        scope: {
            defaultValue: "=?"
        },
        link: function (scope, element, attrs, ngModel) {
            element.wrap('<div class="master-search"></div>');
            var icon = angular.element('<span class="icon input-group-btn"><i class="fa fa-search"></i></span>');
            element.after(icon);
            var onChange = function(event) {
                var value;
                value = element.val();
                if (value && value.length > 0) {
                    icon.find('i').removeClass().addClass('fa fa-close');
                } else {
                    icon.find('i').removeClass().addClass('fa fa-search');
                }
            };

            element.bind('keyup', _.debounce(onChange, 200));

            icon.bind('click', function(event){
                element.val(scope.defaultValue || '');
                scope.$apply(function() {
                    return ngModel.$setViewValue(scope.defaultValue || '');
                });
                return onChange(event);
            });

            return scope.$evalAsync(function() {
                return ngModel.$setViewValue(scope.defaultValue || '');
            });
        }
    };
}]);

