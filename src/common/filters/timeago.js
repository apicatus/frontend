/* Timeago filter */
angular.module('timeago', [])
.filter('timeago', function(){
    return function humanize(time) {
        var result = moment(time).fromNow(true);
        return result;
    };
});
