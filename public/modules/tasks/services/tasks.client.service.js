'use strict';

//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
  function($resource) {
    return $resource('tasks/:taskId', {
      taskId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
//
////Logs service used to communicate Tasks REST endpoints
//angular.module('tasks').factory('LogsArray', ['$resource',
//  function($resource) {
//    return $resource('logs/list/:objectId', {
//      objectId: '@_id'
//    }, {
//      get: {
//        method: 'GET',
//        isArray: true
//      }
//
//    });
//  }
//]);


////Logs service used to communicate Tasks REST endpoints
//angular.module('tasks').factory('Logs', ['$resource',
//  function($resource) {
//    return $resource('tasks/:taskId/logs/:logId', {
//      taskId: '@_id'
//    }, {
//      update: {
//        method: 'PUT'
//      }
//    });
//  }
//]);
