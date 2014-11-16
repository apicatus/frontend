angular.module( 'apicatus.about', [
])

.config(function config( $stateProvider ) {
    $stateProvider.state( 'main.about', {
        url: '/about',
        views: {
            'main': {
                controller: 'AboutCtrl as about',
                templateUrl: 'about/about.tpl.html'
            }
        },
        data:{ pageTitle: 'About' },
        authenticate: false
    });
})

.controller( 'AboutCtrl', function AboutCtrl() {

});
