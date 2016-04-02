DisplayMetrics = ['$http', '$rootScope', 'clientSession', '$timeout', function($http, $rootScope, clientSession, $timeout) {
  return {
    restrict: 'E',

    templateUrl: '/html/display-metrics.html',

    link: function(scope, elem, attrs) {

      var hidden = true;

      $rootScope.$on('toggleTests', function(ev, test) {
        if (test.id !== scope.test.id) return;

        hidden = !hidden;

        if (!hidden) {
          $http.get('/tests/' + test.id + '/metrics?whose=' + scope.filterUser.id + '&span=' + scope.setSpan, {
            headers: {
              Authorization: clientSession.getApiKey()
            }
          }).then(
            function(res) {

              var metrics = {};
              var array = [];

              res.data.forEach(function(metric) {
                metrics[metric.name] = metrics[metric.name] || [];
                // metrics[metric.name].push(metric);

                var value = parseFloat(metric.value);

                metrics[metric.name].push({
                  value: value,
                  date: new Date(metric.ts)
                })
              });

              Object.keys(metrics).forEach(function(key) {
                array.push({
                  name: key,
                  values: metrics[key]
                })
              });

              scope.metrics = array;

              // need to await the dom render before attaching to the graph
              // canvases that it creates
              $timeout(function() {
                array.forEach(function(metric) {
                  CreateChart(scope, metric);
                });
              });

            },
            function(err) {
              console.error('in getting metrics', err);
              clientSession.logout();
            }
          )
        }
      });


      scope.hideMetrics = function() {
        return hidden;
      }

      // scope.toggleMetrics = function(metric) {
      //   console.log("toggle metrics", metric);
      // }


    }
  }
}];
