angular.module('humanize', [])
.filter('humanize', function(){
    return function humanize(number) {
        var sign = (number < 0) ? '-' : '';
        number = Math.abs(number);
        if(number < 1000) {
            return number || 0;
        }
        var si = ['K', 'M', 'G', 'T', 'P', 'H'];
        var exp = Math.floor(Math.log(number) / Math.log(1000));
        var result = number / Math.pow(1000, exp);
        result = (result % 1 > (1 / Math.pow(1000, exp - 1))) ? result.toFixed(2) : result.toFixed(0);
        return isNaN(result) ? 0 : sign + result + si[exp - 1];
    };
});