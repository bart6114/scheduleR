'use strict';

//Menu service used for managing  menus
angular.module('reports').factory('ScheduleService',
    function(){
        var scheduleOptions = {
            minutes: ['*'].concat(_.range(0,60)).map(String),
            hours: ['*'].concat(_.range(0,24)).map(String),
            days: ['*'].concat(_.range(0,32)).map(String),
            months: ['*'].concat(_.range(0,12)).map(String),
            weekdays: ['*'].concat(_.range(0,7)).map(String)
        };

        var scheduleTemplate = {
            minutes: '*',
            hours: '*',
            days: '*',
            months: '*',
            weekdays: '*'
        };

        return {
            getOptions: function() {
                return scheduleOptions;
            },
            getTemplate: function() {
                return scheduleTemplate;
            }
        };
    });
