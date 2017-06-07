'use strict'
var app = angular.module("mainApp");

app.controller("taskCtrl", function($scope, $http, $location, $interval){
    console.log("add task ctrl");

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
        $http.get('/conf/parameters/templates').
            then(function(res) {
                $scope.parameters.templates = res.data;
                $scope.parameters.selected = $scope.parameters.templates[0];
        });
    }


    $scope.newTask = function() {
        $scope.task.parametersFile = $scope.parameters.selected.file_name;
        $http.put('/tasks', $scope.task)
        .then(function(res) {
            $scope.getTaskB();
        })
        .catch(function(err) {
            console.error(err, err.stack);
        });

    }

    $scope.removeTask = function(taskName) {
        $http.delete("/tasks/"+taskName)
        .then(function(res) {
            $scope.getTaskB();
        })
        .catch(function(err) {
            console.error(err, err.stack);
        });

    }

    $scope.toParameterEditor = function() {
        $location.path("paramTemplateEditor");
    }

    $scope.setProcessCnt = function(pcnt) {
        $scope.task.processCnt = pcnt;
    }

    $scope.loadTemplates();


    $scope.getTaskB = function() {
        return new Promise(function(resolve, reject) {
            $http.get('/tasks')
            .then(function(res) {
                $scope.tasks = res.data;
                resolve($scope.tasks);
            })
            .catch(function(err) {
                reject(err);
            });

        });
    }

    $scope.getTaskB();
    $interval($scope.getTaskB, 1000*5);
});
