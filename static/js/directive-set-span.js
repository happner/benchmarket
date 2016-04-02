SetSpan = ['clientSession', function(clientSession) {
  return {
    restrict: 'E',

    templateUrl: '/html/set-span.html',

    link: function(scope, elem, attrs) {

      scope.isLoggedIn = clientSession.isLoggedIn;
      scope.setSpan = 'day';

    }
  }
}];
