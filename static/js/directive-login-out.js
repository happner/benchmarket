LoginOut = ['$http', '$rootScope', 'clientSession', function($http, $rootScope, clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/login-out.html',

    link: function(scope, elem, attrs) {

      scope.isLoggedIn = clientSession.isLoggedIn;

      // scope.username = 'chrome';
      // scope.password = 'p';

      scope.login = function() {
        if (scope.username.length == 0 || scope.password.length == 0) return;

        $http.post('/login', {
          username: scope.username,
          password: scope.password,
        }).then(
          function(res) {
            if (res.status === 200) {
              clientSession.login(res.data.id, res.data.username, res.data.api_key);
              return;
            }
            alert('bad username or password');
          },
          function(err) {
            if (err.status === 404) {
              alert('bad username or password');
              return;
            }
            alert('unexpected error (see browser log)');
            console.error(err);
          }
        );
      }

      scope.logout = clientSession.logout;

    }
  }
}]