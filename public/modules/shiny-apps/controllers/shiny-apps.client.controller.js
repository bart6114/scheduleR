'use strict';

// Shiny apps controller
angular.module('shiny-apps').controller('ShinyAppsController', ['$scope', '$stateParams','$upload', '$location', 'Authentication', 'ShinyApps',
	function($scope, $stateParams, $upload, $location, Authentication, ShinyApps) {
		$scope.authentication = Authentication;

		// Init create/edit from
		$scope.create_or_edit = function() {

			if($stateParams.shinyappId) {
				$scope.findOneWithLogs();
				$scope.editing = true;
			} else {
				$scope.shinyApp = new ShinyApps();
			}
		};

		// Create new Shiny app
		$scope.create = function() {

			// Redirect after save
			$scope.shinyApp.$save(function(response) {
				$location.path('shiny-apps/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Shiny app
		$scope.remove = function(shinyApp) {
			if ( shinyApp ) {
				shinyApp.$remove();

				for (var i in $scope.shinyApps) {
					if ($scope.shinyApps [i] === shinyApp) {
						$scope.shinyApps.splice(i, 1);
					}
				}
			} else {
				$scope.shinyApp.$remove(function() {
					$location.path('shiny-apps');
				});
			}
		};

		// Update existing Shiny app
		$scope.update = function() {
			var shinyApp = $scope.shinyApp;

			shinyApp.$update(function() {
				$location.path('shiny-apps/' + shinyApp._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Shiny apps
		$scope.find = function() {
			$scope.shinyApps = ShinyApps.query();
		};

		// Find existing Shiny app
		$scope.findOne = function() {
			$scope.shinyApp = ShinyApps.get({
				shinyAppId: $stateParams.shinyAppId
			});
		};


		$scope.onFileSelect = function($files) {
			//$files: an array of files selected, each file has name, size, and type.
			var file = $files[0];
			var ext = file.name.substr(file.name.lastIndexOf('.') + 1);

			console.log(ext.toLowerCase());

			// upload exceptions
			if(file.size > 5000000){
				console.log('File too large! (' + file.size + ')');
				$scope.newAppForm.appfile.$setValidity('size', false);



			} else if(ext.toLowerCase() != 'zip') {
				console.log('File is not a .zip package!');
				$scope.newAppForm.appfile.$setValidity('filetype', false);

			}	else {
				$scope.upload = $upload.upload({
					url: 'uploads/', //upload.php script, node.js route, or servlet url
					method: 'POST',
					file: file
				}).progress(function (evt) {
					console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				}).success(function (data, status, headers, config) {
					// file is uploaded successfully
					$scope.shinyApp.packageNewFilename = data.filename.replace(/^.*[\\\/]/, '');
					$scope.shinyApp.packageOriginalFilename = file.name;
					console.log($scope.shinyApp.packageOriginalFilename + ' uploaded as ' + $scope.shinyApp.packageNewFilename);
				});
			}

		};



	}
]);
