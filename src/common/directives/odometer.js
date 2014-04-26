angular.module('odometer', [])
.directive('odometer', function() {
    return {
        restrict:'EA',
        scope : {
            endValue : '=value'
        },
        link: function(scope, element, attrs) {
            // If you want to change the format, you have to add the necessary
            //  parameters. In this case I am going with the defaults.
            var od = new Odometer({
                el : element[0],
                value : 0   // default value
            });
            attrs.$observe("endValue", function() {
                od.update(scope.endValue);
            });
        }
    };
});
