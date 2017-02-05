
var app = angular.module("mainApp");

app.controller("newTaskController", function($scope){
    console.log("add newTaskController");

    $scope.taskConfig = {
        "parameters_file": "parameters.txt"
    }
    $scope.nextTaskNo = 1;
    $scope.processCount = 32;
    $scope.newTask = function() {
        console.log("add a new task");
        $scope.nextTaskNo++;
        alert("create new task failed");
    }

    $scope.editParameters = function() {
        alert("edit parameters");
    }
/*
    $scope.close = function(result){
        console.log("close dialog");
        dialog.close(result);
    };
*/
});
