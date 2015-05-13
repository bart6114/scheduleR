'use strict';

/*global later */

// Reports controller
angular.module('reports').controller('ReportsController', ['$scope', '$stateParams', '$upload', '$http', '$location', 'Authentication', 'Reports', 'LogsArray','ScheduleService',
    function($scope, $stateParams, $upload, $http, $location, Authentication, Reports, LogsArray, ScheduleService) {
        $scope.authentication = Authentication;

        $scope.mailAddresses = {
            onError: [],
            onSuccess: [],
            rmdReport: []
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

            $scope.report.cron = cronString;
        };


        $scope.runOnce = function() {
            $http.post('/reports/' + $scope.report._id + '/run')
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

            // check if file an Rmd file
            var ext = file.name.substr(file.name.lastIndexOf('.') + 1).toLowerCase();



            // upload exceptions
            if(file.size > 500000){
                console.log('File too large! (' + file.size + ')');
                $scope.newReportForm.scriptfile.$setValidity('size', false);



            }
            else if(ext !== 'rmd'){
                // file should be an .Rmd file
                console.log('File is not an .Rmd file');
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
                    $scope.report.scriptNewFilename = data.filename.replace(/^.*[\\\/]/, '');
                    $scope.report.scriptOriginalFilename = file.name;
                    console.log($scope.report.scriptOriginalFilename + ' uploaded as ' + $scope.report.scriptNewFilename);
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

            if($stateParams.reportId) {
                $scope.findOneWithLogs();
                $scope.editing = true;
            } else {
                $scope.report = new Reports();
                $scope.report.enabled = true;
            }
            $scope.fillCron();
        };

        // Create new Report
        $scope.create = function() {

            // Create new Report object

            var report = new Reports ({
                name: this.report.name,
                description: this.report.description,
                enabled: this.report.enabled,
                cron: this.report.cron,
                scriptNewFilename: this.report.scriptNewFilename,
                scriptOriginalFilename: this.report.scriptOriginalFilename,
                arguments: this.report.arguments,
                mailOnError: $scope.mailAddresses.onError,
                mailOnSuccess: $scope.mailAddresses.onSuccess,
                mailRmdReport: $scope.mailAddresses.rmdReport,
                Rmarkdown: this.report.Rmarkdown,
                RmdFilenameTimestamp: this.report.RmdFilenameTimestamp,
                RmdAccompanyingMsg: this.report.RmdAccompanyingMsg,
                RmdOutputPath: this.report.RmdOutputPath
            });

            // Redirect after save
            report.$save(function(response) {
                $location.path('reports/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Report
        $scope.remove = function( report ) {
            console.log(report);
            if ( report ) { report.$remove();

                for (var i in $scope.reports ) {
                    if ($scope.reports [i] === report ) {
                        $scope.reports.splice(i, 1);
                    }
                }
            } else {
                $scope.report.$remove(function() {
                    $location.path('reports');
                });
            }
        };

        $scope.toggleEnabled = function() {
            $scope.report.enabled = !$scope.report.enabled;
            var report = $scope.report ;
            report.$update(function(){
                console.log('Report enabled status toggled to: ' + $scope.report.enabled);
            }, function(err){
                $scope.error = err.data.message;
            });
        };

        // Update existing Report
        $scope.update = function() {
            var report = $scope.report ;
            report.mailOnError = $scope.mailAddresses.onError;
            report.mailOnSuccess = $scope.mailAddresses.onSuccess;
            report.mailRmdReport = $scope.mailAddresses.rmdReport;


            report.$update(function() {
                $location.path('reports/' + report._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Reports
        $scope.find = function() {
            $scope.reports = Reports.query();
        };

        // Find existing Report
        $scope.findOneWithLogs = function() {


            $scope.report = Reports.get({
                reportId: $stateParams.reportId
            }, function(report){
                $scope.mailAddresses.onError = report.mailOnError;
                $scope.mailAddresses.onSuccess = report.mailOnSuccess;
                $scope.mailAddresses.rmdReport = report.mailRmdReport;
                var cronValues = report.cron.split(' ');
                $scope.schedule.minutes = cronValues[0].split(',');
                $scope.schedule.hours = cronValues[1].split(',');
                $scope.schedule.days = cronValues[2].split(',');
                $scope.schedule.months = cronValues[3].split(',');
                $scope.schedule.weekdays = cronValues[4].split(',');
                if($scope.report.cron) {
                    // set later to use local time
                    later.date.localTime();
                    var laterSchedule = later.parse.cron($scope.report.cron);
                    $scope.nextRuntime = later.schedule(laterSchedule).next(1);
                }

                $scope.logPage = 0;
                $scope.maxNumberOfLogs = 5;
                $scope.getLogs();
            });

        };



        $scope.getLogs = function() {

            $scope.logs = LogsArray.get({
                objectId: $scope.report._id,
                startAt: $scope.logPage * $scope.maxNumberOfLogs,
                maxNumberOfLogs: $scope.maxNumberOfLogs
            });
        };


    }
]);
