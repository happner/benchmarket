FilterUser = ['$http', '$rootScope', 'clientSession', function($http, $rootScope, clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/filter-user.html',

    link: function(scope, elem, attrs) {

      scope.isLoggedIn = clientSession.isLoggedIn;

      scope.filterUserSelection = [
        {
          id: -2,
          name: 'everyones'
        },
        {
          id: -1,
          name: 'my'
        },
        {
          id: 0,
          name: 'my latest run\'s'
        }
        // preceding are negative numbers to allow for list of user id's starting from 1 later
      ];

      // remember previous across page refresh
      if (localStorage.filterUserSeq) {
        scope.filterUser = scope.filterUserSelection[parseInt(localStorage.filterUserSeq)];
      } else {
        scope.filterUser = scope.filterUserSelection[0];
      }

      scope.applyUserFilter = function() {
        for (var i = 0; i < scope.filterUserSelection.length; i++) {
          if (scope.filterUser.id === scope.filterUserSelection[i].id) {
            localStorage.filterUserSeq = i.toString();
            break;
          }
        }

        scope.loadRepos();

      }



    }
  }
}];