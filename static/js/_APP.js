angular.module('benchmarket', [])

.directive('loginOut', LoginOut)
.directive('filterUser', FilterUser)
.directive('filterRepository', FilterRepository)

.service('clientSession', ClientSession)