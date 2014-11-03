'use strict';

// Configuring the Articles module
angular.module('schedules').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Schedules', 'schedules', 'dropdown', '/schedules(/create)?');
		Menus.addSubMenuItem('topbar', 'schedules', 'List Schedules', 'schedules');
		Menus.addSubMenuItem('topbar', 'schedules', 'New Schedule', 'schedules/create');
	}
]);