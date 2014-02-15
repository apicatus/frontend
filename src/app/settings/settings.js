/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */

angular.module( 'apicatus.settings', [])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider, $urlRouterProvider ) {
    $stateProvider.state( 'main.settings', {
        url: '/settings',
        views: {
            "main": {
                controller: 'SettingsCtrl',
                templateUrl: 'settings/settings.tpl.html'
            }
        },
        data: { pageTitle: 'Settings' },
        authenticate: false
    });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'SettingsCtrl', function SettingsController( $scope ) {
    console.log("SettingsCtrl", $scope);
    $scope.tabs = [
        { title:"Account", icon: "fa fa-user", content:"Dynamic content 1" },
        { title:"Users", icon: "fa fa-users", content:"Dynamic content 1" },
        { title:"Data sources", content:"Dynamic content 2", disabled: true }
    ];
    $scope.invoices = [{id: "1234",amount: 200, due: new Date(), status: "paid"},
        {id: "1235",amount: 300, due: new Date(), status: "paid"},
        {id: "1236",amount: 400, due: new Date(), status: "paid"},
        {id: "1237",amount: 500, due: new Date(), status: "paid"},
        {id: "1238",amount: 600, due: new Date(), status: "Posted"}];

    $scope.users = [{
        username: "James Woods",
        email: "jwoods@ananke.com",
        avatar: "https://pbs.twimg.com/profile_images/378800000534882248/fc2341fbc7d96cd7a9dc21f0f396e099.jpeg",
        firstName: "James",
        lastName: "Woods",
        phone: "555-555-555",
        address: "bonpland",
        zip: 4336,
        city: "Buenos Aires",
        timezone: "AGT"
    },{
        username: "Peter Griffin",
        email: "PeterGriffin@ananke.com",
        avatar: "https://pbs.twimg.com/profile_images/1119269505/0509071614Peter_Griffin.jpg",
        firstName: "Peter",
        lastName: "Griffin",
        phone: "555-555-555",
        address: "bonpland",
        zip: 4336,
        city: "Buenos Aires",
        timezone: "AGT"
    }];

    $scope.max = 100;
    $scope.dynamic = 25;
});

