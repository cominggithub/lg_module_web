'use strict'
//var app = angular.module("mainApp", ["ngRoute"]);
var app = angular.module("mainApp");

app.controller("taskHistoryController", function($scope){
    console.log("add taskHistoryController");
    $scope.taskHistory = [
        {
            no: "1",
            name:"task1",
            parameters: "parameters",
            log: "log",
            status: "success",
            date: "2017/1/5 11:22:33"
        },
        {
            no: "2",
            name:"task2",
            parameters: "parameters",
            log: "log",
            status: "failed",
            date: "2017/1/5 11:22:33"
        }
    ];
});

