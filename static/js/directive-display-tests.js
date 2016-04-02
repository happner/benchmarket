DisplayTests = ['$http', '$rootScope', 'clientSession', function($http, $rootScope, clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/display-tests.html',

    link: function(scope, elem, attrs) {

      var hidden = true;

      $rootScope.$on('toggleTestfile', function(ev, file) {
        if (file.id !== scope.file.id) return;

        hidden = !hidden;

        if (!hidden) {
          $http.get('/testfiles/' + file.id + '/tests?whose=' + scope.filterUser.id, {
            headers: {
              Authorization: clientSession.getApiKey()
            }
          }).then(
            function(res) {
              scope.tests = res.data;
            },
            function(err) {
              console.error('in getting tests', err);
              clientSession.logout();
            }
          );
        }
      });

      scope.hideTests = function() {
        return hidden;
      }

      scope.toggleTests = function(test) {
        $rootScope.$emit('toggleTests', test);
      }

    }
  }
}];
