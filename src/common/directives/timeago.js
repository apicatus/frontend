angular.module('timeago', [])
.directive('timeago', function() {
    return {
        restrict:'A',
        link: function(scope, element, attrs) {
            attrs.$observe("timeago", function() {
                element.text(moment(attrs.timeago).fromNow());
            });
        }
    };
});