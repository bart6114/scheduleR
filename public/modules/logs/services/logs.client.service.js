'use strict';

//Logs service used to communicate Tasks REST endpoints
angular.module('logs').factory('LogsArray', ['$resource',
  function($resource) {
    return $resource('logs/list/:objectId', {
      objectId: '@_id'
    }, {
      get: {
        method: 'GET',
        isArray: true
      }

    });
  }
]);

//Logs service used to communicate Tasks REST endpoints
angular.module('logs').factory('Logs', ['$resource',
  function($resource) {
    return $resource('logs/specific/:logId', {
      taskId: '@_id'
    }
    );
  }
]);
