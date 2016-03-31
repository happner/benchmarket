ClientSession = ['$rootScope', function($rootScope) {

  var session = {};

  try {
    session = JSON.parse(localStorage.session);
  } catch (e) {}

  return {
    isLoggedIn: function() {
      return (session.api_key && session.username);
    },
    login: function(id, username, api_key) {
      session.id = id;
      session.username = username;
      session.api_key = api_key;
      localStorage.session = JSON.stringify(session);
      $rootScope.$emit('login');
    },
    logout: function() {
      delete session.api_key;
      delete session.username;
      localStorage.session = JSON.stringify(session);
      $rootScope.$emit('logout');
    },

    getApiKey: function() {
      return session.api_key;
    }
  }
}]
