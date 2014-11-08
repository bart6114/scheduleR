'use strict';



// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$upload', '$location', 'Authentication', 'Tasks', 'LogsArray',
	function($scope, $stateParams, $upload, $location, Authentication, Tasks, LogsArray ) {
		$scope.authentication = Authentication;
		$scope.enabled = true;

		$scope.mailAddresses = {
			onError: [],
			onSuccess: []
		};


		$scope.onFileSelect = function($files) {
			//$files: an array of files selected, each file has name, size, and type.
			var file = $files[0];

			// check if file an Rmd file
			var ext = file.name.substr(file.name.lastIndexOf('.') + 1);

			var RmdExtensions = ['Rmd', 'rmd'];
			if(RmdExtensions.indexOf(ext) >= 0) $scope.Rmarkdown = true;

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
					$scope.newFilename = data.filename.replace(/^.*[\\\/]/, '');
					$scope.originalFilename = file.name;
					console.log($scope.originalFilename + ' uploaded as ' + $scope.newFilename);
				});
			}

		};

		// add email address
		$scope.addEmailAddress = function(value, target) {

			target.push(value);
			$scope.onError = '';
			$scope.onSuccess = '';


		};

		// delete email address
		$scope.deleteEmailAddress = function(index, target) {
			target.splice(index, 1);

		};
		// Create new Task
		$scope.create = function() {
			// Create new Task object

			var task = new Tasks ({
				name: this.name,
				description: this.description,
				enabled: this.enabled,
				cron: this.cron,
				scriptNewFilename: $scope.newFilename,
				scriptOriginalFilename: $scope.originalFilename,
				arguments: this.arguments,
				mailOnError: $scope.mailAddresses.onError,
				mailOnSuccess: $scope.mailAddresses.onSuccess,
				Rmarkdown: this.Rmarkdown,
				RmdAccompanyingMsg: this.RmdAccompanyingMsg,
				RmdOutputPath: this.RmdOutputPath
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

		// Update existing Task
		$scope.update = function() {
			var task = $scope.task ;

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
		$scope.findOne = function() {

			$scope.task = Tasks.get({
				taskId: $stateParams.taskId
			});

			$scope.logs = LogsArray.get({
				taskId: $stateParams.taskId
			});



		};
	}
]);
