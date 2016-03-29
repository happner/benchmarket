LoginOut = ['$http', function($http) {
  return {
    restrict: 'E',

    templateUrl: '/html/login-out.html',

    link: function(scope, elem, attrs) {

      localStorage.benchmarket = localStorage.benchmarket || {}

      if (localStorage.benchmarket.login) {
        scope.isLoggedIn = true;
      } else {
        scope.isLoggedIn = false;
      }

      scope.login = function() {
        if (scope.username.length == 0 || scope.password.length == 0) return;

        $http.post('/login', {
          username: scope.username,
          password: scope.password,
        }).then(
          function(res) {
            console.log('RES', res);
          },
          function(err) {
            console.error('ERR', err);
          }
        );
      }

    }
  }
}]