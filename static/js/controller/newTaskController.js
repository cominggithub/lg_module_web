'use strict'
var app = angular.module("mainApp");

app.controller("newTaskController", function($scope, $http, $location){
    console.log("add newTaskController");

    $scope.taskConfig = {
        "parameters_file": "parameters.txt"
    }
    $scope.task = {}
    $scope.task.processCnt = 1;
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
        console.log($scope.task);
        console.log($scope.parameters.selected.file_name);
        $scope.task.parametersFile = $scope.parameters.selected.file_name;
        $http.put('/tasks', $scope.task)
        .then(function(res) {
            console.log(res);
        })
        .catch(function(err) {
            console.error(err, err.stack);
        });

    }

    $scope.toParameterEditor = function() {
        console.log("to paramter editor");
        $location.path("paramTemplateEditor");
    }

    $scope.setProcessCnt = function(pcnt) {
        console.log(pcnt);
        $scope.task.processCnt = pcnt;
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
