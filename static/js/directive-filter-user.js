FilterUser = ['$http', '$rootScope', 'clientSession', function($http, $rootScope, clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/filter-user.html',

    link: function(scope, elem, attrs) {

      scope.isLoggedIn = clientSession.isLoggedIn;

      var loadUserList = function() {
        $http.get('/users', {
          headers: {
            Authorization: clientSession.getApiKey()
          }
        }).then(function(res) {
          scope.filterUserSelection = res.data;

          if (typeof localStorage.userSelection !== 'undefined') {
            console.log('load historical selected user')
            var i = 0;
            for (; i < scope.filterUserSelection.length; i++) {
              if (parseInt(scope.filterUserSelection[i].id) === parseInt(localStorage.userSelection)) {
                scope.filterUser = scope.filterUserSelection[i];
                scope.changeUserFilter();
              }
            }
          }

        }).catch(function(err) {
          console.error('in getting users', err);
          clientSession.logout();
        });
      }

      scope.changeUserFilter = function() {
        console.log('change user filter', scope.filterUser);
        localStorage.userSelection = scope.filterUser.id;
        $rootScope.$emit('selectedUser');
      }

      $rootScope.$on('login', function(ev) {
        console.log('load users list');
        loadUserList();
      });

      if (scope.isLoggedIn()) {
        console.log('load users list');
        loadUserList();
      }

    }
  }
}];
