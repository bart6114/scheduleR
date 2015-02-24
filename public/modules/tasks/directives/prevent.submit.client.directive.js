'use strict';

angular.module('tasks').directive('preventFormSubmitOnEnter', [
	function() {
		return {
        restrict:'A',
        link: function(scope,element,attr) {

            element.on('keydown',function(e) {

                if (e.which === 13) {
                    e.preventDefault();
                }
            });
        }
    };
		}
]);
