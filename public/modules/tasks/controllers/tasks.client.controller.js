'use strict';
/*global later */

// Tasks controller
angular.module('tasks').controller('TasksController', ['$scope', '$stateParams', '$upload', '$http', '$location', 'Authentication', 'Tasks', 'LogsArray', 'ScheduleService',
    function($scope, $stateParams, $upload, $http, $location, Authentication, Tasks, LogsArray, ScheduleService) {
        $scope.authentication = Authentication;

        $scope.mailAddresses = {
            onError: [],
            onSuccess: []
        };

        $scope.scheduleOptions = ScheduleService.getOptions();
        $scope.schedule = ScheduleService.getTemplate();

        $scope.fillCron = function(){
            var cronString =
                $scope.schedule.minutes + ' ' +
                $scope.schedule.hours + ' ' +
                $scope.schedule.days + ' ' +
                $scope.schedule.months + ' ' +
                $scope.schedule.weekdays;

            $scope.task.cron = cronString;
        };


        $scope.runOnce = function() {
            $http.post('/tasks/' + $scope.task._id + '/run')
                .success(function(data, status, headers, config) {
                    console.log('Running once');
                })
                .error(function(err) {
                    console.log(err);
                });
        };

        $scope.onFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.
            var file = $files[0];

            // check if file is an .R file
            var ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();

            // upload exceptions
            if(file.size > 500000){
                console.log('File too large! (' + file.size + ')');
                $scope.newTaskForm.scriptfile.$setValidity('size', false);



            }
            else if(ext !== 'r' ){
                // file should be an .R file
                console.log('File is not an .R file');
                $scope.newTaskForm.scriptfile.$setValidity('filetype', false); // TODO: fix
            }
            else {
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
                mailOnSuccess: $scope.mailAddresses.onSuccess
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

                $scope.logPage = 0;
                $scope.maxNumberOfLogs = 5;
                $scope.getLogs();
            });

        };



        $scope.getLogs = function() {

            $scope.logs = LogsArray.get({
                objectId: $scope.task._id,
                startAt: $scope.logPage * $scope.maxNumberOfLogs,
                maxNumberOfLogs: $scope.maxNumberOfLogs
            });
        };


    }
]);
