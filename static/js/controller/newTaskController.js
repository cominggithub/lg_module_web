'use strict'
var app = angular.module("mainApp");

app.controller("newTaskController", function($scope, $http, $location){
    console.log("add newTaskController");

    $scope.taskConfig = {
        "parameters_file": "parameters.txt"
    }
    $scope.nextTaskNo = 1;
    $scope.processCount = 32;
    $scope.parameters =
    {
        "default":{},
        "current": {
            "name":"default",
            "data":[]
        }
    }

    $scope.loadTemplates = function() {
        console.log("load templates");
        $http.get('/conf/parameters/templates').
            then(function(res) {
                console.log("get temples " + res.data);
                $scope.parameters.templates = res.data;
                $scope.parameters.selected = $scope.parameters.templates[0];
        });
    }


    $scope.newTask = function() {
        console.log("add a new task");
        $scope.nextTaskNo++;
        alert("create new task failed");
    }

    $scope.toParameterEditor = function() {
        console.log("to paramter editor");
        $location.path("paramTemplateEditor");
    }

    $scope.loadTemplates();


    $scope.getTaskB = function() {
        return new Promise(function(resolve, reject) {
            $http.get('/tasks')
            .then(function(res) {
                console.log("get tasks " + res.data);
                $scope.tasks = res.data;
            });

        });
    }

    $scope.getTaskB();
});
