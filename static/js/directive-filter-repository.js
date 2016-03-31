FilterRepository = ['$http', '$rootScope', 'clientSession', function($http, $rootScope, clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/filter-repository.html',

    link: function(scope, elem, attrs) {

      scope.isLoggedIn = clientSession.isLoggedIn;

      scope.filterRepositorySelection = [];

      scope.filterRepository = scope.filterRepositorySelection[0];


      scope.loadRepos = function() {

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
            console.error('ERR', err);
            clientSession.logout();
          }
        )
      }

      scope.loadRepos();

      $rootScope.$on('login', function() {
        scope.loadRepos();
      });


      scope.applyRepoFilter = function() {
        if (scope.filterRepository === null) {
          console.log('TODO: clear downward');
          return;
        }

        console.log('APPLY filter repo TO ', scope.filterRepository);
      }

      // scope.filterUserSelection = [
      //   {
      //     id: 0,
      //     name: 'my'
      //   },
      //   {
      //     id: -1,
      //     name: 'everyones'
      //   }
      // ];
      // scope.filterUser = scope.filterUserSelection[0]

      // scope.applyFilter = function() {
      //   console.log(scope.filterUser);
      // }

    }
  }
}];