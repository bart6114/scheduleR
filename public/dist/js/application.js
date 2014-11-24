'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'scheduler';
	var applicationModuleVendorDependencies = ['ngResource', 'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');


'use strict';


// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('tasks', ['angularFileUpload']);

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('FooterController', ['$scope', 'Authentication', '$http',
	function ($scope, Authentication, $http) {
		$scope.authentication = Authentication;

		$http.get('/version')
			.success(function(data) {
				$scope.appVersion = JSON.parse(data);
			})
	}
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', '$http', 
		function ($scope, Authentication, Menus, $http) {
			$scope.authentication = Authentication;
			$scope.isCollapsed = false;
			$scope.menu = Menus.getMenu('topbar');
			
			$http.get('/users/count').success(function(response) {
				$scope.noUsers = (response.count === 0);
			});

			$scope.toggleCollapsibleMenu = function () {
				$scope.isCollapsed = !$scope.isCollapsed;
			};

			// Collapsing the menu after navigation
			$scope.$on('$stateChangeSuccess', function () {
				$scope.isCollapsed = false;
			});
		}
	]);

'use strict';


angular.module('core').controller('HomeController', ['$scope', '$http', '$timeout', 'Authentication',
	function($scope, $http, $timeout, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.XKCDurl = '#';

		$http.jsonp('http://dynamic.xkcd.com/api-0/jsonp/comic/?callback=JSON_CALLBACK')
			.success(function(data, status, headers, config) {
				$timeout(function() {
					$scope.XKCDurl = data.img;
				});
			});






	}
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

// Configuring the Articles module
angular.module('tasks').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Tasks', 'tasks', 'dropdown', '/tasks(/create)?');
		Menus.addSubMenuItem('topbar', 'tasks', 'List Tasks', 'tasks');
		Menus.addSubMenuItem('topbar', 'tasks', 'New Task', 'tasks/create');
	}
]);
'use strict';

//Setting up route
angular.module('tasks').config(['$stateProvider',
	function($stateProvider) {
		// Tasks state routing
		$stateProvider.
		state('viewLog', {
			url: '/tasks/:taskId/logs/:logId',
			templateUrl: 'modules/tasks/views/view-log.client.view.html'
		}).
		state('listTasks', {
			url: '/tasks',
			templateUrl: 'modules/tasks/views/list-tasks.client.view.html'
		}).
		state('createTask', {
			url: '/tasks/create',
			templateUrl: 'modules/tasks/views/create-edit-task.client.view.html'
		}).
		state('viewTask', {
			url: '/tasks/:taskId',
			templateUrl: 'modules/tasks/views/view-task.client.view.html'
		}).
		state('editTask', {
			url: '/tasks/:taskId/edit',
			templateUrl: 'modules/tasks/views/create-edit-task.client.view.html'
		});
	}
]);

'use strict';

angular.module('tasks').controller('LogsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Tasks', 'Logs',
	function($scope, $stateParams, $location, Authentication, Tasks, Logs ) {
		// Logs controller logic
		// ...
		

		// Find existing Task
		$scope.findOne = function() {

			$scope.task = Tasks.get({
				taskId: $stateParams.taskId
			});

			// clean up array return (should be object) 
			$scope.log = Logs.get({
				taskId: $stateParams.taskId,
				logId: $stateParams.logId
			}); 





		};
	}
]);

'use strict';


// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$upload', '$location', 'Authentication', 'Tasks', 'LogsArray',
	function($scope, $stateParams, $upload, $location, Authentication, Tasks, LogsArray ) {
		$scope.authentication = Authentication;

		$scope.mailAddresses = {
			onError: [],
			onSuccess: [],
			rmdReport: []
		};

		$scope.scheduleOptions = {
			minutes: ['*', '0', '1', '2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59'],
			hours: ['*', '0', '1', '2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'],
			days: ['*', '1', '2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30'],
			months: ['*', '1', '2','3','4','5','6','7','8','9','10','11','12'],
			weekdays: ['*','0', '1','2','3','4','5','6']
		};

		$scope.schedule = {
			minutes: '*',
			hours: '*',
			days: '*',
			months: '*',
			weekdays: '*'
		};

		$scope.fillCron = function(){
			var cronString = 
			$scope.schedule.minutes + ' ' + 
			$scope.schedule.hours + ' ' + 
			$scope.schedule.days + ' ' + 
			$scope.schedule.months + ' ' + 
			$scope.schedule.weekdays;

			$scope.task.cron = cronString;
		};


		$scope.onFileSelect = function($files) {
			//$files: an array of files selected, each file has name, size, and type.
			var file = $files[0];

			// check if file an Rmd file
			var ext = file.name.substr(file.name.lastIndexOf('.') + 1);

			var RmdExtensions = ['Rmd', 'rmd'];
			if(RmdExtensions.indexOf(ext) >= 0) {
				$scope.task.Rmarkdown = true;
			} else {
				$scope.task.Rmarkdown = false;
			}

			// upload exceptions
			if(file.size > 500000){
				console.log('File too large! (' + file.size + ')');
				$scope.newTaskForm.scriptfile.$setValidity('size', false);



			} else {
				$scope.upload = $upload.upload({
					url: 'uploads/', //upload.php script, node.js route, or servlet url
					method: 'POST',
					file: file
				}).progress(function (evt) {
					console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				}).success(function (data, status, headers, config) {
					// file is uploaded successfully
					$scope.task.scriptNewFilename = data.filename.replace(/^.*[\\\/]/, '');
					$scope.task.scriptOriginalFilename = file.name;
					console.log($scope.task.scriptOriginalFilename + ' uploaded as ' + $scope.task.scriptNewFilename);
				});
			}

		};

		// add email address
		$scope.addEmailAddress = function(value, target) {

			target.push(value);
			$scope.onError = '';
			$scope.onSuccess = '';
			$scope.rmdReport = '';


		};

		$scope.addOnSuccessToOnError = function(){
			$scope.mailAddresses.onError = $scope.mailAddresses.onError.concat($scope.mailAddresses.onSuccess);

		};

		// delete email address
		$scope.deleteEmailAddress = function(index, target) {
			target.splice(index, 1);

		};

		// Init create/edit from
		$scope.create_or_edit = function() {

			if($stateParams.taskId) {
				$scope.findOneWithLogs();
				$scope.editing = true;
			} else {
				$scope.task = new Tasks();
				$scope.task.enabled = true;
			}
			$scope.fillCron();
		};

		// Create new Task
		$scope.create = function() {

			// Create new Task object

			var task = new Tasks ({
				name: this.task.name,
				description: this.task.description,
				enabled: this.task.enabled,
				cron: this.task.cron,
				scriptNewFilename: this.task.scriptNewFilename,
				scriptOriginalFilename: this.task.scriptOriginalFilename,
				arguments: this.task.arguments,
				mailOnError: $scope.mailAddresses.onError,
				mailOnSuccess: $scope.mailAddresses.onSuccess,
				mailRmdReport: $scope.mailAddresses.rmdReport,
				Rmarkdown: this.task.Rmarkdown,
				RmdAccompanyingMsg: this.task.RmdAccompanyingMsg,
				RmdOutputPath: this.task.RmdOutputPath
			});

			// Redirect after save
			task.$save(function(response) {
				$location.path('tasks/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Task
		$scope.remove = function( task ) {
			console.log(task);
			if ( task ) { task.$remove();

				for (var i in $scope.tasks ) {
					if ($scope.tasks [i] === task ) {
						$scope.tasks.splice(i, 1);
					}
				}
			} else {
				$scope.task.$remove(function() {
					$location.path('tasks');
				});
			}
		};

		$scope.toggleEnabled = function() {
			$scope.task.enabled = !$scope.task.enabled;
			var task = $scope.task ;
			task.$update(function(){
				console.log('Task enabled status toggled to: ' + $scope.task.enabled);
			}, function(err){
				$scope.error = err.data.message;
			});
		};

		// Update existing Task
		$scope.update = function() {
			var task = $scope.task ;
			task.mailOnError = $scope.mailAddresses.onError;
			task.mailOnSuccess = $scope.mailAddresses.onSuccess;
			task.mailRmdReport = $scope.mailAddresses.rmdReport;


			task.$update(function() {
				$location.path('tasks/' + task._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Tasks
		$scope.find = function() {
			$scope.tasks = Tasks.query();
		};

		// Find existing Task
		$scope.findOneWithLogs = function() {

			$scope.task = Tasks.get({
				taskId: $stateParams.taskId
			}, function(task){
				$scope.mailAddresses.onError = task.mailOnError;
				$scope.mailAddresses.onSuccess = task.mailOnSuccess;
				$scope.mailAddresses.rmdReport = task.mailRmdReport;
				var cronValues = task.cron.split(' ');
				$scope.schedule.minutes = cronValues[0].split(',');
				$scope.schedule.hours = cronValues[1].split(',');
				$scope.schedule.days = cronValues[2].split(',');
				$scope.schedule.months = cronValues[3].split(',');
				$scope.schedule.weekdays = cronValues[4].split(',');
				if($scope.task.cron) {
					// set later to use local time
					later.date.localTime();
					var laterSchedule = later.parse.cron($scope.task.cron);
					$scope.nextRuntime = later.schedule(laterSchedule).next(1);
				}

			});

			$scope.logs = LogsArray.get({
				taskId: $stateParams.taskId
			});



		};
	}
]);

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

'use strict';

//Tasks service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Tasks', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId', { taskId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

//Logs service used to communicate Tasks REST endpoints
angular.module('tasks').factory('LogsArray', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId/logs/:logId', { taskId: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			get: {
				method: 'GET',
				isArray: true}
		});
	}
]);


//Logs service used to communicate Tasks REST endpoints
angular.module('tasks').factory('Logs', ['$resource',
	function($resource) {
		return $resource('tasks/:taskId/logs/:logId', { taskId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
		function ($stateProvider) {
			// Users state routing
			$stateProvider.
			state('profile', {
				url : '/settings/profile',
				templateUrl : 'modules/users/views/settings/edit-profile.client.view.html'
			}).
			state('password', {
				url : '/settings/password',
				templateUrl : 'modules/users/views/settings/change-password.client.view.html'
			}).
			//state('accounts', {
			//	url: '/settings/accounts',
			//	templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
			//}).

			state('signup', {
				url : '/signup',
				templateUrl : 'modules/users/views/authentication/signup.client.view.html'
			}).
			state('invite', {
				url : '/invite',
				templateUrl : 'modules/users/views/authentication/invite.client.view.html'
			}).
			state('signin', {
				url : '/signin',
				templateUrl : 'modules/users/views/authentication/signin.client.view.html'
			}).
			state('forgot', {
				url : '/password/forgot',
				templateUrl : 'modules/users/views/password/forgot-password.client.view.html'
			}).
			state('reset-invlaid', {
				url : '/password/reset/invalid',
				templateUrl : 'modules/users/views/password/reset-password-invalid.client.view.html'
			}).
			state('reset-success', {
				url : '/password/reset/success',
				templateUrl : 'modules/users/views/password/reset-password-success.client.view.html'
			}).
			state('reset', {
				url : '/password/reset/:token',
				templateUrl : 'modules/users/views/password/reset-password.client.view.html'
			});
		}
	]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.checkNoUsers = function() {
			$http.get('/users/count').success(function (response) {
				if (response.count > 0) $location.path('/');
			});
		};

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

angular.module('users').controller('InviteController', ['$scope', '$http', '$location', 'Users', 'Authentication',
    function($scope, $http, $location, Users, Authentication) {
        $scope.user = Authentication.user;

        // If user is not signed in then redirect back home
        if (!$scope.user) $location.path('/');

        $scope.invite = function() {
            $http.post('/auth/invite', $scope.credentials).success(function(response) {

                // And redirect to the index page
                $location.path('/');
            }).error(function(response) {
                $scope.error = response.message;
            });
        };
    }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);