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
angular.module( 'apicatus.login', [])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
    $stateProvider.state( 'main.login', {
        url: '/login',
            views: {
                "main": {
                    controller: 'LoginCtrl',
                    templateUrl: 'login/login.tpl.html'
                }
            },
        data:{ pageTitle: 'Login' }
    });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'LoginCtrl', function LoginController( $scope, $state, AuthService ) {
    console.log("user in scope: ", $scope.user);
    $scope.submit = function () {
        $scope.processing = true;
        AuthService.authenticate($scope.username, $scope.password).then(function(result) {
            $scope.$emit('userLoggedIn', angular.copy(result));
            if($scope.user.token) {
                // Get previous state (page that requested authentication)
                var toState = AuthService.getState();
                if(toState.name) {
                    $state.transitionTo(toState.name);
                } else {
                    $state.transitionTo("main.home"); // Redirect to home
                }
            } else {
                $scope.alerts = [{
                    msg: 'error: Could not authenticate'
                }];
            }
            $scope.processing = false;
        }, function(error) {
            $scope.alerts = [{
                msg: 'error: ' + error.data.error
            }];
            $scope.processing = false;
        });
    };
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
});

