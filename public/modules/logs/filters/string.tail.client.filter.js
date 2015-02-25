'use strict';

angular.module('tasks').filter('getTail', [
	function() {
		return function(text, n){
            return text.substr(text.length - n);
    };
		}
]);
