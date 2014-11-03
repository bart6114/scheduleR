'use strict';



// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$upload', '$stateParams', '$location', 'Authentication', 'Tasks',
	function($scope, $upload, $stateParams, $location, Authentication, Tasks ) {
		$scope.authentication = Authentication;
		$scope.enabled = true;
		$scope.newFilename = "";
		$scope.originalFilename = "";

		$scope.onFileSelect = function($files) {
			//$files: an array of files selected, each file has name, size, and type.
			for (var i = 0; i < $files.length; i++) {
				var file = $files[i];
				$scope.upload = $upload.upload({
					url: 'uploads/', //upload.php script, node.js route, or servlet url
					method: 'POST',
					//headers: {'header-key': 'header-value'},
					//withCredentials: true,
					//data: {myObj: $scope.newFilename},
					file: file, // or list of files ($files) for html5 only
					//fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
					// customize file formData name ('Content-Disposition'), server side file variable name.
					//fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
					// customize how data is added to formData. See #40#issuecomment-28612000 for sample code
					//formDataAppender: function(formData, key, val){}
				}).progress(function(evt) {
					console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				}).success(function(data, status, headers, config) {
					// file is uploaded successfully
					$scope.newFilename = data.filename.replace(/^.*[\\\/]/, '')
					$scope.originalFilename = file.name;
				});
				//.error(...)
				//.then(success, error, progress);
				// access or attach event listeners to the underlying XMLHttpRequest.
				//.xhr(function(xhr){xhr.upload.addEventListener(...)})
			}
			/* alternative way of uploading, send the file binary with the file's content-type.
			 Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
			 It could also be used to monitor the progress of a normal http post/put request with large data*/
			// $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
		};


		// Create new Task
		$scope.create = function() {
			// Create new Task object

			var task = new Tasks ({
				name: this.name,
				description: this.description,
				enabled: this.enabled,
				cron: this.cron,
				scriptNewFilename: this.newFilename,
				scriptOriginalFilename: this.originalFilename

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
		};
	}
]);
