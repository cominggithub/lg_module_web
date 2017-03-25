'use strict'

console.log("start angular app");

var app=angular.module("mainApp", ["ngRoute"])
// allow DI for use in controllers, unit tests
  .constant('_', window._)
  // use in views, ng-repeat="x in _.range(3)"
  .run(function ($rootScope) {
     $rootScope._ = window._;
  });

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
    .when("/taskHistory", {
        templateUrl: "taskHistory.html"
    })
    .when("/modal", {
        templateUrl: "modal.html"
    })
    .when("/newTask", {
        templateUrl: "newTask.html"
    })
    .when("/paramTemplateEditor", {
        templateUrl: "paramTemplateEditor.html"
    });

}]);

function getDefaultParameters(http) {
    

}

app.factory('aservice', function() {
    console.log("this is a service");

    var aservice = {};

    aservice.toString = function() {

        console.log("this is a service");
    }
    return aservice;
})

app.factory('backEndService', function($http) {
        var backEndService = {};

        backEndService.getDefaultParameters = function() {
            $http({
                method: 'GET',
                url: '/conf/parameters/default'
            }).then(function successCallback(response) {
                console.log(response);
                console.log(response.data);
                return response.data;
            }, function errorCallback(response) {
                console.log("error");
                console.error(response);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
        };

        return backEndService;
    }
);

