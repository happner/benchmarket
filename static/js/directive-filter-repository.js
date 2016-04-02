FilterRepository = ['$http', '$rootScope', 'clientSession', function($http, $rootScope, clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/filter-repository.html',

    link: function(scope, elem, attrs) {

      scope.isLoggedIn = clientSession.isLoggedIn;

      var loadRepoList = function() {
        if (!scope.isLoggedIn()) return;

        $http.get('/repos?whose=' + scope.filterUser.id, {
          headers: {
            Authorization: clientSession.getApiKey()
          }
        }).then(
          function(res) {
            if (res.status === 200) {
              scope.loadingRepos = '';
              scope.filterRepositorySelection = res.data;

              if (res.data.length === 1) {
                scope.filterRepository = scope.filterRepositorySelection[0];
                scope.applyRepoFilter();
              }

              return;
            }
          },
          function(err) {
            console.error('in getting repositories', err);
            clientSession.logout();
          }
        );
      }

      $rootScope.$on('selectedUser', function(ev) {
        console.log('load repo list');
        loadRepoList();
      });


      // scope.filterRepositorySelection = [];

      // scope.filterRepository = scope.filterRepositorySelection[0];


      // scope.loadRepos = function() {

      //   if (!scope.isLoggedIn()) return;

      //   $http.get('/repos?whose=' + scope.filterUser.id, {
      //     headers: {
      //       Authorization: clientSession.getApiKey()
      //     }
      //   }).then(
      //     function(res) {
      //       if (res.status === 200) {
      //         scope.loadingRepos = '';
      //         scope.filterRepositorySelection = res.data;

      //         if (res.data.length === 1) {
      //           scope.filterRepository = scope.filterRepositorySelection[0];
      //           scope.applyRepoFilter();
      //         }

      //         return;
      //       }
      //     },
      //     function(err) {
      //       console.error('in getting repositories', err);
      //       clientSession.logout();
      //     }
      //   );
      // }

      // // scope.loadRepos();

      // $rootScope.$on('login', function() {
      //   scope.loadRepos();
      // });


      scope.applyRepoFilter = function() {
        if (scope.filterRepository === null) {
          console.log('TODO: clear downward');
          return;
        }

        $rootScope.$emit('repo', scope.filterRepository);
      }


    }
  }
}];