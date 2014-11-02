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
angular.module( 'apicatus.navbar', ['dateRange'])

/**
 * And of course we define a controller for our route.
 */
.controller( 'NavBarCtrl', function NavBarController($scope, $state, Restangular) {
    $scope.sideBarOpened = false;
    $scope.oneAtATime = true;
    $scope.addItem = function() {
        var newItemNo = $scope.items.length + 1;
        $scope.items.push('Item ' + newItemNo);
    };
    $scope.logOut = function(user) {
        $state.transitionTo("main.home");
        /*
        Restangular.one('user/signout').get().then(function() {
            $state.transitionTo("main.home");
            console.log("user logged out !");
        });*/
    };
})
.directive("menuToggle", function () {
    return function (scope, element) {
        element.bind("click", function () {
            scope.sideBarOpened = !scope.sideBarOpened;
            document.body.classList.toggle('opened');
            $(window).trigger('resize');
        });
    };
});
