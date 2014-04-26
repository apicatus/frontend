// This is a fork of: https://github.com/luisfarzati/ng-bs-daterangepicker.git
// Modified for ANANKE

angular.module('dateRange', [])
.directive('dateRange', function ($compile, $parse) {
    return {
        restrict: 'E',
        require: 'ngModel',
        link: function ($scope, $element, $attributes, ngModel) {
            if ($attributes.class !== 'reportrange') {
                return;
            }
            console.log("date range");
            var options = {};
            options.format = $attributes.format || 'YYYY-MM-DD';
            options.separator = $attributes.separator || ' - ';
            options.minDate = $attributes.minDate && moment($attributes.minDate);
            options.maxDate = $attributes.maxDate && moment($attributes.maxDate);
            options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function (elem, index) { return index === 0 && parseInt(elem, 10) || elem; }) );
            options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope) || {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
                'Last 7 Days': [moment().subtract('days', 6), moment()],
                'Last 30 Days': [moment().subtract('days', 29), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
            };

            function format(date) {
                if(angular.isNumber(date)) {
                    date = moment(date);
                }
                return date.format(options.format);
            }

            function formatted(dates) {
                return [format(dates.since), format(dates.until)].join(options.separator);
            }

            ngModel.$formatters.unshift(function (modelValue) {
                if (!modelValue) {
                    return '';
                }
                return modelValue;
            });

            ngModel.$parsers.unshift(function (viewValue) {
                return viewValue;
            });

            ngModel.$render = function () {
                if (!ngModel.$viewValue || !ngModel.$viewValue.since) {
                    return;
                }
                //$element.val(formatted(ngModel.$viewValue));
                $element.find("span").text(formatted(ngModel.$viewValue));
            };

            $scope.$watch($attributes.ngModel, function (modelValue) {
                if (!modelValue || (!modelValue.since)) {
                    ngModel.$setViewValue({ since: moment().startOf('day'), until: moment().startOf('day') });
                    return;
                }
                $element.data('daterangepicker').since = modelValue.since;
                $element.data('daterangepicker').until = modelValue.until;
                $element.data('daterangepicker').updateView();
                $element.data('daterangepicker').updateCalendars();
                $element.data('daterangepicker').updateInputText();
            });

            $element.daterangepicker(options, function(start, end) {
                $scope.$apply(function () {
                    ngModel.$setViewValue({ since: start, until: end });
                    ngModel.$render();
                });
            });
        }
    };
});
