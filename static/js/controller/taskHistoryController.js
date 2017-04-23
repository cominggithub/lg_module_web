'use strict'
//var app = angular.module("mainApp", ["ngRoute"]);
var app = angular.module("mainApp");

app.controller("taskHistoryController", function($scope, $http, $interval){
    console.log("add taskHistoryController");

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

    $scope.dotPosFiles = {
        "files": [
            {"name":"a.txt"},
            {"name":"b.txt"}
        ]
    }

    $scope.dotPosFiles.selected = $scope.dotPosFiles.files[0];

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
                $scope.tasks = res.data;
            });

        });
    }

    $scope.removeTaskB = function(taskName) {
        console.log("remove TaskB: " + taskName);
        return new Promise(function(resolve, reject) {
            $http.delete('/tasks/'+taskName)
            .then(function(res) {
                console.log(res);
            });

        })
    }

    $scope.removeTask = function(taskName) {
        $scope.removeTaskB(taskName);
    }

    $scope.getTaskB();
    $interval($scope.getTaskB, 1000*5);

});

