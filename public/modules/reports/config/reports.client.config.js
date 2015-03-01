'use strict';

// Configuring the Articles module
angular.module('reports').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Reports', 'reports', 'dropdown', '/reports(/create)?', undefined, undefined, 50);
		Menus.addSubMenuItem('topbar', 'reports', 'List Reports', 'reports');
		Menus.addSubMenuItem('topbar', 'reports', 'New Report', 'reports/create');
	}
]);